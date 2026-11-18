// Run against the open comparison panel in a disposable DSH browser profile.
import assert from 'node:assert/strict';
export async function verifyLiveComparison(page) {
  const panel = page.locator('.jd-panel');
  const [left, right] = await panel.locator('textarea').all();
  assert.equal(await panel.getByRole('combobox').count(), 0);
  await left.fill('开始\n会议在周三\n结束');
  await right.fill('开始\n会议在周五\n结束\n附注');
  await panel.locator('.jd-plus').nth(1).waitFor();
  assert.equal(await panel.locator('.jd-minus').count(), 1);
  for (const divider of await panel.getByRole('separator').all()) {
    const box = await divider.boundingBox();
    const leftWidth = () => left.evaluate(el => el.clientWidth);
    const before = await leftWidth();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, {steps: 5});
    await page.mouse.up();
    assert(await leftWidth() > before + 50);
    const headerWidth = await panel.locator('th').first().evaluate(el => el.clientWidth);
    assert(Math.abs(headerWidth - await leftWidth()) < 15);
    await divider.dblclick();
    assert.equal(await divider.getAttribute('aria-valuenow'), '50');
    await divider.press('ArrowRight');
    assert.equal(await divider.getAttribute('aria-valuenow'), '52');
  }
  await panel.getByRole('checkbox').check();
  assert.equal(await panel.locator('tbody tr').count(), 2);
  assert.equal(await panel.locator('.jd-minus mark').innerText(), '三');
  assert.equal(await panel.locator('.jd-plus mark').innerText(), '五');
  await right.fill('开始\n会议在周三\n结束');
  await panel.getByRole('status').filter({hasText:/match|一致/}).waitFor();
  await right.fill('');
  await panel.locator('.jd-minus').nth(2).waitFor();
  await left.fill('');
  await panel.locator('table').waitFor({state:'hidden'});
  await left.fill('a'.repeat(500001));
  await panel.getByRole('alert').waitFor();
  await left.fill('{invalid');
  await right.fill('{invalid');
  await panel.getByRole('status').filter({hasText:/match|一致/}).waitFor();
}
