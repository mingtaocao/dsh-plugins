// Run against the open comparison panel in a disposable DSH browser profile.
import assert from 'node:assert/strict';
export async function verifyLiveComparison(page) {
  const panel = page.locator('.jd-panel');
  const [left, right] = await panel.locator('textarea').all();
  await left.fill('{"count":1}');
  await right.fill('{"count":2,"extra":true}');
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
  await right.fill('invalid');
  await panel.getByRole('alert').waitFor();
  await right.fill('{ "count": 1 }');
  await panel.getByRole('status').filter({hasText:/match|一致/}).waitFor();
  await right.fill('');
  await panel.locator('table').waitFor({state:'hidden'});
  await panel.getByRole('combobox').selectOption('text');
  await left.fill('alpha');
  await right.fill('alpha\nbeta');
  await panel.locator('.jd-plus').waitFor();
  assert.equal(await panel.locator('.jd-minus').count(), 0);
}
