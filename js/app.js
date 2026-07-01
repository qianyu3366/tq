/* app.js - core application logic */

let currentCity=HOT_CITIES[0];
let favorites=[];
let pomoState={running:false,time:25*60,total:25*60,interval:null};

document.addEventListener('DOMContentLoaded',()=>{
  initTabs();initHotCities();initFoodCities();initAttrCities();initZodiac();
  initClocks();initConverter();initColorPicker();initNotepad();initParticles();
  setCharImage();loadWeather(currentCity);
  try{favorites=JSON.parse(localStorage.getItem('fav_cities')||'[]')}catch(e){}
});

function initTabs(){
  document.querySelectorAll('.nav-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.nav-tab').forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false')});
      document.querySelectorAll('.tab-section').forEach(s=>s.classList.remove('active'));
      tab.classList.add('active');tab.setAttribute('aria-selected','true');
      document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
    });
  });
}

function openDoor(){
  document.getElementById('welcome').classList.add('hide');
  document.getElementById('app').classList.add('show');
  setTimeout(()=>{
    document.getElementById('welcome').style.display='none';
    var wv=document.getElementById('welcome-video');
    if(wv)wv.pause();
  },1000);
}

(function(){
  var VIDEO_URL='https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4';
  var wCanvas=document.getElementById('welcome-video-canvas');
  var wVideo=document.getElementById('welcome-video');
  var wCtx=wCanvas.getContext('2d');
  var animId=null;

  function resizeWCanvas(){
    var dpr=Math.min(devicePixelRatio,2);
    wCanvas.width=Math.round(window.innerWidth*dpr);
    wCanvas.height=Math.round(window.innerHeight*dpr);
  }

  function drawVideoFrame(){
    if(wVideo.readyState>=2){
      var cw=wCanvas.width,ch=wCanvas.height;
      var s=Math.max(cw/wVideo.videoWidth,ch/wVideo.videoHeight);
      var dw=wVideo.videoWidth*s,dh=wVideo.videoHeight*s;
      wCtx.drawImage(wVideo,(cw-dw)/2,(ch-dh)/2,dw,dh);
      wCanvas.style.visibility='visible';
    }
    animId=requestAnimationFrame(drawVideoFrame);
  }

  wCanvas.style.visibility='hidden';
  resizeWCanvas();
  window.addEventListener('resize',resizeWCanvas);

  wVideo.addEventListener('loadeddata',function(){
    wVideo.play().catch(function(){});
    drawVideoFrame();
  });
  if(wVideo.readyState>=2){
    wVideo.play().catch(function(){});
    drawVideoFrame();
  }

  var pCanvas=document.getElementById('welcome-particles');
  var pCtx=pCanvas.getContext('2d');
  var pts=[];

  function resizePCanvas(){
    pCanvas.width=window.innerWidth;
    pCanvas.height=window.innerHeight;
    createPts();
  }
  function createPts(){
    pts=[];
    var count=Math.floor((pCanvas.width*pCanvas.height)/14000);
    for(var i=0;i<count;i++){
      pts.push({
        x:Math.random()*pCanvas.width,
        y:Math.random()*pCanvas.height,
        vx:(Math.random()-.5)*.3,
        vy:(Math.random()-.5)*.3,
        size:Math.random()*1.5+.5,
        opacity:Math.random()*.5+.2
      });
    }
  }
  function animPts(){
    pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
    for(var i=0;i<pts.length;i++){
      var p=pts[i];
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=pCanvas.width;
      if(p.x>pCanvas.width)p.x=0;
      if(p.y<0)p.y=pCanvas.height;
      if(p.y>pCanvas.height)p.y=0;
      pCtx.beginPath();
      pCtx.arc(p.x,p.y,p.size,0,Math.PI*2);
      pCtx.fillStyle='rgba(255,255,255,'+p.opacity+')';
      pCtx.fill();
    }
    requestAnimationFrame(animPts);
  }
  resizePCanvas();
  window.addEventListener('resize',resizePCanvas);
  animPts();
})();

function setCharImage(){
  const h=new Date().getHours();
  const img=document.getElementById('charImg');
  const msg=document.getElementById('charMsg');
  if(h>=6&&h<18){
    img.src=IMG_DAY;
    msg.textContent=lang==='zh'?'白天好呀～出门记得防晒哦！':'Good day~ Remember sunscreen!';
  }else{
    img.src=IMG_EVE;
    msg.textContent=lang==='zh'?'晚上好～今晚星星很美呢！':'Good evening~ Stars are beautiful tonight!';
  }
}

function initHotCities(){
  const box=document.getElementById('hotCities');
  box.innerHTML=HOT_CITIES.map((c,i)=>`<div class="hot-city${i===0?' active':''}" onclick="selectCity(${i})">${c.name}</div>`).join('');
}
function selectCity(i){
  currentCity=HOT_CITIES[i];
  document.querySelectorAll('#hotCities .hot-city').forEach((el,j)=>el.classList.toggle('active',j===i));
  loadWeather(currentCity);
}

function searchCity(){
  const q=document.getElementById('cityInput').value.trim();
  if(!q)return;
  const raw=q.replace(/[市区县]/g,'');
  const local=CN_CITIES[raw]||CN_CITIES[q];
  if(local){currentCity={name:raw,en:local.en,lat:local.lat,lon:local.lon};loadWeather(currentCity);return}
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=zh`)
    .then(r=>r.json()).then(d=>{
      if(d.results&&d.results.length){
        const r=d.results.find(x=>x.population>100000)||d.results[0];
        currentCity={name:r.name,en:r.name,lat:r.latitude,lon:r.longitude};
        loadWeather(currentCity);
      } else {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(raw)}&count=5`)
          .then(r=>r.json()).then(d2=>{
            if(d2.results&&d2.results.length){
              const r=d2.results.find(x=>x.population>100000)||d2.results[0];
              currentCity={name:q,en:r.name,lat:r.latitude,lon:r.longitude};
              loadWeather(currentCity);
            }
          }).catch(()=>{});
      }
    }).catch(()=>{});
}
document.getElementById('cityInput').addEventListener('keydown',e=>{if(e.key==='Enter')searchCity()});

async function loadWeather(city){
  const heroEl=document.querySelector('.weather-main');
  if(heroEl)heroEl.insertAdjacentHTML('afterbegin','<div class="loading-spinner" id="weatherLoading">加载中...</div>');
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
  const aqUrl=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi`;
  try{
    const [wRes,aqRes]=await Promise.all([fetch(url).then(r=>r.json()),fetch(aqUrl).then(r=>r.json()).catch(()=>null)]);
    const ld=document.getElementById('weatherLoading');if(ld)ld.remove();
    renderWeather(wRes,aqRes,city);
  }catch(e){
    const ld=document.getElementById('weatherLoading');if(ld)ld.remove();
    showToast(lang==='zh'?'天气数据加载失败，请重试':'Failed to load weather data');
    console.error(e);
  }
}

function showToast(msg){
  let t=document.getElementById('globalToast');
  if(!t){t=document.createElement('div');t.id='globalToast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

function renderWeather(w,aq,city){
  const c=w.current;const code=c.weather_code;const wmo=WMO[code]||WMO[0];
  document.getElementById('cityName').innerHTML=`${city.name}<small>${new Date().toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{weekday:'long',month:'long',day:'numeric'})}</small>`;
  const updateEl=document.getElementById('updateTime');
  if(updateEl)updateEl.textContent=(lang==='zh'?'更新于 ':'Updated ')+new Date().toLocaleTimeString(lang==='zh'?'zh-CN':'en-US',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('tempBig').textContent=Math.round(c.temperature_2m)+'°';
  document.getElementById('wIcon').textContent=wmo[0];
  document.getElementById('wDesc').textContent=lang==='zh'?`${wmo[1]} | 体感 ${Math.round(c.apparent_temperature)}°`:`${wmo[2]} | Feels ${Math.round(c.apparent_temperature)}°`;
  const aqi=aq?.current?.european_aqi||'--';
  const uvMax=w.daily?.uv_index_max?.[0]||'--';
  const sunrise=w.daily?.sunrise?.[0]?.slice(11,16)||'--';
  const sunset=w.daily?.sunset?.[0]?.slice(11,16)||'--';
  document.getElementById('metrics').innerHTML=[
    {v:c.relative_humidity_2m+'%',l:t('humidity')},{v:c.wind_speed_10m+' km/h',l:t('wind')},
    {v:uvMax,l:t('uv')},{v:Math.round(c.pressure_msl)+' hPa',l:t('pressure')},
    {v:(c.visibility/1000).toFixed(1)+' km',l:t('visibility')},{v:aqi,l:t('aqi')},
    {v:'🌅 '+sunrise,l:lang==='zh'?'日出':'Sunrise'},{v:'🌇 '+sunset,l:lang==='zh'?'日落':'Sunset'}
  ].map(m=>`<div class="glass metric-card"><div class="val">${m.v}</div><div class="label">${m.l}</div></div>`).join('');
  const hh=w.hourly;const nowH=new Date().getHours();let hourlyHTML='';
  const precip=hh.precipitation_probability||[];
  for(let i=nowH;i<nowH+24&&i<hh.time.length;i++){
    const hc=WMO[hh.weather_code[i]]||WMO[0];
    const pp=precip[i]!=null?`<div style="font-size:.65em;color:var(--accent)">💧${precip[i]}%</div>`:'';
    hourlyHTML+=`<div class="forecast-item"><div class="time">${new Date(hh.time[i]).getHours()}:00</div><div class="icon">${hc[0]}</div><div class="temp">${Math.round(hh.temperature_2m[i])}°</div>${pp}</div>`;
  }
  document.getElementById('hourlyRow').innerHTML=hourlyHTML;
  const dd=w.daily;let dailyHTML='';
  const days=lang==='zh'?['周日','周一','周二','周三','周四','周五','周六']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for(let i=0;i<7&&i<dd.time.length;i++){
    const dc=WMO[dd.weather_code[i]]||WMO[0];const d=new Date(dd.time[i]);
    dailyHTML+=`<div class="glass daily-item"><div class="day">${days[d.getDay()]}</div><div class="icon">${dc[0]}</div><div class="temp-range"><span class="hi">${Math.round(dd.temperature_2m_max[i])}°</span> / <span class="lo">${Math.round(dd.temperature_2m_min[i])}°</span></div></div>`;
  }
  document.getElementById('dailyRow').innerHTML=dailyHTML;
  const qs=lang==='zh'?QUOTES_ZH:QUOTES_EN;
  document.getElementById('quoteText').textContent=qs[Math.floor(Math.random()*qs.length)];
  const temp=c.temperature_2m;let outfit='';
  if(lang==='zh'){
    if(temp>30)outfit='🩳 短袖短裤，注意防晒和补水！';else if(temp>20)outfit='👕 薄外套或长袖即可，舒适温度！';else if(temp>10)outfit='🧥 建议穿外套或薄毛衣。';else if(temp>0)outfit='🧣 天冷了，穿厚外套配围巾。';else outfit='🧤 零下低温，羽绒服+保暖内衣！';
  }else{
    if(temp>30)outfit='🩳 Shorts & tee. Stay hydrated!';else if(temp>20)outfit='👕 Light jacket or long sleeves.';else if(temp>10)outfit='🧥 Wear a jacket or light sweater.';else if(temp>0)outfit='🧣 Bundle up with a warm coat!';else outfit='🧤 Below zero! Heavy coat + layers.';
  }
  document.getElementById('outfitText').textContent=outfit;
  renderLifeIndex(c,uvMax,aqi);updateParticles(code);
  applyWeatherTheme(code);
  renderLifeCard(c,code,city);
}

function applyWeatherTheme(code){
  const h=new Date().getHours();
  const isNight=h<6||h>=20;
  let theme='';
  if(isNight) theme='theme-night';
  else if([0,1,2,3].includes(code)) theme='theme-sunny';
  else if([45,48,51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) theme='theme-rainy';
  else if([71,73,75,77,85,86].includes(code)) theme='theme-snowy';
  else theme='theme-cloudy';
  document.body.className=theme;
}

function renderLifeCard(c,code,city){
  const el=document.getElementById('lifeCard');
  if(!el)return;
  const temp=c.temperature_2m,wind=c.wind_speed_10m,vis=c.visibility;
  const wmo=WMO[code]||WMO[0];
  let outfit='🧥 ';
  if(temp>30)outfit+='短袖短裤';else if(temp>20)outfit+='薄外套';else if(temp>10)outfit+='外套毛衣';else if(temp>0)outfit+='厚外套围巾';else outfit+='羽绒服';
  const goOut=wind<40&&vis>5000&&![95,96,99,65,67,75,82].includes(code);
  const foods=FOOD_DB[city.name];const food=foods&&foods.length?foods[Math.floor(Math.random()*foods.length)]:null;
  const attrs=ATTR_DB[city.name];const attr=attrs&&attrs.length?attrs[Math.floor(Math.random()*attrs.length)]:null;
  el.innerHTML=`
    <div class="life-card-item"><div class="lc-icon">🧥</div><div class="lc-text"><strong>${lang==='zh'?'穿搭':'Outfit'}</strong><br>${outfit}</div></div>
    <div class="life-card-item"><div class="lc-icon">${goOut?'🚶':'🏠'}</div><div class="lc-text"><strong>${lang==='zh'?'出行':'Go Out'}</strong><br>${goOut?(lang==='zh'?'适合出门':'Good to go'):(lang==='zh'?'建议待在室内':'Stay indoors')}</div></div>
    ${food?`<div class="life-card-item"><div class="lc-icon">${food.emoji}</div><div class="lc-text"><strong>${lang==='zh'?'推荐吃':'Try'}</strong><br>${food.name}</div></div>`:''}
    ${attr?`<div class="life-card-item"><div class="lc-icon">${attr.emoji}</div><div class="lc-text"><strong>${lang==='zh'?'推荐去':'Visit'}</strong><br>${attr.name}</div></div>`:''}`;
}

function renderLifeIndex(c,uv,aqi){
  const items=[];const temp=c.temperature_2m,hum=c.relative_humidity_2m,wind=c.wind_speed_10m;
  const comfort=temp>=18&&temp<=26&&hum>=40&&hum<=70;
  items.push({icon:'😊',name:lang==='zh'?'舒适度':'Comfort',val:comfort?(lang==='zh'?'舒适':'Comfy'):(lang==='zh'?'一般':'Fair'),tip:comfort?(lang==='zh'?'适合户外活动':'Good for outdoors'):(lang==='zh'?'注意增减衣物':'Adjust clothing')});
  items.push({icon:'🏃',name:lang==='zh'?'运动':'Exercise',val:wind<30&&temp>5&&temp<35?(lang==='zh'?'适宜':'Suitable'):(lang==='zh'?'不宜':'Not ideal'),tip:wind<30?(lang==='zh'?'适合户外运动':'Outdoor sports OK'):(lang==='zh'?'建议室内运动':'Try indoor exercise')});
  items.push({icon:'☀️',name:lang==='zh'?'紫外线':'UV',val:uv<=2?(lang==='zh'?'弱':'Low'):uv<=5?(lang==='zh'?'中等':'Moderate'):uv<=7?(lang==='zh'?'强':'High'):(lang==='zh'?'极强':'Very High'),tip:uv>5?(lang==='zh'?'涂防晒霜戴帽子':'Wear sunscreen & hat'):(lang==='zh'?'正常出行即可':'Normal outing OK')});
  items.push({icon:'👔',name:lang==='zh'?'穿衣':'Clothing',val:temp>28?(lang==='zh'?'清凉':'Light'):temp>18?(lang==='zh'?'舒适':'Comfy'):temp>8?(lang==='zh'?'保暖':'Warm'):(lang==='zh'?'厚装':'Heavy'),tip:''});
  items.push({icon:'🌬️',name:lang==='zh'?'空气':'Air',val:typeof aqi==='number'?(aqi<=50?(lang==='zh'?'优':'Good'):aqi<=100?(lang==='zh'?'良':'Fair'):(lang==='zh'?'差':'Poor')):'--',tip:''});
  items.push({icon:'🚗',name:lang==='zh'?'出行':'Travel',val:wind<40&&c.visibility>5000?(lang==='zh'?'适宜':'Good'):(lang==='zh'?'注意安全':'Be careful'),tip:''});
  document.getElementById('lifeGrid').innerHTML=items.map(i=>`<div class="glass life-item"><div class="li-icon">${i.icon}</div><div class="li-name">${i.name}</div><div class="li-val">${i.val}</div><div class="li-tip">${i.tip}</div></div>`).join('');
}

function pomoAction(action){
  if(action==='start'){
    if(pomoState.running){clearInterval(pomoState.interval);pomoState.running=false;document.getElementById('pomoStartBtn').textContent=t('start');}
    else{pomoState.running=true;document.getElementById('pomoStartBtn').textContent=t('pause');
      pomoState.interval=setInterval(()=>{pomoState.time--;if(pomoState.time<=0){clearInterval(pomoState.interval);pomoState.running=false;document.getElementById('pomoStartBtn').textContent=t('start');}updatePomo();},1000);}
  }else if(action==='reset'){clearInterval(pomoState.interval);pomoState.running=false;pomoState.time=25*60;pomoState.total=25*60;document.getElementById('pomoStartBtn').textContent=t('start');updatePomo();}
  else if(action==='short'){clearInterval(pomoState.interval);pomoState.running=false;pomoState.time=5*60;pomoState.total=5*60;document.getElementById('pomoStartBtn').textContent=t('start');updatePomo();}
}
function updatePomo(){const m=Math.floor(pomoState.time/60);const s=pomoState.time%60;document.getElementById('pomoTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;const pct=1-pomoState.time/pomoState.total;document.getElementById('pomoCircle').setAttribute('stroke-dashoffset',339.292*(1-pct));}

let musicPlaying=false,musicBarShown=false;
const TRACKS=[
  {name:'🎵 狂乱 Hey Kids!!',artist:'THE ORAL CIGARETTES',album:'FIXION',src:'狂乱 Hey Kids!!.mp3'},
  {name:'🎹 Twinkle Star',notes:[[60,.5],[60,.5],[67,.5],[67,.5],[69,.5],[69,.5],[67,1],[65,.5],[65,.5],[64,.5],[64,.5],[62,.5],[62,.5],[60,1]]},
  {name:'🎹 Für Elise',notes:[[76,.3],[75,.3],[76,.3],[75,.3],[76,.3],[71,.3],[74,.3],[72,.3],[69,1],[60,.3],[64,.3],[69,.3],[71,1]]}
];
let trackIdx=0,noteIdx=0,noteTimer=null;
const audioEl=new Audio();
audioEl.preload='metadata';
audioEl.addEventListener('timeupdate',()=>{if(audioEl.duration){document.getElementById('mProgress').style.width=(audioEl.currentTime/audioEl.duration*100)+'%'}});
audioEl.addEventListener('ended',()=>{nextTrack()});
let audioCtx;
function getTrackLabel(t){return t.artist?t.name+' — '+t.artist:t.name}
document.getElementById('musicToggle').onclick=()=>{musicBarShown=!musicBarShown;document.getElementById('musicBar').classList.toggle('hidden',!musicBarShown);document.getElementById('trackName').textContent=getTrackLabel(TRACKS[trackIdx]);};
function getCtx(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx}
function playNote(freq,dur){const ctx=getCtx();const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur*0.8);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);}
function midiToFreq(n){return 440*Math.pow(2,(n-69)/12)}
function togglePlay(){
  const track=TRACKS[trackIdx];
  if(musicPlaying){stopMusic();return}
  musicPlaying=true;document.querySelector('#musicBar .m-btn').textContent='⏸';
  if(track.src){audioEl.src=track.src;audioEl.play().catch(()=>{});}
  else{noteIdx=0;playNextNote();}
}
function playNextNote(){if(!musicPlaying)return;const track=TRACKS[trackIdx];if(!track.notes)return;if(noteIdx>=track.notes.length){noteIdx=0}const[midi,dur]=track.notes[noteIdx];playNote(midiToFreq(midi),dur);document.getElementById('mProgress').style.width=(noteIdx/track.notes.length*100)+'%';noteIdx++;noteTimer=setTimeout(playNextNote,dur*500);}
function stopMusic(){musicPlaying=false;clearTimeout(noteTimer);audioEl.pause();document.querySelector('#musicBar .m-btn').textContent='▶';}
function nextTrack(){stopMusic();trackIdx=(trackIdx+1)%TRACKS.length;document.getElementById('trackName').textContent=getTrackLabel(TRACKS[trackIdx]);togglePlay();}
function prevTrack(){stopMusic();trackIdx=(trackIdx-1+TRACKS.length)%TRACKS.length;document.getElementById('trackName').textContent=getTrackLabel(TRACKS[trackIdx]);togglePlay();}
function seekMusic(e){const track=TRACKS[trackIdx];if(track.src&&audioEl.duration){const rect=e.currentTarget.getBoundingClientRect();const pct=(e.clientX-rect.left)/rect.width;audioEl.currentTime=pct*audioEl.duration;}}

document.getElementById('langBtn').onclick=()=>{
  lang=lang==='zh'?'en':'zh';
  document.getElementById('langBtn').textContent=lang==='zh'?'文':'EN';
  document.getElementById('cityInput').placeholder=t('search');
  document.getElementById('searchBtn').textContent=t('searchBtn');
  document.getElementById('hourlyTitle').textContent=t('hourly');
  document.getElementById('dailyTitle').textContent=t('daily');
  document.getElementById('quoteH').textContent=t('quote');
  document.getElementById('outfitH').textContent=t('outfit');
  document.getElementById('lifeTitle').textContent=t('life');
  document.getElementById('pomoH').textContent=t('pomo');
  const doorMain=document.getElementById('doorMainTitle');
  if(doorMain)doorMain.innerHTML=lang==='zh'?'探索你的 <span class="underlined"><span class="line"></span><span>生活门户</span></span>':'Instantly explore your <span class="underlined"><span class="line"></span><span>Life Portal</span></span>';
  const doorSub=document.getElementById('doorSubtitle');
  if(doorSub)doorSub.textContent=lang==='zh'?'YOUR ALL-IN-ONE LIFESTYLE HUB':'YOUR ALL-IN-ONE LIFESTYLE HUB';
  const tabs=document.querySelectorAll('.nav-tab');
  const tabKeys=['weatherTab','foodTab','attrTab','horoTab','toolTab'];
  tabs.forEach((tb,i)=>{if(tabKeys[i])tb.textContent=t(tabKeys[i])});
  setCharImage();loadWeather(currentCity);
};

let particleType='stars';
function initParticles(){
  const canvas=document.getElementById('particles');const ctx=canvas.getContext('2d');let W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  let particles=[];
  function createParticles(){particles=[];const count=particleType==='stars'?80:particleType==='rain'?150:100;
    for(let i=0;i<count;i++){particles.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*3+1,vx:(Math.random()-0.5)*0.5,vy:particleType==='rain'?Math.random()*8+4:particleType==='snow'?Math.random()*1+0.5:Math.random()*0.3,o:Math.random()*0.5+0.3});}}
  createParticles();
  function draw(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{ctx.beginPath();
    if(particleType==='rain'){ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+10);ctx.strokeStyle=`rgba(150,200,255,${p.o})`;ctx.stroke();}
    else if(particleType==='snow'){ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.o})`;ctx.fill();}
    else{ctx.arc(p.x,p.y,p.r*0.8,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.o*0.6})`;ctx.fill();}
    p.x+=p.vx;p.y+=p.vy;if(p.y>H){p.y=0;p.x=Math.random()*W}if(p.x>W)p.x=0;if(p.x<0)p.x=W;});
    requestAnimationFrame(draw);}
  draw();window._createParticles=createParticles;
}
function updateParticles(code){
  if([61,63,65,80,81,82].includes(code))particleType='rain';
  else if([71,73,75,77,85,86].includes(code))particleType='snow';
  else particleType='stars';
  if(window._createParticles)window._createParticles();
}
