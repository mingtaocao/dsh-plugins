// Run on an authenticated library panel with a document open and a controls.html fixture
// titled Controls whose button changes its output from Idle to Clicked.
async page => {
  await page.locator('.dshl-details summary').click();
  const detailsBox = await page.locator('.dshl-details').boundingBox();
  const frameBox = await page.locator('.dshl-memory-frame').boundingBox();
  if (detailsBox.y + detailsBox.height > frameBox.y + 1) throw new Error('Details overlap the document');
  const drag = page.locator('.dshl-split');
  const box = await drag.boundingBox();
  const nav = page.locator('.dshl-nav');
  const before = await nav.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 85, box.y + 10, {steps: 10});
  await page.mouse.up();
  if ((await nav.boundingBox()).width <= before.width + 40) throw new Error('Drag did not resize the tree');
  await drag.press('Home');
  await page.waitForFunction(() => localStorage.getItem('dsh-html-library:nav-width') === '18');
  await page.locator('.dshl-navrow[title$="controls.html"]').click();
  const sandbox = mode => page.frameLocator('iframe[title="Controls"][sandbox="'+mode+'"]');
  await sandbox('allow-scripts').getByRole('button').click();
  if (await sandbox('allow-scripts').locator('output').innerText() !== 'Clicked') throw new Error('Document control did not respond');
};
