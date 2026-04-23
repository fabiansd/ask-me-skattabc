import { test, expect } from '@playwright/test';
import path from 'path';

// Screenshots land in .dev-screenshots/ at the repo root so they can be opened
// directly from an editor and are easy to gitignore.
const SCREENSHOT_DIR = path.join(process.cwd(), '.dev-screenshots');

const viewports = [
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
] as const;

for (const vp of viewports) {
  test(`SourcesSidebar renders correctly on ${vp.name} (${vp.width}x${vp.height})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/dev/sources-preview');

    const sidebar = page.locator('[data-sidebar="sources"]');
    await expect(sidebar).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${vp.name}.png`),
      fullPage: false,
    });

    // Also confirm the sidebar is not wider than the viewport — this is the
    // core of the mobile bug we are fixing.
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect.soft(box.width).toBeLessThanOrEqual(vp.width);
    }
  });
}
