/* horoscope.js - horoscope page logic */

function initZodiac(){
  const bdBox=document.getElementById('zodiacBirthday');
  if(bdBox){
    bdBox.innerHTML=`<label>${lang==='zh'?'输入生日自动匹配：':'Enter birthday:'}</label><input type="date" id="birthdayInput" onchange="matchZodiacByBirthday()">`;
  }
  document.getElementById('zodiacGrid').innerHTML=ZODIAC_LIST.map((z,i)=>`<button class="zodiac-btn" onclick="showZodiac(${i},this)"><div class="z-icon">${z.icon}</div><div class="z-name">${z.name}<br><span style="font-size:.8em;color:var(--text2)">${z.date}</span></div></button>`).join('');
}

function matchZodiacByBirthday(){
  const input=document.getElementById('birthdayInput');
  if(!input||!input.value)return;
  const d=new Date(input.value);
  const m=d.getMonth()+1,day=d.getDate();
  const ranges=[[1,20,9],[2,19,10],[3,21,11],[4,20,0],[5,21,1],[6,21,2],[7,23,3],[8,23,4],[9,23,5],[10,23,6],[11,22,7],[12,22,8]];
  let idx=9;
  for(const [mon,endDay,zi] of ranges){
    if(m===mon&&day<=endDay){idx=zi;break;}
    if(m===mon&&day>endDay){idx=(zi+1)%12;break;}
  }
  const btns=document.querySelectorAll('.zodiac-btn');
  if(btns[idx])btns[idx].click();
}

function showZodiac(i,el){
  document.querySelectorAll('.zodiac-btn').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  const z=ZODIAC_LIST[i];const seed=new Date().getDate()*7+i*13;
  const rand=(n)=>((seed*31+n*17)%100);
  const love=rand(1),career=rand(2),wealth=rand(3),health=rand(4),luck=rand(5);
  const colors=['#f06292','#64b5f6','#ffb74d','#81c784','#ce93d8'];
  const advicePool=lang==='zh'?['今天适合主动出击，好运就在前方。','保持耐心，好事需要时间酝酿。','注意休息，劳逸结合才能走得更远。','今天的社交运很好，多和朋友交流。','财运不错，但要理性消费。','感情上可能有小惊喜，保持开放的心态。','工作中注意细节，能避免不必要的失误。','今天灵感爆棚，适合创作和思考。']:['Take initiative today, luck is on your side.','Be patient, good things take time.','Rest well, balance work and life.','Great social energy, connect with friends.','Finances look good, but spend wisely.','A pleasant surprise in relationships awaits.','Pay attention to details at work.','Creative energy is high, great for brainstorming.'];
  const advice=advicePool[(seed+i)%advicePool.length];
  const box=document.getElementById('zodiacResult');box.style.display='block';
  box.innerHTML=`<h3>${z.icon} ${z.name} ${lang==='zh'?'今日运势':"Today's Fortune"}</h3>
    ${[['❤️',lang==='zh'?'爱情':'Love',love,0],['💼',lang==='zh'?'事业':'Career',career,1],['💰',lang==='zh'?'财运':'Wealth',wealth,2],['💪',lang==='zh'?'健康':'Health',health,3],['🍀',lang==='zh'?'幸运':'Luck',luck,4]].map(([icon,label,val,ci])=>`<div class="z-meter"><span class="label">${icon} ${label}</span><div class="bar"><div class="bar-fill" style="width:${val}%;background:${colors[ci]}"></div></div><span style="font-size:.8em;width:30px;text-align:right">${val}%</span></div>`).join('')}
    <div class="z-advice">${lang==='zh'?'💫 今日建议':'💫 Tip'}: ${advice}</div>
    <button class="zodiac-share-btn" onclick="shareZodiac(${i})">📤 ${lang==='zh'?'生成分享卡':'Share Card'}</button>`;
}

function shareZodiac(i){
  const z=ZODIAC_LIST[i];const seed=new Date().getDate()*7+i*13;
  const rand=(n)=>((seed*31+n*17)%100);
  const canvas=document.createElement('canvas');
  canvas.width=400;canvas.height=500;
  const ctx=canvas.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,400,500);
  grad.addColorStop(0,'#1a1a2e');grad.addColorStop(1,'#16213e');
  ctx.fillStyle=grad;ctx.fillRect(0,0,400,500);
  ctx.fillStyle='#fff';ctx.font='48px serif';ctx.textAlign='center';
  ctx.fillText(z.icon,200,80);
  ctx.font='bold 24px sans-serif';ctx.fillText(z.name,200,120);
  ctx.font='14px sans-serif';ctx.fillStyle='#9ca3af';
  ctx.fillText(z.date,200,145);
  ctx.fillText(new Date().toLocaleDateString('zh-CN'),200,170);
  const items=[['❤️ 爱情',rand(1)],['💼 事业',rand(2)],['💰 财运',rand(3)],['💪 健康',rand(4)],['🍀 幸运',rand(5)]];
  const barColors=['#f06292','#64b5f6','#ffb74d','#81c784','#ce93d8'];
  items.forEach(([label,val],j)=>{
    const y=210+j*50;
    ctx.fillStyle='#ccc';ctx.font='14px sans-serif';ctx.textAlign='left';
    ctx.fillText(label,30,y);
    ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(120,y-12,230,16);
    ctx.fillStyle=barColors[j];ctx.fillRect(120,y-12,230*val/100,16);
    ctx.fillStyle='#fff';ctx.textAlign='right';ctx.fillText(val+'%',370,y);
  });
  ctx.fillStyle='#666';ctx.font='12px sans-serif';ctx.textAlign='center';
  ctx.fillText('Life Portal · 生活门户',200,480);
  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=z.name+'_运势.png';a.click();
    URL.revokeObjectURL(url);
    showToast(lang==='zh'?'分享卡已下载':'Card downloaded');
  });
}
