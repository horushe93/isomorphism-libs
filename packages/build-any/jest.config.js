const buildConfig = require('../../jest.base.config');

module.exports = buildConfig(__dirname, {
  // 参考：https://jestjs.io/docs/configuration#testenvironment-string
  testEnvironment: 'node', // 浏览器 app 用 'jsdom'，node 端 app 用 'node'，默认后者
  testEnvironmentOptions: {},

  setupFiles: ['<rootDir>/jest.setup.js'],
});
