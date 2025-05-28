import fs from 'fs';
import path from 'path';
import { Plugin, OnLoadArgs } from 'esbuild';

type ReplaceFn = (args: OnLoadArgs) => string;

const defaultLoaderMap = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
};
const getProperLoaderName = (filePath: string) => defaultLoaderMap[path.extname(filePath)];

/**
 * 替换一些元信息数据
 * - esbuild 是不支持 node 原生内置的变量，例如 __dirname、__filename、import.meta.url 这些东西
 *
 * @export
 * @param {Map<RegExp, ReplaceFn>} [options=new Map()]
 * @returns {*}  {Plugin}
 */
export function createEsbuildPluginReplaceMeta(options: Map<RegExp, ReplaceFn> = new Map()): Plugin {
  return {
    name: 'esbuild-plugin-replace-meta',
    setup(build) {
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const { path: argPath } = args;
        const oriContents = await fs.promises.readFile(argPath, 'utf8');
        const replaceRules = [
          [/\bimport\.meta\.url\b/g, args => JSON.stringify(`file://${args.path}`)],
          [/\b__dirname\b/g, args => JSON.stringify(path.dirname(args.path))],
          [/\b__filename\b/g, args => JSON.stringify(args.path)],
        ].concat([...options.entries()]);
        const contents = replaceRules.reduce((c, item: [RegExp, ReplaceFn]) => {
          const [reg, fn] = item;
          return c.replace(reg, () => fn(args));
        }, oriContents);
        return {
          loader: getProperLoaderName(argPath),
          contents,
        };
      });
    },
  };
}
