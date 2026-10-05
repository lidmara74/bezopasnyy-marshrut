/* Общие цифровые приложения подключаются к существующему игровому движку. */
(() => {
'use strict';
const D=DN,E=D.escape;
function scene(root,w,{transfer=false,day=false,onDone,data={},onSave=()=>{},onError=()=>{}}={}){
 const rank=D.rank(),spec=DN_SCENES.specs[w.id],c=IAR_CASES[w.number-1].ages[D.state.age];
 const text=day?DN_SCENES.finalMessages[w.id]:transfer?c.situation:(DN_SCENES.training[w.id]?.[rank]||w.stages[0].situation);
 const message=day?text:transfer?DN_SCENES.messages[w.id][rank]:text;
 const v=data;v.tab=v.tab||'screen';v.facts=v.facts||[];v.events=v.events||[];v.actions=v.actions||[];v.permissions=v.permissions||{contacts:true,documents:true,notifications:true};
 const record=(name)=>{if(!v.actions.includes(name))v.actions.push(name);v.events.push({name,at:Date.now()});onSave();};
 const say=(message,bad=false)=>{v.notice=message;onSave();if(bad)onError(message);draw();if(!bad||day)D.voiceText(message);};
 const required=rank===0?['pause','help']:rank===1?['pause','verify','resolve','help']:['pause','inspect','verify','resolve',...(['pressure','conflict','help'].includes(w.id)?['capture','help']:[])];
 const factCount=rank<2?0:2;
 const complete=()=>required.every(a=>v.actions.includes(a))&&v.facts.length>=factCount&&(rank<3||v.actions.includes('follow'));
 function checkFinish(){if(complete()){onDone({actions:[...v.actions],evidence:[...v.facts],events:[...v.events],independent:!v.hint,transfer,consequence:v.notice});return true;}return false;}
 function act(action){if(D.game?.paused&&!day)return;
  if(action==='pause'){v.paused=true;record('pause');say('Окно остановлено. Ничего не отправлено. Можно разобраться.');}
  else if(action==='inspect'){record('inspect');v.tab='profile';draw();}
  else if(action==='verify'){if(!v.paused)return say('Запрос ещё активен. Отложи действие, чтобы спокойно проверить сведения.',true);record('verify');v.tab='check';if(rank>=3)v.followVisible=true;say(spec.checks[rank]);}
  else if(action==='capture'){record('capture');v.captured=true;say('В пакет сохранены сообщение, отправитель и время. Пакет не опубликован в общем чате.');}
  else if(action==='resolve'){
   if(!v.paused)return say('Сейчас запрос ещё активен. Сначала останови его выполнение.',true);
   if(rank>0&&!v.actions.includes('verify'))return say('В твоих действиях пока нет независимой проверки. Открой известное приложение или сведения об источнике.',true);
   if(spec.kind==='account'&&(v.permissions.contacts||v.permissions.documents))return say(rank===4&&!day?'В настройках остаётся неизвестный сеанс или не изменён пароль. Проверь оба пункта.':'Посмотри, какие сведения остаются доступны. Сопоставь их с целью запроса.',true);
   record('resolve');v.resolved=true;say(({payment:'Перевод отменён. Деньги остались на счёте.',browser:'Сомнительная вкладка закрыта. Загрузка не запущена.',account:'Настройки сохранены. Рискованный доступ прекращён; уведомления остаются доступными.',feed:'Публикация не переслана. Обращение сохранено в выбранном канале.',game:'Предложение отклонено. Доступ к аккаунту и защита сохранены.',offer:'Участие отменено. Платёжные данные не переданы.'})[spec.kind]||'Личные требования не выполнены. Контакт ограничен; можно получить поддержку.');
  }
  else if(action==='help'){v.tab='help';draw();}
  else if(action==='send-help'){
   if(!v.paused)return say('Сначала останови действие в непонятном окне.',true);
   if(rank>=2&&['pressure','conflict','help'].includes(w.id)&&!v.captured)return say('К обращению пока нечего приложить. Сохрани сообщение с отправителем и временем.',true);
   record('help');v.sentHelp=true;say('Ситуация передана доверенному человеку вместе с доступными фактами. Чужие данные публично не пересылались.');
  }
  else if(action==='unsafe'){v.loss=(v.loss||0)+1;record('attempt');say('Учебная операция остановлена: '+({payment:'перевод ушёл бы непроверенному получателю.',account:'лишние данные стали бы доступны приложению.',browser:'новая вкладка запросила бы данные аккаунта.',offer:'за «бесплатным» предложением следует платёж.',feed:'копия увеличила бы аудиторию непроверенной или обидной публикации.'}[spec.kind]||'собеседник получил бы личные сведения или контроль над действием.')+' Можно отменить и изменить решение.',true);}
  else if(action==='follow'){record('follow');v.followVisible=false;say('Новое уведомление отложено. Ты сопоставил его с уже проверенными сведениями, условия не стали надёжнее.');}
  else if(action==='finish'){if(!checkFinish())say(rank<2?'Посмотри, что ещё можно сделать с этим окном и кому показать его.':'Остались непроверенные сведения или незавершённые действия. Доска фактов помогает обосновать решение.',true);}
 }
 const button=(action,label,icon='')=>`<button type="button" class="device-action" data-scene-action="${action}">${icon?D.icon(icon):''}<span>${label}</span></button>`;
 function draw(){
  const short=rank===0;const bubble=message;
  const facts=[{id:'request',text:text},{id:'check',text:spec.checks[rank]},{id:'appearance',text:'На экране знакомый значок и аккуратное оформление.'}];
  root.innerHTML=`<div class="digital-workspace ${short?'little-reader':''}"><section class="device-frame" aria-label="Учебное приложение ${E(spec.app)}"><div class="device-status"><span>${day?'14:20':'09:41'}</span><span>●●● ▰</span></div><div class="device-appbar"><button data-tab="screen" aria-label="Назад к сообщению">‹</button><b>${E(spec.app)}</b><button data-scene-action="inspect" aria-label="Открыть профиль отправителя">${D.icon('people')}</button></div><nav class="device-tabs">${['screen','check',...(short?[]:['facts'])].map((tab,i)=>`<button data-tab="${tab}" aria-pressed="${v.tab===tab}">${['Экран','Проверка','Факты'][i]}</button>`).join('')}</nav><div class="device-content">
  ${v.tab==='screen'?`${spec.kind==='browser'?'<label class="address-bar">Адрес из сообщения<input value="service-check.example/verify" readonly aria-label="Адрес в сообщении"></label>':''}${spec.kind==='game'?'<div class="game-horizon"><span>ИГРОВОЙ ЦЕНТР</span><span class="pixel-person">♟</span><span>◇ ◇ ◇</span></div>':''}<article class="incoming-post"><div class="post-author">${D.icon(w.icon)}<span>${E(spec.sender)}<small>Сегодня, 09:41</small></span></div><p>${E(bubble)}</p>${transfer?'<button type="button" class="text-button" data-read-message="1">🔊 Прослушать сообщение</button>':''}${v.paused?'<span class="status-neutral">Действие отложено</span>':''}</article>
  ${spec.kind==='account'&&!short?`<fieldset class="permission-panel"><legend>Разрешения приложения</legend>${[['contacts',day?'Контакты':rank===4?'Неизвестный сеанс активен':rank===3?'Открыть номер телефона':'Отправить код собеседнику'],['documents',day?'Документы':rank===4?'Старый пароль действует':rank===3?'Приложить фото документа':'Передать пароль'],['notifications','Уведомления']].map(([k,t])=>`<label>${t}<input type="checkbox" data-device-permission="${k}" ${v.permissions[k]?'checked':''}></label>`).join('')}</fieldset>`:''}
  ${spec.kind==='payment'?'<div class="payment-slip"><span>Получатель: новый счёт</span><b>490 ₽</b><small>Подтверждение ещё не отправлено</small></div>':''}
  ${spec.kind==='offer'?'<details class="offer-terms"><summary>Условия предложения</summary><p>Для получения бонуса нужны регистрация и оплата. Автоматический платёж возможен по условиям подписки.</p></details>':''}
  <div class="device-controls">${button('pause',short?'Закрыть':'Отложить действие','hand')}${short?button('help','Показать взрослому','people'):button('unsafe',spec.kind==='feed'?'Переслать':'Выполнить запрос','arrow')}${!short?button('capture','Сохранить сообщение','camera'):''}${!short?button('resolve',spec.action,w.icon):''}</div>`:''}
  ${v.tab==='profile'?`<article class="device-profile"><div class="large-avatar">${D.icon('people')}</div><h3>${E(spec.sender)}</h3><p>${rank>=3?'Есть общий чат и знакомая фотография.':'Аккаунт прислал запрос.'}</p><p>Дата создания и личность не подтверждены. Сведения заполнены самим отправителем.</p><p>Общий чат и фотография не подтверждают конкретную просьбу.</p>${button('verify','Проверить другим каналом','search')}</article>`:''}
  ${v.tab==='check'?`<div class="known-app"><h3>${short?'Проверим вместе':'Независимая проверка'}</h3><p>Открой известный канал самостоятельно.</p>${button('verify',spec.kind==='browser'?'Открыть по сохранённому адресу':spec.kind==='chat'?'Связаться по известному контакту':spec.kind==='feed'?'Открыть первоисточник':'Открыть известное приложение','search')}${v.actions.includes('verify')?`<article class="verification-result"><b>Что удалось установить</b><p>${E(spec.checks[rank])}</p></article>`:''}</div>`:''}
  ${v.tab==='facts'?`<div class="facts-board"><h3>Основания решения</h3><p>Закрепи сведения из самой ситуации и независимой проверки. Значок или оформление сами по себе ничего не доказывают.</p>${facts.map(f=>`<button data-fact="${f.id}" aria-pressed="${v.facts.includes(f.id)}" ${f.id==='check'&&!v.actions.includes('verify')?'disabled':''}>${E(f.text)}<span>${v.facts.includes(f.id)?'Закреплено':'Закрепить'}</span></button>`).join('')}</div>`:''}
  ${v.tab==='help'?`<div class="help-composer"><h3>Обращение за помощью</h3><label>Кому<select id="help-recipient"><option>Доверенному взрослому</option><option>Педагогу</option>${rank>=2?'<option>Поддержке сервиса через известный канал</option>':''}</select></label><article>${E(short?spec.young:text)}${v.captured?'<p>Приложение: снимок с автором и временем.</p>':''}</article>${button('send-help',short?'Показать':'Передать обращение','people')}</div>`:''}
  </div><div class="device-bottom"></div></section><aside class="scene-desk"><span class="eyebrow">${day?'ОДИН ДЕНЬ ОНЛАЙН':transfer?'НОВАЯ СИТУАЦИЯ':'ИССЛЕДУЙ ПРИЛОЖЕНИЕ'}</span><h3>${short?'Твои действия':'Рабочий стол'}</h3>${!short?button('help','Обратиться за помощью','people'):''}${rank<2||D.state.settings.steps?`<p class="scene-guide">${rank===0?'Посмотри на окно. Можно остановиться и показать его взрослому.':'Остановись. Проверь просьбу. Реши, что делать дальше.'}</p>`:'<p>Изучай интерфейс, меняй его состояние и наблюдай последствия.</p>'}${v.captured?'<div class="evidence-ticket">Снимок сохранён · отправитель · сообщение · время</div>':''}${v.followVisible?`<article class="push-notification"><b>Новое уведомление</b><p>${E(spec.follow)}</p>${button('follow','Отложить и сопоставить','chat')}</article>`:''}<div class="scene-notice" role="status">${E(v.notice||'Все операции происходят внутри учебной сцены.')}</div><div class="scene-journal">${v.actions.filter(x=>x!=='attempt'&&!x.startsWith('evidence-')).map(x=>`<span>${E(({pause:'Отложено',inspect:'Профиль открыт',verify:'Проверено',capture:'Факты сохранены',resolve:'Действие выполнено',help:'Помощь запрошена',follow:'Новое событие учтено'})[x])}</span>`).join('')}</div>${button('finish',short?'Готово':'Завершить работу с ситуацией','check')}</aside></div>`;
  root.querySelectorAll('[data-scene-action]').forEach(b=>b.onclick=()=>act(b.dataset.sceneAction));
  root.querySelector('[data-read-message]')?.addEventListener('click',()=>D.voice(`scene.message.${w.id}.${rank}`,{manual:true}));
  root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{v.tab=b.dataset.tab;onSave();draw();});
  root.querySelectorAll('[data-device-permission]').forEach(el=>el.onchange=()=>{v.permissions[el.dataset.devicePermission]=el.checked;onSave();});
  root.querySelectorAll('[data-fact]').forEach(b=>b.onclick=()=>{const id=b.dataset.fact;if(id==='appearance')return say('Оформление видно, но оно не объясняет надёжность просьбы. Найди сведения о содержании и проверке.',true);const at=v.facts.indexOf(id);at<0?v.facts.push(id):v.facts.splice(at,1);record('evidence-'+id);draw();});
 }
 draw();return {act,complete};
}
D.scenes={mount:scene};
const stage=(a,s)=>{const G=D.game;G.data.device=G.data.device||{};scene(a,G.w,{transfer:s.type==='case',data:G.data.device,onSave:()=>G.store(),onError:msg=>G.error(msg),onDone:observation=>{G.done('Ты изменил цифровую ситуацию своими действиями. '+IAR_CASES[G.w.number-1].ages[D.state.age].safe);D.state.results[G.k].observation=observation;D.save();}});};
D.games.types.case=stage;D.games.types.chat=stage;
/* Единый рабочий стол: события остаются доступны, порядок работы выбирает игрок. */
D.games.final=(root)=>{
 const age=D.state.age,saved=D.state.final[age]||(D.state.final[age]={});saved.desktop=saved.desktop||{done:[],scenes:{},active:null};const desk=saved.desktop;
 const save=()=>D.save();
 function draw(){root.innerHTML=`<section class="day-desktop"><header class="day-toolbar"><b>Командный проект · 14:20</b><span>${desk.done.length}/10 событий обработано</span></header><p>Готовим общую публикацию. Сообщения, покупки и игровые предложения приходят в течение дня. Выбирай, чем заняться, и возвращайся к незавершённым приложениям.</p><nav class="day-apps">${DN_CONTENT.worlds.map((w,i)=>`<button data-day-app="${w.id}" ${i>desk.done.length+1?'disabled':''}>${D.icon(w.icon)}<span>${E(DN_SCENES.specs[w.id].app)}</span><small>${desk.done.includes(w.id)?'Завершено':i<=desk.done.length+1?'Новое событие':'Позже'}</small></button>`).join('')}</nav><div id="day-window"></div>${desk.done.length===10?'<div class="route-finish"><h2>Безопасный день завершён!</h2><p>Ты сохранил контроль над данными, перепиской и расходами. Публикацию подготовим вместе с теми, кто поможет проверить согласие.</p><button id="final-map" class="primary">На карту</button><button id="final-repeat" class="secondary">Пройти день снова</button></div>':''}</section>`;
  root.querySelectorAll('[data-day-app]').forEach(b=>b.onclick=()=>open(b.dataset.dayApp));
  if(desk.done.length===10){root.querySelector('#final-map').onclick=D.app.map;root.querySelector('#final-repeat').onclick=()=>{desk.done=[];desk.scenes={};desk.active=null;save();draw();};}
  else if(desk.active)open(desk.active);
 }
 function open(id){desk.active=id;const w=D.world(id);save();scene(root.querySelector('#day-window'),w,{day:true,data:desk.scenes[id]||(desk.scenes[id]={}),onSave:save,onError:()=>{saved.mistakes=(saved.mistakes||0)+1;save();},onDone:observation=>{if(!desk.done.includes(id))desk.done.push(id);desk.scenes[id].observation=observation;desk.active=null;if(desk.done.length===10&&!saved.rewarded){saved.rewarded=true;D.state.xp+=200;}save();D.app.refreshHeader();draw();}});D.voice('day.'+id);}
 draw();return ()=>D.stopVoice();
};
})();
