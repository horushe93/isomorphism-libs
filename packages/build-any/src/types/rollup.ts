import type { InternalModuleFormat, OutputOptions, RollupOptions } from 'rollup';
import type { RPT2Options } from 'rollup-plugin-typescript2';

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

export type BuildOutputFormat = CreateRollupConfigOptions['format'];
