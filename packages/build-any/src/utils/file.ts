import fs from 'fs-extra';
import { debug } from './debug';
import { resolvePackageJsonPath } from './resolve';

export function importJsonSync(pathStr: string) {
  return fs.readJsonSync(pathStr, { encoding: 'utf-8' });
}

export async function importJson(pathStr: string) {
  return await fs.readJSON(pathStr, { encoding: 'utf-8' });
}

export function getProjectModuleType(dirPath: string): 'esm' | 'cjs' | '' {
  try {
    const jsonPath = resolvePackageJsonPath(dirPath);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return json.type === 'module' ? 'esm' : 'cjs';
  } catch (err: any) {
    debug('[getProjectModuleType] 异常：', err.message);
  }
  return '';
}
