const CONFIG = {
  WS_URL: null,              // Örn: "wss://example.com/chat" (null ise demo bot çalışır)
  PAIR_TIMEOUT_MS: 5000,
  DEMO_MAX_TURNS: 25,
  DEMO_MAX_MINUTES: 3
};

let nickname = '';
let currentCategory = 'Genel Sohbet';
let ws = null;
let pairTimer = null;
let usingDemo = false;
let demoStart = 0;
let demoCount = 0;
let msgId = 0;

const REACTIONS = ['👍','❤️','😂','😮','😢'];
const DEMO_RESPONSES = {
  'Teknoloji':['Son zamanlarda hangi uygulamayı keşfettin?','Yeni bir cihaz almak ister misin?','Favori yazılımın hangisi?'],
  'Oyun':['Hangi tür oyunları seversin?','En son hangi oyunu bitirdin?','Bir oyun esprisi ister misin?'],
  'Spor':['Hangi takımı tutuyorsun?','Son maç skorunu takip ettin mi?','Spor yapmayı sever misin?'],
  'Film & Dizi':['En son hangi filmi izledin?','Favori dizin ne?','Yeni çıkan filmler hakkında ne düşünüyorsun?'],
  'Müzik':['Hangi şarkıyı önerirsin?','Sevdiğin sanatçı kim?','En son hangi konseri izledin?'],
  'Eğitim & Öğrenme':['Şu sıralar ne öğrenmek istiyorsun?','Önerdiğin eğitim kaynakları var mı?','Hedeflediğin bir kurs var mı?'],
  'Genel Sohbet':['Günün nasıl geçti?','Bugün neler yaptın?','Hava nasıl?']
};

const modal = document.getElementById('nicknameModal');
const nicknameInput = document.getElementById('nicknameInput');
const saveNickname = document.getElementById('saveNickname');
const categoryList = document.getElementById('categoryList');
const currentCategoryEl = document.getElementById('currentCategory');
const pairStatus = document.getElementById('pairStatus');
const messagesEl = document.getElementById('messages');
const typingEl = document.getElementById('typing');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');

// init nickname
const saved = localStorage.getItem('nickname');
if (saved) {
  nickname = saved;
  modal.classList.add('hidden');
  startChat();
} else {
  modal.classList.remove('hidden');
}

saveNickname.onclick = () => {
  const val = nicknameInput.value.trim();
  if (val) {
    nickname = val;
    localStorage.setItem('nickname', nickname);
    modal.classList.add('hidden');
    startChat();
  }
};

themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};

categoryList.addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    document.querySelectorAll('#categoryList li').forEach(li=>li.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.cat;
    currentCategoryEl.textContent = currentCategory;
    startChat();
  }
});

sendBtn.onclick = sendMessage;
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  } else {
    sendTyping();
  }
});

function startChat(){
  messagesEl.innerHTML='';
  pairStatus.textContent='Eşleşme bekleniyor...';
  typingEl.classList.add('hidden');
  demoCount=0;
  demoStart=Date.now();
  usingDemo=false;
  if(ws){ws.close();ws=null;}
  if(CONFIG.WS_URL){
    ws=new WebSocket(CONFIG.WS_URL);
    ws.addEventListener('open',()=>{
      ws.send(JSON.stringify({type:'join',nickname,category:currentCategory}));
    });
    ws.addEventListener('message',handleWSMessage);
    pairTimer=setTimeout(()=>{ if(!usingDemo) startDemo(); },CONFIG.PAIR_TIMEOUT_MS);
  } else {
    startDemo();
  }
}

function handleWSMessage(ev){
  const data=JSON.parse(ev.data);
  switch(data.type){
    case 'system': addSystemMessage(data.text); break;
    case 'message': addMessage('other', data.text); break;
    case 'paired': pairStatus.textContent='Eşleşti'; usingDemo=false; clearTimeout(pairTimer); break;
    case 'unpaired': pairStatus.textContent='Eşleşme bekleniyor...'; break;
    case 'typing': showTyping(true); setTimeout(()=>showTyping(false),2000); break;
  }
}

function startDemo(){
  usingDemo=true;
  pairStatus.textContent='Demo Bot bağlı';
}

function sendTyping(){
  if(ws && ws.readyState===1 && !usingDemo){
    ws.send(JSON.stringify({type:'typing'}));
  }
}

function sendMessage(){
  const text=messageInput.value.trim();
  if(!text) return;
  messageInput.value='';
  const opts={};
  let sendText=text;
  if(text.startsWith('/vanish ')){
    opts.ephemeral=true;
    sendText=text.replace('/vanish','').trim();
  } else if(text.startsWith('/poll ')){
    const poll=parsePoll(text);
    if(poll){ opts.poll=poll; sendText=''; }
  }
  const el=addMessage('me', sendText, opts);
  if(opts.ephemeral){ setTimeout(()=>removeMessage(el),30000); }
  if(ws && ws.readyState===1 && !usingDemo){
    ws.send(JSON.stringify({type:'message',text:sendText,options:opts}));
  } else if(usingDemo){
    handleDemoResponse(text);
  }
}

function handleDemoResponse(userText){
  demoCount++;
  if(demoCount>=CONFIG.DEMO_MAX_TURNS || (Date.now()-demoStart)>(CONFIG.DEMO_MAX_MINUTES*60000)){
    addSystemMessage('Sohbeti sonlandırmak ister misin?');
    return;
  }
  showTyping(true);
  const delay=600+Math.random()*600;
  setTimeout(()=>{
    showTyping(false);
    const arr=DEMO_RESPONSES[currentCategory]||DEMO_RESPONSES['Genel Sohbet'];
    const reply=arr[Math.floor(Math.random()*arr.length)];
    addMessage('other', reply);
    const last=messagesEl.querySelector('.msg.me:last-of-type .status');
    if(last) last.textContent='✓✓';
  }, delay);
}

function parsePoll(input){
  const parts=input.slice(6).split('|').map(s=>s.trim()).filter(Boolean);
  if(parts.length<2) return null;
  const question=parts[0];
  const options=parts.slice(1).map(t=>({text:t,count:0}));
  return {question,options};
}

function addMessage(role,text,opts={}){
  const el=document.createElement('div');
  el.className='msg '+(role||'system');
  el.dataset.id=++msgId;
  if(opts.ephemeral) el.classList.add('ephemeral');

  if(opts.poll){
    const poll=document.createElement('div');
    poll.className='poll';
    const q=document.createElement('div');
    q.className='question';
    q.textContent=opts.poll.question;
    poll.appendChild(q);
    opts.poll.options.forEach((opt)=>{
      const o=document.createElement('div');
      o.className='option';
      const count=document.createElement('span');
      count.className='count';
      count.textContent='0';
      o.textContent=opt.text+' ';
      o.appendChild(count);
      o.onclick=()=>{
        if(o.classList.contains('selected')) return;
        o.classList.add('selected');
        opt.count++; count.textContent=opt.count;
        showPollResults(poll, opts.poll);
      };
      poll.appendChild(o);
    });
    el.appendChild(poll);
  } else if(role==='system'){
    el.textContent=text;
  } else {
    const content=document.createElement('div');
    content.className='content';
    content.textContent=text;
    el.appendChild(content);
  }

  if(role!=='system'){
    const meta=document.createElement('div');
    meta.className='meta';
    meta.innerHTML=`<span class="time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="status">✓</span>`;
    el.appendChild(meta);

    const reactions=document.createElement('div');
    reactions.className='reactions';
    el.appendChild(reactions);

    const reactBtn=document.createElement('button');
    reactBtn.textContent='🙂';
    reactBtn.className='react-btn';
    reactBtn.onclick=(e)=>{ e.stopPropagation(); showPicker(el, reactions); };
    el.appendChild(reactBtn);

    if(role==='me') enableControls(el);
  }

  messagesEl.appendChild(el);
  scrollBottom();
  return el;
}

function enableControls(msgEl){
  const controls=document.createElement('div');
  controls.className='controls';
  const editBtn=document.createElement('button');
  editBtn.textContent='✏️';
  const delBtn=document.createElement('button');
  delBtn.textContent='🗑️';
  controls.append(editBtn,delBtn);
  msgEl.appendChild(controls);

  editBtn.onclick=()=>{
    const content=msgEl.querySelector('.content');
    const nt=prompt('Mesajı düzenle', content.textContent);
    if(nt) content.textContent=nt;
  };
  delBtn.onclick=()=>{ if(confirm('Mesaj silinsin mi?')) msgEl.remove(); };
  setTimeout(()=>controls.remove(),10000);
}

function showPicker(msgEl,container){
  const picker=document.createElement('div');
  picker.className='picker';
  REACTIONS.forEach(r=>{
    const s=document.createElement('span');
    s.textContent=r;
    s.onclick=()=>{ addReaction(container,r); picker.remove(); };
    picker.appendChild(s);
  });
  msgEl.appendChild(picker);
  document.addEventListener('click',function hide(e){
    if(!picker.contains(e.target)){
      picker.remove();
      document.removeEventListener('click',hide);
    }
  });
}

function addReaction(container,emoji){
  let span=Array.from(container.children).find(c=>c.dataset.emoji===emoji);
  if(!span){
    span=document.createElement('span');
    span.dataset.emoji=emoji;
    span.textContent=`${emoji} 1`;
    container.appendChild(span);
  } else {
    const parts=span.textContent.split(' ');
    const cnt=parseInt(parts[1])+1;
    span.textContent=`${emoji} ${cnt}`;
  }
}

function showPollResults(pollEl,poll){
  const total=poll.options.reduce((s,o)=>s+o.count,0);
  pollEl.querySelectorAll('.option').forEach((o,i)=>{
    const count=poll.options[i].count;
    const perc=total?Math.round(count/total*100):0;
    o.querySelector('.count').textContent=`${count} (${perc}%)`;
  });
}

function removeMessage(el){
  if(el && el.parentElement) el.remove();
}

function scrollBottom(){
  messagesEl.scrollTop=messagesEl.scrollHeight;
}

function showTyping(show){
  typingEl.classList[show?'remove':'add']('hidden');
}

function addSystemMessage(text){
  addMessage('system',text);
}
