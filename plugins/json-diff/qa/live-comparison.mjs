import assert from 'node:assert/strict';

export async function verifyLiveComparison(page) {
  const panel = page.locator('.jd-panel');
  const [left,right] = await panel.locator('textarea').all();
  await left.fill('111\n22\n333\n444');
  await right.fill('111\n222\n333\n444');
  const items = panel.locator('.jd-list button');
  await items.first().waitFor();
  assert.equal(await items.count(), 1);
  assert.match(await items.first().innerText(), /22 → 222/);
  assert.equal(await panel.locator('.jd-plus mark').innerText(), '2');
  const divider = panel.getByRole('separator');
  await divider.press('ArrowRight');
  assert.equal(await divider.getAttribute('aria-valuenow'), '52');
  await divider.dblclick();
  assert.equal(await divider.getAttribute('aria-valuenow'), '50');
  const prefix = 'same\n'.repeat(100);
  await left.fill(prefix+'A\nB');
  await right.fill(prefix+'C\nB\nD');
  await items.nth(1).waitFor();
  await items.first().click();
  assert(await right.evaluate(el=>el.scrollTop>0));
  await right.fill(prefix+'A\nB');
  await panel.locator('.jd-equal').waitFor();
  assert.equal(await items.count(),0);
  await left.fill('a'.repeat(500001));
  await panel.getByRole('alert').waitFor();
  await left.fill('');
  await right.fill('');
  await panel.getByRole('alert').waitFor({state:'hidden'});
}
