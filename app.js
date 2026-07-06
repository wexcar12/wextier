document.addEventListener('DOMContentLoaded',function(){
const P='wt_',B=['https://i.pinimg.com/736x/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg','https://i.pinimg.com/736x/e7/29/81/e729811d65432283f14d04b3402a7604.jpg','https://i.pinimg.com/736x/b1/fb/e0/b1fbe00a51bd64ed14aa7193af834456.jpg','https://i.pinimg.com/1200x/12/08/9b/12089ba4009236d30d3d5188d9d2d002.jpg','https://i.pinimg.com/736x/e1/a7/b4/e1a7b44a3711d48afe510af6a905587c.jpg','https://i.pinimg.com/1200x/f3/72/40/f37240b2def552721e7591cba7371da0.jpg','https://i.pinimg.com/736x/8a/9c/26/8a9c26d497504af8791b1048b3a5e30a.jpg','https://img.freepik.com/premium-psd/abstract-polygonal-structure_538547-13168.jpg','https://img.magnific.com/premium-psd/serene-sunset-tranquil-lake-reflecting-majestic-mountains-evergreen-trees_609277-10811.jpg'];
const ACH=[{id:'first_edit',icon:'🏆',name:'Первый среди всех',desc:'Внести первое изменение'},{id:'twenty_tracks',icon:'🎵',name:'Чистый звук',desc:'Добавить 20+ треков'},{id:'shared',icon:'📤',name:'У тебя нет друзей',desc:'Использовать кнопку «Поделиться»'},{id:'rainbow',icon:'🌈',name:'Радужный',desc:'Все тиры разных цветов'},{id:'five_s',icon:'🔥',name:'Нужно больше',desc:'5 треков в S-тире'},{id:'all_empty',icon:'💀',name:'Бесконечная Пустота',desc:'Все тиры пустые'}];
const TC=['#ff7f7f','#ffbf7f','#ffdf7f','#bfff7f','#7fffff','#bfbfff','#df7fff','#ff9fcf'];
function dD(){return[{tier:"S",label:"S",color:"#ff7f7f",items:[{img:"",url:"https://youtu.be/dQw4w9WgXcQ",svc:"youtube"},{img:"",url:"https://youtu.be/kJQP7kiw5Fk",svc:"youtube"}]},{tier:"A",label:"A",color:"#ffbf7f",items:[{img:"",url:"https://youtu.be/fJ9rUzIMcZQ",svc:"youtube"}]},{tier:"B",label:"B",color:"#ffdf7f",items:[{img:"",url:"https://youtu.be/9bZkp7q19f0",svc:"youtube"}]},{tier:"C",label:"C",color:"#bfff7f",items:[{img:"",url:"https://youtu.be/OPf0YbXqDm0",svc:"youtube"}]},{tier:"D",label:"D",color:"#7fffff",items:[]}]}
function sg(k,f){try{const r=localStorage.getItem(P+k);return r!==null?JSON.parse(r):f}catch(e){return f}}
function ss(k,v){try{localStorage.setItem(P+k,JSON.stringify(v))}catch(e){}}
function clr(){Object.keys(localStorage).filter(k=>k.startsWith(P)).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})}

let DRAFTS,ad,data1,data2,hist1=[],hist2=[];
let editing=false,compare=false,parallaxOn=false;
let dragItem=null,dST=null,dSI=null,dSL=null;
let aTT=null,aTL=1;
let currentFilter='all';
let neonS={enabled:false,color:'rainbow',target:'all'};
let unlocked=[],comments=[],ctid=null,db=null;
let duelLeftId=null,duelRightId=null;

function showLoading(show){let l=document.querySelector('.loading-spinner');if(!l){l=document.createElement('div');l.className='loading-spinner';document.body.appendChild(l)}l.classList.toggle('show',show)}
function initFB(){try{if(typeof firebase!=='undefined'&&firebase.apps&&firebase.apps.length===0){firebase.initializeApp({apiKey:"AIzaSyDIiUmEqdmQXyhQfUh3Zv-oiA62qXunOqs",authDomain:"wex-tier.firebaseapp.com",projectId:"wex-tier",storageBucket:"wex-tier.appspot.com",messagingSenderId:"81848663409",appId:"1:81848663409:web:4a450cd1960ed71db64ad0"})}db=firebase.firestore()}catch(e){db=null}}
function loadDrafts(){const s=sg('drafts',null);DRAFTS=(s&&Array.isArray(s)&&s.length>0&&s[0].data)?s:[{name:'Основной',data:dD()}];ad=parseInt(sg('active_draft','0'),10);if(isNaN(ad)||!DRAFTS[ad])ad=0;if(!DRAFTS[ad].data)DRAFTS[ad].data=dD();data1=JSON.parse(JSON.stringify(DRAFTS[ad].data));data2=dD()}
function saveDrafts(){if(DRAFTS[ad])DRAFTS[ad].data=JSON.parse(JSON.stringify(data1));ss('drafts',DRAFTS);ss('active_draft',ad)}
function pImg(svc){const c={youtube:'#ff0000',spotify:'#1db954',apple:'#fc3c44',yandex:'#ffcc00'},i={youtube:'▶',spotify:'🟢',apple:'🎵',yandex:'🎧'};const svg='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="'+(c[svc]||'#555')+'" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">'+(i[svc]||'?')+'</text></svg>';return'data:image/svg+xml,'+encodeURIComponent(svg)}
function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),3000)}
function pushH(n){const h=n===1?hist1:hist2;h.push(JSON.parse(JSON.stringify(n===1?data1:data2)));if(h.length>50)h.shift()}
function gD(n){return n===1?data1:data2}
function sD(n,v){if(n===1)data1=v;else data2=v;saveDrafts()}
function chkAch(){const total=data1.reduce((s,t)=>s+t.items.length,0),sT=data1.find(t=>t.tier==='S'),aE=data1.every(t=>t.items.length===0);const colors=data1.map(t=>t.color),aD=new Set(colors).size===data1.length&&data1.length>1;const fE=sg('first_edit_done',false);const checks={first_edit:fE||editing,twenty_tracks:total>=20,rainbow:aD,five_s:sT&&sT.items.length>=5,all_empty:aE};for(const[id,met]of Object.entries(checks)){if(met&&!unlocked.includes(id)){unlocked.push(id);const a=ACH.find(x=>x.id===id);toast('🏆 Достижение: '+(a?a.name:id));ss('achievements',unlocked)}}if(!fE&&editing)ss('first_edit_done',true)}

// НЕОН С РАДУЖНОЙ АНИМАЦИЕЙ
function applyNeon(){
    if(neonS.enabled){
        document.body.classList.add('neon-active');
        if(neonS.color==='rainbow'){
            if(!window._neonRainbowInterval){
                const colors=['rgba(255,100,100,0.9)','rgba(255,200,50,0.9)','rgba(100,255,100,0.9)','rgba(50,150,255,0.9)','rgba(200,50,255,0.9)'];
                let ci=0;
                window._neonRainbowInterval=setInterval(function(){
                    ci=(ci+1)%colors.length;
                    document.documentElement.style.setProperty('--neon-glow','0 0 20px '+colors[ci]);
                },600);
            }
        }else{
            if(window._neonRainbowInterval){clearInterval(window._neonRainbowInterval);window._neonRainbowInterval=null}
            let c='rgba(245,200,66,0.9)';
            if(neonS.color==='cyan')c='rgba(0,200,255,0.9)';
            else if(neonS.color==='magenta')c='rgba(255,0,200,0.9)';
            document.documentElement.style.setProperty('--neon-glow','0 0 20px '+c);
        }
    }else{
        document.body.classList.remove('neon-active');
        document.documentElement.style.setProperty('--neon-glow','none');
        if(window._neonRainbowInterval){clearInterval(window._neonRainbowInterval);window._neonRainbowInterval=null}
    }
    const nb=document.getElementById('neonBtn');
    if(neonS.enabled)nb.classList.add('neon-active');else nb.classList.remove('neon-active');
}
function saveNeon(){neonS.enabled=document.getElementById('neonToggle').checked;neonS.color=document.getElementById('neonColor').value;neonS.target=document.getElementById('neonTarget').value;ss('neon',neonS);applyNeon()}

function applyBg(idx){document.documentElement.style.setProperty('--bg-img','url(\''+B[idx]+'\')');ss('bg',idx)}

// ПАРАЛЛАКС С ВИДЕО
function toggleParallax(on){
    parallaxOn=on;
    const video=document.getElementById('parallaxVideo');
    if(on){
        document.body.classList.add('parallax-active');
        document.getElementById('parallaxBtn').classList.add('primary');
        if(video){
            video.style.display='block';
            video.play().catch(function(){});
        }
    }else{
        document.body.classList.remove('parallax-active');
        document.getElementById('parallaxBtn').classList.remove('primary');
        if(video){
            video.pause();
            video.style.display='none';
        }
    }
    ss('parallax',on);
}

function applyStyle(){const s=document.getElementById('styleSelect').value;document.querySelectorAll('.item').forEach(el=>{el.classList.remove('style-gradient','style-shadow','style-border','style-circle');el.classList.add('style-'+s)});ss('style',s)}
function applySize(){const s=document.getElementById('sizeSelect').value;document.querySelectorAll('.item img').forEach(img=>{img.style.width=s+'px';img.style.height=s+'px'});ss('size',s)}
function filterItems(){const q=document.getElementById('searchInput').value.toLowerCase();document.querySelectorAll('.item').forEach(el=>{const a=el.querySelector('a');const u=a?a.href.toLowerCase():'';const sv=el.dataset.svc||'';el.style.opacity=((!q||u.includes(q))&&(currentFilter==='all'||sv===currentFilter))?'1':'0.25'})}
async function loadComments(id){if(!db||!id){comments=[];return}try{const snap=await db.collection('tierlists').doc(id).collection('comments').orderBy('createdAt','asc').get();comments=[];snap.forEach(doc=>comments.push({id:doc.id,text:doc.data().text,createdAt:doc.data().createdAt?doc.data().createdAt.toDate():new Date()}))}catch(e){comments=[]}}
async function addComment(text){if(!text)return;if(!db||!ctid){comments.push({id:Date.now().toString(),text:text,createdAt:new Date()});updateCommentsDisplay();return}try{await db.collection('tierlists').doc(ctid).collection('comments').add({text:text,createdAt:firebase.firestore.FieldValue.serverTimestamp()});await loadComments(ctid);updateCommentsDisplay()}catch(e){toast('Ошибка при отправке комментария')}}
function updateCommentsDisplay(){const list=document.getElementById('commentsList');if(!list)return;if(comments.length===0){list.innerHTML='<div style="color:#888;text-align:center;padding:10px;">Пока нет комментариев</div>';return}list.innerHTML=comments.map(c=>'<div style="margin-bottom:6px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;"><div style="font-size:0.85rem;">'+c.text.replace(/</g,'&lt;')+'</div>'+(c.createdAt?'<div style="font-size:0.7rem;color:#888;margin-top:4px;">'+new Date(c.createdAt).toLocaleString()+'</div>':'')+'</div>').join('')}
function renderAll(){render(1);if(compare)render(2);updateUI();applyStyle();applySize();filterItems();applyNeon();updateUndo();renderDraftsSidebar()}
function render(n){const el=document.getElementById(n===1?'list1':'list2');if(!el)return;const data=gD(n);el.innerHTML='';data.forEach((t,ti)=>{const row=document.createElement('div');row.className='tier-row animate';const lbl=document.createElement('div');lbl.className='tier-label';lbl.style.backgroundColor=t.color||'#ff7f7f';lbl.textContent=t.label;lbl.title='Двойной клик';lbl.ondblclick=()=>{if(!editing)return;const ci=document.createElement('input');ci.type='color';ci.value=t.color||'#ff7f7f';ci.style.cssText='position:absolute;top:0;left:0;width:100%;height:45%;border:none;cursor:pointer;padding:0;';const ni=document.createElement('input');ni.value=t.label;ni.maxLength=8;ni.style.cssText='position:absolute;bottom:0;left:0;width:100%;height:55%;background:transparent;border:1px solid rgba(0,0,0,0.3);text-align:center;font-weight:900;font-size:1.1rem;color:#111;outline:none;border-radius:0 0 0 4px;';lbl.textContent='';lbl.style.position='relative';lbl.appendChild(ci);lbl.appendChild(ni);ci.focus();const done=()=>{t.label=ni.value.trim()||t.label;t.color=ci.value;pushH(n);sD(n,data);chkAch();renderAll()};ni.onblur=done;ni.onkeypress=e=>{if(e.key==='Enter')ni.blur()}};row.appendChild(lbl);const itemsDiv=document.createElement('div');itemsDiv.className='tier-items';itemsDiv.dataset.tierIndex=ti;itemsDiv.dataset.listNum=n;t.items.forEach((item,ii)=>{const div=document.createElement('div');div.className='item';div.draggable=true;div.dataset.tierIndex=ti;div.dataset.itemIndex=ii;div.dataset.listNum=n;div.dataset.svc=item.svc;const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';a.onclick=function(e){if(item.svc==='youtube'){e.preventDefault();const v=item.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);if(v){document.getElementById('playerFrame').src='https://www.youtube.com/embed/'+v[1]+'?autoplay=1';document.getElementById('playerModal').classList.add('open')}}};const img=document.createElement('img');img.src=item.img||pImg(item.svc);img.alt='';img.onerror=function(){this.src=pImg(item.svc)};img.addEventListener('dragstart',e=>e.preventDefault());a.appendChild(img);div.appendChild(a);const si=document.createElement('span');si.className='svc-icon '+(item.svc==='youtube'?'yt':item.svc==='spotify'?'sp':item.svc==='apple'?'ap':'ym');si.textContent=item.svc==='youtube'?'▶':item.svc==='spotify'?'🟢':item.svc==='apple'?'🎵':'🎧';div.appendChild(si);const db=document.createElement('button');db.className='del-btn';db.textContent='×';db.onclick=function(e){e.stopPropagation();e.preventDefault();pushH(n);t.items.splice(ii,1);sD(n,data);chkAch();renderAll()};div.appendChild(db);div.addEventListener('dragstart',function(e){if(!editing){e.preventDefault();return}dragItem=this;dST=ti;dSI=ii;dSL=n;this.classList.add('dragging');e.dataTransfer.setData('text/plain','')});div.addEventListener('dragend',function(){this.classList.remove('dragging');dragItem=null});itemsDiv.appendChild(div)});const addBtn=document.createElement('button');addBtn.className='add-btn';addBtn.textContent='+';addBtn.onclick=()=>{aTT=ti;aTL=n;document.getElementById('trackUrl').value='';document.getElementById('coverUrl').value='';document.getElementById('svc').value='youtube';document.getElementById('coverPreview').style.display='none';document.getElementById('addModal').classList.add('open')};itemsDiv.appendChild(addBtn);itemsDiv.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('drag-over')});itemsDiv.addEventListener('dragleave',function(){this.classList.remove('drag-over')});itemsDiv.addEventListener('drop',function(e){e.preventDefault();this.classList.remove('drag-over');if(!dragItem||!editing)return;if(dSL!==n)return;const fTi=dST,fIi=dSI,tTi=ti;if(fTi===tTi&&fIi===data[tTi].items.length)return;pushH(n);const moved=data[fTi].items.splice(fIi,1)[0];data[tTi].items.push(moved);sD(n,data);dragItem=null;chkAch();renderAll()});row.appendChild(itemsDiv);if(t.items.length===0){const dt=document.createElement('button');dt.className='del-tier';dt.textContent='×';dt.onclick=function(e){e.stopPropagation();pushH(n);data.splice(ti,1);sD(n,data);chkAch();renderAll()};row.appendChild(dt)}el.appendChild(row)})}
function updateUI(){document.body.classList.toggle('editing',editing);const eb=document.getElementById('editBtn');eb.textContent=editing?'✓ Готово':'✎ Редактировать';if(editing)eb.classList.add('primary');else eb.classList.remove('primary');document.getElementById('resetBtn').classList.toggle('hidden',!editing);document.getElementById('addTierBtn').classList.toggle('hidden',!editing);document.getElementById('col2').style.display=compare?'block':'none'}
function updateUndo(){document.getElementById('undoBtn').disabled=(compare?hist2:hist1).length===0}
function renderDraftsSidebar(){const list=document.getElementById('draftListSidebar');if(!list)return;list.innerHTML='';DRAFTS.forEach((d,i)=>{const div=document.createElement('button');div.className='sidebar-btn'+(i===ad?' primary':'');div.textContent=(i===ad?'● ':'')+d.name;div.onclick=()=>{if(i===ad)return;saveDrafts();ad=i;data1=JSON.parse(JSON.stringify(DRAFTS[i].data));hist1=[];renderAll()};list.appendChild(div)})}
function initParticles(){const canvas=document.getElementById('particlesCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');let particles=[];function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight}function create(){particles=[];for(let i=0;i<40;i++)particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+1,sx:(Math.random()-0.5)*0.5,sy:(Math.random()-0.5)*0.5,o:Math.random()*0.5+0.2})}function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.x+=p.sx;p.y+=p.sy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(245,200,66,'+p.o+')';ctx.fill()});requestAnimationFrame(animate)}resize();create();animate();window.addEventListener('resize',()=>{resize();create()})}

async function loadFromURL(){const p=new URLSearchParams(location.search);if(p.has('id')&&db){try{const doc=await db.collection('shared').doc(p.get('id')).get();if(doc.exists){const d=JSON.parse(doc.data().data);if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);ctid=p.get('id');if(p.has('tierlistId'))ctid=p.get('tierlistId');await loadComments(ctid);history.replaceState({},'',location.pathname);return true}}}catch(e){}}if(p.has('data')){try{const d=JSON.parse(LZString.decompressFromEncodedURIComponent(p.get('data')));if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);if(p.has('tierlistId')){ctid=p.get('tierlistId');await loadComments(ctid)}history.replaceState({},'',location.pathname);return true}}catch(e){}}return false}

async function voteFor(side){
    const id=side==='left'?duelLeftId:duelRightId;
    if(!id||id==='local'){toast('Нельзя голосовать за локальный тир-лист');return}
    if(!db){toast('Голосование недоступно');return}
    showLoading(true);
    try{
        const ref=db.collection('tierlists').doc(id);
        const doc=await ref.get();
        if(doc.exists){
            const currentWins=doc.data().wins||0;
            await ref.update({wins:currentWins+1});
            toast('✅ Голос учтён! Всего побед: '+(currentWins+1));
            document.getElementById('duelVoteBar').classList.remove('show');
            duelLeftId=null;duelRightId=null;
        }
    }catch(e){toast('Ошибка голосования')}
    showLoading(false);
}

function bindEvents(){
    document.getElementById('burgerBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
    document.getElementById('editBtn').addEventListener('click',()=>{editing=!editing;renderAll()});
    document.getElementById('undoBtn').addEventListener('click',()=>{const h=compare?hist2:hist1;if(!h.length)return;sD(compare?2:1,h.pop());renderAll()});
    document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('Сбросить всё?')){data1=dD();data2=dD();hist1=[];hist2=[];sD(1,data1);sD(2,data2);chkAch();renderAll()}});
    document.getElementById('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light-theme');ss('theme',document.body.classList.contains('light-theme')?'light':'dark')});
    document.getElementById('parallaxBtn').addEventListener('click',()=>toggleParallax(!parallaxOn));
    document.getElementById('addTierBtn').addEventListener('click',()=>{if(!editing)return;const letters='EFGHIJKLMNOPQRSTUVWXYZ';const exist=data1.map(t=>t.tier);let next='E';for(const l of letters){if(!exist.includes(l)){next=l;break}}pushH(1);data1.push({tier:next,label:next,color:TC[data1.length%TC.length],items:[]});sD(1,data1);renderAll()});
    document.getElementById('pngBtn').addEventListener('click',async()=>{const btn=document.getElementById('pngBtn');btn.textContent='⏳...';btn.disabled=true;try{const el=document.getElementById('list1');const canvas=await html2canvas(el,{backgroundColor:null,scale:2,useCORS:true,allowTaint:true});const a=document.createElement('a');a.download='wex-tier.png';a.href=canvas.toDataURL('image/png');a.click()}catch(e){toast('Ошибка PNG')}btn.textContent='📥 Скачать PNG';btn.disabled=false});
    document.getElementById('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data1,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wex-tier.json';a.click()});
    document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change',function(){const file=this.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{try{const d=JSON.parse(e.target.result);if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);chkAch();renderAll();toast('✅ Загружено!')}}catch(ex){toast('Ошибка формата')}};reader.readAsText(file);this.value=''});
    document.getElementById('shareBtn').addEventListener('click',async()=>{if(!db){const compressed=LZString.compressToEncodedURIComponent(JSON.stringify(data1));const url=location.origin+location.pathname+'?data='+compressed;navigator.clipboard.writeText(url).then(()=>toast('🔗 Ссылка скопирована!'))}else{try{const docRef=await db.collection('shared').add({data:JSON.stringify(data1),createdAt:firebase.firestore.FieldValue.serverTimestamp()});ctid=docRef.id;const shortUrl=location.origin+location.pathname+'?id='+docRef.id;navigator.clipboard.writeText(shortUrl).then(()=>toast('🔗 Короткая ссылка скопирована!'))}catch(e){const compressed=LZString.compressToEncodedURIComponent(JSON.stringify(data1));const url=location.origin+location.pathname+'?data='+compressed;navigator.clipboard.writeText(url).then(()=>toast('🔗 Ссылка скопирована!'))}}if(!unlocked.includes('shared')){unlocked.push('shared');ss('achievements',unlocked);toast('🏆 Достижение: У тебя нет друзей')}});
    document.getElementById('compareBtn').addEventListener('click',()=>{compare=!compare;if(compare){data2=JSON.parse(JSON.stringify(data1));hist2=[]}renderAll()});
    document.getElementById('playlistBtn').addEventListener('click',()=>{const yt=data1.flatMap(t=>t.items).filter(i=>i.svc==='youtube');if(yt.length===0){toast('Нет YouTube треков');return}const ids=yt.map(i=>{const m=i.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null}).filter(Boolean);if(ids.length>0)window.open('https://www.youtube.com/watch_videos?video_ids='+ids.join(','),'_blank')});

    document.getElementById('galleryBtn').addEventListener('click',async()=>{if(!db){toast('Галерея недоступна');return}document.getElementById('galleryModal').classList.add('open');document.getElementById('galleryModal').querySelector('h3').textContent='🖼 Галерея тир-листов';document.getElementById('publishBtn').style.display='inline-block';const list=document.getElementById('galleryList');list.innerHTML='⏳ Загрузка...';showLoading(true);try{const snap=await db.collection('tierlists').orderBy('createdAt','desc').limit(20).get();list.innerHTML='';snap.forEach(doc=>{const d=doc.data();const div=document.createElement('div');div.style.cssText='padding:8px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';div.innerHTML='<strong>'+(d.name||'Без названия')+'</strong> 🏆'+(d.wins||0)+' ('+(d.trackCount||0)+' треков)';div.onclick=async()=>{pushH(1);data1=JSON.parse(d.data);sD(1,data1);ctid=doc.id;await loadComments(ctid);document.getElementById('galleryModal').classList.remove('open');renderAll()};list.appendChild(div)});if(snap.empty)list.innerHTML='Пока пусто...'}catch(e){list.innerHTML='Ошибка загрузки';toast('Ошибка загрузки галереи')}showLoading(false)});
    document.getElementById('closeGallery').addEventListener('click',()=>document.getElementById('galleryModal').classList.remove('open'));
    document.getElementById('publishBtn').addEventListener('click',async()=>{if(!db){toast('Недоступно');return}const name=prompt('Название:','Мой тир-лист');if(!name)return;showLoading(true);try{const docRef=await db.collection('tierlists').add({name,data:JSON.stringify(data1),trackCount:data1.reduce((s,t)=>s+t.items.length,0),wins:0,createdAt:firebase.firestore.FieldValue.serverTimestamp()});ctid=docRef.id;toast('📤 Опубликовано!');document.getElementById('galleryModal').classList.remove('open')}catch(e){toast('Ошибка публикации')}showLoading(false)});

    document.getElementById('duelBtn').addEventListener('click',async()=>{if(!db){toast('Недоступно');return}document.getElementById('duelModal').classList.add('open');const list=document.getElementById('duelList');list.innerHTML='⏳ Загрузка...';showLoading(true);try{const snap=await db.collection('tierlists').orderBy('createdAt','desc').limit(20).get();list.innerHTML='';snap.forEach(doc=>{const d=doc.data();const div=document.createElement('div');div.style.cssText='padding:8px;margin-bottom:4px;background:rgba(255,255,255,0.05);border-radius:6px;';div.innerHTML='<input type="radio" name="duelSelect" value="'+doc.id+'"> '+(d.name||'Без названия')+' 🏆'+(d.wins||0)+' ('+(d.trackCount||0)+' треков)';list.appendChild(div)});if(snap.empty)list.innerHTML='Пусто...'}catch(e){list.innerHTML='Ошибка загрузки';toast('Ошибка загрузки дуэли')}showLoading(false)});
    document.getElementById('closeDuel').addEventListener('click',()=>document.getElementById('duelModal').classList.remove('open'));
    document.getElementById('startDuelBtn').addEventListener('click',async()=>{
        const sel=document.querySelector('input[name="duelSelect"]:checked');
        if(!sel){toast('Выберите соперника');return}
        try{
            const doc=await db.collection('tierlists').doc(sel.value).get();
            if(doc.exists){
                compare=true;
                data2=JSON.parse(doc.data().data);
                hist2=[];
                duelLeftId=ctid;
                duelRightId=sel.value;
                const bar=document.getElementById('duelVoteBar');
                bar.classList.add('show');
                document.getElementById('duelLeftWins').textContent='🏆 '+(duelLeftId?'?':'0');
                document.getElementById('duelRightWins').textContent='🏆 '+(doc.data().wins||0);
                document.getElementById('duelModal').classList.remove('open');
                renderAll();
                toast('⚔ Дуэль началась! Голосуйте за победителя!');
            }
        }catch(e){toast('Ошибка загрузки соперника')}
    });

    document.getElementById('voteLeftBtn').addEventListener('click',()=>voteFor('left'));
    document.getElementById('voteRightBtn').addEventListener('click',()=>voteFor('right'));

    document.getElementById('topBtn').addEventListener('click',async()=>{
        if(!db){toast('Недоступно');return}
        document.getElementById('galleryModal').classList.add('open');
        document.getElementById('galleryModal').querySelector('h3').textContent='🏅 Топ тир-листов';
        document.getElementById('publishBtn').style.display='none';
        const list=document.getElementById('galleryList');
        list.innerHTML='⏳ Загрузка...';
        showLoading(true);
        try{
            const snap=await db.collection('tierlists').orderBy('wins','desc').limit(20).get();
            list.innerHTML='';
            let rank=1;
            snap.forEach(doc=>{
                const d=doc.data();
                if(!d.wins||d.wins===0){rank++;return;}
                const div=document.createElement('div');
                div.style.cssText='padding:8px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';
                let medal='';
                if(rank===1)medal='🥇';
                else if(rank===2)medal='🥈';
                else if(rank===3)medal='🥉';
                div.innerHTML=medal+' <strong>#'+rank+'</strong> '+(d.name||'Без названия')+' 🏆'+(d.wins||0)+' ('+(d.trackCount||0)+' треков)';
                div.onclick=async()=>{pushH(1);data1=JSON.parse(d.data);sD(1,data1);ctid=doc.id;await loadComments(ctid);document.getElementById('galleryModal').classList.remove('open');renderAll()};
                list.appendChild(div);
                rank++;
            });
            if(list.innerHTML==='')list.innerHTML='Пока никто не побеждал...';
        }catch(e){list.innerHTML='Ошибка загрузки'}
        showLoading(false);
    });

    document.getElementById('achievementsBtn').addEventListener('click',()=>{document.getElementById('achievementsModal').classList.add('open');document.getElementById('achievementsList').innerHTML=ACH.map(a=>{const u=unlocked.includes(a.id);return'<div style="padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;opacity:'+(u?'1':'0.4')+';display:flex;align-items:center;gap:10px;"><span style="font-size:2rem;">'+(u?a.icon:'🔒')+'</span><div><strong>'+a.name+'</strong><br><small>'+a.desc+'</small></div></div>'}).join('')});
    document.getElementById('closeAchievements').addEventListener('click',()=>document.getElementById('achievementsModal').classList.remove('open'));
    document.getElementById('neonBtn').addEventListener('click',()=>{document.getElementById('neonModal').classList.add('open');document.getElementById('neonToggle').checked=neonS.enabled;document.getElementById('neonColor').value=neonS.color;document.getElementById('neonTarget').value=neonS.target});
    document.getElementById('closeNeon').addEventListener('click',()=>{saveNeon();document.getElementById('neonModal').classList.remove('open')});
    document.getElementById('neonModal').addEventListener('click',function(e){if(e.target===this){saveNeon();this.classList.remove('open')}});
    document.getElementById('commentsBtn').addEventListener('click',async()=>{document.getElementById('commentsModal').classList.add('open');if(ctid)await loadComments(ctid);updateCommentsDisplay()});
    document.getElementById('closeComments').addEventListener('click',()=>document.getElementById('commentsModal').classList.remove('open'));
    document.getElementById('addCommentBtn').addEventListener('click',async()=>{const text=document.getElementById('newComment').value.trim();if(!text)return;document.getElementById('newComment').value='';await addComment(text)});
    document.getElementById('cancelAdd').addEventListener('click',()=>document.getElementById('addModal').classList.remove('open'));
    document.getElementById('fetchCoverBtn').addEventListener('click',async function(){const url=document.getElementById('trackUrl').value.trim();if(!url){toast('Вставьте ссылку');return}this.textContent='⏳...';this.disabled=true;let cover=null;const ytM=url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);if(ytM)cover='https://img.youtube.com/vi/'+ytM[1]+'/mqdefault.jpg';if(cover){document.getElementById('coverUrl').value=cover;document.getElementById('coverPreview').src=cover;document.getElementById('coverPreview').style.display='block'}else{toast('Не удалось. Вставьте ссылку на картинку вручную.')}this.textContent='🔍 Загрузить обложку';this.disabled=false});
    document.getElementById('coverUrl').addEventListener('input',function(){const url=this.value.trim();const prev=document.getElementById('coverPreview');if(url){prev.src=url;prev.style.display='block'}else{prev.style.display='none'}});
    document.getElementById('okAdd').addEventListener('click',function(){const svc=document.getElementById('svc').value;const url=document.getElementById('trackUrl').value.trim();let img=document.getElementById('coverUrl').value.trim();if(!url){toast('Вставьте ссылку!');return}if(!img)img=pImg(svc);pushH(aTL);gD(aTL)[aTT].items.push({img,url,svc});sD(aTL,gD(aTL));document.getElementById('addModal').classList.remove('open');chkAch();renderAll()});
    document.getElementById('closePlayer').addEventListener('click',()=>{document.getElementById('playerModal').classList.remove('open');document.getElementById('playerFrame').src=''});
    document.getElementById('searchInput').addEventListener('input',filterItems);
    document.querySelectorAll('.filter-btn').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active-filter'));this.classList.add('active-filter');currentFilter=this.dataset.filter;filterItems()})});
    document.getElementById('bgSelect').addEventListener('change',function(){applyBg(parseInt(this.value,10))});
    document.getElementById('styleSelect').addEventListener('change',applyStyle);
    document.getElementById('sizeSelect').addEventListener('change',applySize);
    document.getElementById('newDraftBtnSidebar').addEventListener('click',()=>{const name=prompt('Название:','Черновик '+(DRAFTS.length+1));if(name&&name.trim()){DRAFTS.push({name:name.trim(),data:dD()});ad=DRAFTS.length-1;data1=JSON.parse(JSON.stringify(DRAFTS[ad].data));hist1=[];saveDrafts();renderAll()}});
    document.getElementById('resetAllLink').addEventListener('click',function(e){e.preventDefault();if(confirm('Удалить ВСЕ данные?')){clr();DRAFTS=[{name:'Основной',data:dD()}];ad=0;data1=JSON.parse(JSON.stringify(DRAFTS[0].data));data2=dD();hist1=[];hist2=[];comments=[];unlocked=[];neonS={enabled:false,color:'rainbow',target:'all'};parallaxOn=false;ctid=null;duelLeftId=null;duelRightId=null;document.body.classList.remove('light-theme','neon-active','parallax-active');if(window._neonRainbowInterval){clearInterval(window._neonRainbowInterval);window._neonRainbowInterval=null}const video=document.getElementById('parallaxVideo');if(video){video.pause();video.style.display='none';}document.getElementById('parallaxBtn').classList.remove('primary');document.getElementById('duelVoteBar').classList.remove('show');document.documentElement.style.setProperty('--bg-img','url(\''+B[0]+'\')');document.getElementById('bgSelect').value='0';document.getElementById('styleSelect').value='gradient';document.getElementById('sizeSelect').value='60';saveDrafts();renderAll()}});
    window.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='z'){e.preventDefault();document.getElementById('undoBtn').click()}});
    document.querySelectorAll('.modal').forEach(m=>{m.addEventListener('click',function(e){if(e.target===this&&this.id!=='neonModal')this.classList.remove('open')})});
}
async function init(){initFB();loadDrafts();unlocked=sg('achievements',[]);neonS=sg('neon',{enabled:false,color:'rainbow',target:'all'});const sbg=sg('bg',null);if(sbg!==null){applyBg(parseInt(sbg,10));document.getElementById('bgSelect').value=sbg}document.getElementById('styleSelect').value=sg('style','gradient');document.getElementById('sizeSelect').value=sg('size','60');if(sg('theme','dark')==='light')document.body.classList.add('light-theme');parallaxOn=sg('parallax',false);bindEvents();showLoading(true);const loaded=await loadFromURL();showLoading(false);if(!loaded)renderAll();else renderAll();renderDraftsSidebar();applyNeon();if(parallaxOn)toggleParallax(true);initParticles()}init()});
