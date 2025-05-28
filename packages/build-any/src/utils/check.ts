export function checkIsBuildingSelf() {
  console.log('process.argv:', process.argv);
  return process.argv[2] === 'wspacker';
}
