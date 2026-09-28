import { expect, test } from '@playwright/test'

test('opening and architecture remain visually stable', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('opening.png', { fullPage: true })
  await page.goto('/?act=1&scene=0')
  await expect(page).toHaveScreenshot('architecture.png', { fullPage: true })
})

test('live journey opens as a workload workspace with topology on demand', async ({ page }) => {
  await page.goto('/?act=2&scene=0')
  await expect(page).toHaveScreenshot('live-journey.png', { fullPage: true })
})

test('desktop scenes fit the viewport without document scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'rehearsal-mobile', 'Mobile is tested for usability rather than stage zero-scroll.')
  for (const path of ['/?act=0&scene=0', '/?act=1&scene=0', '/?act=2&scene=0', '/?act=2&scene=1', '/?act=4&scene=0']) {
    await page.goto(path)
    await page.evaluate(() => window.scrollTo(1000, 1000))
    const position = await page.evaluate(() => ({x: window.scrollX, y: window.scrollY, overflow: getComputedStyle(document.documentElement).overflow}))
    expect(position, `${path} should have no desktop document scrolling`).toEqual({x: 0, y: 0, overflow: 'hidden'})
  }
})

test('core controls are keyboard reachable', async ({ page }) => {
  await page.goto('/?act=0&scene=0')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeFocused()
})
