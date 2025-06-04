# Isomorphism Libs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

A collection of JavaScript/TypeScript utility libraries designed for isomorphic applications, supporting seamless execution in both server-side and browser environments.

## ✨ Features

- 🔄 **Isomorphic Support** - All packages work in both Node.js and browser environments
- 📦 **Multiple Module Formats** - Supports UMD, CommonJS, and ESM module formats
- 🔒 **Type Safety** - Complete TypeScript type definitions
- 🎯 **Lightweight & Efficient** - Carefully optimized bundle size and performance
- 🧪 **Test Coverage** - Comprehensive unit tests and integration tests
- 📚 **Well Documented** - Detailed API documentation and usage examples

## 📦 Package List

### [randomize-any](https://www.npmjs.com/package/randomize-any)

A secure randomization utility library that provides various randomization functions.

```bash
npm install randomize-any
```

**Key Features:**
- 🔒 Cryptographically secure random number generation
- 🎯 Supports randomization of array elements, integers, and floating-point numbers
- ⚖️ Built-in weighted random algorithms
- 🌐 Cross-platform compatibility

**Usage Example:**
```typescript
import { randomizeAny, randomizeInteger, randomizeFloat } from 'randomize-any';

// Randomly select array element
const fruits = ['apple', 'banana', 'orange'];
const randomFruit = randomizeAny(fruits);

// Generate random integer
const randomInt = randomizeInteger(1, 100);

// Generate random float
const randomFloat = randomizeFloat(0, 1);
```

## 🚀 Quick Start

### Installation

Using npm:
```bash
npm install <package-name>
```

Using pnpm:
```bash
pnpm add <package-name>
```

Using yarn:
```bash
yarn add <package-name>
```

### Basic Usage

```typescript
// ESM import
import { functionName } from 'package-name';

// CommonJS import
const { functionName } = require('package-name');

// UMD browser direct reference
<script src="https://unpkg.com/package-name/dist/index.browser.global.js"></script>
```

## 🏗️ Development Guide

This project uses a Monorepo architecture, managed with pnpm workspace for multiple packages.

### Prerequisites

- Node.js >= 16
- pnpm >= 8

### Install Dependencies

```bash
pnpm install
```

### Development Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Code linting
pnpm lint

# Generate documentation
pnpm build:docs

# Preview documentation locally
pnpm --filter docs dev
```

### Version Management

This project uses [Changeset](https://github.com/changesets/changesets) for version management:

1. **Update Code** - Modify business code within packages
2. **Create Changeset** - Run `pnpm changeset` to describe your changes
3. **Commit Changes** - `git commit` your code changes
4. **Version Bump** - Run `pnpm version` to select packages for upgrade
5. **Commit Version** - `git commit` version number changes
6. **Push Code** - `git push` to remote repository

### Release Process

When PR is merged to main branch, CI/CD pipeline will automatically:
- Detect version changes
- Publish to npm registry
- Create Git tags

### Generate / Update Documentation

The documentation project is located in `app/docs`. Generating or updating documentation involves two steps:

```bash
# Build all packages to generate the latest *.d.ts declaration files
pnpm build

# Use *.d.ts declaration files to generate markdown documentation in app/docs
pnpm build:docs

# View effects locally
pnpm --filter docs dev
```

## 🌐 Browser Compatibility

All packages are tested and support the following browsers:

- Chrome 11+
- Firefox 21+
- Safari 3.1+
- Edge 12+
- IE 11+

For unsupported environments, automatic fallback to compatible implementations is provided.

## 📊 Usage Statistics

Our libraries are used by the following projects:

### 🎮 Gaming & Entertainment
- **Colorfle Unlimited** - A color wordle game using random algorithms to select daily target colors
- **Flagle Explorer** - A flag wordle game using weighted randomization to select daily flags

### 🎯 Utilities & Tools
- **[Ruleta Aleatoria](https://ruletaa.net/)** - Simple web app helping users make random choices
- **[Random Wheel from 1 to 100](https://ruletaa.net/en/numbers/1-100)** - Tool for randomly selecting numbers using secure randomization algorithms

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Code Standards

- Write code in TypeScript
- Follow ESLint configuration
- Write unit tests
- Update relevant documentation

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

## 🔗 Related Links

- [GitHub Repository](https://github.com/horushe93/isomorphism-libs)
- [Issue Tracker](https://github.com/horushe93/isomorphism-libs/issues)
- [Contributing Guide](https://github.com/horushe93/isomorphism-libs/blob/master/CONTRIBUTING.md)

## 📞 Contact Us

If you have any questions or suggestions, feel free to:

- Create an [Issue](https://github.com/horushe93/isomorphism-libs/issues)
- Start a [Discussion](https://github.com/horushe93/isomorphism-libs/discussions)
- Submit a Pull Request

---

⭐ If this project helps you, please give us a Star!
