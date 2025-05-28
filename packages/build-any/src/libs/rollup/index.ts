import path from 'path';
import deepmerge from 'deepmerge';
import { rollup, RollupOptions, OutputOptions } from 'rollup';
import findup from 'findup-sync';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import { getNodeModulePaths, getRequireResolve, CURRENT_PROJECT_PATH } from '@/utils/resolve';
import { ALL_BUILD_FORMATS } from '@/constants/format';

import type { BundledStringResult } from '@/types/bundle';
import type { CreateRollupConfigOptions } from '@/types/rollup';

type RollupConfig = RollupOptions & { output: OutputOptions };

// 对外提供插件
export * from './plugins/memory-fs';

/**
 * 生成打包后的字符串
 *
 * @export
 * @param {CreateRollupConfigOptions} options
 * @returns {*}  {Promise<string>}
 */
export async function rollupBundleString(options: CreateRollupConfigOptions): Promise<BundledStringResult> {
  const rollupConfig = createRollupConfig({
    format: ALL_BUILD_FORMATS.get('iife'),
    sourcemap: false,
    ...options,
  });
  const { output: outputConfig, ...inputConfig } = rollupConfig;
  const bundle = await rollup(inputConfig as RollupOptions);
  const originalResult = await bundle.generate(outputConfig as OutputOptions);
  const string = originalResult?.output?.[0]?.code || '';
  return {
    string,
    originalResult,
  };
}

/**
 * 创建 rollup 配置
 *
 * @export
 * @param {CreateRollupConfigOptions} options
 * @returns {*}  {RollupConfig}
 */
export function createRollupConfig(options: CreateRollupConfigOptions): RollupConfig {
  const nodeModulePaths = getNodeModulePaths([CURRENT_PROJECT_PATH]);
  const requireResolve = getRequireResolve(nodeModulePaths);
  const {
    input,
    format,
    sourcemap,
    browserslist,
    external,
    plugins,
    debug,
    target,
    tsPluginOptions,
    define,
  } = formatCreateRollupConfigOptions(options);
  const output = {
    format,
    sourcemap,
    exports: 'auto',
  } as const;
  const babelExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.cjs'];
  const allExtensions = babelExtensions.concat(['.d.ts']);

  // babel 插件
  const ignoreBabelPlugin = browserslist === false;
  const babelPlugin = ignoreBabelPlugin
    ? undefined
    : babel({
      extensions: babelExtensions,
      babelrc: false,
      babelHelpers: [ALL_BUILD_FORMATS.get('iife'), ALL_BUILD_FORMATS.get('umd')].includes(format) ? 'bundled' : 'runtime',
      presets: [
        [
          requireResolve('@babel/preset-env'),
          {
            debug,
            modules: format === ALL_BUILD_FORMATS.get('es') ? false : 'auto',
            useBuiltIns: 'usage',
            corejs: 3,
            targets: browserslist,
          },
        ],
        [
          requireResolve('@babel/preset-typescript'),
          {
            allExtensions: false,
          },
        ],
      ],
      plugins: [
        [requireResolve('@babel/plugin-proposal-decorators'), { legacy: true }],
        ...(![ALL_BUILD_FORMATS.get('iife'), ALL_BUILD_FORMATS.get('umd')].includes(format)
          ? [
            [
              requireResolve('@babel/plugin-transform-runtime'),
              {
                corejs: 3,
              },
            ],
          ]
          : []),
      ],
    });

  // ts 插件，其作用定位：
  // 1. 在 babel 插件不启用时，用来编译 ts 文件，以及生成声明文件
  // 2. 在 babel 插件启用时，仅用来生成声明文件
  const isTsPluginOptionsObject = Object.prototype.toString.call(tsPluginOptions) === '[object Object]';
  const isTsPluginOptionsTruthy = Boolean(tsPluginOptions);
  const firstInput = Array.isArray(input) ? input[0] : input;
  const tsPlugin = (isTsPluginOptionsTruthy || ignoreBabelPlugin)
    ? ts(deepmerge({
      check: ignoreBabelPlugin,
      tsconfig: findup('tsconfig.json', { cwd: path.dirname(path.resolve(firstInput)) }),
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: sourcemap,
          module: 'esnext',
          ...(ignoreBabelPlugin ? {
            target: target === 'node' ? 'es2018' : 'es2015',
          } : {}),
          emitDeclarationOnly: !ignoreBabelPlugin,
          declaration: true,
          declarationMap: true,
        },
        exclude: ['**/__tests__', '**/tests'],
      },
    }, isTsPluginOptionsObject ? (tsPluginOptions as object) : {}))
    : undefined;

  // 预置的 external
  const presetExternal = [ALL_BUILD_FORMATS.get('iife'), ALL_BUILD_FORMATS.get('umd')].includes(format)
    ? []
    : [/@babel\/runtime-corejs3/];
  return {
    input,
    output,
    // /@babel\/runtime-corejs3/ 加入 external 很重要，需要仔细阅读：
    // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    external: [
      ...presetExternal,
      ...external,
    ],
    plugins: [
      replace({
        values: define,
        preventAssignment: true,
      }),
      json({
        namedExports: false,
      }),
      commonjs(),
      nodeResolve({
        extensions: allExtensions,
        // 默认也是 true，但如果显式地设置了，在构建时就不会出警告
        preferBuiltins: true,
      }),
      babelPlugin,
      // 2022.06.25 官方已合并代码，但是还未发版
      // 2023.08.15 再看，已经发版了
      // - feat: support emitDeclarationOnly #366: https://github.com/ezolenko/rollup-plugin-typescript2/pull/366
      tsPlugin,
      ...plugins,
    ].filter(Boolean),
    onwarn: (warning, warnCallback) => {
      if (!/Circular/.test(warning.message)) {
        warnCallback(warning);
      }
    },
    treeshake: {
      // 默认 cjs 和 esm 格式是没有模块副作用的
      moduleSideEffects: ![ALL_BUILD_FORMATS.get('cjs'), ALL_BUILD_FORMATS.get('es')].includes(format),
    },
  };
}

/**
 * 格式化入参
 *
 * @param {CreateRollupConfigOptions} options
 * @returns {*}
 */
export function formatCreateRollupConfigOptions(options: CreateRollupConfigOptions) {
  const {
    input,
    format,
    sourcemap,
    external: rawExternal,
    plugins: rawPlugins,

    target,
    debug: rawDebug,
    define: rawDefine,
    minify: rawMinify,
    browserslist: rawBrowserslist,
    tsPluginOptions: rawTsPluginOptions,
  } = options;
  if (!input) throw new Error('input 不能为空');

  // 这里入口文件有效性交给 rollup 检查
  // if ((typeof input === 'string') && !checkIsRollupVirtualFile(input) && !fs.pathExistsSync(input)) {
  //   throw new Error(`入口路径不存在：${input}`);
  // }
  // if (Array.isArray(input)) {
  //   for (const i of input) {
  //     if (!fs.pathExistsSync(i) && !checkIsRollupVirtualFile(i)) throw new Error(`入口路径不存在：${i}`);
  //   }
  // }

  const defaultBrowserslistMap = getRollupDefaultBrowserslistMap();
  let browserslist: CreateRollupConfigOptions['browserslist'] = rawBrowserslist === false ? false : [];
  if (browserslist) {
    if (rawBrowserslist) {
      browserslist = rawBrowserslist;
    } else if (target === 'node') {
      browserslist.push(...defaultBrowserslistMap.node);
    } else if (target === 'browser') {
      browserslist.push(...defaultBrowserslistMap.browser);
    } else {
      browserslist.push(...defaultBrowserslistMap.browser.concat(defaultBrowserslistMap.node));
    }
  }
  const tsPluginOptions = rawTsPluginOptions ?? {};
  const debug = rawDebug ?? false;
  const external = rawExternal ?? [];
  const plugins = rawPlugins ?? [];
  const define = rawDefine ?? {};
  const minify = rawMinify ?? false;
  if (minify) {
    plugins.push(...[
      terser({
        ecma: 5,
        module: /^esm?/.test(format),
        compress: {
          pure_getters: true,
          // toplevel: true,
        },
        safari10: true,
      }),
    ]);
  }
  return {
    input,
    format,
    sourcemap,
    external,
    plugins,
    target,
    debug,
    minify,
    browserslist,
    tsPluginOptions,
    define,
  };
}

/**
 * 获取默认的兼容性配置列表
 *
 * @returns {*}
 */
export function getRollupDefaultBrowserslistMap() {
  return {
    node: ['node >= 12.0'],
    // 参考： https://supercodepower.com/fontend-target
    // 浏览器支持 ESModule 的版本（Chrome 和 Safari）如下设置
    // 即支持 <script type="module"> & import & export
    // 想要符合如上场景的话，需要将满足 safari >= 10.3，如果以后有需要可以设置过去
    browser: ['defaults', 'chrome >= 61', 'safari >= 10.1'],
  };
}

/**
 * 判断是否虚拟文件
 *
 * @export
 * @param {string} input
 * @returns {*}  {boolean}
 */
export function checkIsRollupVirtualFile(input: string): boolean {
  const VIRTUAL_PREFIX = 'virtual:';
  return input.startsWith(VIRTUAL_PREFIX);
}
