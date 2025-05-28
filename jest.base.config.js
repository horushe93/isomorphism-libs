const fs = require('fs');
const path = require('path');

const tsConfig = 'tsconfig.json';

module.exports = function (packageDirectory, pkgConfig) {
  const packageName = require(`${packageDirectory}/package.json`).name;
  const packageTsconfig = path.resolve(packageDirectory, tsConfig);
  return {
    displayName: packageName,
    verbose: true,
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      // '\\.(s?css|less)$': 'identity-obj-proxy',
    },
    snapshotSerializers: [
      // 'jest-serializer-vue'
    ],
    testMatch: ['**/(test|tests|__test__|__tests__)/**/*.(spec|test).(js|jsx|ts|tsx)'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.*(.mock.(js|ts))$'],
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    collectCoverage: false,
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.mock.(js | ts)'],
    coverageDirectory: '<rootDir>/coverage/',
    // coverageReporters: ['html', 'lcov', 'json', 'text-summary', 'clover'],
    coverageReporters: ['html', 'lcov', 'json', 'text', 'clover'],
    reporters: [
      'default',
      // 'jest-html-reporters'
    ],
    globals: {
      __DEV__: true,
      // Deprecated and move it into 'transform' option
      // 'ts-jest': {
      //   tsconfig: fs.existsSync(packageTsconfig) ? packageTsconfig : path.resolve(__dirname, tsConfig),
      // },
    },
    ...pkgConfig,

    // 参考：https://jestjs.io/docs/configuration#testenvironment-string
    // testEnvironment: 'jsdom', // 浏览器 app 用 'jsdom'，node 端 app 用 'node'，默认后者
    // testEnvironmentOptions: {},

    transform: {
      // '^.+\\.vue$': 'vue-jest',
      // '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
      // '^.+\\.jsx?$': 'babel-jest'
      '^.+\\.ts$': [
        'ts-jest',
        {
          tsconfig: fs.existsSync(packageTsconfig) ? packageTsconfig : path.resolve(__dirname, tsConfig),
        },
      ],
    },

    // setupFiles: [
    //   '<rootDir>/jest.setup.js',
    //   // 'jest-canvas-mock'
    // ],
    // setupFilesAfterEnv: [
    //   '<rootDir>/jest.setup.after.js',
    // ],
  };
};
