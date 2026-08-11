export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Polyfill browser globals for server-side rendering
    if (typeof globalThis.self === "undefined") {
      ;(globalThis as any).self = globalThis
    }
  }
}

