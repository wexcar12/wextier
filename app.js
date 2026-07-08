document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    const P = 'wt_';
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() { func.apply(context, args); }, wait);
        };
    }
    
    const B = [
        'https://i.pinimg.com/originals/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg',
        'https://i.pinimg.com/originals/e7/29/81/e729811d65432283f14d04b3402a7604.jpg',
        'https://i.pinimg.com/originals/b1/fb/e0/b1fbe00a51bd64ed14aa7193af834456.jpg',
        'https://i.pinimg.com/originals/12/08/9b/12089ba4009236d30d3d5188d9d2d002.jpg',
        'https://i.pinimg.com/originals/e1/a7/b4/e1a7b44a3711d48afe510af6a905587c.jpg',
        'https://images.steamusercontent.com/ugc/13054916979645448/3247B76A919A45A67793B1747716F68C9C53499F/'
    ];
    const TC = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#bfff7f', '#7fffff', '#bfbfff', '#df7fff', '#ff9fcf'];
    const ACH = [
        {id:'first_edit',icon:'trophy',name:'Первый среди всех',desc:'Внести первое изменение'},
        {id:'twenty_tracks',icon:'music',name:'Чистый звук',desc:'Добавить 20+ треков'},
        {id:'shared',icon:'upload',name:'У тебя нет друзей',desc:'Использовать кнопку «Поделиться»'},
        {id:'rainbow',icon:'palette',name:'Радужный',desc:'Все тиры разных цветов'},
        {id:'five_s',icon:'flame',name:'Нужно больше',desc:'5 треков в S-тире'},
        {id:'all_empty',icon:'skull',name:'Бесконечная Пустота',desc:'Все тиры пустые'}
    ];

    const TEMPLATES = {
        music: [],
        movies: [
            { title: "Интерстеллар", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150", link: "https://www.imdb.com/title/tt0816692/", svc: "imdb" },
            { title: "Начало", img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150", link: "https://www.imdb.com/title/tt1375666/", svc: "imdb" },
            { title: "Темный Рыцарь", img: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=150", link: "https://www.imdb.com/title/tt0468569/", svc: "imdb" },
            { title: "Матрица", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150", link: "https://www.imdb.com/title/tt0133093/", svc: "imdb" },
            { title: "Побег из Шоушенка", img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=150", link: "https://www.imdb.com/title/tt0111161/", svc: "imdb" },
            { title: "Криминальное чтиво", img: "https://images.unsplash.com/photo-1594909122845-11ba5fcb7e47?w=150", link: "https://www.imdb.com/title/tt0110912/", svc: "imdb" },
            { title: "Бойцовский клуб", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", link: "https://www.imdb.com/title/tt0137523/", svc: "imdb" },
            { title: "Форрест Гамп", img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150", link: "https://www.imdb.com/title/tt0109830/", svc: "imdb" },
            { title: "Властелин колец", img: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=150", link: "https://www.imdb.com/title/tt0120737/", svc: "imdb" },
            { title: "Гладиатор", img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150", link: "https://www.imdb.com/title/tt0172495/", svc: "imdb" }
        ],
        games: [
            { title: "The Witcher 3", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150", link: "https://store.steampowered.com/app/292030/", svc: "steam" },
            { title: "Cyberpunk 2077", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150", link: "https://store.steampowered.com/app/1091500/", svc: "steam" },
            { title: "Elden Ring", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150", link: "https://store.steampowered.com/app/1245620/", svc: "steam" },
            { title: "Red Dead Redemption 2", img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150", link: "https://store.steampowered.com/app/1174180/", svc: "steam" },
            { title: "GTA V", img: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=150", link: "https://store.steampowered.com/app/271590/", svc: "steam" },
            { title: "Minecraft", img: "https://images.unsplash.com/photo-1604537466608-109fa2f16c3b?w=150", link: "https://www.minecraft.net/", svc: "steam" },
            { title: "God of War", img: "https://images.unsplash.com/photo-1552820728-8b83f6b4cf19?w=150", link: "https://store.steampowered.com/app/1593500/", svc: "steam" },
            { title: "Portal 2", img: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=150", link: "https://store.steampowered.com/app/620/", svc: "steam" },
            { title: "Half-Life 2", img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=150", link: "https://store.steampowered.com/app/220/", svc: "steam" },
            { title: "Baldur's Gate 3", img: "https://images.unsplash.com/photo-1612282131449-25e1e80becea?w=150", link: "https://store.steampowered.com/app/1086940/", svc: "steam" }
        ],
        actors: [
            { title: "Леонардо Ди Каприо", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", link: "https://www.imdb.com/name/nm0000138/", svc: "imdb" },
            { title: "Киану Ривз", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", link: "https://www.imdb.com/name/nm0000206/", svc: "imdb" },
            { title: "Скарлетт Йоханссон", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", link: "https://www.imdb.com/name/nm0424060/", svc: "imdb" },
            { title: "Том Харди", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", link: "https://www.imdb.com/name/nm0362766/", svc: "imdb" },
            { title: "Марго Робби", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", link: "https://www.imdb.com/name/nm3053338/", svc: "imdb" },
            { title: "Роберт Дауни мл.", img: "https://images.unsplash.com/photo-1566492031773-4f4e44617d1a?w=150", link: "https://www.imdb.com/name/nm0000375/", svc: "imdb" },
            { title: "Кристиан Бэйл", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", link: "https://www.imdb.com/name/nm0000288/", svc: "imdb" },
            { title: "Натали Портман", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", link: "https://www.imdb.com/name/nm0000204/", svc: "imdb" },
            { title: "Хоакин Феникс", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150", link: "https://www.imdb.com/name/nm0001618/", svc: "imdb" },
            { title: "Дензел Вашингтон", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", link: "https://www.imdb.com/name/nm0000243/", svc: "imdb" }
        ]
    };
    let currentPoolItems = [];
    let currentUser = null;

    function escapeHTML(str) { return str.replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag]||tag)); }
    function dD() { return [{tier:"S",label:"S",color:"#ff7f7f",items:[]},{tier:"A",label:"A",color:"#ffbf7f",items:[]},{tier:"B",label:"B",color:"#ffdf7f",items:[]},{tier:"C",label:"C",color:"#bfff7f",items:[]}]; }
    function sg(k,f){try{const r=localStorage.getItem(P+k);return r!==null?JSON.parse(r):f}catch(e){return f}}
    function ss(k,v){try{localStorage.setItem(P+k,JSON.stringify(v))}catch(e){}}
    function clr(){Object.keys(localStorage).filter(k=>k.startsWith(P)).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})}
    function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(function(){el.remove()},3000)}
    function pImg(svc){var c={youtube:'#ff0000',spotify:'#1db954',apple:'#fc3c44',yandex:'#ffcc00',steam:'#171a21',imdb:'#f5c518'},i={youtube:'▶',spotify:'●',apple:'♫',yandex:'♪',steam:'🎮',imdb:'🎬'};var svg='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="'+(c[svc]||'#555')+'" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">'+(i[svc]||'?')+'</text></svg>';return'data:image/svg+xml,'+encodeURIComponent(svg)}

    var DRAFTS,ad,data1,data2,hist1=[],hist2=[];
    var editing=false,compare=false,parallaxOn=false;
    var aTT=null,aTL=1;
    var currentFilter='all';
    var neonS={enabled:false,color:'rainbow',target:'all'};
    var unlocked=[],comments=[],ctid=null,db=null;
    var duelLeftId=null,duelRightId=null;

    function showLoading(show){var l=document.querySelector('.loading-spinner');if(!l){l=document.createElement('div');l.className='loading-spinner';document.body.appendChild(l)}l.classList.toggle('show',show)}
    function initFB(){try{if(typeof firebase!=='undefined'&&firebase.apps&&firebase.apps.length===0){firebase.initializeApp({apiKey:"AIzaSyDIiUmEqdmQXyhQfUh3Zv-oiA62qXunOqs",authDomain:"wex-tier.firebaseapp.com",projectId:"wex-tier",storageBucket:"wex-tier.appspot.com",messagingSenderId:"81848663409",appId:"1:81848663409:web:4a450cd1960ed71db64ad0"})}db=firebase.firestore()}catch(e){db=null}}
    
    function handleLogin() {
        if (!firebase.apps.length) return;
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
            toast("Добро пожаловать, " + result.user.displayName + "!");
        }).catch(function(error) {
            toast("Ошибка входа: " + error.message);
        });
    }

    function handleLogout() {
        firebase.auth().signOut().then(function() {
            toast("Вы вышли из профиля");
        });
    }

    function initAuthObserver() {
        if (typeof firebase === 'undefined' || !firebase.apps.length) return;
        firebase.auth().onAuthStateChanged(function(user) {
            var loginBtn = document.getElementById('loginBtn');
            var userProfile = document.getElementById('userProfile');
            var userAvatar = document.getElementById('userAvatar');
            var userName = document.getElementById('userName');
            if (user) {
                currentUser = { uid: user.uid, name: user.displayName, photo: user.photoURL };
                if (loginBtn) loginBtn.style.display = 'none';
                if (userProfile) userProfile.style.display = 'flex';
                if (userAvatar) userAvatar.src = user.photoURL || '';
                if (userName) userName.textContent = user.displayName || 'Пользователь';
            } else {
                currentUser = null;
                if (loginBtn) loginBtn.style.display = 'flex';
                if (userProfile) userProfile.style.display = 'none';
            }
            lucide.createIcons();
        });
    }

    function loadDrafts(){var s=sg('drafts',null);DRAFTS=(s&&Array.isArray(s)&&s.length>0&&s[0].data)?s:[{name:'Основной',data:dD()}];ad=parseInt(sg('active_draft','0'),10);if(isNaN(ad)||!DRAFTS[ad])ad=0;if(!DRAFTS[ad].data)DRAFTS[ad].data=dD();data1=JSON.parse(JSON.stringify(DRAFTS[ad].data));data2=dD()}
    function saveDrafts(){if(DRAFTS[ad])DRAFTS[ad].data=JSON.parse(JSON.stringify(data1));ss('drafts',DRAFTS);ss('active_draft',ad)}
    var debouncedSave = debounce(saveDrafts, 800);
    
    function pushH(n){var h=n===1?hist1:hist2;h.push(JSON.parse(JSON.stringify(n===1?data1:data2)));if(h.length>50)h.shift()}
    function gD(n){return n===1?data1:data2}
    function sD(n,v){if(n===1)data1=v;else data2=v;debouncedSave()}
    
    function chkAch(){var total=data1.reduce(function(s,t){return s+t.items.length},0),sT=data1.find(function(t){return t.tier==='S'}),aE=data1.every(function(t){return t.items.length===0});var colors=data1.map(function(t){return t.color}),aD=new Set(colors).size===data1.length&&data1.length>1;var fE=sg('first_edit_done',false);var checks={first_edit:fE||editing,twenty_tracks:total>=20,rainbow:aD,five_s:sT&&sT.items.length>=5,all_empty:aE};for(var id in checks){if(checks[id]&&!unlocked.includes(id)){unlocked.push(id);var a=ACH.find(function(x){return x.id===id});toast('Достижение: '+(a?a.name:id));ss('achievements',unlocked)}}if(!fE&&editing)ss('first_edit_done',true)}

    function applyNeon(){
        if(neonS.enabled){document.body.classList.add('neon-active');if(neonS.color==='rainbow'){if(!window._neonRI){var colors=['rgba(255,100,100,0.9)','rgba(255,200,50,0.9)','rgba(100,255,100,0.9)','rgba(50,150,255,0.9)','rgba(200,50,255,0.9)'];var ci=0;window._neonRI=setInterval(function(){ci=(ci+1)%colors.length;document.documentElement.style.setProperty('--neon-glow','0 0 20px '+colors[ci])},600)}}else{if(window._neonRI){clearInterval(window._neonRI);window._neonRI=null}var c='rgba(245,200,66,0.9)';if(neonS.color==='cyan')c='rgba(0,200,255,0.9)';else if(neonS.color==='magenta')c='rgba(255,0,200,0.9)';document.documentElement.style.setProperty('--neon-glow','0 0 20px '+c)}}else{document.body.classList.remove('neon-active');document.documentElement.style.setProperty('--neon-glow','none');if(window._neonRI){clearInterval(window._neonRI);window._neonRI=null}}var nb=document.getElementById('neonBtn');if(neonS.enabled)nb.classList.add('neon-active');else nb.classList.remove('neon-active')}
    function saveNeon(){neonS.enabled=document.getElementById('neonToggle').checked;neonS.color=document.getElementById('neonColor').value;neonS.target=document.getElementById('neonTarget').value;ss('neon',neonS);applyNeon()}

    function applyBg(idx){document.documentElement.style.setProperty('--bg-img','url(\''+B[idx]+'\')');ss('bg',idx)}
    function applyStyle(){var s=document.getElementById('styleSelect').value;document.querySelectorAll('.item').forEach(function(el){el.classList.remove('style-gradient','style-shadow','style-border','style-circle');el.classList.add('style-'+s)});ss('style',s)}
    function applySize(){var s=document.getElementById('sizeSelect').value;document.querySelectorAll('.item img').forEach(function(img){img.style.width=s+'px';img.style.height=s+'px'});ss('size',s)}
    function filterItems(){var q=document.getElementById('searchInput').value.toLowerCase();document.querySelectorAll('.item').forEach(function(el){var a=el.querySelector('a');var u=a?a.href.toLowerCase():'';var sv=el.dataset.svc||'';el.style.opacity=((!q||u.includes(q))&&(currentFilter==='all'||sv===currentFilter))?'1':'0.25'})}

    function initParallaxMouse(){
        var layer=document.getElementById('parallaxLayer');if(!layer)return;
        window.addEventListener('mousemove',function(e){if(!parallaxOn)return;var x=(window.innerWidth/2-e.pageX)/25;var y=(window.innerHeight/2-e.pageY)/25;layer.style.transform='translateX('+x+'px) translateY('+y+'px)'});
    }
    function toggleParallax(on){
        parallaxOn=on;var wrapper=document.getElementById('parallaxWrapper');var layer=document.getElementById('parallaxLayer');
        if(on){document.body.classList.add('parallax-active');document.getElementById('parallaxBtn').classList.add('primary');if(wrapper)wrapper.style.display='block';if(layer){var bgIdx=parseInt(document.getElementById('bgSelect').value,10);layer.style.backgroundImage='url(\''+B[bgIdx]+'\')'}}
        else{document.body.classList.remove('parallax-active');document.getElementById('parallaxBtn').classList.remove('primary');if(wrapper)wrapper.style.display='none';if(layer)layer.style.transform='translateX(0px) translateY(0px)'}
        ss('parallax',on);
    }

    async function loadComments(id){if(!db||!id){comments=[];return}try{var snap=await db.collection('tierlists').doc(id).collection('comments').orderBy('createdAt','asc').get();comments=[];snap.forEach(function(doc){comments.push({id:doc.id,text:doc.data().text,createdAt:doc.data().createdAt?doc.data().createdAt.toDate():new Date()})})}catch(e){comments=[]}}
    async function addComment(text){if(!text)return;if(!db||!ctid){comments.push({id:Date.now().toString(),text:text,createdAt:new Date()});updateCommentsDisplay();return}try{await db.collection('tierlists').doc(ctid).collection('comments').add({text:text,createdAt:firebase.firestore.FieldValue.serverTimestamp()});await loadComments(ctid);updateCommentsDisplay()}catch(e){toast('Ошибка при отправке комментария')}}
    function updateCommentsDisplay(){var list=document.getElementById('commentsList');if(!list)return;if(comments.length===0){list.innerHTML='<div style="color:#888;text-align:center;padding:10px;">Пока нет комментариев</div>';return}list.innerHTML=comments.map(function(c){return'<div style="margin-bottom:6px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;"><div style="font-size:0.85rem;">'+escapeHTML(c.text)+'</div>'+(c.createdAt?'<div style="font-size:0.7rem;color:#888;margin-top:4px;">'+new Date(c.createdAt).toLocaleString()+'</div>':'')+'</div>'}).join('')}

    async function voteFor(side){
        var id=side==='left'?duelLeftId:duelRightId;
        if(!db){toast('Голосование недоступно');return}
        if(!id || id === 'local') {toast('Опубликуйте тир-лист, чтобы участвовать в голосовании');return;}
        showLoading(true);
        try{var ref=db.collection('tierlists').doc(id);var doc=await ref.get();if(doc.exists){var cw=doc.data().wins||0;await ref.update({wins:cw+1});toast('Голос учтён! Всего побед: '+(cw+1));document.getElementById('duelVoteBar').classList.remove('show');duelLeftId=null;duelRightId=null}}catch(e){toast('Ошибка голосования')}
        showLoading(false);
    }

    function handleSortableMove(evt) {
        var isFromPool = evt.from.id === 'templatePool';
        var isToPool = evt.to.id === 'templatePool';
        var fromList = isFromPool ? null : parseInt(evt.from.dataset.listNum, 10);
        var toList = isToPool ? null : parseInt(evt.to.dataset.listNum, 10);
        var fromTier = isFromPool ? null : parseInt(evt.from.dataset.tierIndex, 10);
        var toTier = isToPool ? null : parseInt(evt.to.dataset.tierIndex, 10);
        var movedItem;

        if (isFromPool) {
            movedItem = currentPoolItems.splice(evt.oldIndex, 1)[0];
        } else {
            var fromData = (fromList === 1) ? data1 : data2;
            pushH(fromList);
            movedItem = fromData[fromTier].items.splice(evt.oldIndex, 1)[0];
            sD(fromList, fromData);
        }

        if (isToPool) {
            currentPoolItems.splice(evt.newIndex, 0, movedItem);
        } else {
            var toData = (toList === 1) ? data1 : data2;
            if (fromList !== toList && !isFromPool) pushH(toList);
            toData[toTier].items.splice(evt.newIndex, 0, movedItem);
            sD(toList, toData);
            if (fromList !== toList && !isFromPool) sD(toList, toData);
        }

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(evt.item, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)'});
        }
        chkAch();
        renderAll();
    }

    function renderTemplatePool() {
        var type = document.getElementById('templateSelect').value;
        var container = document.getElementById('templatePoolContainer');
        var pool = document.getElementById('templatePool');
        if (type === 'music') {
            container.style.display = 'none';
        } else {
            container.style.display = 'flex';
            pool.innerHTML = currentPoolItems.map(function(item, idx) {
                return '<div class="item" data-item-index="' + idx + '">' +
                       '<a href="' + item.url + '" target="_blank" rel="noopener" title="' + item.title + '">' +
                       '<img src="' + item.img + '" alt="' + item.title + '">' +
                       '</a>' +
                       '</div>';
            }).join('');
        }
    }

    function renderAll(){
        render(1);
        if(compare)render(2);
        renderTemplatePool();
        updateUI();
        applyStyle();
        applySize();
        filterItems();
        applyNeon();
        updateUndo();
        renderDraftsSidebar();
        setTimeout(function(){
            document.querySelectorAll('.tier-items').forEach(function(el){
                if(el._sortable)el._sortable.destroy();
                new Sortable(el,{
                    group:'shared',
                    animation:200,
                    easing:'cubic-bezier(0.16, 1, 0.3, 1)',
                    onEnd: function(evt) { handleSortableMove(evt); }
                });
            });

            var poolEl = document.getElementById('templatePool');
            if (poolEl) {
                if(poolEl._sortable) poolEl._sortable.destroy();
                new Sortable(poolEl, {
                    group: 'shared',
                    animation: 200,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    onEnd: function(evt) { handleSortableMove(evt); }
                });
            }
            lucide.createIcons();
        },0);
    }
    
    function render(n){
        var el=document.getElementById(n===1?'list1':'list2');if(!el)return;var data=gD(n);el.innerHTML='';
        data.forEach(function(t,ti){
            var row=document.createElement('div');row.className='tier-row animate';
            var lbl=document.createElement('div');lbl.className='tier-label';lbl.style.backgroundColor=t.color||'#ff7f7f';lbl.textContent=t.label;lbl.title='Двойной клик — переименовать';
            lbl.ondblclick=function(){if(!editing||lbl.querySelector('input'))return;var ci=document.createElement('input');ci.type='color';ci.value=t.color||'#ff7f7f';ci.style.cssText='position:absolute;top:0;left:0;width:100%;height:45%;border:none;cursor:pointer;padding:0;';var ni=document.createElement('input');ni.value=t.label;ni.maxLength=8;ni.style.cssText='position:absolute;bottom:0;left:0;width:100%;height:55%;background:transparent;border:1px solid rgba(0,0,0,0.3);text-align:center;font-weight:900;font-size:1.1rem;color:#111;outline:none;';lbl.textContent='';lbl.style.position='relative';lbl.appendChild(ci);lbl.appendChild(ni);ci.focus();var done=function(){t.label=escapeHTML(ni.value.trim())||t.label;t.color=ci.value;pushH(n);sD(n,data);chkAch();renderAll()};ni.onblur=done;ni.onkeypress=function(e){if(e.key==='Enter')ni.blur()}};
            row.appendChild(lbl);
            var itemsDiv=document.createElement('div');itemsDiv.className='tier-items';itemsDiv.dataset.tierIndex=ti;itemsDiv.dataset.listNum=n;
            t.items.forEach(function(item,ii){
                var div=document.createElement('div');div.className='item';div.dataset.tierIndex=ti;div.dataset.itemIndex=ii;div.dataset.listNum=n;div.dataset.svc=item.svc;
                var a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';a.onclick=function(e){if(item.svc==='youtube'){e.preventDefault();var v=item.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);if(v){document.getElementById('playerFrame').src='https://www.youtube.com/embed/'+v[1]+'?autoplay=1';document.getElementById('playerModal').classList.add('open')}}};
                var img=document.createElement('img');img.src=item.img||pImg(item.svc);img.alt='';img.onerror=function(){this.src=pImg(item.svc)};img.addEventListener('dragstart',function(e){e.preventDefault()});a.appendChild(img);div.appendChild(a);
                var delBtn=document.createElement('button');delBtn.className='del-btn';delBtn.innerHTML='<i data-lucide="x"></i>';delBtn.dataset.tierIndex=ti;delBtn.dataset.itemIndex=ii;delBtn.dataset.listNum=n;div.appendChild(delBtn);
                itemsDiv.appendChild(div);
            });
            var addBtn=document.createElement('button');addBtn.className='add-btn';addBtn.innerHTML='<i data-lucide="plus"></i>';addBtn.dataset.tierIndex=ti;addBtn.dataset.listNum=n;itemsDiv.appendChild(addBtn);
            row.appendChild(itemsDiv);
            if(t.items.length===0){var dt=document.createElement('button');dt.className='del-btn';dt.style.right='auto';dt.style.left='-8px';dt.innerHTML='<i data-lucide="trash-2"></i>';dt.dataset.tierIndex=ti;dt.dataset.listNum=n;row.appendChild(dt)}
            el.appendChild(row);
        });
    }
    function updateUI(){
        document.body.classList.toggle('editing', editing);
        var eb = document.getElementById('editBtn');
        eb.innerHTML = editing ? '<i data-lucide="check"></i> Готово' : '<i data-lucide="edit-3"></i> Редактировать';
        if(editing) eb.classList.add('primary'); else eb.classList.remove('primary');
        document.getElementById('resetBtn').classList.toggle('hidden', !editing);
        document.getElementById('addTierBtn').classList.toggle('hidden', !editing);
        document.getElementById('col2').style.display = compare ? 'block' : 'none';
        lucide.createIcons();
    }
    function updateUndo(){document.getElementById('undoBtn').disabled=(compare?hist2:hist1).length===0}
    function renderDraftsSidebar(){var list=document.getElementById('draftListSidebar');if(!list)return;list.innerHTML='';DRAFTS.forEach(function(d,i){var div=document.createElement('button');div.className='sidebar-btn'+(i===ad?' primary':'');div.textContent=(i===ad?'● ':'')+d.name;div.onclick=function(){if(i===ad)return;saveDrafts();ad=i;data1=JSON.parse(JSON.stringify(DRAFTS[i].data));hist1=[];renderAll()};list.appendChild(div)})}
    function initParticles(){var canvas=document.getElementById('particlesCanvas');if(!canvas)return;var ctx=canvas.getContext('2d');var particles=[];function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight}function create(){particles=[];for(var i=0;i<40;i++)particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+1,sx:(Math.random()-0.5)*0.5,sy:(Math.random()-0.5)*0.5,o:Math.random()*0.5+0.2})}function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(function(p){p.x+=p.sx;p.y+=p.sy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(245,200,66,'+p.o+')';ctx.fill()});requestAnimationFrame(animate)}resize();create();animate();window.addEventListener('resize',function(){resize();create()})}

    async function loadFromURL(){var p=new URLSearchParams(location.search);if(p.has('id')&&db){try{var doc=await db.collection('shared').doc(p.get('id')).get();if(doc.exists){var d=JSON.parse(doc.data().data);if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);ctid=p.get('id');if(p.has('tierlistId'))ctid=p.get('tierlistId');if(doc.data().templateType){document.getElementById('templateSelect').value=doc.data().templateType}await loadComments(ctid);history.replaceState({},'',location.pathname);return true}}}catch(e){}}if(p.has('data')){try{var d=JSON.parse(LZString.decompressFromEncodedURIComponent(p.get('data')));if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);if(p.has('tierlistId')){ctid=p.get('tierlistId');await loadComments(ctid)}history.replaceState({},'',location.pathname);return true}}catch(e){}}return false}

    document.getElementById('compareWrap').addEventListener('click', function(e) {
        var delBtn = e.target.closest('.del-btn');
        if (delBtn) {
            e.stopPropagation(); e.preventDefault();
            var tI = parseInt(delBtn.dataset.tierIndex, 10);
            var iI = parseInt(delBtn.dataset.itemIndex, 10);
            var listN = parseInt(delBtn.dataset.listNum, 10);
            if (!isNaN(tI) && !isNaN(iI) && !isNaN(listN)) {
                var data = (listN === 1) ? data1 : data2;
                pushH(listN);
                data[tI].items.splice(iI, 1);
                sD(listN, data);
                chkAch(); renderAll();
            }
            return;
        }
        var addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            aTT = parseInt(addBtn.dataset.tierIndex, 10);
            aTL = parseInt(addBtn.dataset.listNum, 10);
            if (!isNaN(aTT)) {
                document.getElementById('trackUrl').value = '';
                document.getElementById('coverUrl').value = '';
                document.getElementById('svc').value = 'youtube';
                document.getElementById('coverPreview').style.display = 'none';
                document.getElementById('addModal').classList.add('open');
            }
            return;
        }
    });

    function bindEvents(){
        document.getElementById('burgerBtn').addEventListener('click',function(){document.getElementById('sidebar').classList.toggle('open')});
        document.getElementById('editBtn').addEventListener('click',function(){editing=!editing;renderAll()});
        document.getElementById('undoBtn').addEventListener('click',function(){var h=compare?hist2:hist1;if(!h.length)return;sD(compare?2:1,h.pop());renderAll()});
        document.getElementById('resetBtn').addEventListener('click',function(){if(confirm('Сбросить всё?')){data1=dD();data2=dD();hist1=[];hist2=[];sD(1,data1);sD(2,data2);chkAch();renderAll()}});
        document.getElementById('themeBtn').addEventListener('click',function(){document.body.classList.toggle('light-theme');ss('theme',document.body.classList.contains('light-theme')?'light':'dark')});
        document.getElementById('parallaxBtn').addEventListener('click',function(){toggleParallax(!parallaxOn)});
        document.getElementById('addTierBtn').addEventListener('click',function(){if(!editing)return;var letters='EFGHIJKLMNOPQRSTUVWXYZ';var exist=data1.map(function(t){return t.tier});var next='E';for(var i=0;i<letters.length;i++){if(!exist.includes(letters[i])){next=letters[i];break}}pushH(1);data1.push({tier:next,label:next,color:TC[data1.length%TC.length],items:[]});sD(1,data1);renderAll()});
        document.getElementById('pngBtn').addEventListener('click',async function(){var btn=document.getElementById('pngBtn');btn.disabled=true;try{var el=document.getElementById('list1');var canvas=await html2canvas(el,{backgroundColor:null,scale:2,useCORS:true,allowTaint:true});var a=document.createElement('a');a.download='wex-tier.png';a.href=canvas.toDataURL('image/png');a.click()}catch(e){toast('Ошибка PNG')}btn.disabled=false});
        document.getElementById('exportBtn').addEventListener('click',function(){var blob=new Blob([JSON.stringify(data1,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wex-tier.json';a.click()});
        document.getElementById('importBtn').addEventListener('click',function(){document.getElementById('importFile').click()});
        document.getElementById('importFile').addEventListener('change',function(){var file=this.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){try{var d=JSON.parse(e.target.result);if(Array.isArray(d)){pushH(1);data1=d;sD(1,data1);chkAch();renderAll();toast('Загружено!')}}catch(ex){toast('Ошибка формата')}};reader.readAsText(file);this.value=''});
        document.getElementById('shareBtn').addEventListener('click',async function(){if(!db){var compressed=LZString.compressToEncodedURIComponent(JSON.stringify(data1));var url=location.origin+location.pathname+'?data='+compressed;navigator.clipboard.writeText(url).then(function(){toast('Ссылка скопирована!')})}else{try{var docRef=await db.collection('shared').add({data:JSON.stringify(data1),createdAt:firebase.firestore.FieldValue.serverTimestamp()});ctid=docRef.id;var shortUrl=location.origin+location.pathname+'?id='+docRef.id;navigator.clipboard.writeText(shortUrl).then(function(){toast('Короткая ссылка скопирована!')})}catch(e){var compressed=LZString.compressToEncodedURIComponent(JSON.stringify(data1));var url=location.origin+location.pathname+'?data='+compressed;navigator.clipboard.writeText(url).then(function(){toast('Ссылка скопирована!')})}}if(!unlocked.includes('shared')){unlocked.push('shared');ss('achievements',unlocked);toast('Достижение: У тебя нет друзей')}});
        document.getElementById('compareBtn').addEventListener('click',function(){compare=!compare;if(compare){data2=JSON.parse(JSON.stringify(data1));hist2=[]}renderAll()});
        document.getElementById('playlistBtn').addEventListener('click',function(){var yt=data1.flatMap(function(t){return t.items}).filter(function(i){return i.svc==='youtube'});if(yt.length===0){toast('Нет YouTube треков');return}var ids=yt.map(function(i){var m=i.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null}).filter(Boolean);if(ids.length>0)window.open('https://www.youtube.com/watch_videos?video_ids='+ids.join(','),'_blank')});
        document.getElementById('galleryBtn').addEventListener('click',async function(){if(!db){toast('Галерея недоступна');return}document.getElementById('galleryModal').classList.add('open');document.getElementById('galleryModal').querySelector('h3').textContent='Галерея тир-листов';document.getElementById('publishBtn').style.display='inline-block';var list=document.getElementById('galleryList');list.innerHTML='Загрузка...';showLoading(true);try{var snap=await db.collection('tierlists').orderBy('createdAt','desc').limit(20).get();list.innerHTML='';snap.forEach(function(doc){var d=doc.data();var div=document.createElement('div');div.style.cssText='padding:8px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';div.innerHTML='<strong>'+(d.name||'Без названия')+'</strong> ('+(d.wins||0)+' побед, '+(d.trackCount||0)+' треков)';div.onclick=async function(){pushH(1);data1=JSON.parse(d.data);sD(1,data1);ctid=doc.id;if(d.templateType){document.getElementById('templateSelect').value=d.templateType}await loadComments(ctid);document.getElementById('galleryModal').classList.remove('open');renderAll()};list.appendChild(div)});if(snap.empty)list.innerHTML='Пока пусто...'}catch(e){list.innerHTML='Ошибка загрузки';toast('Ошибка загрузки галереи')}showLoading(false)});
        document.getElementById('closeGallery').addEventListener('click',function(){document.getElementById('galleryModal').classList.remove('open')});
        document.getElementById('publishBtn').addEventListener('click',async function(){if(!db){toast('Недоступно');return}if(!data1||data1.length===0||data1.every(function(t){return t.items.length===0})){toast('Тир-лист пуст!');return}var name=prompt('Название:','Мой тир-лист');if(!name)return;showLoading(true);try{var currentTemplateType=document.getElementById('templateSelect').value;var docRef=await db.collection('tierlists').add({name:escapeHTML(name),templateType:currentTemplateType,data:JSON.stringify(data1),trackCount:data1.reduce(function(s,t){return s+t.items.length},0),wins:0,authorId:currentUser?currentUser.uid:'anonymous',authorName:currentUser?escapeHTML(currentUser.name):'Аноним',createdAt:firebase.firestore.FieldValue.serverTimestamp()});ctid=docRef.id;toast('Опубликовано!');document.getElementById('galleryModal').classList.remove('open')}catch(e){toast('Ошибка публикации')}showLoading(false)});
        document.getElementById('duelBtn').addEventListener('click',async function(){if(!db){toast('Недоступно');return}document.getElementById('duelModal').classList.add('open');var list=document.getElementById('duelList');list.innerHTML='Загрузка...';showLoading(true);try{var snap=await db.collection('tierlists').orderBy('createdAt','desc').limit(20).get();list.innerHTML='';snap.forEach(function(doc){var d=doc.data();var div=document.createElement('div');div.style.cssText='padding:8px;margin-bottom:4px;background:rgba(255,255,255,0.05);border-radius:6px;';div.innerHTML='<input type="radio" name="duelSelect" value="'+doc.id+'"> '+(d.name||'Без названия')+' ('+(d.wins||0)+' побед)';list.appendChild(div)});if(snap.empty)list.innerHTML='Пусто...'}catch(e){list.innerHTML='Ошибка загрузки';toast('Ошибка загрузки дуэли')}showLoading(false)});
        document.getElementById('closeDuel').addEventListener('click',function(){document.getElementById('duelModal').classList.remove('open')});
        document.getElementById('startDuelBtn').addEventListener('click',async function(){var sel=document.querySelector('input[name="duelSelect"]:checked');if(!sel){toast('Выберите соперника');return}try{var doc=await db.collection('tierlists').doc(sel.value).get();if(doc.exists){compare=true;data2=JSON.parse(doc.data().data);hist2=[];duelLeftId=ctid;duelRightId=sel.value;var bar=document.getElementById('duelVoteBar');bar.classList.add('show');document.getElementById('duelLeftWins').textContent=(duelLeftId?'?':'0');document.getElementById('duelRightWins').textContent=(doc.data().wins||0);document.getElementById('duelModal').classList.remove('open');renderAll();toast('Дуэль началась! Голосуйте за победителя!')}}catch(e){toast('Ошибка загрузки соперника')}});
        document.getElementById('voteLeftBtn').addEventListener('click',function(){voteFor('left')});
        document.getElementById('voteRightBtn').addEventListener('click',function(){voteFor('right')});
        document.getElementById('topBtn').addEventListener('click',async function(){if(!db){toast('Недоступно');return}document.getElementById('galleryModal').classList.add('open');document.getElementById('galleryModal').querySelector('h3').textContent='Топ тир-листов';document.getElementById('publishBtn').style.display='none';var list=document.getElementById('galleryList');list.innerHTML='Загрузка...';showLoading(true);try{var snap=await db.collection('tierlists').orderBy('wins','desc').limit(20).get();list.innerHTML='';var rank=1;snap.forEach(function(doc){var d=doc.data();if(!d.wins||d.wins===0){rank++;return}var div=document.createElement('div');div.style.cssText='padding:8px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';var medal='';if(rank===1)medal='<i data-lucide="medal"></i>';else if(rank===2)medal='<i data-lucide="medal"></i>';else if(rank===3)medal='<i data-lucide="medal"></i>';div.innerHTML=medal+' <strong>#'+rank+'</strong> '+(d.name||'Без названия')+' ('+(d.wins||0)+' побед)';div.onclick=async function(){pushH(1);data1=JSON.parse(d.data);sD(1,data1);ctid=doc.id;if(d.templateType){document.getElementById('templateSelect').value=d.templateType}await loadComments(ctid);document.getElementById('galleryModal').classList.remove('open');renderAll()};list.appendChild(div);rank++});if(list.innerHTML==='')list.innerHTML='Пока никто не побеждал...';lucide.createIcons()}catch(e){list.innerHTML='Ошибка загрузки'}showLoading(false)});
        document.getElementById('achievementsBtn').addEventListener('click',function(){document.getElementById('achievementsModal').classList.add('open');document.getElementById('achievementsList').innerHTML=ACH.map(function(a){var u=unlocked.includes(a.id);return'<div style="padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;opacity:'+(u?'1':'0.4')+';display:flex;align-items:center;gap:10px;"><i data-lucide="'+(u?a.icon:'lock')+'"></i><div><strong>'+a.name+'</strong><br><small>'+a.desc+'</small></div></div>'}).join('');lucide.createIcons()});
        document.getElementById('closeAchievements').addEventListener('click',function(){document.getElementById('achievementsModal').classList.remove('open')});
        document.getElementById('neonBtn').addEventListener('click',function(){document.getElementById('neonModal').classList.add('open');document.getElementById('neonToggle').checked=neonS.enabled;document.getElementById('neonColor').value=neonS.color;document.getElementById('neonTarget').value=neonS.target});
        document.getElementById('closeNeon').addEventListener('click',function(){saveNeon();document.getElementById('neonModal').classList.remove('open')});
        document.getElementById('neonModal').addEventListener('click',function(e){if(e.target===this){saveNeon();this.classList.remove('open')}});
        document.getElementById('commentsBtn').addEventListener('click',async function(){document.getElementById('commentsModal').classList.add('open');if(ctid)await loadComments(ctid);updateCommentsDisplay()});
        document.getElementById('closeComments').addEventListener('click',function(){document.getElementById('commentsModal').classList.remove('open')});
        document.getElementById('addCommentBtn').addEventListener('click',async function(){var text=document.getElementById('newComment').value.trim();if(!text)return;document.getElementById('newComment').value='';await addComment(text)});
        document.getElementById('cancelAdd').addEventListener('click',function(){document.getElementById('addModal').classList.remove('open')});
        document.getElementById('fetchCoverBtn').addEventListener('click',async function(){var url=document.getElementById('trackUrl').value.trim();if(!url){toast('Вставьте ссылку');return}this.textContent='...';this.disabled=true;var cover=null;var ytM=url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);if(ytM)cover='https://img.youtube.com/vi/'+ytM[1]+'/mqdefault.jpg';if(cover){document.getElementById('coverUrl').value=cover;document.getElementById('coverPreview').src=cover;document.getElementById('coverPreview').style.display='block'}else{toast('Не удалось. Вставьте ссылку на картинку вручную.')}this.textContent='Авто-поиск обложки';this.disabled=false});
        document.getElementById('coverUrl').addEventListener('input',function(){var url=this.value.trim();var prev=document.getElementById('coverPreview');if(url){prev.src=url;prev.style.display='block'}else{prev.style.display='none'}});
        document.getElementById('okAdd').addEventListener('click',function(){var svc=document.getElementById('svc').value;var url=document.getElementById('trackUrl').value.trim();var img=document.getElementById('coverUrl').value.trim();if(!url){toast('Вставьте ссылку!');return}if(!img)img=pImg(svc);pushH(aTL);gD(aTL)[aTT].items.push({img:img,url:url,svc:svc});sD(aTL,gD(aTL));document.getElementById('addModal').classList.remove('open');chkAch();renderAll()});
        document.getElementById('closePlayer').addEventListener('click',function(){document.getElementById('playerModal').classList.remove('open');document.getElementById('playerFrame').src='about:blank'});
        document.getElementById('searchInput').addEventListener('input',filterItems);
        document.querySelectorAll('.filter-btn').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active-filter')});this.classList.add('active-filter');currentFilter=this.dataset.filter;filterItems()})});
        document.getElementById('bgSelect').addEventListener('change',function(){applyBg(parseInt(this.value,10))});
        document.getElementById('styleSelect').addEventListener('change',applyStyle);
        document.getElementById('sizeSelect').addEventListener('change',applySize);
        document.getElementById('newDraftBtnSidebar').addEventListener('click',function(){var name=prompt('Название:','Черновик '+(DRAFTS.length+1));if(name&&name.trim()){DRAFTS.push({name:escapeHTML(name.trim()),data:dD()});ad=DRAFTS.length-1;data1=JSON.parse(JSON.stringify(DRAFTS[ad].data));hist1=[];saveDrafts();renderAll()}});
        document.getElementById('resetAllLink').addEventListener('click',function(e){e.preventDefault();if(confirm('Удалить ВСЕ данные?')){clr();DRAFTS=[{name:'Основной',data:dD()}];ad=0;data1=JSON.parse(JSON.stringify(DRAFTS[0].data));data2=dD();hist1=[];hist2=[];comments=[];unlocked=[];neonS={enabled:false,color:'rainbow',target:'all'};parallaxOn=false;ctid=null;duelLeftId=null;duelRightId=null;document.body.classList.remove('light-theme','neon-active','parallax-active');if(window._neonRI){clearInterval(window._neonRI);window._neonRI=null}var wrapper=document.getElementById('parallaxWrapper');if(wrapper)wrapper.style.display='none';document.getElementById('parallaxBtn').classList.remove('primary');document.getElementById('duelVoteBar').classList.remove('show');document.documentElement.style.setProperty('--bg-img','url(\''+B[0]+'\')');document.getElementById('bgSelect').value='0';document.getElementById('styleSelect').value='gradient';document.getElementById('sizeSelect').value='60';saveDrafts();renderAll()}});
        window.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='z'){e.preventDefault();document.getElementById('undoBtn').click()}});
        document.querySelectorAll('.modal').forEach(function(m){
            m.addEventListener('click',function(e){
                if(e.target===this&&this.id!=='neonModal'){
                    this.classList.remove('open');
                    if(this.id==='playerModal'){
                        document.getElementById('playerFrame').src='about:blank';
                    }
                }
            })
        });

        var toggleBtn=document.getElementById('toggleSidebarBtn');
        var sidebar=document.getElementById('sidebar');
        if(sg('sidebar_collapsed',false)){sidebar.classList.add('collapsed');document.documentElement.style.setProperty('--sidebar-width','72px')}
        if(toggleBtn){toggleBtn.addEventListener('click',function(){sidebar.classList.toggle('collapsed');var collapsed=sidebar.classList.contains('collapsed');ss('sidebar_collapsed',collapsed);document.documentElement.style.setProperty('--sidebar-width',collapsed?'72px':'260px');setTimeout(function(){lucide.createIcons()},100)})}

        var templateSelect=document.getElementById('templateSelect');
        if(templateSelect){templateSelect.addEventListener('change',function(){var type=this.value;if(type==='music'){currentPoolItems=[]}else{var currentItemsUrls=data1.flatMap(function(t){return t.items.map(function(i){return i.url})});currentPoolItems=TEMPLATES[type].filter(function(item){return!currentItemsUrls.includes(item.link)}).map(function(item){return{img:item.img,url:item.link,svc:item.svc,title:item.title}})}renderAll()})}

        document.getElementById('loginBtn').addEventListener('click', handleLogin);
        document.getElementById('logoutLink').addEventListener('click', handleLogout);
    }

    async function init(){
        if(!sg('version_1_1',false)){clr();ss('version_1_1',true)}
        initFB();loadDrafts();unlocked=sg('achievements',[]);neonS=sg('neon',{enabled:false,color:'rainbow',target:'all'});var sbg=sg('bg',null);if(sbg!==null){applyBg(parseInt(sbg,10));document.getElementById('bgSelect').value=sbg}document.getElementById('styleSelect').value=sg('style','gradient');document.getElementById('sizeSelect').value=sg('size','60');if(sg('theme','dark')==='light')document.body.classList.add('light-theme');parallaxOn=sg('parallax',false);bindEvents();showLoading(true);var loaded=await loadFromURL();showLoading(false);if(!loaded)renderAll();else renderAll();renderDraftsSidebar();applyNeon();if(parallaxOn)toggleParallax(true);initParticles();initParallaxMouse();initAuthObserver()}init()});
