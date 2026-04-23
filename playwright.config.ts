import { defineConfig } from '@playwright/test';

// Playwright config for visual testing only. The spec files in ./e2e/visual
// capture screenshots of dev-only preview pages (e.g. /dev/sources-preview) at
// mobile/tablet/desktop viewports so UI work can be verified without manually
// opening each breakpoint.
export default defineConfig({
  testDir: './e2e/visual',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  // Build + start a production server for visual tests. This avoids the
  // macOS Watchpack EMFILE issues `next dev` can hit and guarantees the
  // preview route is compiled before tests run. The preview page is a pure
  // client component with mock data, so it renders without DB/ES. The project
  // uses `output: 'standalone'`, so we launch the standalone server directly.
  webServer: {
    command:
      'npm run build && cp -R public .next/standalone/ 2>/dev/null; cp -R .next/static .next/standalone/.next/ 2>/dev/null; PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXTAUTH_URL: 'http://127.0.0.1:3100',
      // Unlocks the /dev/* preview routes. Production deploys never set this,
      // so those routes return 404 in the live app.
      ENABLE_DEV_PREVIEWS: 'true',
      // Skip the DB-dependent instrumentation hook — we don't need a default
      // user for visual-only tests.
      SKIP_INSTRUMENTATION: 'true',
    },
  },
});
