A universal packer based on `Rollup` and `Esbuild`.

## Installation

```sh
# If you do not want to use in nodejs code, you should add `-D` option
pnpm install build-any
```

## Get started

In `package.json`:
```json
// packages/randomize-any/package.json
{
  "name": "randomize-any",
  "scripts": {
    // add script for build
    "build": "rimraf ./dist && cross-env NODE_ENV=production bany randomize-any"
    // ...
  },
  // add `buildOptions` for wspacker
  "buildOptions": [
    {
      "target": "node",
      "formats": [
        "cjs",
        "esm"
      ]
    }
  ],
}
```

## Nodejs API

We have provided some useful and convenient functions in common cases.

### `dynamicImport`

The api supports importing files with `.json`, `.ts` and `.js` extensions.

```ts
import { dynamicImport } from 'build-any';

export async function dynamicLoadProjectConfig(configPath: string): Promise<any> {
  return await dynamicImport(configPath);
}
```

