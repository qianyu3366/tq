/* tools.js - tools page logic */

function initClocks(){renderClocks();setInterval(renderClocks,1000)}
function renderClocks(){
  const now=new Date();
  document.getElementById('clockGrid').innerHTML=CLOCK_CITIES.map(c=>{
    const opts={timeZone:c.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false};
    const dopts={timeZone:c.tz,month:'short',day:'numeric',weekday:'short'};
    const time=now.toLocaleTimeString('en-US',opts);
    const date=now.toLocaleDateString(lang==='zh'?'zh-CN':'en-US',dopts);
    const localH=parseInt(now.toLocaleTimeString('en-US',{timeZone:c.tz,hour:'2-digit',hour12:false}));
    const myH=now.getHours();const diff=localH-myH;
    return `<div class="glass clock-card"><div class="clock-city">${c.name}</div><div class="clock-time">${time}</div><div class="clock-date">${date}</div><div class="clock-diff">${diff>=0?'+':''}${diff}h</div></div>`;
  }).join('');
}

let convCat='长度';
function initConverter(){
  document.getElementById('convCats').innerHTML=Object.keys(CONV_UNITS).map(c=>`<button class="converter-cat${c===convCat?' active':''}" onclick="switchConvCat('${c}',this)">${c}</button>`).join('');
  renderConverter();
}
function switchConvCat(cat,el){
  convCat=cat;document.querySelectorAll('.converter-cat').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');renderConverter();
}
function renderConverter(){
  const d=CONV_UNITS[convCat];
  const opts=d.units.map((u,i)=>`<option value="${i}">${u}</option>`).join('');
  document.getElementById('converterUI').innerHTML=`<div class="field"><label>从</label><input type="number" id="convFrom" value="1" oninput="doConvert()"><select id="convFromUnit" onchange="doConvert()">${opts}</select></div><button class="swap-btn" onclick="swapConv()">⇄</button><div class="field"><label>到</label><input type="number" id="convTo" readonly><select id="convToUnit" onchange="doConvert()"><option value="1" selected>${d.units[1]}</option>${opts}</select></div>`;
  document.getElementById('convToUnit').value='1';doConvert();
}
function doConvert(){
  const d=CONV_UNITS[convCat];const val=parseFloat(document.getElementById('convFrom').value)||0;
  const fi=parseInt(document.getElementById('convFromUnit').value);
  const ti=parseInt(document.getElementById('convToUnit').value);
  let result;
  if(d.special){let celsius;if(fi===0)celsius=val;else if(fi===1)celsius=(val-32)*5/9;else celsius=val-273.15;if(ti===0)result=celsius;else if(ti===1)result=celsius*9/5+32;else result=celsius+273.15;}
  else{result=val*d.base[fi]/d.base[ti];}
  document.getElementById('convTo').value=+result.toFixed(6);
}
function swapConv(){const f=document.getElementById('convFromUnit');const t=document.getElementById('convToUnit');[f.value,t.value]=[t.value,f.value];doConvert();}

function initColorPicker(){
  let r=100,g=150,b=240;
  document.getElementById('colorTool').innerHTML=`<div><div class="color-display" id="colorDisp" style="background:rgb(${r},${g},${b})"></div><div class="color-inputs"><label>R: <span id="rVal">${r}</span></label><input type="range" min="0" max="255" value="${r}" id="rSlider" oninput="updateColor()"><label>G: <span id="gVal">${g}</span></label><input type="range" min="0" max="255" value="${g}" id="gSlider" oninput="updateColor()"><label>B: <span id="bVal">${b}</span></label><input type="range" min="0" max="255" value="${b}" id="bSlider" oninput="updateColor()"></div></div><div><div class="color-values" id="colorVals"></div></div>`;
  updateColor();
}
function updateColor(){
  const r=+document.getElementById('rSlider').value,g=+document.getElementById('gSlider').value,b=+document.getElementById('bSlider').value;
  document.getElementById('rVal').textContent=r;document.getElementById('gVal').textContent=g;document.getElementById('bVal').textContent=b;
  document.getElementById('colorDisp').style.background=`rgb(${r},${g},${b})`;
  const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  const hsl=rgbToHsl(r,g,b);
  document.getElementById('colorVals').innerHTML=`<div class="color-val"><span>HEX</span><code onclick="copyColor(this)">${hex}</code></div><div class="color-val"><span>RGB</span><code onclick="copyColor(this)">rgb(${r}, ${g}, ${b})</code></div><div class="color-val"><span>HSL</span><code onclick="copyColor(this)">hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)</code></div>`;
}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}}return[Math.round(h*360),Math.round(s*100),Math.round(l*100)]}
function copyColor(el){
  navigator.clipboard.writeText(el.textContent).then(()=>{
    showToast('✓ '+el.textContent+' '+(lang==='zh'?'已复制':'copied'));
  });
}

function initNotepad(){
  try{document.getElementById('notepad').value=localStorage.getItem('portal_note')||''}catch(e){}
  const np=document.getElementById('notepad');
  const status=document.getElementById('notepadStatus');
  if(np){
    np.addEventListener('input',()=>{
      try{localStorage.setItem('portal_note',np.value)}catch(e){}
      if(status)status.textContent=(lang==='zh'?'已自动保存 · ':'Auto-saved · ')+np.value.length+(lang==='zh'?' 字':' chars');
    });
  }
}
function saveNote(){
  try{localStorage.setItem('portal_note',document.getElementById('notepad').value)}catch(e){}
  showToast(lang==='zh'?'已保存':'Saved');
}
function clearNote(){if(confirm(lang==='zh'?'确定清空记事本？':'Clear notepad?')){document.getElementById('notepad').value='';try{localStorage.removeItem('portal_note')}catch(e){};const s=document.getElementById('notepadStatus');if(s)s.textContent='';}}
