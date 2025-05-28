# randomize-any

A secure randomization utility library that provides various randomization functions, supporting both browser and Node.js environments.

## Features

- 🔒 **Secure Random**: Uses `crypto.getRandomValues()` for cryptographically secure random number generation
- 🎯 **Multiple Types**: Supports randomization of array elements, integers, and floating-point numbers
- ⚖️ **Weight Support**: Built-in weighted random algorithms
- 🌐 **Cross-platform**: Supports both browser and Node.js environments
- 📦 **Multiple Formats**: Provides ESM, CJS, UMD and other module formats
- 🔧 **TypeScript**: Complete TypeScript type definitions

## Installation

```bash
npm install randomize-any
```

Or using pnpm:

```bash
pnpm add randomize-any
```

## Usage

### Basic Import

```javascript
import { randomizeAny, randomizeInteger, randomizeFloat } from 'randomize-any';
```

### API Documentation

#### `randomizeAny(list: any[]): any`

Randomly select an element from an array.

**Parameters:**
- `list` - The array to randomly select from

**Returns:**
- A random element from the array

**Example:**
```javascript
const fruits = ['apple', 'banana', 'orange', 'grape'];
const randomFruit = randomizeAny(fruits);
console.log(randomFruit); // e.g.: 'banana'

const numbers = [1, 2, 3, 4, 5];
const randomNumber = randomizeAny(numbers);
console.log(randomNumber); // e.g.: 3
```

#### `randomizeInteger(min: number, max: number): number`

Generate a random integer within the specified range.

**Parameters:**
- `min` - Minimum value (inclusive)
- `max` - Maximum value (inclusive)

**Returns:**
- A random integer within the range

**Example:**
```javascript
const randomInt = randomizeInteger(1, 10);
console.log(randomInt); // e.g.: 7

const diceRoll = randomizeInteger(1, 6);
console.log(diceRoll); // e.g.: 4
```

#### `randomizeFloat(min: number, max: number): number`

Generate a random floating-point number within the specified range (precision: 0.01).

**Parameters:**
- `min` - Minimum value (inclusive)
- `max` - Maximum value (inclusive)

**Returns:**
- A random floating-point number within the range

**Example:**
```javascript
const randomFloat = randomizeFloat(0, 1);
console.log(randomFloat); // e.g.: 0.73

const temperature = randomizeFloat(20.0, 30.0);
console.log(temperature); // e.g.: 25.67
```

#### `getSecureWeightedRandom(weights: number[]): number`

Generate a secure random index based on a weight array.

**Parameters:**
- `weights` - Weight array

**Returns:**
- A random index based on weight distribution

**Example:**
```javascript
// Weights [1, 2, 3], index 2 has the highest probability of being selected
const weights = [1, 2, 3];
const randomIndex = getSecureWeightedRandom(weights);
console.log(randomIndex); // 0, 1, or 2

// Practical application: Select prizes based on weights
const prizes = ['Bronze', 'Silver', 'Gold'];
const prizeWeights = [5, 3, 1]; // Bronze has the highest probability
const selectedPrizeIndex = getSecureWeightedRandom(prizeWeights);
const selectedPrize = prizes[selectedPrizeIndex];
console.log(selectedPrize);
```

## Advanced Usage

### Combined Usage

```javascript
import { randomizeAny, randomizeInteger, getSecureWeightedRandom } from 'randomize-any';

// Create a weighted random selector
function weightedRandomSelect(items, weights) {
  const index = getSecureWeightedRandom(weights);
  return items[index];
}

const items = ['Common Item', 'Rare Item', 'Legendary Item'];
const weights = [70, 25, 5]; // 70% common, 25% rare, 5% legendary

const selectedItem = weightedRandomSelect(items, weights);
console.log(selectedItem);
```

### Generate Random Data

```javascript
// Generate random user data
function generateRandomUser() {
  const names = ['John', 'Jane', 'Bob', 'Alice'];
  const ages = randomizeInteger(18, 65);
  const scores = randomizeFloat(60, 100);
  
  return {
    name: randomizeAny(names),
    age: ages,
    score: Math.round(scores * 100) / 100
  };
}

const user = generateRandomUser();
console.log(user);
// e.g.: { name: 'Jane', age: 28, score: 87.34 }
```

## Browser Support

This library uses the `crypto.getRandomValues()` API to provide cryptographically secure random numbers. Supported browsers include:

- Chrome 11+
- Firefox 21+
- Safari 3.1+
- Edge 12+
- IE 11+

For unsupported environments, it automatically falls back to `Math.random()`.

## Module Formats

This package provides multiple module formats:

- **ESM**: `dist/index.browser.esm.mjs`
- **CommonJS**: `index.js`
- **UMD**: `dist/index.browser.global.js`
- **Legacy versions**: Compatible versions with polyfills

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Generate coverage report
pnpm coverage
```

## Websites Using This Library

Here are some websites and applications that use `randomize-any` in production:

### 🎮 Gaming & Entertainment

- **[Colorfle Unlimited](https://colorfle.app/)** - A color wordle use the random algorithm to select daily target color randomly.
- **[Flagle Explorer](https://flagle.fun/)** - A flag wordle select daily flag randomly by using weighted randomization.

### 🎯 Utilities & Tools
- **[Ruleta Aleatoria](https://ruletaa.net/)** - Simple web app helping users make random choices
- **[Random Wheel from 1 to 100](http://ruletaa.net/en/numbers/1-100)** - Tool for randomly selecting numbers from 1 to 100 using secure randomization algorithms

---

*Want to showcase your website here? [Open an issue](https://github.com/horushe93/isomorphism-libs/issues) or submit a pull request!*

## License

MIT License
