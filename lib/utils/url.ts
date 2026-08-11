export function getApiBaseUrl(): string {
  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  return host.startsWith("http") ? host : `https://${host}`
}

