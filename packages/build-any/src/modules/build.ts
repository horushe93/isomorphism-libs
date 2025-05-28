/*
 * @Description  : 构建 npm 包相关的模块
 * @usage        : 仅适用于 Monorepo 方式组织的项目，且包路径需要满足 `packages/*`格式
 */
import assert from 'assert';
import { replaceTscAliasPaths } from 'tsc-alias';
import { rollup, OutputOptions, MergedRollupOptions } from 'rollup';

import { importJsonSync } from '@/utils/file';
import { createRollupConfig } from '../libs/rollup';
import { debug } from '../utils/debug';
import {
  getPackageTargets,
  resolvePackage,
  resolveBuildInput,
  resolveBuildOutput,
  pushProjectRootPath,
  popProjectRootPath,
  resolveTsConfigJsonForBuild,
} from '../utils/resolve';
import { PKG_BUILD_FORMATS } from '../constants/format';
import type { PkgBuildOption } from '../types';

const IS_PROD_NODE_ENV = process.env.NODE_ENV === 'production';

/**
 * 开始自动构建
 *
 * @export
 * @returns {*}
 */
export async function buildPackagesInShell() {
  const { packageNames, cwd } = getPackageTargets();
  debug('packageNames: %o', packageNames);
  assert.ok(packageNames.length > 0, '没有满足构建需求的目标');
  return await Promise.all(packageNames.map(n => buildPackage(n, cwd)));
}

/**
 * 开始构建指定的包
 *
 * @export
 * @param {string} packageName
 * @returns {*}
 */
export async function buildPackage(packageName: string, cwd?: string) {
  if (cwd) {
    pushProjectRootPath(cwd);
  }
  try {
    const isBuildingSelf = typeof global.isBuildingSelf === 'boolean' && global.isBuildingSelf;
    const tsConfigJsonPath = resolveTsConfigJsonForBuild(packageName);
    const formatMsg = (msg: string) =>  `[${packageName}] 下的 package.json 中，${msg}`;
    const pkgJson = importJsonSync(resolvePackage(packageName, 'package.json'));
    const pkgBuildOptions: PkgBuildOption[] = pkgJson.buildOptions || [];
    assert.ok(pkgBuildOptions.length > 0, formatMsg('缺少 buildOptions 配置'));

    let hasSetTsDeclaration = false;
    const rollupConfigs = pkgBuildOptions.reduce((allConfigs, buildOption) => {
      const { input: rawInput, target, name, formats, sourcemap = false, browserslist: rawBrowserslist } = buildOption;
      assert.ok(formats?.length > 0, formatMsg('无有效 formats 配置'));
      assert.ok(
        formats.filter(f => !Array.from(PKG_BUILD_FORMATS.keys()).includes(f)).length === 0,
        formatMsg('formats 包含了无效的配置'),
      );
      const input = resolveBuildInput(rawInput, packageName);
      const configs = formats.map((rawFormat) => {
        // 如果指定的 format 不带 legacy，则表示不需要 babel 插件介入
        const shutdownBabelPlugin = rawFormat.indexOf('legacy') < 0;
        // 如果没有 babel 插件介入的话，则一定需要 ts 插件来介入进行对 ts 文件的编译
        // 如果有 babel 插件介入的话，则 ts 插件的作用只是生成声明文件，那就交给 hasSetTsDeclaration 锁来控制
        const shutdownTsplugin = shutdownBabelPlugin ? false : hasSetTsDeclaration;
        const browserslist = shutdownBabelPlugin ? false : rawBrowserslist;
        const format = PKG_BUILD_FORMATS.get(rawFormat);
        const isBuildingESM = format === 'es';
        const rawExternal = Array.from(new Set([
          ...Object.keys(pkgJson.dependencies || {}),
          ...Object.keys(pkgJson.peerDependencies || {}),
        ]));
        const external = rawExternal.map((rawE) => {
          if (typeof rawE !== 'string') return rawE;
          // 例如依赖包 solid-js，实际有可能导入自 solid-js/web
          // 这时候 solid-js/web 是不会被当做外部依赖的，因为和字符串不完全匹配
          // 所以需要转化为正则表达式来匹配原包和原包子路径下的场景
          return new RegExp(`^${rawE}(/\\S+)?$`);
        });
        const config = createRollupConfig({
          input,
          format,
          sourcemap,
          target,
          tsPluginOptions: !shutdownTsplugin ? {
            tsconfig: tsConfigJsonPath,
            tsconfigOverride: {
              compilerOptions: {
                rootDir: './src',
                emitDeclarationOnly: !shutdownBabelPlugin,
                declaration: true,
                declarationMap: true,
              },
            },
          } : false,
          browserslist,
          external: format === 'iife' ? [] : external,
          minify: IS_PROD_NODE_ENV,
          define: {
            ...(isBuildingSelf ? {
              ['global.PREDEFINED' + '_FILE_NAME']: 'PREDEFINED' + '_FILE_NAME',
              ['global.PREDEFINED' + '_IS_ESM']: JSON.stringify(isBuildingESM),
            } : {
              ['PREDEFINED' + '_IS_ESM']: JSON.stringify(isBuildingESM),
            }),
            ['PREDEFINED' + '_FILE_NAME']: isBuildingESM ? 'import.meta.url' : '__filename',
          },
        });

        // ============== 构造 output 选项 START ==============
        const output = {
          ...(config.output || {}),
          ...resolveBuildOutput({
            absoluteInputPath: input,
            packageName,
            target,
            format: rawFormat,
            name,
          }),
        };
        // ============== 构造 output 选项 END ==============

        // ============== 生成声明文件加锁逻辑 START ==============
        // 同个包不同 format 构建，会多次生成声明文件，其实只需要一次就够
        if (!hasSetTsDeclaration) {
          hasSetTsDeclaration = true;
        }
        // ============== 生成声明文件加锁逻辑 END ==============
        return {
          ...config,
          output,
        };
      });

      // 返回配置列表
      return allConfigs.concat(configs);
    }, []);
    const results = [];
    for (const c of rollupConfigs) {
      const result = await doBuild(c);
      results.push(result);
    }
    await replaceTscAliasPaths({
      configFile: tsConfigJsonPath,
    });
    return results;
  } catch (err) {
    throw err;
  } finally {
    cwd && popProjectRootPath();
  }
}

/**
 * 开始执行单项 rollup 构建
 *
 * @param {MergedRollupOptions} rollupConfig
 * @returns {*}
 */
async function doBuild(rollupConfig: MergedRollupOptions) {
  // debug('\n[doBuild] rollupConfig: %O', rollupConfig);
  const { output, ...inputOptions } = rollupConfig;
  const bundle = await rollup(inputOptions);
  const originalResult = await bundle.write(output as OutputOptions);
  // debug('[result] originalResult: %O', originalResult);
  return originalResult;
}
