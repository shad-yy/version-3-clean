# Smart Live TV - Non-Negotiable Requirements

**Purpose**: Critical requirements that MUST be maintained during all development work.

**Status**: Enforced  
**Last Updated**: 2025-01-XX

---

## 1. API Architecture Requirements

### ✅ MUST: Use Unified API Layer
- **Rule**: All frontend code MUST use `unifiedSportsAPI`, `newsAPI`, or `ufcAPI`
- **Never**: Call `theSportsDB`, `newsAPI`, or `ufcScraper` directly from pages/components
- **Exception**: API route handlers can use low-level clients

### ✅ MUST: Server-Side API Calls Only
- **Rule**: External APIs (TheSportsDB, NewsData.io) MUST be called server-side
- **Never**: Make external API calls from client-side React components
- **Exception**: Client-side caching (localStorage) is allowed

### ✅ MUST: Rate Limit Compliance
- **Rule**: TheSportsDB calls MUST stay below 25 requests/minute
- **Implementation**: Use existing rate limiting in `lib/api/the-sports-db.ts`
- **Never**: Bypass rate limiting or make concurrent requests without queuing

---

## 2. Error Handling Requirements

### ✅ MUST: Graceful Error Handling
- **Rule**: API failures MUST return empty arrays `[]` or cached data, never throw errors
- **User Message**: Show "Data temporarily unavailable" instead of technical error messages
- **Never**: Let API errors crash pages or components

### ✅ MUST: Fallback Mechanisms
- **Rule**: All API calls MUST have fallback (cached data or mock data)
- **News**: Falls back to mock news if NewsData.io fails
- **UFC**: Falls back to cached UFC data if scraping fails
- **Sports**: Falls back to cached sports data if TheSportsDB fails

---

## 3. Caching Requirements

### ✅ MUST: Cache All API Responses
- **Rule**: All external API calls MUST be cached with appropriate TTLs
- **TTLs**: 
  - Leagues/Teams/Players: 24 hours
  - Events: 15 minutes (season) or 60 seconds (today)
  - Search: 10 minutes
- **Never**: Make API calls on every page load without checking cache

### ✅ MUST: Cache Key Format
- **Rule**: Cache keys MUST follow format: `api:{endpoint}:{params}`
- **Example**: `api:eventsday.php:d=2025-01-15&s=Soccer`
- **Never**: Use inconsistent cache key formats

---

## 4. Data Transformation Requirements

### ✅ MUST: Transform to Unified Types
- **Rule**: TheSportsDB responses MUST be transformed to `UnifiedTeam`, `UnifiedPlayer`, `UnifiedFixture`, etc.
- **Location**: Transformations in `lib/api/unified-sports-api.ts`
- **Never**: Return TheSportsDB types directly to frontend

### ✅ MUST: Handle Missing Fields
- **Rule**: Missing fields MUST use defaults (empty string, null, placeholder image)
- **Images**: Always provide fallback (`/placeholder-logo.svg`)
- **Never**: Return `undefined` for required fields

---

## 5. Security Requirements

### ✅ MUST: Protect API Keys
- **Rule**: API keys MUST be in environment variables, never hardcoded
- **Server-Side Only**: Keys never exposed to client (except `NEXT_PUBLIC_*` where required)
- **Never**: Commit API keys to git

### ✅ MUST: Validate User Input
- **Rule**: All user input (search queries, parameters) MUST be validated and sanitized
- **SSRF Protection**: URL validation for custom endpoints (see `lib/config.ts` ALLOWED_DOMAINS)
- **Never**: Trust user input without validation

### ✅ MUST: Admin Route Protection
- **Rule**: Admin routes (`/admin/*`, `/dev/*`) MUST be protected with JWT authentication
- **Implementation**: See `middleware.ts`
- **Never**: Expose admin routes without authentication

---

## 6. Code Quality Requirements

### ✅ MUST: TypeScript Strict Mode
- **Rule**: All code MUST pass TypeScript compilation (`npx tsc --noEmit`)
- **Types**: Use existing types from `lib/types.ts`, don't use `any`
- **Never**: Disable TypeScript errors with `@ts-ignore` without justification

### ✅ MUST: Follow Existing Patterns
- **Rule**: New code MUST follow existing code patterns and structure
- **Examples**: 
  - API routes in `app/api/*/route.ts`
  - Components in `components/*/`
  - Types in `lib/types.ts`
- **Never**: Create new patterns without documenting them

---

## 7. Performance Requirements

### ✅ MUST: Optimize API Calls
- **Rule**: Minimize API calls through caching and batching
- **Batch Requests**: Fetch multiple endpoints concurrently when possible
- **Never**: Make sequential API calls when they can be parallel

### ✅ MUST: Lazy Load Images
- **Rule**: All images MUST use Next.js `Image` component with lazy loading
- **Component**: Use `OptimizedImage` from `components/ui/optimized-image.tsx`
- **Never**: Use `<img>` tags without optimization

---

## 8. Documentation Requirements

### ✅ MUST: Document New Features
- **Rule**: New API endpoints, components, or major features MUST be documented
- **Location**: Update `TECHNICAL_ARCHITECTURE.md` or create feature-specific docs
- **Never**: Add features without documentation

### ✅ MUST: Update Type Definitions
- **Rule**: New data structures MUST have TypeScript types
- **Location**: Add to `lib/types.ts` or create `lib/types/{name}.ts`
- **Never**: Use `any` or untyped objects

---

## 9. Testing Requirements

### ✅ MUST: Test Before Deployment
- **Rule**: All changes MUST be tested locally before deployment
- **Checks**: Type check, lint, build, manual page testing
- **Never**: Deploy without testing

### ✅ MUST: Handle Edge Cases
- **Rule**: Code MUST handle edge cases (empty responses, null values, missing data)
- **Examples**: 
  - Empty search results
  - Missing team logos
  - No events for a date
- **Never**: Assume data always exists

---

## 10. Data Integrity Requirements

### ✅ MUST: Preserve Reference Data
- **Rule**: `data/sportsdb/*.json` files MUST be preserved (regenerate, don't delete)
- **Purpose**: These files are canonical reference data for league/team IDs
- **Never**: Delete or manually edit these files

### ✅ MUST: Validate API Responses
- **Rule**: API responses MUST be validated for expected shape
- **Implementation**: Use `expectedKey` parameter in `makeRequest()`
- **Never**: Trust API responses without validation

---

## Violation Consequences

**Minor Violations** (Code quality, documentation):
- Code review feedback
- Request to fix before merge

**Major Violations** (Security, architecture):
- Block merge until fixed
- Escalate to lead developer

**Critical Violations** (Data loss, security breach):
- Immediate rollback
- Post-mortem review

---

## Exceptions

**Temporary Exceptions**:
- Must be documented with `// TODO: Fix architecture violation`
- Must have issue created in project tracker
- Must be fixed within 1 sprint (2 weeks)

**Permanent Exceptions**:
- Must be approved by lead developer
- Must be documented in `TECHNICAL_ARCHITECTURE.md`
- Must have justification

---

**Remember**: These requirements exist to maintain code quality, security, and scalability. Violations can lead to technical debt, security issues, or system failures.

**Questions?** See `TECHNICAL_ARCHITECTURE.md` for detailed explanations.

