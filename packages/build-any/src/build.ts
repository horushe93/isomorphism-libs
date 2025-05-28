/*
 * @Description  : 用于用自己源码构建自己的脚本
 * @usage        :
 */

global.isBuildingSelf = true;
global.PREDEFINED_IS_ESM = false;
global.PREDEFINED_FILE_NAME = __filename;

const { buildPackagesInShell } = require('./index');
buildPackagesInShell();
