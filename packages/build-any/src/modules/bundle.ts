/*
 * @Description  : 根据入口打包出一个字符串
 * @usage        : 适用于简单的场景，例如打包一个脚本文件，更多地是为了注入兼容性代码 & 压缩代码
 */
import { debug } from '@/utils/debug';
import { rollupBundleString, rollupPluginMemoryFs } from '@/libs/rollup';
import { esbuildBundleString, createEsbuildPluginVirtualFile } from '@/libs/esbuild';

import { CreateRollupConfigOptions } from '@/types/rollup';
import { CreateEsbuildConfigOptions } from '@/types/esbuild';

export interface BundleStringOptions {
  input: string | {
    path: string;
    content: string;
  };
  target: 'browser' | 'node' | 'common';
  sourcemap?: boolean | 'inline';
  external?: string[];
  define?: Record<string, any>;
  minify?: boolean;
  browserslist?: string | string[];
}

/**
 * 打包成字符串
 *
 * @export
 * @param {('esbuild' | 'rollup')} builder
 * @param {BundleStringOptions} options
 * @returns {*}  {Promise<string>}
 */
export async function bundle2String(builder: 'esbuild' | 'rollup', options: BundleStringOptions): Promise<string> {
  const params = {
    format: 'iife' as const,
    sourcemap: false,
    ...options,
  };
  let buildOptions: CreateRollupConfigOptions | CreateEsbuildConfigOptions;
  let result;

  const { input } = params;
  const isInputVirtualFile = typeof input !== 'string';
  if (builder === 'esbuild') {
    buildOptions = {
      entryPoints: [isInputVirtualFile ? input.path : input],
      sourcemap: params.sourcemap,
      external: params.external,
      define: params.define,
      minify: params.minify,
      platform: params.target === 'common' ? 'neutral' : params.target,
      plugins: [],
      ...(params.browserslist ? { target: params.browserslist } : {}),
    } as CreateEsbuildConfigOptions;
    if (isInputVirtualFile) {
      buildOptions.plugins.push(createEsbuildPluginVirtualFile({
        rules: [{
          filter: new RegExp(input.path),
          contents: input.content,
          loader: 'ts',
        }],
      }));
    }
    debug('[bundle2String] esbuild options: %O', buildOptions);
    result = await esbuildBundleString(buildOptions);
  } else {
    buildOptions = {
      ...params,
      input: isInputVirtualFile ? input.path : input,
      tsPluginOptions: false,
      plugins: [],
    };
    if (isInputVirtualFile) {
      buildOptions.plugins.push(rollupPluginMemoryFs({
        [input.path]: input.content,
      }));
    }
    debug('[bundle2String] rollup options: %O', buildOptions);
    result = await rollupBundleString(buildOptions);
  }
  return result.string;
}
