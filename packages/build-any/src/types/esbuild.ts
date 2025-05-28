import type { BuildOptions } from 'esbuild';

export interface CreateEsbuildConfigOptions extends BuildOptions {
  // 原生配置
  entryPoints: BuildOptions['entryPoints'];
  format?: BuildOptions['format'];
  sourcemap?: BuildOptions['sourcemap'];
  external?: BuildOptions['external'];
  plugins?: BuildOptions['plugins'];
  platform: BuildOptions['platform'];
  define?: BuildOptions['define'];
  minify?: BuildOptions['minify'];
  target?: BuildOptions['target'];
}

export type EsbuildDynamicImportOptions = Omit<Partial<CreateEsbuildConfigOptions>, 'entryPoints' | 'platform'> & {
  keepTempFile?: boolean;
};
