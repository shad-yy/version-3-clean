import { Redis } from "@upstash/redis"
import * as fs from "fs"
import * as path from "path"

// Parse .env.local manually
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  for (const line of envContent.split("\n")) {
    const parts = line.trim().split("=")
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const val = parts.slice(1).join("=").trim()
      process.env[key] = val
    }
  }
} catch (e) {
  console.warn("Failed to load .env.local", e)
}

async function testRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  console.log("Redis URL:", url)
  console.log("Redis Token (first 5 chars):", token ? token.substring(0, 5) : "undefined")

  if (!url || !token) {
    console.log("Missing Redis credentials")
    return
  }

  try {
    const redis = new Redis({ url, token })
    console.log("Attempting ping...")
    const res = await redis.ping()
    console.log("Ping result:", res)
  } catch (err) {
    console.error("Redis connection failed:", err)
  }
}

testRedis()
