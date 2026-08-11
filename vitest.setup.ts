/**
 * Vitest global setup.
 *
 * Next.js loads `.env.local` automatically; Vitest does not. Several route
 * handlers refuse to run without JWT_SECRET and return 500, which previously
 * made every admin auth test fail in `beforeAll` and silently skip.
 *
 * We inject a deterministic test secret rather than reading the developer's
 * `.env.local`, so the suite behaves identically on every machine and in CI.
 */
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "vitest-only-secret-do-not-use-in-production"
}

if (!process.env.ADMIN_PASSWORD_HASH) {
  // bcrypt hash of the string "test-password", cost 10.
  process.env.ADMIN_PASSWORD_HASH =
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
}
