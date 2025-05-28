import path from 'path';
import { Plugin } from 'esbuild';
import { debug } from '@/utils/debug';

interface PluginOptions {
  ignoreList?: Array<RegExp>;
}

/**
 * 自动将相关的依赖置为 external
 *
 * @export
 * @returns {*}  {Plugin}
 */
export function createEsbuildExternalizeDepsPlugin(options: PluginOptions = {}): Plugin {
  return {
    name: 'esbuild-plugin-externalize-deps',
    setup(build) {
      const { initialOptions: buildOptions } = build;
      const { alias = {} } = buildOptions;
      const { ignoreList = [] } = options || {};
      const shouldExternalizeAliasKeys = Object.keys(alias).filter(key => /node_modules/.test(alias[key]));
      // debug('[createEsbuildExternalizeDepsPlugin] build:%O', build);
      // debug('[createEsbuildExternalizeDepsPlugin] alias:%O', alias);
      // debug('[createEsbuildExternalizeDepsPlugin] ignoreList:%O', ignoreList);
      build.onResolve({ filter: /.*/ }, (args) => {
        const id = args.path;
        const isModule = (id[0] !== '.' && !path.isAbsolute(id));
        const shouldExternalize = (isModule && !ignoreList.find(regx => regx.test(id)))
          || Boolean(shouldExternalizeAliasKeys.find(key => id.startsWith(key)));
        debug(`[createEsbuildExternalizeDepsPlugin] id: ${id} shouldExternalize: ${shouldExternalize}`);
        return {
          external: shouldExternalize,
        };
      });
    },
  };
}
