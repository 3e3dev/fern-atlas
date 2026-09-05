// Run with NODE_PATH pointing to a temporary jsdom installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/ferns.json')));
async function run(reduced) {
 const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'), {url:'https://3e3dev.github.io/fern-atlas/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 w.matchMedia=()=>({matches:reduced,addEventListener(){}});
 w.fetch=async()=>({ok:true,json:async()=>structuredClone(data)});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
 await new Promise(r=>setTimeout(r,20));
 assert.equal(d.querySelectorAll('.card').length,24,'First page has 24 cards');
 assert.equal(d.querySelector('.card h3').textContent,'Adiantum capillus-veneris');
 assert.equal(d.body.classList.contains('still'),reduced);
 d.querySelector('#more').click();assert.equal(d.querySelectorAll('.card').length,48);
 const search=d.querySelector('#search');search.value='Christmas';search.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelectorAll('.card').length,1);assert.equal(d.querySelector('.card h3').textContent,'Polystichum acrostichoides');
 d.querySelector('.card').click();assert.equal(d.querySelector('#detail').open,true);assert.equal(d.querySelector('#detail-title').textContent,'Polystichum acrostichoides');assert.ok(d.querySelector('.description').textContent.length>50);assert.equal(d.body.style.overflow,'hidden');
 d.querySelector('#detail .close').click();assert.equal(d.querySelector('#detail').open,false);assert.equal(d.body.style.overflow,'');assert.equal(d.activeElement,d.querySelector('.card'));
 search.value='no fern matches this xyz';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.card').length,0);assert.equal(d.querySelector('#empty').hidden,false);
 search.value='';search.dispatchEvent(new w.Event('input'));const genus=d.querySelector('#genus');genus.value='Adiantum';genus.dispatchEvent(new w.Event('change'));assert.ok([...d.querySelectorAll('.card h3')].every(x=>x.textContent.startsWith('Adiantum ')));
 genus.value='';genus.dispatchEvent(new w.Event('change'));const kind=d.querySelector('#kind');kind.value='Genus';kind.dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('.card').length,data.filter(f=>f.kind==='Genus').length);
 kind.value='';kind.dispatchEvent(new w.Event('change'));while(!d.querySelector('#more').hidden)d.querySelector('#more').click();assert.equal(d.querySelectorAll('.card').length,data.length);
 const state=d.querySelector('#wind').getAttribute('aria-pressed');d.querySelector('#wind').click();assert.notEqual(d.querySelector('#wind').getAttribute('aria-pressed'),state);
 d.querySelector('#about').click();assert.equal(d.querySelector('#notes').open,true);d.querySelector('#notes .close').click();assert.equal(d.querySelector('#notes').open,false);
 dom.window.close();
}
(async()=>{await run(false);await run(true);assert.equal(new Set(data.map(f=>f.id)).size,data.length);assert.ok(data.every(f=>f.description&&f.source.startsWith('https://en.wikipedia.org/')));const missing=data.filter(f=>!fs.existsSync(path.join(root,f.image)));if(missing.length&&process.argv.includes('--assets'))throw Error('Missing artwork: '+missing.map(f=>f.name).join(', '));console.log('PASS: pagination, search, genus/type filters, all entries, detail content, close/focus, wind, reduced motion, notes, source data.');console.log(`${data.length} entries; ${data.length-missing.length} artwork files present.`)})().catch(e=>{console.error(e);process.exit(1)});
