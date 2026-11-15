// Run after ui-workflows.playwright.js, in the same isolated browser session and project.
async page => {
 const root=page.locator('[data-task-manager]'),detail=root.locator('.mtt-detail');
 const call=async(endpoint,payload)=>await page.evaluate(async({endpoint,payload})=>{const r=await(await fetch('/api/mt-tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint,payload})})).json();if(!r.ok)throw Error(JSON.stringify(r));return r.value;},{endpoint,payload});
 const projectName=await root.getByRole('heading',{level:1}).innerText();
 const before=await call('snapshot');const projectId=before.projects.find(p=>p.name===projectName).id;
 const parent=before.tasks.find(t=>t.title==='梳理本周计划'&&t.projectId===projectId);
 if(!await detail.isVisible())await root.locator('.mtt-content').getByRole('button',{name:'梳理本周计划',exact:true}).click();
 await call('mutate',{requestId:await page.evaluate(()=>crypto.randomUUID()),revision:before.revision,op:'task.update',args:{id:parent.id,priority:'high'}});
 await detail.getByRole('textbox',{name:'备注',exact:true}).fill('冲突后的备注仍然保留，优先级由另一处修改。');
 await detail.locator('.mtt-detail-heading').click();
 await root.getByRole('alert').waitFor();
 if(await detail.getByRole('textbox',{name:'备注',exact:true}).inputValue()!=='冲突后的备注仍然保留，优先级由另一处修改。')throw Error('Conflict discarded typed draft');
 await detail.getByRole('button',{name:'关闭',exact:true}).click();
 await detail.waitFor({state:'hidden'});
 const after=await call('snapshot');const saved=after.tasks.find(t=>t.id===parent.id);
 if(saved.priority!=='high'||saved.notes!=='冲突后的备注仍然保留，优先级由另一处修改。')throw Error('Retry lost remote fields or local draft');
 if(await root.getByRole('alert').isVisible())throw Error('Error not cleared after retry');
 // Force one save failure, leave the plugin, then recover its stored draft.
 await root.locator('.mtt-content').getByRole('button',{name:'梳理本周计划',exact:true}).click();
 await page.route('**/api/mt-tasks',async route=>{
   const d=route.request().postDataJSON();
   if(d?.endpoint==='mutate'&&d.payload.args.notes==='页面离开后恢复的备注')await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,error:{code:'TEST_FAILURE',message:'回归模拟：保存失败'}})});
   else await route.continue();
 });
 await detail.getByRole('textbox',{name:'备注',exact:true}).fill('页面离开后恢复的备注');
 await detail.locator('.mtt-detail-heading').click();
 await root.getByRole('alert').filter({hasText:'回归模拟：保存失败'}).waitFor();
 await page.getByRole('button',{name:'新建会话',exact:true}).first().click();
 await root.waitFor({state:'hidden'});
 await page.unroute('**/api/mt-tasks');
 await page.getByRole('button',{name:'任务管理',exact:true}).click();
 await root.locator('.mtt-project-items').getByRole('button',{name:projectName,exact:true}).click();
 await root.locator('.mtt-content').getByRole('button',{name:'梳理本周计划',exact:true}).click();
 await detail.waitFor();
 if(await detail.getByRole('textbox',{name:'备注',exact:true}).inputValue()!=='页面离开后恢复的备注')throw Error('Draft not recovered');
 await detail.getByRole('button',{name:'关闭',exact:true}).click();
 await detail.waitFor({state:'hidden'});
 const recovered=await call('snapshot');
 if(recovered.tasks.find(t=>t.id===parent.id).notes!=='页面离开后恢复的备注')throw Error('Recovered draft did not save');
 const draftKeys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('dsh-task-manager.draft.')));
 if(draftKeys.length)throw Error('Saved draft remained in storage');
 return {passed:['真实版本冲突保留草稿','重试只保存修改字段，保留其他来源的优先级更新','保存失败后离开页面，再打开可恢复草稿并保存','保存成功清理本地草稿'],parentId:parent.id};
}
