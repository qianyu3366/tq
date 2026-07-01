/* attraction.js - attractions page logic */

function initAttrCities(){
  const box=document.getElementById('attrCities');
  box.innerHTML=HOT_CITIES.map((c,i)=>`<button class="hot-city${i===0?' active':''}" onclick="selectAttrCity('${c.name}',this)">${c.name}</button>`).join('');
  renderAttrs(HOT_CITIES[0].name);
}
function selectAttrCity(name,el){
  document.querySelectorAll('#attrCities .hot-city').forEach(e=>e.classList.remove('active'));
  if(el)el.classList.add('active');renderAttrs(name);
}
function renderAttrs(city){
  document.getElementById('attrCitySub').textContent=city+' · 热门景点';
  const attrs=ATTR_DB[city]||[];
  document.getElementById('attrGrid').innerHTML=attrs.map(a=>`<div class="glass attr-card">${a.img?'<img class="attr-img" src="'+a.img+'" alt="'+a.name+'" loading="lazy" onerror="this.outerHTML=\'<div class=attr-banner>'+a.emoji+'</div>\'">':'<div class="attr-banner">'+a.emoji+'</div>'}<div class="attr-info"><div class="attr-name">${a.name}</div><div class="attr-desc">${a.desc}</div><div class="attr-meta"><span>📍 ${a.type}</span><span>${a.rating}</span></div></div></div>`).join('')||`<p style="color:var(--text2)">${lang==='zh'?'暂无该城市景点数据':'No attraction data'}</p>`;
}
