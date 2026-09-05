const $ = s => document.querySelector(s);
const grid = $('#grid'), detail = $('#detail'), notes = $('#notes');
let ferns = [], filtered = [], shown = 0, lastCard;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let wind = !reduced.matches;
const activeRustles = new Set();
const commonNames = {'Adiantum capillus-veneris':'Southern maidenhair fern','Athyrium filix-femina':'Lady fern','Dryopteris filix-mas':'Male fern','Polystichum acrostichoides':'Christmas fern','Nephrolepis exaltata':'Boston fern','Asplenium scolopendrium':"Hart’s-tongue fern",'Osmundastrum cinnamomeum':'Cinnamon fern','Onoclea sensibilis':'Sensitive fern','Phlebodium aureum':'Golden polypody','Polypodium glycyrrhiza':'Licorice fern','Adiantum bellum':'Bermuda maidenhair fern','Struthiopteris spicant':'Deer fern','Pteridium':'Bracken'};
function el(tag, cls, text) { const e = document.createElement(tag); if(cls) e.className=cls; if(text) e.textContent=text; return e; }
function common(f) { return commonNames[f.name] || f.genus + (f.kind==='Genus'?' · genus overview':' · botanical study'); }
function setWind() { if(!wind) for(const motion of activeRustles) motion.stop(); document.body.classList.toggle('still',!wind); $('#wind').setAttribute('aria-pressed',String(wind)); $('#wind').innerHTML='<span class="wind-icon">≋</span> Wind is '+(wind?'on':'off'); }
$('#wind').onclick=()=>{wind=!wind;setWind()};setWind();
reduced.addEventListener('change',()=>{if(reduced.matches){wind=false;setWind()}});
// One intact watercolor pivots at the stem; a damped spring softens pointer changes.
function fernMotion(element) {
 let angle=0,velocity=0,target=0,frame=0,last=0;
 const motion={
  setTarget(value){
   if(!wind||reduced.matches){motion.stop();return;}
   target=value;
   if(!frame){last=0;activeRustles.add(motion);frame=requestAnimationFrame(tick);}
  },
  stop(){
   cancelAnimationFrame(frame);frame=0;angle=velocity=target=0;
   element.style.removeProperty('transform');activeRustles.delete(motion);
  }
 };
 function tick(now){
  if(!element.isConnected||!wind||reduced.matches){motion.stop();return;}
  const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;
  velocity+=((target-angle)*80-velocity*12)*dt;
  angle+=velocity*dt;
  element.style.transform=`rotate(${angle.toFixed(4)}deg) skewX(${(-angle*.3).toFixed(4)}deg)`;
  if(Math.abs(target-angle)>.001||Math.abs(velocity)>.005)frame=requestAnimationFrame(tick);
  else {frame=0;if(target===0){element.style.removeProperty('transform');activeRustles.delete(motion);}}
 }
 return motion;
}
function card(f,index) {
 const b=el('button','card');b.dataset.id=f.id;b.setAttribute('aria-label','Explore '+f.name);b.style.setProperty('--delay',(-index*.73)+'s');
 const top=el('div','card-top');top.append(el('span','',String(ferns.indexOf(f)+1).padStart(3,'0')+' / '+f.kind.toUpperCase()),el('span','plus','+'));b.append(top);
 const art=el('div','specimen');
 const layer=el('div','frond'),rustle=el('div','rustle'),img=el('img');img.src=f.image;img.alt='Watercolor interpretation of '+f.name;img.loading='lazy';img.width=650;img.height=975;rustle.append(img);layer.append(rustle);art.append(layer);
 const motion=fernMotion(rustle);
 b.append(art);const info=el('div','card-info');info.append(el('h3','',f.name),el('p','common',common(f)));const bottom=el('div','card-bottom');bottom.append(el('span','',f.genus.toUpperCase()),el('span','','EXPLORE ↗'));info.append(bottom);b.append(info);
 b.onpointermove=e=>{
  if(!wind||reduced.matches||e.pointerType==='touch')return;
  const r=art.getBoundingClientRect();
  const x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));
  const height=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));
  motion.setTarget(x*(.6+height*2.1));
 };
 b.onpointerleave=()=>motion.setTarget(0);
 b.onpointercancel=()=>motion.setTarget(0);
 b.onclick=()=>{motion.setTarget(0);openFern(f,b)};return b;
}
function append(){const batch=filtered.slice(shown,shown+24);grid.append(...batch.map((f,i)=>card(f,shown+i)));shown+=batch.length;$('#more').hidden=shown>=filtered.length;$('#count').textContent=filtered.length+' '+($('#kind').value==='Species'?'species':'entries')+' · '+shown+' on view';}
function filter(){const q=$('#search').value.toLowerCase().trim(),g=$('#genus').value,k=$('#kind').value;filtered=ferns.filter(f=>(!g||f.genus===g)&&(!k||f.kind===k)&&(!q||(f.name+' '+common(f)+' '+f.description).toLowerCase().includes(q)));for(const motion of activeRustles)motion.stop();grid.replaceChildren();shown=0;append();$('#empty').hidden=filtered.length>0;}
$('#more').onclick=append;$('#search').oninput=filter;$('#genus').onchange=filter;$('#kind').onchange=filter;
function link(text,url){const a=el('a','',text);a.href=url;a.target='_blank';a.rel='noreferrer';return a;}
function openFern(f,b){
 lastCard=b;const container=$('#detail-content');container.replaceChildren();const layout=el('div','detail-layout'),art=el('div','detail-art'),img=el('img');img.src=f.image;img.alt='Watercolor interpretation of '+f.name;art.append(img);const copy=el('div','detail-copy');copy.append(el('p','eyebrow','THE LIVING HERBARIUM · '+f.kind.toUpperCase()));const title=el('h2','',f.name);title.id='detail-title';detail.setAttribute('aria-labelledby','detail-title');copy.append(title,el('p','subtitle',common(f)));const facts=el('dl','facts');for(const [key,value] of [['GENUS',f.genus],['ENTRY',f.kind],['COLLECTION','The Americas']]){const part=el('div');part.append(el('dt','',key),el('dd','',value));facts.append(part)}copy.append(facts);
 const description=el('div','description');for(const part of (f.details||f.description).split(/(^={2,}.*?={2,}$)/m).filter(Boolean)){if(/^={2,}/.test(part))description.append(el('h3','',part.replace(/=/g,'').trim()));else for(const p of part.split(/\n\s*\n/).filter(p=>p.trim()))description.append(el('p','',p.trim()));}copy.append(description);const sources=el('div','source-links');sources.append(link('Read on Wikipedia ↗',f.source),link('Contributors & history ↗',f.source+'?action=history'));if(f.reference){sources.append(link('Reference image ↗',f.reference));const filename=decodeURIComponent(f.reference.split('?')[0].split('/').pop());sources.append(link('Image credits ↗','https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(filename)));}copy.append(sources,el('p','art-note','AI-generated watercolor interpretation. '+(f.referenceNote||(f.reference?'Based on the source article’s reference image.':'No specimen image was available in the source article; interpreted from its description.'))+' Text: Wikipedia contributors, CC BY-SA 4.0.'));layout.append(art,copy);container.append(layout);
 const from=b?.querySelector('.specimen').getBoundingClientRect();detail.showModal();detail.scrollTop=0;document.body.style.overflow='hidden';
 if(from&&!reduced.matches){const flight=el('img','flight');flight.src=f.image;Object.assign(flight.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});detail.append(flight);img.style.visibility='hidden';requestAnimationFrame(()=>requestAnimationFrame(()=>{const to=img.getBoundingClientRect();Object.assign(flight.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'});setTimeout(()=>{flight.remove();img.style.visibility=''},580)}));}
}
for(const d of [detail,notes]){d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{document.body.style.overflow='';if(d===detail)lastCard?.focus({preventScroll:true})});}
function showNotes(){notes.showModal();document.body.style.overflow='hidden'}$('#about').onclick=showNotes;$('#sources').onclick=showNotes;
fetch('data/ferns.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json()}).then(data=>{ferns=data;const featured=['Adiantum capillus-veneris','Athyrium filix-femina','Polystichum acrostichoides','Asplenium scolopendrium','Osmundastrum cinnamomeum','Phlebodium aureum'];ferns.sort((a,b)=>{const ai=featured.indexOf(a.name),bi=featured.indexOf(b.name);return (ai<0?999:ai)-(bi<0?999:bi)||a.name.localeCompare(b.name)});for(const g of [...new Set(ferns.map(f=>f.genus))].sort()){const o=el('option','',g);o.value=g;$('#genus').append(o)}filter()}).catch(()=>{$('#count').textContent='The herbarium could not load. Please refresh to try again.'});
