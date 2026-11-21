// Run in a disposable profile with active projects Alpha and Beta,
// each containing a top-level pending task named "Task Alpha" or "Task Beta".
async page => {
  const panel = page.locator('[data-task-manager]');
  const nav = panel.getByRole('navigation');
  const task = name => panel.locator('.mtt-content').getByRole('button', { name, exact: true });
  for (const view of [/^(Board|看板)$/, /^(Matrix|四象限)$/]) {
    await nav.getByRole('button', { name: 'Alpha', exact: true }).click();
    await task('Task Alpha').waitFor();
    await task('Task Beta').waitFor({ state: 'hidden' });
    await nav.getByRole('button', { name: view }).click();
    await task('Task Alpha').waitFor();
    await task('Task Beta').waitFor();
    if (await nav.getByRole('button', { name: 'Alpha', exact: true }).getAttribute('aria-pressed') !== 'false') {
      throw new Error('Project selection remained active in the global view');
    }
  }
};
