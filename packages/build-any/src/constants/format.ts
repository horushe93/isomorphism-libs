import { BuildFormatMap, AllowedBuildFormatMap,  PkgBuildForamtMap } from '../types';

// 所有构建类型
export const ALL_BUILD_FORMATS: BuildFormatMap = new Map([
  ['amd', 'amd'],
  ['cjs', 'cjs'],
  ['es', 'es'],
  ['iife', 'iife'],
  ['system', 'system'],
  ['umd', 'umd'],
]);

// 允许实际构建落地的目标构建类型
export const BUILD_FORMATS: AllowedBuildFormatMap = new Map([
  ['cjs', 'cjs'],
  ['es', 'es'],
  ['iife', 'iife'],
]);

// 允许 package.json 中指定的构建产出类型
export const PKG_BUILD_FORMATS: PkgBuildForamtMap = new Map([
  ['esm', 'es'],
  ['esm-legacy', 'es'],
  ['cjs', 'cjs'],
  ['cjs-legacy', 'cjs'],
  ['global', 'iife'],
  ['global-legacy', 'iife'],
]);
