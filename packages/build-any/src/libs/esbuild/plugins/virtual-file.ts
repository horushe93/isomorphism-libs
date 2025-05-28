import { Plugin, Loader } from 'esbuild';

interface Options {
  rules: Array<{
    filter: RegExp;
    contents: string;
    loader: Loader;
  }>
}


/**
 * 替换一些元信息数据
 *
 * @export
 * @param {Map<RegExp, ReplaceFn>} [options=new Map()]
 * @returns {*}  {Plugin}
 */
export function createEsbuildPluginVirtualFile(options: Options): Plugin {
  return {
    name: 'esbuild-plugin-virtual-file',
    setup(build) {
      const { rules = [] } = options;
      rules.forEach(({ filter, contents, loader }) => {
        build.onLoad({ filter }, () => ({
          loader,
          contents,
        }));
      });
    },
  };
}
