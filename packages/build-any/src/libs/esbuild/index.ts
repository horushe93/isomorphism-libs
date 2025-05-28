import path from 'path';
import fs from 'fs-extra';
import { build, BuildOptions } from 'esbuild';
import { debug } from '@/utils/debug';
import { importJson, getProjectModuleType } from '@/utils/file';
import { BundledStringResult } from '@/types/bundle';
import { createEsbuildPluginReplaceMeta } from './plugins/replace-meta';
import { createEsbuildPluginVirtualFile } from './plugins/virtual-file';
import { createEsbuildExternalizeDepsPlugin } from './plugins/externalize-deps';
import { EsbuildDynamicImportOptions, CreateEsbuildConfigOptions } from '@/types/esbuild';

export {
  createEsbuildPluginReplaceMeta,
  createEsbuildPluginVirtualFile,
  createEsbuildExternalizeDepsPlugin,
};

/**
 * 动态引入脚本文件
 * 说明：仅 .js, .ts 等脚本文件的读取
 *
 * @export
 * @param {string} filePath
 * @param {EsbuildDynamicImportOptions} [rawOptions]
 * @returns {*}  {Promise<any>}
 */
export async function esbuildDynamicImport(filePath: string, rawOptions?: EsbuildDynamicImportOptions): Promise<any> {
  const { keepTempFile = false, ...options } = rawOptions || {};
  const isExisted = await fs.exists(filePath);
  if (!isExisted) {
    throw new Error(`[esbuildDynamicImport] exception: ${filePath} doest not exist`);
  }
  // 自动尝试读取 package.json 中的 type 字段来判断项目的模块类型
  const format = options.format ?? (getProjectModuleType(path.dirname(filePath)) || 'cjs');
  const esbuildConfig = createEsbuildConfig({
    entryPoints: [filePath],
    format,
    sourcemap: 'inline',
    platform: 'node',
    plugins: [
      createEsbuildPluginReplaceMeta(),
      createEsbuildExternalizeDepsPlugin(),
    ],
    ...(options || {}),
  });
  debug('[esbuildDynamicImport] esbuildConfig: %O', esbuildConfig);
  const originalResult = await build({
    bundle: true,
    write: false,
    ...esbuildConfig,
  });
  const content = originalResult.outputFiles?.[0]?.text || '';
  if (!content) return undefined;

  // 写硬盘文件的方式有一定的性能损耗，后面可以优化成读写内存，而且不影响项目
  // 但是这样会带来新的问题，那就是：
  // 1. require 和 import 要同时去实现加载导入字符串 —— 还好
  // 2. 如果字符串中有包依赖，那还得切换 process.cwd —— 分配到进程中去做？
  const filePathObject = path.parse(filePath);
  const isBuildFormatEsm = esbuildConfig.format === 'esm';
  const tempFilePath = path.format({
    root: filePathObject.root,
    dir: filePathObject.dir,
    name: `.${filePathObject.name}.temp.${new Date().getTime()}`,
    ext: '.js',
  });

  let result;
  let error;
  try {
    await fs.writeFile(tempFilePath, content, 'utf8');
    const dynamicImport = isBuildFormatEsm
      ? new Function('filePath',  'return import(filePath)')
      : require;
    result = await dynamicImport(tempFilePath);
  } catch (err) {
    error = err;
  }

  try {
    const isTempFileExists = await fs.pathExists(tempFilePath);
    if (!keepTempFile && isTempFileExists) {
      await fs.unlink(tempFilePath);
    }
  } catch (err) {
    if (!error) {
      error = err;
    }
  }
  if (error) throw error;
  return Object.prototype.hasOwnProperty.call(result, 'default') ? result.default : result;
}

/**
 * 动态引入
 * 说明：支持 .json 和 .js, .ts 等脚本文件的读取
 * @export
 * @param {string} filePath
 * @param {EsbuildDynamicImportOptions} [rawOptions]
 * @returns {*}  {Promise<any>}
 */
export async function dynamicImport(filePath: string, rawOptions?: EsbuildDynamicImportOptions): Promise<any> {
  const isJSONFile = path.extname(filePath) === '.json';
  if (isJSONFile) return await importJson(filePath);

  return esbuildDynamicImport(filePath, rawOptions);
}

/**
 * 生成打包后的字符串
 * - 适用于打包构建简单的模板脚本代码
 *
 * @export
 * @param {CreateEsbuildConfigOptions} options
 * @returns {*}  {Promise<string>}
 */
export async function esbuildBundleString(options: CreateEsbuildConfigOptions): Promise<BundledStringResult> {
  const esbuildConfig = createEsbuildConfig({
    format: 'iife',
    sourcemap: false,
    ...options,
  });
  const originalResult = await build({
    bundle: true,
    write: false,
    ...esbuildConfig,
  });
  const string = originalResult.outputFiles?.[0]?.text || '';
  return {
    string,
    originalResult,
  };
}

/**
 * 创建 esbuild 配置
 *
 * @export
 * @param {CreateEsbuildConfigOptions} rawOptions
 * @returns {*}  {BuildOptions}
 */
export function createEsbuildConfig(rawOptions: CreateEsbuildConfigOptions): BuildOptions {
  const defaultBrowserslistMap = getEsbuildDefaultBrowserslistMap();
  const target = defaultBrowserslistMap[rawOptions.platform] || [].concat(Object.values(defaultBrowserslistMap));
  return {
    target,
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.cjs'],
    ...rawOptions,
  };
}

/**
 * 获取默认的兼容性配置列表
 * - esbuild 一般在开发环境去使用，所以默认是高版本环境
 *
 * @returns {*}
 */
export function getEsbuildDefaultBrowserslistMap() {
  return {
    node: ['node14'],
    browser: ['es2016'],
  };
}
