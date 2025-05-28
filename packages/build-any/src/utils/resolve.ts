import fs from 'fs';
import path from 'path';
import findup from 'findup-sync';
import minimist from 'minimist';
import findNodeModules from 'find-node-modules';

import { debug } from './debug';
import { getCurrentProjectPath } from './path';
import { PKG_BUILD_FORMATS } from '@/constants/format';
import { DEFAULT_INPUT_RELATIVE_PATH, PACKAGES_PATH_SEGMENT } from '@/constants/uri';
import type { BuildOutputFormat, ResolveBuildOutput } from '../types';

interface OutputConfigMap {
  [format: string]: {
    file: string;
    format: BuildOutputFormat;
  }
}

export const CURRENT_PROJECT_PATH = getCurrentProjectPath();

/**
 * 获取定制化的 resolve 方法
 *
 * @export
 * @param {string} projectPath
 * @returns 定制化的 resolve 方法
 */
export function getResolve(projectPath: string): (...pathnameList: string[]) => string {
  return (...pathnameList: string[]) => path.resolve(projectPath, ...pathnameList);
}

/**
 * 获取搜索 node_modules 的路径列表
 *
 * @export
 * @param {string[]} extraSearchList
 * @param {boolean} [replacePresets=false]
 * @returns {*}
 */
export function getNodeModulePaths(extraSearchList: string[] = [], replacePresets = false) {
  const pathListTofindModules = replacePresets
    ? extraSearchList || []
    : [...(extraSearchList || []), process.cwd(), CURRENT_PROJECT_PATH, process.argv[0]];
  const distinctedPathList = Array.from(new Set(pathListTofindModules));
  const rawPaths = [].concat(...distinctedPathList.map(cwd => findNodeModules({ cwd, relative: false }) || []));
  const nodeModulePaths = Array.from(new Set(rawPaths));
  return nodeModulePaths;
}

/**
 * 获取封装好的 requireResolve 方法
 *
 * @export
 * @param {string[]} nodeModulePaths
 * @returns {*}
 */
export function getRequireResolve(nodeModulePaths: string[]) {
  return moduleName => require.resolve(moduleName, {
    paths: nodeModulePaths,
  });
}

// 读写项目根目录位置栈
const projectRootPathStack = [];
function initProjectRootPath() {
  // 目前仅支持 pnpm 管理的项目
  const rootPath = path.dirname(findup('pnpm-workspace.yaml', { cwd: process.cwd() })
    || findup('package.json', { cwd: process.cwd() }));
  debug('[initProjectRootPath] rootPath:', rootPath);
  const { length } = projectRootPathStack;
  if (length > 0) {
    projectRootPathStack.splice(0, length, rootPath);
  } else {
    projectRootPathStack.push(rootPath);
  }
}
export function getProjectRootPath() {
  if (projectRootPathStack.length === 0) {
    initProjectRootPath();
  }
  return projectRootPathStack.slice(-1)[0];
}
export function pushProjectRootPath(path: string) {
  projectRootPathStack.push(path);
}
export function popProjectRootPath() {
  return projectRootPathStack.pop();
}

/**
 * 解析项目根目录下的路径
 *
 * @export
 * @param {...string[]} args
 * @returns {*}
 */
export function resolveRoot(...args: string[]) {
  return path.resolve(getProjectRootPath(), ...args);
}

/**
 * 解析目标包目录下的路径
 *
 * @export
 * @param {...string[]} args
 * @returns {*}
 */
export function resolvePackage(...args: string[]) {
  return resolveRoot(PACKAGES_PATH_SEGMENT, ...args);
}

/**
 * 解析指定路径下 package.json 的路径
 *
 * @export
 * @param {string} cwd
 * @returns {*} string
 */
export function resolvePackageJsonPath(cwd: string): string {
  return findup('package.json', { cwd });
}

/**
 * 解析构建入口
 *
 * @export
 * @param {(string | undefined)} rawInput
 * @param {string} packageName
 * @returns {*}
 */
export function resolveBuildInput(rawInput: string | undefined, packageName: string) {
  const getErrorInfoText = (text: string) => `解析构建入口文件失败：${text}`;

  if (!packageName) {
    throw new Error(getErrorInfoText('入参 packageName 无效'));
  }

  let input = resolvePackage(packageName, DEFAULT_INPUT_RELATIVE_PATH);
  if (rawInput && typeof rawInput === 'string') {
    // 兼容绝对路径和相对路径
    input = path.isAbsolute(rawInput) ? rawInput : resolvePackage(packageName, rawInput);
  }
  if (!fs.statSync(input).isFile()) {
    throw new Error(getErrorInfoText('入口路径不存在'));
  }
  return input;
}

export function resolveBuildOutput(option: ResolveBuildOutput) {
  const { absoluteInputPath, target, format, packageName, name  } = option;
  const outputConfigMap = resolveBuildOutputConfigMap(packageName);
  const rawOutputConfig = outputConfigMap[format];
  const { name: fileName } = path.parse(absoluteInputPath);
  const file = rawOutputConfig.file.replace('{target}', target).replace('{fileName}', fileName);
  return {
    ...rawOutputConfig,
    file,
    name,
  };
}

/**
 * 获取构建出口配置映射表
 *
 * @export
 * @param {string} packageName
 * @returns {*}  {OutputConfigMap}
 */
export function resolveBuildOutputConfigMap(packageName: string): OutputConfigMap {
  const resolvePackageDist = (...args: string[]) => resolvePackage(packageName, 'dist', ...args);
  const map: OutputConfigMap = {};
  return Array.from(PKG_BUILD_FORMATS.entries()).reduce((map, [pkgBuildFormat, outputFormat]) => {
    // 由于我们的库目前还是兼容 cjs 为主，对于 esm 类型的项目，只需要提供 .mjs 入口文件就可以解决
    let ext = 'js';
    if (['esm', 'esm-legacy'].includes(pkgBuildFormat)) {
      ext = 'mjs';
    } else if (['cjs', 'cjs-legacy'].includes(pkgBuildFormat)) {
      ext = 'cjs';
    }
    map[pkgBuildFormat] = {
      file: resolvePackageDist(`{fileName}.{target}.${pkgBuildFormat}.${ext}`),
      format: outputFormat,
    };
    return map;
  }, map);
}

/**
 * 解析获取构建时使用的 tsconfig 文件
 *
 * @export
 * @param {string} packageName
 * @returns {*}  {string}
 */
export function resolveTsConfigJsonForBuild(packageName: string): string {
  let pathString = '';
  pathString = resolvePackage(packageName, 'tsconfig.prod.json');
  if (!fs.statSync(pathString)?.isFile()) {
    pathString = resolvePackage(packageName, 'tsconfig.json');
  }
  return pathString;
}

/**
 * 获取所有可以被构建的 packages 目标列表
 *
 * @export
 * @returns 目标列表
 */
export function getAllPackageTargets(): string[] {
  return fs.readdirSync(resolveRoot(PACKAGES_PATH_SEGMENT)).filter(checkIsQualifiedTarget);
}

/**
 * 获取命令行指定要构建的 package
 *
 * @export
 * @returns 目标列表
 */
export function getPackageTargets(): { packageNames: string[]; cwd: string | undefined; } {
  const args = minimist(process.argv.slice(2));
  debug('[getPackageTargets] args:%O', args);

  let packageNames = args._;
  if (packageNames.length > 0) {
    packageNames = packageNames.filter(checkIsQualifiedTarget);
  } else {
    packageNames = getAllPackageTargets();
  }
  return {
    packageNames,
    cwd: args.cwd || undefined,
  };
}

/**
 * 检查是否符合构建要求的包
 *
 * @param {string} packageName
 * @returns {*}
 */
function checkIsQualifiedTarget(packageName: string) {
  debug('[checkIsQualifiedTarget] root:', resolveRoot());
  if (!fs.statSync(resolveRoot(`${PACKAGES_PATH_SEGMENT}/${packageName}`)).isDirectory()) {
    return false;
  }
  const pkg = require(resolveRoot(`${PACKAGES_PATH_SEGMENT}/${packageName}/package.json`));
  if (pkg.private || !pkg.buildOptions) {
    return false;
  }
  return true;
}
