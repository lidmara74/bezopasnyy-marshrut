(() => {
'use strict';
const KEY='digital-navigator-iar-10-v1';
const defaults=()=>({version:1,hero:'max',started:false,age:'5–7',xp:0,results:{},runs:{},inventory:['Стоп','Попроси помощи'],uses:{},resume:null,final:{},settings:{voice:true,effects:true,volume:.65,large:false,short:false,steps:false,algorithm:false,slow:false,reduced:false,calm:false}});
const PROFILE_KEY='digital-navigator-profiles-v2';
let registry={version:2,active:null,players:[]};let storageBroken=false;
try{const raw=localStorage.getItem(PROFILE_KEY);if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed.players))throw Error('profiles');registry=parsed;}else{const old=JSON.parse(localStorage.getItem(KEY)||'null');if(old&&old.version===1){registry.players.push({id:'legacy',name:'Мой маршрут',state:old,updated:Date.now()});}}}catch{storageBroken=true;}
const state=defaults();
function persistRegistry(){if(storageBroken){toast('Хранилище повреждено или недоступно. Исходные данные сохранены; выгрузи текущий маршрут через настройки.');return false;}try{localStorage.setItem(PROFILE_KEY,JSON.stringify(registry));return true;}catch{toast('Не удалось сохранить. Скачай сохранение в настройках перед выходом.');return false;}}
function replaceState(value){Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,defaults(),value);state.settings=Object.assign(defaults().settings,value.settings||{});}
const profiles={
 list:()=>registry.players.map(p=>({id:p.id,name:p.name,age:p.state.age,updated:p.updated,resume:p.state.resume,xp:p.state.xp})),
 current:()=>registry.players.find(p=>p.id===registry.active),
 select(id){const player=registry.players.find(p=>p.id===id);if(!player)return false;stopVoice();registry.active=id;replaceState(JSON.parse(JSON.stringify(player.state)));return true;},
 create(name,age){name=String(name).trim().slice(0,30);if(!name||!['1–2','3–4','5–7','8–9','10–11'].includes(age))return false;const id=crypto.randomUUID?.()||'p'+Date.now()+Math.random();registry.players.push({id,name,state:{...defaults(),age},updated:Date.now()});this.select(id);persistRegistry();return true;},
 finish(){if(!save())return false;stopVoice();registry.active=null;return persistRegistry();},
 remove(){const id=registry.active;registry.players=registry.players.filter(p=>p.id!==id);registry.active=null;replaceState(defaults());return persistRegistry();},
 reset(){const keep={age:state.age,hero:state.hero,settings:{...state.settings},started:true};replaceState({...defaults(),...keep});return save();},
 resetWorld(id){const prefix=state.age+':'+id+':';for(const bucket of ['results','runs'])for(const k of Object.keys(state[bucket]))if(k.startsWith(prefix))delete state[bucket][k];delete state.final[state.age];state.resume={world:id,stage:0,age:state.age};return save();}
};
const ageNames={'1–2':'Исследователь','3–4':'Следопыт','5–7':'Навигатор','8–9':'Аналитик','10–11':'Эксперт'};
const iconPaths={
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
 shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
 people:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-3c0-7 12-7 12 0v3m1-7c5-1 7 2 7 6"/>',
 chat:'<path d="M4 4h16v12H9l-5 4Z"/><path d="M8 8h8m-8 4h5"/>',
 link:'<path d="m10 14 4-4m-6 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',
 hand:'<path d="M8 13V5a2 2 0 0 1 4 0v7-9a2 2 0 0 1 4 0v9-6a2 2 0 0 1 4 0v9c0 5-3 7-7 7-3 0-5-2-7-5l-3-4c-2-3 1-5 3-3l2 3Z"/>',
 spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
 gamepad:'<path d="M7 7h10c3 0 6 11 4 13-2 2-5-3-5-3H8s-3 5-5 3C1 18 4 7 7 7Z"/><path d="M6 11v5m-2-2h5m7-2h.1m2 2h.1"/>',
 wallet:'<path d="M3 6h17v14H3Zm0 0V4h14v2m-2 5h7v6h-7Zm3 3h.1"/>',
 gift:'<path d="M3 8h18v5H3Zm2 5v8h14v-8M12 8v13m0-13C3 8 5 1 8 3Zm0 0c9 0 7-7 4-5Z"/>',
 life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5 5 4 4m6 6 4 4M5 19l4-4m6-6 4-4"/>',
 home:'<path d="m2 11 10-9 10 9M5 9v13h14V9m-10 13v-8h6v8"/>',
 settings:'<circle cx="12" cy="12" r="4"/><path d="m12 2 1 3 3 1 3-1 2 3-2 3v2l2 3-2 3-3-1-3 1-1 3-3-1-1-3-3-1-3 1-2-3 2-3v-2-3L3 5l3 1 3-1 1-3Z"/>',
 bag:'<path d="M5 8h14v14H5Zm3 0V5c0-4 8-4 8 0v3m-8 8h8m-8-4h8"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
 trophy:'<path d="M7 3h10v7c0 6-10 6-10 0ZM7 5H3v5c0 3 4 3 4 3m10-8h4v5c0 3-4 3-4 3m-5 2v6m-5 0h10"/>',
 sound:'<path d="M3 9h4l5-5v16l-5-5H3Zm13-2c4 3 4 7 0 10m3-13c6 5 6 11 0 16"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
 camera:'<path d="M2 7h5l2-3h6l2 3h5v14H2Z"/><circle cx="12" cy="13" r="4"/>',
 play:'<path d="m8 4 12 8-12 8Z"/>',
 puzzle:'<path d="M3 3h6c-2 5 8 5 6 0h6v6c-5-2-5 8 0 6v6h-6c2-5-8-5-6 0H3v-6c5 2 5-8 0-6Z"/>',
 check:'<path d="m4 12 5 5L21 5"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.compass}</svg>`;
const escape=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const world=id=>DN_CONTENT.worlds.find(w=>w.id===id);
const rank=()=>Object.keys(ageNames).indexOf(state.age);
const young=()=>rank()<2;
const key=(id,i)=>`${state.age}:${id}:${i}`;
const completed=id=>[0,1,2,3,4].filter(i=>state.results[key(id,i)]).length;
const stars=()=>Object.values(state.results).reduce((a,r)=>a+r.stars,0);
const save=()=>{const player=profiles.current();if(!player)return true;player.state=JSON.parse(JSON.stringify(state));player.updated=Date.now();return persistRegistry();};
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),4500);}
function effect(kind='tap'){
 if(!state.settings.effects||state.settings.volume===0)return;
 try{const ctx=effect.ctx||(effect.ctx=new (window.AudioContext||window.webkitAudioContext)());ctx.resume().catch(()=>{});const tones=kind==='success'?[523,659,784]:kind==='error'?[230,190]:kind==='reward'?[659,784,1047]:[450];tones.forEach((hz,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+i*.075;oscillator.type='sine';oscillator.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(state.settings.volume*.045,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+.12);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(at);oscillator.stop(at+.13);});}catch{}
}
function findVoice(voiceId){return (window.AUDIO_MANIFEST||[]).find(c=>c.voiceId===voiceId||c.aliases?.includes(voiceId))||null;}
function voiceText(text,{manual=false}={}){const clean=t=>String(t||'').trim().replace(/\s+/g,' ');const clip=(window.AUDIO_MANIFEST||[]).find(c=>clean(c.text)===clean(text));return clip?voice(clip.voiceId,{manual}):false;}
function stopVoice(){voice.token=(voice.token||0)+1;if(voice.audio){voice.audio.pause();voice.audio.removeAttribute('src');voice.audio.load();voice.audio=null;}}
function voice(voiceId,{manual=false,next=null}={}){
 if(!state.settings.voice&&!manual)return false;
 const clip=findVoice(voiceId);stopVoice();
 if(!clip||!['verified','generated','legacy-unverified'].includes(clip.status)){if(manual)toast('Точная запись этой реплики ещё готовится. Подмены другим советом нет.');return false;}
 const file=clip.files?.[state.hero]||clip.file;
 const a=new Audio('audio/'+file);voice.audio=a;a.volume=state.settings.volume;voice.currentId=clip.voiceId;
 const token=voice.token;a.addEventListener('ended',()=>{if(voice.token===token){voice.audio=null;if(next)voice(next);}}, {once:true});
 a.play().catch(()=>{if(token===voice.token&&manual)toast('Не удалось воспроизвести запись. Нажми повтор после проверки звука.');});return true;
}
function applySettings(){document.body.classList.toggle('large',state.settings.large||young());document.body.classList.toggle('calm',state.settings.calm);document.body.classList.toggle('brief',state.settings.short);}
function dialog(title,body,bind){const d=$('#modal');if(d.open)d.close();d.innerHTML=`<div class="modal-head"><h2>${escape(title)}</h2><button class="quiet close" aria-label="Закрыть окно">×</button></div>${body}`;d.querySelector('.close').onclick=()=>d.close();d.showModal();if(bind)bind(d);}
const hero=()=>({name:state.hero==='lera'?'Лера':'Макс',img:'assets/hero_'+state.hero+'-cutout.png'});
const awardTool=name=>{if(!state.inventory.includes(name)){state.inventory.push(name);save();return true;}return false;};
const count=()=>DN_CONTENT.worlds.filter(w=>completed(w.id)===5).length;
window.DN={profiles,PROFILE_KEY,state,defaults,KEY,ageNames,icon,escape,$,$$,world,rank,young,key,completed,stars,save,toast,effect,voice,voiceText,findVoice,stopVoice,applySettings,dialog,hero,awardTool,count};
})();
