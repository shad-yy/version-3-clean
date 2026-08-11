// Route verification script to ensure all navigation links have corresponding pages
const fs = require("fs")
const path = require("path")

const APP_DIR = path.join(process.cwd(), "app")

// Expected routes based on navigation
const EXPECTED_ROUTES = [
  "/", // app/page.tsx
  "/scores", // app/scores/page.tsx
  "/leagues", // app/leagues/page.tsx
  "/teams", // app/teams/page.tsx
  "/players", // app/players/page.tsx
  "/events", // app/events/page.tsx
  "/news", // app/news/page.tsx
  "/ufc", // app/ufc/page.tsx
  "/search", // app/search/page.tsx
]

// Expected dynamic routes
const EXPECTED_DYNAMIC_ROUTES = [
  "/teams/[id]", // app/teams/[id]/page.tsx
  "/players/[id]", // app/players/[id]/page.tsx
  "/leagues/[id]", // app/leagues/[id]/page.tsx
  "/events/[id]", // app/events/[id]/page.tsx
]

function checkRouteExists(route) {
  if (route === "/") {
    return fs.existsSync(path.join(APP_DIR, "page.tsx"))
  }

  const routePath = route.replace(/^\//, "")
  const pagePath = path.join(APP_DIR, routePath, "page.tsx")
  return fs.existsSync(pagePath)
}

function checkDynamicRouteExists(route) {
  const routePath = route.replace(/^\//, "").replace(/\[id\]/, "[id]")
  const pagePath = path.join(APP_DIR, routePath, "page.tsx")
  return fs.existsSync(pagePath)
}

console.log("🔍 Verifying route structure...\n")

// Check static routes
console.log("📄 Static Routes:")
EXPECTED_ROUTES.forEach((route) => {
  const exists = checkRouteExists(route)
  const status = exists ? "✅" : "❌"
  const filePath = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`
  console.log(`${status} ${route} → ${filePath}`)
})

console.log("\n🔗 Dynamic Routes:")
EXPECTED_DYNAMIC_ROUTES.forEach((route) => {
  const exists = checkDynamicRouteExists(route)
  const status = exists ? "✅" : "❌"
  const filePath = `app${route}/page.tsx`
  console.log(`${status} ${route} → ${filePath}`)
})

console.log("\n📋 Summary:")
const staticRouteCount = EXPECTED_ROUTES.filter(checkRouteExists).length
const dynamicRouteCount = EXPECTED_DYNAMIC_ROUTES.filter(checkDynamicRouteExists).length
const totalExpected = EXPECTED_ROUTES.length + EXPECTED_DYNAMIC_ROUTES.length
const totalFound = staticRouteCount + dynamicRouteCount

console.log(`Found ${totalFound}/${totalExpected} expected routes`)
console.log(`Static routes: ${staticRouteCount}/${EXPECTED_ROUTES.length}`)
console.log(`Dynamic routes: ${dynamicRouteCount}/${EXPECTED_DYNAMIC_ROUTES.length}`)

if (totalFound === totalExpected) {
  console.log("\n🎉 All routes are properly configured!")
} else {
  console.log("\n⚠️  Some routes are missing. Check the file structure.")
}
