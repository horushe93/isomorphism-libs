/**
 * Randomize an element from an array
 * @param list array
 * @returns randomized element
 */
export function randomizeAny(list: any[]) {
  const targetIndex = getSecureWeightedRandom(list.map(() => 1));
  return list[targetIndex];
}

/**
 * Randomize an integer
 * @param min minimum value
 * @param max maximum value
 * @returns randomized integer
 */
export function randomizeInteger(min: number, max: number) {
  const list = generateArray(min, max);
  return randomizeAny(list);
}

/**
 * Randomize a float number
 * @param min minimum value
 * @param max maximum value
 * @returns randomized float number
 */
export function randomizeFloat(min: number, max: number) {
  const list = generateArray(min, max, 0.01);
  return randomizeAny(list);
}

/**
 * Get a secure weighted random number
 * @param weights weight array
 * @returns randomized index
 */
export function getSecureWeightedRandom(weights: number[]) {
  let sum = weights.reduce((acc, val) => acc + val, 0); // Calculate total weight

  // Generate a secure random number (range 0 ~ sum-1)
  let array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  let rand = array[0] / (0xFFFFFFFF + 1) * sum; // Normalize to [0, sum)

  // Iterate through weight array to find corresponding random index
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
          return i;
      }
  }
  return getWeightedRandom(weights);
}

/**
 * Get a weighted random number
 * @param weights weight array
 * @returns randomized index
 */
function getWeightedRandom(weights: number[]) {
  const total = weights.reduce((acc, curr) => acc + curr, 0);
  const random = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return i;
    }
  }
}

/**
 * Generate an array
 * @param min minimum value
 * @param max maximum value
 * @param step step size
 * @returns array
 */
function generateArray(min: number, max: number, step = 1) {
  const array = [];
  for (let i = min; i <= max; i += step) {
    array.push(i);
  }
  return array;
}
