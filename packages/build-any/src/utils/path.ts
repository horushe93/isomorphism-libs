import path from 'path';
import findup from 'findup-sync';
import { fileURLToPath } from 'url';

/**
 * 获取当前项目的绝对路径
 *
 * @export
 * @returns {*}  {string}
 */
export function getCurrentProjectPath(rawFileNameArg?: string): string {
  // 这里要加一个 ignore 声明，因为在编译构建本身时，会将预全局预定义变量转成预定义变量字符串，命中 define 之后再转一次
  // 属于中间过渡态，目前暂时来看没有更好的解决办法
  // @ts-ignore
  const rawFileName = rawFileNameArg ?? global.PREDEFINED_FILE_NAME;
  let fileName = '';
  if (global.PREDEFINED_IS_ESM) {
    fileName = fileURLToPath(rawFileName);
  } else {
    fileName = rawFileName;
  }
  const currentDir = path.dirname(fileName);
  return path.dirname(findup('package.json', { cwd: currentDir }));
}
