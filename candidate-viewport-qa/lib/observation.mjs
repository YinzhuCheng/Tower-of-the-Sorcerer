// Executed in the inspected page. Reads DOM and existing read-only QA hooks only.
// No state, localStorage, style, renderer, or game hooks are written here.
export function observe(document, storage, win, config) {
  const q = s => document.querySelector(s);
  const visible = el => Boolean(el && !el.hidden && !el.classList.contains('hidden') && el.getClientRects().length && win.getComputedStyle(el).display !== 'none' && win.getComputedStyle(el).visibility !== 'hidden');
  const box = el => { if (!el) return null; const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
  const text = s => q(s)?.textContent?.trim().slice(0,1000) ?? null;
  const dialog = q(config.adapter === 'a' ? '#gal-root' : '#story');
  const storyOpen = visible(dialog) && (config.adapter === 'a' || dialog.open);
  const modalOpen = config.adapter === 'a' ? visible(q('#modal-root')) : Boolean(q('dialog[open]'));
  let state=null, identity=null, saveKey=null, saveValid=false, saveError=null;
  try {
    if (config.adapter === 'a') {
      // The app's installed content scope maps this logical key to A's actual key.
      saveKey='lost-magic-tower:auto:v1'; state=JSON.parse(storage.getItem(saveKey) ?? 'null');
      saveValid=Boolean(state && Array.isArray(state.floorStates) && state.floorStates.length >= 30 && Number.isInteger(state.floor) && Number.isInteger(state.x) && Number.isInteger(state.y));
    } else {
      const hook=config.adapter==='b'?win.__FOREST_PREVIEW__:win.__CAMPAIGN_PREVIEW__;
      state=hook?.getState(); identity=hook?.getIdentity();
      if (identity) {
        saveKey=`${config.adapter==='c3d'?'c3d-prototype:':''}campaign:${identity.campaignId}:${identity.difficultyId}:${identity.rulesVersion}:${identity.contentHash}:auto`;
        const parsed=JSON.parse(storage.getItem(saveKey) ?? 'null'), stored=parsed?.$campaignSave===1?parsed.state:parsed;
        saveValid=Boolean(stored && state && identity.campaignId===config.expectedCampaignId && stored.identity?.campaignId===identity.campaignId && stored.identity?.contentHash===identity.contentHash && stored.identity?.rulesVersion===identity.rulesVersion && stored.identity?.difficultyId===identity.difficultyId && stored.location?.regionId===state.location?.regionId && stored.location?.x===state.location?.x && stored.location?.y===state.location?.y);
      }
    }
  } catch(e) { saveError=String(e.message); }
  if (state && config.adapter!=='a') saveValid=saveValid && Number.isInteger(state.location?.x) && Number.isInteger(state.location?.y);
  const summary=state ? {region:config.adapter==='a'?`floor:${state.floor}`:state.location?.regionId,x:config.adapter==='a'?state.x:state.location?.x,y:config.adapter==='a'?state.y:state.location?.y,victory:Boolean(state.victory),revision:state.revision??null} : null;
  const canvases=[...document.querySelectorAll('canvas')].map(el=>({id:el.id||null,width:el.width,height:el.height,css:box(el),visible:visible(el),dataset:{...el.dataset}}));
  const canvasReady=canvases.some(c=>c.visible && c.width>0 && c.height>0 && c.css.width>0 && c.css.height>0);
  const board=q('#board'), boardReady=visible(board) && board.children.length===121;
  const mapCanvas=canvases.find(c=>c.id==='map-canvas');
  const mapCanvasReady=Boolean(mapCanvas?.visible && mapCanvas.width>0 && mapCanvas.height>0 && mapCanvas.css.width>0 && mapCanvas.css.height>0);
  const loadingHidden=Boolean(q('#loading-note')?.classList.contains('hidden'));
  const shellActive=Boolean(q('#app-shell') && !q('#app-shell').inert);
  let renderer='unknown', rendererSettled=true;
  if (config.adapter==='a') renderer=canvasReady?(win.__TOWER_FORCE_CANVAS__?'Canvas2D (app-selected)':'canvas (type unverified)'):'not-created';
  else renderer=board?.dataset.renderer==='continuous' && canvasReady?'Canvas2D continuous':boardReady?'DOM grid':'not-ready';
  const viewHealth=text('#view-health'), viewStats=text('#view-stats');
  let threeSnapshot=null;
  if (config.adapter==='c3d') {
    const read=win.__C3D_QA__?.snapshot();
    if (read) threeSnapshot={mode:read.mode,view:read.view,stateHash:read.stateHash,stats:read.stats};
    const threeCanvas=canvases.find(c=>c.id==='three-canvas');
    if (threeSnapshot?.view==='3d' && threeCanvas?.visible && viewStats?.includes('WebGL2')) renderer='WebGL2 (app-reported)';
    else if (threeSnapshot?.view==='2d' && viewHealth?.startsWith('已回退 2D：') && boardReady && board.dataset.renderer==='continuous' && mapCanvasReady && threeCanvas && !threeCanvas.visible) renderer='Canvas2D fallback';
    else if (threeSnapshot?.view==='2d' && viewHealth?.startsWith('已回退 2D：') && boardReady && board.dataset.renderer==='legacy' && mapCanvas && threeCanvas && !mapCanvas.visible && !threeCanvas.visible) renderer='DOM grid fallback';
    else rendererSettled=false;
  }
  const mapSurfaceReady=config.adapter==='a'?canvasReady&&loadingHidden&&shellActive:boardReady && (board?.dataset.renderer==='legacy'||(board?.dataset.renderer==='continuous'&&mapCanvasReady)||(config.adapter==='c3d'&&renderer==='WebGL2 (app-reported)'));
  const ready=Boolean(saveValid && mapSurfaceReady && rendererSettled && !storyOpen && !modalOpen);
  const directions=[['up',0,-1,'ArrowUp'],['left',-1,0,'ArrowLeft'],['right',1,0,'ArrowRight'],['down',0,1,'ArrowDown']];
  let safeMove=null;
  if (ready && summary) for(const [direction,dx,dy,key] of directions) {
    const x=summary.x+dx,y=summary.y+dy;
    const tile=config.adapter==='a'?null:[...board.children].find(el=>(el.getAttribute('aria-label')??'').startsWith(`${x},${y} `));
    const safe=config.adapter==='a'?state.floorStates[state.floor]?.map?.[y]?.[x]==='.':Boolean(tile?.classList.contains('floor') && !tile.classList.contains('entity') && !tile.classList.contains('blocked') && !tile.title && !tile.textContent.trim());
    if(safe){safeMove={direction,key,x,y};break;}
  }
  return {
    url:win.location.href,title:document.title,documentReady:document.readyState,
    viewport:{width:win.innerWidth,height:win.innerHeight,dpr:win.devicePixelRatio,scrollX:win.scrollX,scrollY:win.scrollY,visualWidth:win.visualViewport?.width??null,visualHeight:win.visualViewport?.height??null},
    document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,horizontalOverflow:document.documentElement.scrollWidth>win.innerWidth+1},
    save:{key:saveKey,valid:saveValid,error:saveError,identity},state:summary,canvases,
    readiness:{ready,canvasReady,mapCanvasReady,boardReady,loadingHidden,shellActive,storyOpen,modalOpen,rendererSettled},
    renderStatus:{renderer,viewHealth,viewStats,three:threeSnapshot,loadingText:text('#loading-note'),artRevision:q('#map-canvas')?.dataset.artRevision??null,layout:win.__C_LAYOUT_QA__?.snapshot?.()??null},
    dialog:{visible:storyOpen,kind:config.adapter==='a'?'opening GAL':'current story',rect:box(dialog),text:storyOpen?dialog.textContent.trim().slice(0,1800):null},
    ui:{map:box(config.adapter==='a'?q('#game-container'):q('.map-stage')),board:box(board),controls:[...document.querySelectorAll('[data-dir],[data-move],#story-skip,#story-pause,#resume-story,[data-gal-control="skip"]')].map(el=>({id:el.id||el.dataset.dir||el.dataset.move||el.dataset.galControl,visible:visible(el),disabled:Boolean(el.disabled),rect:box(el)}))},safeMove
  };
}
export function observationExpression(config) {
  return `(${observe.toString()})(document, localStorage, window, ${JSON.stringify(config)})`;
}
