/*
 * @Description  : 构建相关的类型声明文件
 * @usage        :
 */
import type { InternalModuleFormat, OutputOptions, RollupOptions } from 'rollup';
import type { RPT2Options } from 'rollup-plugin-typescript2';

export type PkgBuildForamt = 'esm' | 'esm-legacy' | 'cjs' | 'cjs-legacy' | 'global' | 'global-legacy';
export type BuildOutputFormat = CreateRollupConfigOptions['format'];

type AllowedInternalModuleFormat = Extract<InternalModuleFormat, 'cjs' | 'es' | 'iife'>;
export type BuildFormatMap = Map<InternalModuleFormat, InternalModuleFormat>;
export type AllowedBuildFormatMap = Map<AllowedInternalModuleFormat, InternalModuleFormat>;
export type PkgBuildForamtMap = Map<PkgBuildForamt, InternalModuleFormat>;


export interface CreateRollupConfigOptions {
  // =============== rollup 原生配置 ===============
  input: string | string[];
  // 要求仅使用 InternalModuleFormat 类型的枚举值，其他之外的都是 alias
  format?: InternalModuleFormat;
  sourcemap?: OutputOptions['sourcemap'];
  // 暂时仅支持数组方式
  external?: (string | RegExp)[];
  // external?: RollupOptions['external'];
  plugins?: RollupOptions['plugins'];

  // =============== 自定义配置 ===============
  target: 'node' | 'browser' | 'common';
  debug?: boolean;
  define?: Record<string, any>;
  minify?: boolean;
  // browserslist 配置为 false 即表示不需要 babel 插件来编译
  browserslist?: false | string | string[] | Record<string, string | string[]>;
  tsPluginOptions?: boolean | RPT2Options;
}

export interface PkgBuildOption {
  target: CreateRollupConfigOptions['target'],
  formats: PkgBuildForamt[],
  name?: string;
  input?: string;
  sourcemap?: CreateRollupConfigOptions['sourcemap'];
  // browserslist 仅对于带 'legacy' 字符串的 format 生效
  browserslist?: CreateRollupConfigOptions['browserslist'];
}

export interface ResolveBuildOutput {
  // 构建入口绝对路径
  absoluteInputPath: string;
  target: CreateRollupConfigOptions['target'];
  format: PkgBuildForamt;
  packageName: string;
  name?: string;
}
