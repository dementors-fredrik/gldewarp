/*
 * Implements operators that work on vectors, scalars or
 * any combination of both.
 *
 * Operands are either Array (vectors) or Number (scalar).
 * If the arity of the operands don't match, the shorter
 * of them will be extended by repeating its components.
 *
 * A unary operand will always be converted into an Array,
 * even if all operands are unary.
 *
 * All functions return an array regardless of the arity
 * of their operands, except for functions that always
 * have a unary output, like `len`, `dist` and `dot`
 */

// JavaScript modulus behaves badly with negative dividends.
// This is a scalar modulus operator that behaves correctly.
const fixedMod = (v, d) => (v % d + d) % d;

// Helper functions for implementing the operators.

// Convert array or unary into a new array.
// If it is a unary, it is converted to an array of length 1.
const toArray = x => (x instanceof Array ? [...x] : [x]);

// pairs([1, 2, 3], [4, 5, 6]) -> [[1, 4], [2, 5], [3, 6]]
const pairs = (a, b) => a.map((v, i) => [v, b[i]]);

// scalarSum([1, 2, 3]) -> 6
const scalarSum = v => v.reduce((a, b) => a + b);

// extend([1, 2], [4, 5, 6, 7]) -> [[1, 2, 1, 2], [4, 5, 6, 7]]
function extend(a, b) {
  a = toArray(a); // a is now a new array
  b = toArray(b); // b is now a new array

  const alen = a.length;
  const blen = b.length;

  // This mutates a and b, but they are local to the function scope for now
  while (a.length < b.length) a.push(a[a.length % alen]);
  while (a.length > b.length) b.push(b[b.length % blen]);

  return [a, b];
}

// The arguments of the wrapper are extended to arrays of equal length before
// being passed to the original function
const extendWrap = f => (a, b) => f(...extend(a, b));

// The array arguments of the wrapper are aggregated into pairs through
// convolution, mapping the original function to each of them
const pairWrap = f => (a, b) => pairs(a, b).map(pair => f(...pair));

// Most binary vector functions can be generalized as the
// component-by-component application of a binary scalar function
const binary = f => extendWrap(pairWrap(f));

// Most n-ary vector functions can be generalized as the iterated application
// of a binary vector function on their arguments
const nary = f => (...args) => args.reduce(binary(f));

// Most unary vector functions can be generalized as the application of a
// unary scalar function to each component of the vector
const unary = f => v => toArray(v).map(f);

// Copies a vector, identical to toArray
export const copy = toArray;

// Unary operators
export const sqrt = unary(Math.sqrt);
export const inv = unary(a => -a);
export const abs = unary(Math.abs);
export const square = unary(a => a * a);
export const degToRad = unary(deg => Math.PI * deg / 180);
export const radToDeg = unary(rad => rad / Math.PI * 180);

// n-ary operators
export const add = nary((a, b) => a + b);
export const sub = nary((a, b) => a - b);
export const mul = nary((a, b) => a * b);
export const div = nary((a, b) => a / b);
export const mod = nary(fixedMod);

// Length-wise maximum and minimum, i.e. max(-10, 5) is -10
export const max = nary((a, b) => (square(a) > square(b) ? a : b));
export const min = nary((a, b) => (square(a) < square(b) ? a : b));

// Binary operators
export const clampLow = binary((a, b) => (a > b ? a : b));
export const clampHigh = binary((a, b) => (a < b ? a : b));

// Ternary operators
export const clamp = (v, lo, hi) => clampHigh(clampLow(v, lo), hi);

// Functions with unary outputs, for which the generalizations don't apply
export const len = a => Math.sqrt(scalarSum(square(a))); // unary
export const dist = (a, b) => len(sub(a, b)); // binary
export const dot = (...args) => scalarSum(mul(...args)); // n-ary
