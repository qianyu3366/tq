/* food.js - food page logic */

let currentFoodCity=HOT_CITIES[0].name;
let currentFoodFilter='全部';

function initFoodCities(){
  const box=document.getElementById('foodCities');
  box.innerHTML=HOT_CITIES.map((c,i)=>`<button class="hot-city${i===0?' active':''}" onclick="selectFoodCity('${c.name}',this)">${c.name}</button>`).join('');
  renderFoods(HOT_CITIES[0].name);
}
function selectFoodCity(name,el){
  currentFoodCity=name;
  document.querySelectorAll('#foodCities .hot-city').forEach(e=>e.classList.remove('active'));
  if(el)el.classList.add('active');
  currentFoodFilter='全部';
  renderFoods(name);
}

function getCatFromTag(tag){
  if(/早餐|早茶|粥/.test(tag))return '早餐';
  if(/小吃|名小吃|传统小吃|名点|点心|卤味/.test(tag))return '小吃';
  if(/甜品|冰/.test(tag))return '甜品';
  return '正餐';
}

function renderFoods(city){
  document.getElementById('foodCitySub').textContent=city+' · 特色美食';
  const foods=FOOD_DB[city]||[];
  const cats=['全部',...new Set(foods.map(f=>getCatFromTag(f.tag)))];
  const filterBox=document.getElementById('foodFilters');
  if(filterBox){
    filterBox.innerHTML=cats.map(c=>`<button class="food-filter${c===currentFoodFilter?' active':''}" onclick="filterFoods('${c}')">${c}</button>`).join('')+
      `<button class="random-btn" onclick="randomFood()">🎲 ${lang==='zh'?'随机吃什么':'Random Pick'}</button>`;
  }
  const filtered=currentFoodFilter==='全部'?foods:foods.filter(f=>getCatFromTag(f.tag)===currentFoodFilter);
  document.getElementById('foodGrid').innerHTML=filtered.map(f=>`<div class="glass food-card" id="food-${f.name}">${f.img?'<img class="food-img" src="'+f.img+'" alt="'+f.name+'" loading="lazy" onerror="this.outerHTML=\'<div class=food-emoji>'+f.emoji+'</div>\'">':'<div class="food-emoji">'+f.emoji+'</div>'}<div class="food-info"><div class="food-name">${f.name}</div><div class="food-desc">${f.desc}</div><span class="food-tag">${f.tag}</span></div></div>`).join('')||`<p style="color:var(--text2)">${lang==='zh'?'暂无该城市美食数据':'No food data for this city'}</p>`;
}

function filterFoods(cat){
  currentFoodFilter=cat;
  renderFoods(currentFoodCity);
}

function randomFood(){
  const foods=FOOD_DB[currentFoodCity]||[];
  if(!foods.length)return;
  const pick=foods[Math.floor(Math.random()*foods.length)];
  showToast(`🎲 ${lang==='zh'?'今天吃':'Try'}: ${pick.name} ${pick.emoji}`);
  currentFoodFilter='全部';
  renderFoods(currentFoodCity);
  setTimeout(()=>{
    const el=document.getElementById('food-'+pick.name);
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.boxShadow='0 0 20px rgba(255,150,50,.5)';setTimeout(()=>el.style.boxShadow='',2000);}
  },100);
}
