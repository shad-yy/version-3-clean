/**
 * Polyfill for `self` so Next.js server bundle (webpack runtime) works in Node.
 * Use: node -r ./self-polyfill.js node_modules/next/dist/bin/next build
 */
if (typeof globalThis.self === "undefined") {
  globalThis.self = globalThis;
}
