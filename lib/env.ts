// Lazy environment accessors to avoid throwing at module initialization time.
// Validation happens only when the value is actually accessed.

function getEnv(key: string, required = true): string {
  const value = process.env[key]
  if (required && (!value || value.length === 0)) {
    throw new Error(
      `Environment validation failed. Missing or invalid fields: ${key}\n` +
      `Please set these in your .env.local file. See README.env.example for required variables.`
    )
  }
  return value ?? ""
}

// Export as getter functions, not eagerly-evaluated values
export const getJwtSecret = () => getEnv("JWT_SECRET")
// unused
export const getSportsDbApiKey = () => getEnv("THESPORTSDB_API_KEY", false)

// Helper used by routes/middleware to detect presence without throwing
export function hasJwtSecret(): boolean {
  const value = process.env["JWT_SECRET"]
  return !!value && value.length > 0
}