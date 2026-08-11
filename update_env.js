const fs = require('fs');

const files = [
  "tests/admin-auth.test.ts",
  "middleware.ts",
  "app/api/dev/news/route.ts",
  "app/api/dev/logs/route.ts",
  "app/api/dev/login/route.ts",
  "app/api/admin/metrics/route.ts",
  "app/api/auth/admin/status/route.ts",
  "app/api/auth/admin/route.ts",
  "app/api/admin/health/route.ts",
  "app/api/auth/admin/extend/route.ts",
  "app/api/admin/health/report/route.ts"
];

const basePath = "c:\\Users\\u2000\\Downloads\\smart-live-tv\\";

files.forEach(f => {
    let content = fs.readFileSync(basePath + f, 'utf8');
    content = content.replace(/import\s*\{\s*getJwtSecret\s*,\s*hasJwtSecret\s*\}\s*from\s*["']@\/lib\/env["']/g, 'import { ENV } from "@/lib/config/env"');
    content = content.replace(/getJwtSecret\(\)/g, 'ENV.JWT_SECRET');
    content = content.replace(/hasJwtSecret\(\)/g, '(!!ENV.JWT_SECRET && ENV.JWT_SECRET.length > 0)');
    fs.writeFileSync(basePath + f, content);
});
console.log("Done");
