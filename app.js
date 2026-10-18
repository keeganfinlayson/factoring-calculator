(()=>{'use strict';
const $=id=>document.getElementById(id), input=$('number'), arrays=$('arrays');
let current=24, models=[], generation=0, freshEntry=false;
function pairs(n){const result=[];for(let r=1;r*r<=n;r++)if(n%r===0)result.push([r,n/r]);return result;}
function svgArray(rows,cols,id){
 const step=28,padLeft=50,padTop=50,width=cols*step+padLeft+20,height=rows*step+padTop+20;
 let disks='';for(let i=0;i<rows*cols;i++){const x=padLeft+(i%cols)*step+step/2,y=padTop+Math.floor(i/cols)*step+step/2;disks+=`<g transform="translate(${x} ${y})"><g class="counter" data-i="${i}"><ellipse cy="3" rx="10.5" ry="10" fill="#0b497e"/><circle r="10.5" fill="url(#disk-${id})" stroke="#11558b" stroke-width=".7"/><path d="M -6 -3 Q -4 -8 2 -7" fill="none" stroke="#b5ddfa" stroke-width="1.4" stroke-linecap="round" opacity=".65"/></g></g>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${rows} rows of ${cols} counters, ${rows*cols} in total" viewBox="0 0 ${width} ${height}" style="width:${width}px;max-width:100%;min-width:${width*.76}px;height:auto"><defs><radialGradient id="disk-${id}" cx="32%" cy="24%" r="78%"><stop offset="0" stop-color="#84c7f7"/><stop offset=".35" stop-color="#338bd0"/><stop offset=".8" stop-color="#176bb0"/><stop offset="1" stop-color="#0d4b83"/></radialGradient></defs><rect class="frame" x="${padLeft-3}" y="${padTop-3}" width="${cols*step+6}" height="${rows*step+6}" rx="6"/><path d="M ${padLeft} 35 H ${padLeft+cols*step} M ${padLeft} 30 V 40 M ${padLeft+cols*step} 30 V 40 M 34 ${padTop} V ${padTop+rows*step} M 29 ${padTop} H 39 M 29 ${padTop+rows*step} H 39" fill="none" stroke="#6e94b0" stroke-width="1.3"/><text class="dimension" x="${padLeft+cols*step/2}" y="23">${cols}</text><text class="dimension" x="17" y="${padTop+rows*step/2+7}">${rows}</text>${disks}</svg>`;
}
function drawCard(model,index,animate=true){
 const [r,c]=model.flipped?[model.pair[1],model.pair[0]]:model.pair;
 const card=model.card;card.className='array-card'+(c>14?' wide':'');
 card.innerHTML=`<div class="card-head"><div class="equation">${r} × ${c} <span class="total">= ${current}</span></div><button class="rotate" aria-label="Turn ${r} by ${c} rectangle">Turn ↻</button></div><div class="drawing">${svgArray(r,c,index+'-'+generation)}</div><p class="hint"></p>`;
 card.querySelector('button').onclick=()=>{model.flipped=!model.flipped;drawCard(model,index,false);};
 const drawing=card.querySelector('.drawing');requestAnimationFrame(()=>{card.querySelector('.hint').textContent=drawing.scrollWidth>drawing.clientWidth+2?'Scroll across to see the whole rectangle →':'';});
 const counters=card.querySelectorAll('.counter');
 if(!animate||$('reduced').checked){card.classList.add('finished');return;}
 const token=generation;
 counters.forEach((el,i)=>{const delay=index*650+Math.floor(i/c)*Math.min(90,700/r)+(i%c)*Math.min(28,400/c);el.style.animationDelay=delay+'ms';el.classList.add('visible');});
}
function render(animate=true){generation++;arrays.replaceChildren();$('chips').replaceChildren();
 const ps=pairs(current);$('heading').textContent='Factor pairs of '+current;
 $('summary').textContent=ps.length+' distinct '+(ps.length===1?'rectangle':'rectangles')+(current===1?' · 1 has one positive factor.':ps.length===1?' · Prime number.':'');
 models=ps.map((pair,index)=>{const card=document.createElement('article');card.id='pair-'+index;arrays.append(card);const model={pair,flipped:false,card};drawCard(model,index,animate);const chip=document.createElement('button');chip.textContent=pair.join(' × ');chip.onclick=()=>{card.scrollIntoView({behavior:$('reduced').checked?'instant':'smooth',block:'center'});card.classList.remove('flash');void card.offsetWidth;card.classList.add('flash');};$('chips').append(chip);return model;});
 $('status').className='';$('status').textContent=current+' '+(current===1?'counter':'counters')+' in each rectangle.';
}
function calculate(){const raw=input.value.trim();if(!/^\d+$/.test(raw)||Number(raw)<1||Number(raw)>200){$('status').textContent='Enter a whole number from 1 to 200.';$('status').className='error';return;}current=Number(raw);input.value=current;freshEntry=true;render();resetExplorer();}
$('form').onsubmit=e=>{e.preventDefault();calculate();};
$('replay').onclick=()=>render();$('turn').onclick=()=>{generation++;models.forEach((m,i)=>{m.flipped=!m.flipped;drawCard(m,i,false);});};
$('reduced').onchange=()=>{document.body.classList.toggle('reduced',$('reduced').checked);if($('reduced').checked&&blockPoses.length)layoutBlocks();if($('reduced').checked)arrays.querySelectorAll('.array-card').forEach(el=>el.classList.add('finished'));};
input.addEventListener('input',()=>freshEntry=false);input.addEventListener('focus',()=>input.select());
document.querySelector('.keypad').onclick=e=>{const button=e.target.closest('button');if(!button)return;const digit=button.dataset.digit,action=button.dataset.action;if(digit!==undefined){input.value=(freshEntry?'':input.value)+digit;freshEntry=false;}else if(action==='clear'){input.value='';freshEntry=false;}else if(action==='back'){input.value=input.value.slice(0,-1);freshEntry=false;}else if(action==='factor')calculate();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';freshEntry=false;input.focus();}if(e.target===input||e.target.closest('button,input,select')||e.ctrlKey||e.metaKey||e.altKey)return;if(/^\d$/.test(e.key)){e.preventDefault();input.value=(freshEntry?'':input.value)+e.key;freshEntry=false;}else if(e.key==='Enter'){e.preventDefault();calculate();}else if(e.key==='Backspace'){e.preventDefault();input.value=input.value.slice(0,-1);freshEntry=false;}});
window.addEventListener('resize',()=>models.forEach(m=>{const d=m.card.querySelector('.drawing');m.card.querySelector('.hint').textContent=d.scrollWidth>d.clientWidth+2?'Scroll across to see the whole rectangle →':'';}));

let mode='explore', columns=1, stops=[], found=new Map(), keyHeld=false;
let blockPoses=[], dimensionPoses=[], motionFrame=0;
const slider=$('width-slider'), blockSvg=$('blocks');
function widthStops(n){let total=0;const bins=[];for(let w=1;w<=n;w++){const weight=n%w===0?2.7:1;bins.push({width:w,start:total,center:total+weight/2,end:total+weight});total+=weight;}return bins.map(b=>({...b,start:b.start/total*1000,center:b.center/total*1000,end:b.end/total*1000}));}
function widthAt(value,bins){return (bins.find(b=>value<=b.end)||bins[bins.length-1]).width;}
function setMode(next){mode=next;$('exploration').hidden=mode!=='explore';$('all-view').hidden=mode!=='all';$('explore-mode').setAttribute('aria-pressed',mode==='explore');$('all-mode').setAttribute('aria-pressed',mode==='all');$('footer-instruction').textContent=mode==='explore'?'Move the slider to reshape the same blocks. Complete rectangles turn green.':'Each rectangle contains the same total. Turn a rectangle to swap its rows and columns.';document.querySelector('.primary').textContent=mode==='explore'?'Arrange':'Factor';if(mode==='explore')requestAnimationFrame(layoutBlocks);}
function resetExplorer(){cancelAnimationFrame(motionFrame);blockPoses=[];dimensionPoses=[];found=new Map();stops=widthStops(current);columns=Math.ceil(Math.sqrt(current));slider.value=stops[columns-1].center;slider.disabled=false;$('explore-title').textContent='Arrange '+current+' '+(current===1?'block':'blocks');$('max-width').textContent=current+' '+(current===1?'column':'columns');blockSvg.innerHTML=`<defs><linearGradient id="block-blue" x2="0.8" y2="1"><stop stop-color="#83c7f6"/><stop offset=".45" stop-color="#368dce"/><stop offset="1" stop-color="#176bb0"/></linearGradient><linearGradient id="block-green" x2="0.8" y2="1"><stop stop-color="#8ce0b5"/><stop offset=".45" stop-color="#3ca977"/><stop offset="1" stop-color="#218760"/></linearGradient></defs><g id="empty-slots"></g><g id="moving-blocks">${Array.from({length:current},(_,i)=>`<g class="explore-block" data-block="${i}"><rect class="edge" x="1" y="4" width="26" height="26" rx="4"/><rect class="face" x="1" y="1" width="26" height="26" rx="4"/><path d="M 5 6 H 22" stroke="white" opacity=".35" stroke-linecap="round"/></g>`).join('')}</g><g id="dimension-labels"><text id="column-dimension" class="dimension">0</text><text id="row-dimension" class="dimension">0</text></g>`;layoutBlocks();renderFound();$('status').textContent=current+' '+(current===1?'block':'blocks')+' · reshape them to find rectangles.';}
// A fixed screen-space frame: all block positions and sizes move in one animation.
function blockLayout(n,cols,width,height){
 const rows=Math.ceil(n/cols),step=Math.min(42,(width-78)/cols,(height-68)/rows);
 const left=(width-cols*step)/2,top=(height-rows*step)/2+8;
 return {rows,step,left,top,poses:Array.from({length:n},(_,i)=>({x:left+(i%cols)*step,y:top+Math.floor(i/cols)*step,scale:step/32}))};
}
function moveBlocks(targets,dimensionTargets){
 cancelAnimationFrame(motionFrame);
 const nodes=Array.from(blockSvg.querySelectorAll('.explore-block'));
 const labels=[$('column-dimension'),$('row-dimension')];
 const paint=()=>{nodes.forEach((el,i)=>{const p=blockPoses[i];el.setAttribute('transform',`translate(${p.x} ${p.y}) scale(${p.scale})`);});labels.forEach((el,i)=>{const p=dimensionPoses[i];el.setAttribute('transform',`translate(${p.x} ${p.y})`);});};
 if(blockPoses.length!==targets.length||$('reduced').checked){blockPoses=targets.map(p=>({...p}));dimensionPoses=dimensionTargets.map(p=>({...p}));paint();return;}
 const starts=blockPoses.map(p=>({...p})),labelStarts=dimensionPoses.map(p=>({...p})),start=performance.now(),duration=320;
 function frame(now){const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);blockPoses=targets.map((p,i)=>({x:starts[i].x+(p.x-starts[i].x)*ease,y:starts[i].y+(p.y-starts[i].y)*ease,scale:starts[i].scale+(p.scale-starts[i].scale)*ease}));dimensionPoses=dimensionTargets.map((p,i)=>({x:labelStarts[i].x+(p.x-labelStarts[i].x)*ease,y:labelStarts[i].y+(p.y-labelStarts[i].y)*ease}));paint();if(t<1)motionFrame=requestAnimationFrame(frame);}
 motionFrame=requestAnimationFrame(frame);
}
function layoutBlocks(){
 const full=Math.floor(current/columns),remainder=current%columns,complete=remainder===0;
 const viewport=$('block-viewport'),vw=Math.max(180,viewport.clientWidth||650),vh=viewport.clientHeight||350;
 const {rows,step,left,top,poses}=blockLayout(current,columns,vw,vh);
 blockSvg.setAttribute('viewBox',`0 0 ${vw} ${vh}`);
 blockSvg.style.width='100%';blockSvg.style.height='100%';
 blockSvg.setAttribute('aria-label',complete?`${rows} rows of ${columns}, a complete rectangle of ${current} blocks`:`${full} full rows of ${columns} and ${remainder} blocks in an incomplete row`);
 document.querySelector('.explore-main').classList.toggle('complete',complete);
 $('column-dimension').textContent=columns;$('row-dimension').textContent=rows;
 moveBlocks(poses,[{x:left+columns*step/2,y:Math.max(32,top-15)},{x:Math.max(30,left-29),y:top+rows*step/2+10}]);
 let ghosts='';if(!complete)for(let c=remainder;c<columns;c++)ghosts+=`<rect class="ghost-slot" x="${left+c*step+step/32}" y="${top+(rows-1)*step+step/32}" width="${step*26/32}" height="${step*26/32}" rx="${Math.min(4,step/8)}"/>`;
 $('empty-slots').innerHTML=ghosts;
 $('shape-label').textContent=complete?`${rows} × ${columns} = ${current}`:`${full} rows + ${remainder} left`;
 $('width-value').textContent=columns+' '+(columns===1?'column':'columns');slider.setAttribute('aria-valuetext',columns+' columns, '+rows+' rows'+(complete?', complete rectangle':', incomplete last row'));$('arrangement-status').textContent=complete?'Complete rectangle! Release to record this factor pair.':`${full} full ${full===1?'row':'rows'} of ${columns}, with ${remainder} left over. Keep reshaping.`;
}
function renderFound(){const list=$('found-list');list.replaceChildren();for(const entry of found.values()){const {rows,cols}=entry;const button=document.createElement('button');button.className='found-item';const sx=48/cols,sy=34/rows,unit=Math.min(sx,sy);button.innerHTML=`<svg viewBox="0 0 54 40" aria-hidden="true"><rect x="${(54-cols*unit)/2}" y="${(40-rows*unit)/2}" width="${cols*unit}" height="${rows*unit}" rx="2" fill="#3ca977"/>${Array.from({length:Math.max(0,cols-1)},(_,i)=>`<path d="M ${(54-cols*unit)/2+(i+1)*unit} ${(40-rows*unit)/2} v ${rows*unit}" stroke="#eaf8ef" stroke-width=".6"/>`).join('')}${Array.from({length:Math.max(0,rows-1)},(_,i)=>`<path d="M ${(54-cols*unit)/2} ${(40-rows*unit)/2+(i+1)*unit} h ${cols*unit}" stroke="#eaf8ef" stroke-width=".6"/>`).join('')}</svg><div><strong>${rows} × ${cols}</strong><span>= ${current}</span></div>`;button.onclick=()=>{columns=cols;slider.value=stops[columns-1].center;layoutBlocks();$('arrangement-status').textContent='Factor pair already recorded.';};list.append(button);}
$('found-count').textContent=found.size+' '+(found.size===1?'pair':'pairs')+' recorded';$('found-message').textContent=found.size===pairs(current).length?'All factor pairs found.':found.size?'Turned rectangles count as the same factor pair.':'Release the slider on a complete rectangle to record it here.';
}
function commitWidth(){slider.value=stops[columns-1].center;if(current%columns!==0)return;const rows=current/columns,key=[Math.min(rows,columns),Math.max(rows,columns)].join('x');const isNew=!found.has(key);if(isNew){found.set(key,{rows,cols:columns});renderFound();}if(isNew||!$('arrangement-status').textContent.startsWith('Recorded:'))$('arrangement-status').textContent=isNew?`Recorded: ${rows} × ${columns} = ${current}.`:'Factor pair already recorded.';}
slider.addEventListener('input',()=>{const next=widthAt(Number(slider.value),stops);if(next!==columns){columns=next;layoutBlocks();}});slider.addEventListener('change',()=>{if(!keyHeld)commitWidth();});slider.addEventListener('pointerup',()=>commitWidth());
slider.addEventListener('keydown',e=>{const moves={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:5,PageDown:-5};if(e.key in moves||e.key==='Home'||e.key==='End'){e.preventDefault();keyHeld=true;columns=e.key==='Home'?1:e.key==='End'?current:Math.max(1,Math.min(current,columns+moves[e.key]));slider.value=stops[columns-1].center;layoutBlocks();}else if(e.key==='Enter'||e.key===' '){e.preventDefault();commitWidth();}});slider.addEventListener('keyup',()=>{if(keyHeld){keyHeld=false;commitWidth();}});slider.addEventListener('blur',()=>{if(keyHeld){keyHeld=false;commitWidth();}});
$('explore-mode').onclick=()=>setMode('explore');$('all-mode').onclick=()=>setMode('all');$('reset-found').onclick=()=>{found.clear();renderFound();layoutBlocks();};window.addEventListener('resize',()=>{if(mode==='explore')layoutBlocks();});
render();resetExplorer();setMode('explore');
})();
