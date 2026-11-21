// Run in a disposable profile with active projects Alpha and Beta,
// each containing a top-level pending task named "Task Alpha" or "Task Beta".
async page => {
  const panel = page.locator('[data-task-manager]');
  const nav = panel.getByRole('navigation');
  const views = nav.locator('.mtt-views > button');
  const names = await views.evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
  if (!['全部任务|看板|四象限', 'All tasks|Board|Matrix'].includes(names.join('|'))) {
    throw new Error('Expected three peer view buttons, got ' + names.join('|'));
  }
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
