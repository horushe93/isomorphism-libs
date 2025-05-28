const { buildPackagesInShell } = require('./dist/index.node.cjs.cjs');

// rollup 内的 ts 插件再进行类型声明检查失败以后会抛出一个 rejection
// 如果进程没有捕获并退出，则会认证构建成功，会导致无法出包 dist
// 进而在流水线发布时，没有带上 dist 包
// 所以必须要捕获 unhandledRejection 事件，并退出进程
process.on('unhandledRejection', (err) => {
  console.error('\r\nUnhandledRejection Occurred and process will exit!');
  console.error(err);
  process.exit(1);
});

buildPackagesInShell();


