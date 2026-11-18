// Run on an open library panel in an authenticated test workspace.
async page => {
  const library = page.locator('.dshl-root');
  const manage = library.getByRole('button', { name: /^(管理目录|Folders)$/ });
  const snapshot = '**/api/dsh-html-library/snapshot';
  const deny = route => route.fulfill({ status: 403, body: 'forbidden' });
  await library.waitFor();
  if (await manage.getAttribute('aria-expanded') === 'true') await manage.click();

  await page.route(snapshot, deny);
  try {
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await library.getByRole('alert').filter({ hasText: /DSH 拒绝|DSH denied/ }).waitFor();
  } finally {
    await page.unroute(snapshot, deny);
  }
  await manage.click();
  await library.locator('.dshl-roots').waitFor();
};
