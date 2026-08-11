export const devConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args)
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args)
    }
  },
}
