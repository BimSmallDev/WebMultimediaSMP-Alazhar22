/* MultiMedia Eskul Creation v5 — galeri + sosial + reels + streak + messenger */
"use strict";

/* ---------- constants ---------- */
const DB_KEY = "mmc_db_v5";
const SESSION_KEY = "mmc_session_v1";
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
const CATEGORIES = ["Art","Desain","Fotografi","Video & Film","Podcast & Audio","Tulisan","Coding","Craft & DIY","Animasi","Musik"];
const TYPE_LABEL = { gambar:"Gambar", videoyt:"Video", vidfile:"Video", note:"Note", text:"Text" };
const TYPE_ICON = { gambar:"i-img", videoyt:"i-play", vidfile:"i-film", note:"i-doc", text:"i-text" };
const REACTIONS = [
  { id:"suka", label:"Suka", icon:"i-heart" },
  { id:"keren", label:"Keren", icon:"i-star" },
  { id:"wow", label:"Wow", icon:"i-r-wow" },
  { id:"sedih", label:"Sedih", icon:"i-r-sedih" },
  { id:"marah", label:"Marah", icon:"i-r-marah" },
];
const reactMeta = id=>REACTIONS.find(r=>r.id===id) || REACTIONS[0];
const isVideo = k=>k && (k.type==="videoyt" || k.type==="vidfile");
const ADMIN_SEED = [
  { u:"iksanadmin", p:"adminadmin", role:"admin", name:"Iksan (Admin)" },
  { u:"GuruMulmed", p:"MulmedMaster", role:"admin", name:"Guru Mulmed" },
  { u:"OmarAjad", p:"OmarAjad", role:"admin", name:"Omar Ajad" },
];
const STUDENT_SEED = [
  ["Maurisa Savanna Danish","7A"],["Arshan Abiyyu Alvarro","7B"],["Muhammad Aldebaran Raya","7B"],
  ["Pramatyo Gilang Witana","7B"],["Raditya Virendra Wardhana","7B"],["Sesyha Azzalea Hermawan","7B"],
  ["Talita Jasmine Azzahra","7B"],["Alicia Ramania Wibowo","7C"],["Arkana Naila Putri Ardinata","7C"],
  ["Gibran Boy Hermantoyo","7C"],["Kyna Adeeva Widyanata","7C"],["Najmi Citra Maharani","7C"],
  ["Aldric azka Tiyan Youdanto","7D"],["Danish Rizky Ekaputra","7D"],["Qaireen Azzalea Achmad","7D"],
  ["Thoriq Arkaan","7D"],["Akhtar Gibran Adhikara","8A"],["Pandu Putra Pratama","8A"],
  ["Andres Alfath Maulana","8B"],["Kaleela Azzahra Dwicahya","8B"],["Zaiden Alrasyid Kurniawan","8B"],
  ["Alqiera Mazayya Haris","8C"],["Gantrazian Fishiyam Kanayufa","8C"],["Aisha Zerina Alifah","9A"],
  ["Khansa Alfany Sierra","9A"],["Ariq Ahmad Dwi Andhika","9B"],["Khayyira Adiva Zain","9B"],
  ["Muhammad Mirza Athaya","9B"],["Bimasakti Dhia Ahza","9C"],["Danish Ahza Putra Ardias","9C"],
];
const GUIDES = {
  beranda:"Ini Beranda: hero info eskul, Top Video paling disukai, karya terbaru, dan tombol join WhatsApp.",
  galeri:"Ini Galeri: saring karya per tipe & kategori. Ketuk hati untuk like, bookmark untuk favorit, lalu buka detail untuk chat.",
  favorit:"Ini Favorit: semua karya yang kamu bookmark tersimpan di sini.",
  announce:"Ini Announce: info resmi + tugas dari admin. Tugas baru biasanya disertai penyemangat.",
  chat:"Ini Chat: grup publik buat semua (guest ikut) + chat pribadi antar akun.",
  reels:"Ini Reels: geser vertikal ala IG. Ketuk ikon reaksi untuk respons cepat, bookmark untuk favorit.",
  upload:"Ini Upload: isi judul, owner, deskripsi, kelas + ruangan (wajib). Video file maksimal 30MB, selebihnya pakai link YouTube.",
  review:"Ini Review: terima karya untuk ditayangkan, tolak dengan alasan jelas, atau hapus permanen.",
  murid:"Ini Murid: tambah/hapus akun, reset password, dan naikkan kelas saat tahun ajaran baru.",
  inbox:"Ini Inbox: hasil review, info hapus karya, dan pengumuman penting masuk ke sini.",
  akun:"Ini Akun: atur nama panggilan, ganti password secara berkala, dan atur panduan mascot.",
};

/* ---------- helpers ---------- */
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = p=>(p||"id")+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
const fmtDate = iso=>{ try{ return new Date(iso).toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});}catch{ return ""; } };
const fmtBytes = b=>b>=1048576?(b/1048576).toFixed(1)+" MB":Math.max(1,Math.round(b/1024))+" KB";
const debounce = (fn,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
const firstName = n=>String(n||"").trim().split(/\s+/)[0]||"";
const gradeOf = k=>{ const m = String(k||"").match(/^(\d)/); return m?+m[1]:null; };
const roomOf = k=>{ const m = String(k||"").match(/^\d([A-D])/i); return m?m[1].toUpperCase():""; };

function toast(msg, kind=""){
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast "+kind;
  el.innerHTML = `<svg class="ic"><use href="#${kind==="bad"?"i-x":kind==="ok"?"i-check":"i-mega"}"/></svg><span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(), 320); }, 2600);
}
function youtubeId(url){
  if(!url) return null;
  url = String(url).trim();
  const m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
  if(m) return m[1];
  if(/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
}
const ytThumb = id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const ytWatch = id=>`https://www.youtube.com/watch?v=${id}`;

/* ---------- IndexedDB media (video file) ---------- */
const MediaDB = {
  _db:null, _urls:new Map(),
  open(){ return new Promise((res,rej)=>{
    if(this._db) return res(this._db);
    const rq = indexedDB.open("mmc_media_v1",1);
    rq.onupgradeneeded = ()=>rq.result.createObjectStore("media");
    rq.onsuccess = ()=>{ this._db = rq.result; res(this._db); };
    rq.onerror = ()=>rej(rq.error);
  });},
  async put(id,blob){ const db=await this.open(); return new Promise((res,rej)=>{ const tx=db.transaction("media","readwrite"); tx.objectStore("media").put(blob,id); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); },
  async getBlob(id){ const db=await this.open(); return new Promise((res,rej)=>{ const rq=db.transaction("media").objectStore("media").get(id); rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>rej(rq.error); }); },
  async url(id){ if(this._urls.has(id)) return this._urls.get(id); try{ const b=await this.getBlob(id); if(!b) return null; const u=URL.createObjectURL(b); this._urls.set(id,u); return u; }catch{ return null; } },
  async del(id){ this._urls.delete(id); try{ const db=await this.open(); await new Promise(res=>{ const tx=db.transaction("media","readwrite"); tx.objectStore("media").delete(id); tx.oncomplete=res; tx.onerror=res; }); }catch{} }
};
async function hydrateMedia(root=document){
  const els = [...root.querySelectorAll("video[data-media]:not([data-hydrated])")];
  for(const v of els){ v.dataset.hydrated = "1"; const u = await MediaDB.url(v.dataset.media); if(u) v.src = u; }
}

/* ---------- database ---------- */
function studentUsername(name, kelas, taken){
  let base = (firstName(name)+String(kelas||"")).toLowerCase().replace(/[^a-z0-9]/g,"");
  if(!base) base = "murid";
  let u = base, i = 2;
  while(taken.has(u)){ u = base + (i++); }
  taken.add(u);
  return u;
}
function seedDb(){
  const now = Date.now();
  const d = min=>new Date(now-min*60000).toISOString();
  const taken = new Set(ADMIN_SEED.map(a=>a.u));
  const users = ADMIN_SEED.map(a=>({ u:a.u, p:a.p, role:"admin", name:a.name, nick:a.name, kelas:"", status:"aktif", days:{}, logins:0 }));
  STUDENT_SEED.forEach(([name,kelas])=>{
    const fn = firstName(name);
    users.push({ u:studentUsername(name,kelas,taken), p:fn.toLowerCase(), role:"murid", name, nick:name, kelas, status:"aktif", days:{}, logins:0 });
  });
  return {
    v: 5,
    settings: { waNumber:"6281282820904", waMsg:"Halo kak, saya mau join Eskul Multimedia! Nama saya: ", schoolYear:"2026/2027", guideOn:true },
    users,
    announces: [
      { id:uid("ann"), title:"Selamat datang di web database kreativitas!", body:"Web ini adalah arsip + ruang sosial karya Eskul Multimedia.\n\n• Murid: login dengan akun dari pembina untuk upload, reaksi, favorit, dan chat.\n• Tamu: klik Masuk sebagai Guest untuk intip galeri.\n• Semua upload direview admin dulu sebelum tayang.", author:"GuruMulmed", date:d(60*50), pin:false },
    ],
    kreas: [],
    inboxes: [],
    searches: [],
    threads: [
      { id:"th_public", type:"public", name:"Grup Publik Eskul", members:["*"], by:"system", date:new Date(now-90*60000).toISOString(), lastRead:{} },
    ],
    messages: [
      { id:uid("cm"), threadId:"th_public", by:"GuruMulmed", name:"Guru Mulmed", text:"Selamat datang di grup publik Eskul Multimedia! Kenalan di sini, tanya-tanya, atau ramaikan obrolan. Guest juga boleh ikut.", date:new Date(now-80*60000).toISOString() },
    ],
  };
}
function migrateV4toV5(db){
  db.v = 5;
  const now = Date.now();
  db.threads = [
    { id:"th_public", type:"public", name:"Grup Publik Eskul", members:["*"], by:"system", date:new Date(now-90*60000).toISOString(), lastRead:{} },
  ];
  db.messages = [
    { id:uid("cm"), threadId:"th_public", by:"GuruMulmed", name:"Guru Mulmed", text:"Selamat datang di grup publik Eskul Multimedia! Kenalan di sini, tanya-tanya, atau ramaikan obrolan. Guest juga boleh ikut.", date:new Date(now-80*60000).toISOString() },
  ];
  return db;
}
function loadDb(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(raw){
      const db = JSON.parse(raw);
      if(db && db.v === 5 && Array.isArray(db.kreas) && Array.isArray(db.users)){
        db.settings ||= { waNumber:"6281282820904", waMsg:"", schoolYear:"2026/2027", guideOn:true };
        db.searches ||= [];
        db.threads ||= [];
        db.messages ||= [];
        return db;
      }
    }
    for(const [key, mig] of [["mmc_db_v4", migrateV4toV5],["mmc_db_v3", db=>migrateV4toV5(migrateV3toV4(db))]]){
      try{
        const old = localStorage.getItem(key);
        if(old){
          const db = JSON.parse(old);
          if(db && Array.isArray(db.kreas)){
            const m = mig(db);
            try{ localStorage.setItem(DB_KEY, JSON.stringify(m)); }catch{}
            return m;
          }
        }
      }catch{}
    }
    throw 0;
  }catch{
    const s = seedDb();
    try{ localStorage.setItem(DB_KEY, JSON.stringify(s)); }catch{}
    return s;
  }
}
let DB = loadDb();
function saveDb(){
  try{ localStorage.setItem(DB_KEY, JSON.stringify(DB)); return true; }
  catch{ toast("Penyimpanan penuh! Hapus beberapa gambar besar dulu.", "bad"); return false; }
}
const getSession = ()=>{ try{ return JSON.parse(localStorage.getItem(SESSION_KEY)); }catch{ return null; } };
const setSession = s=>localStorage.setItem(SESSION_KEY, JSON.stringify(s));
const clearSession = ()=>localStorage.removeItem(SESSION_KEY);
const getUser = u=>DB.users.find(x=>x.u===u) || null;
const me = ()=>{
  const s = getSession(); if(!s) return null;
  if(s.role==="guest") return { u:"guest", role:"guest", name:s.nick||"Guest", nick:s.nick||"Guest", did:s.did||"x" };
  return getUser(s.username);
};
const idkey = m=>{ if(!m) return "guest"; return m.role==="guest" ? ("guest:"+(m.did||"x")) : m.u; };
const displayName = u=>{ if(!u) return "Guest"; if(u.role==="guest"||u.u==="guest") return u.nick || u.name || "Guest"; return u.nick || u.name || u.u; };

/* ---------- upload temp state ---------- */
const upState = { type:"gambar", images:[], noteText:"", videoId:null, videoFile:null, videoURL:null };

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const wt = $("#welcomeTitle");
  const words = wt.textContent.trim().split(/\s+/);
  wt.innerHTML = words.map((w,i)=>`<span style="animation-delay:${0.08*i+0.1}s">${esc(w)}</span>`).join(" ");
  setTimeout(()=>$("#welcome").classList.add("hide"), 2000);
  setTimeout(()=>$("#welcome").remove(), 2800);

  bindAuth(); bindTabs(); bindHero(); bindSearch(); bindGaleri();
  bindUpload(); bindInbox(); bindAnnounce(); bindAkun(); bindMurid(); bindModals(); bindGuide(); bindSocial(); bindChat();
  buildCatOptions(); observeReveals();

  const sess = getSession();
  if(sess && (sess.role==="guest" || getUser(sess.username))){
    enterApp(sess, true);
  }else{
    clearSession();
    $("#app").classList.remove("app-hidden");
  }
});

/* ---------- auth ---------- */
function bindAuth(){
  const doLogin = ()=>{
    const u = $("#loginUser").value.trim(), p = $("#loginPass").value;
    const err = $("#loginError");
    const key = u.toLowerCase();
    const acc = DB.users.find(x=>x.u.toLowerCase()===key || (x.name && x.name.toLowerCase()===key));
    let ok = false;
    if(acc){
      ok = acc.role==="admin" ? (acc.p===p) : (String(acc.p).toLowerCase()===String(p).toLowerCase());
    }
    if(!ok){ err.hidden = false; err.textContent = "Username / password salah. Coba lagi ya."; return; }
    err.hidden = true;
    acc.logins = (acc.logins||0)+1;
    const sess = { username:acc.u, role:acc.role, loginAt:new Date().toISOString() };
    setSession(sess);
    saveDb();
    bumpActivity(1);
    enterApp(sess, false);
  };
  $("#btnLogin").addEventListener("click", doLogin);
  $("#loginPass").addEventListener("keydown", e=>{ if(e.key==="Enter") doLogin(); });
  $("#loginUser").addEventListener("keydown", e=>{ if(e.key==="Enter") doLogin(); });
  $("#btnGuest").addEventListener("click", ()=>{
    $("#guestNick").value = "";
    $("#guestModal").hidden = false;
    setTimeout(()=>$("#guestNick").focus(), 100);
  });
  const guestGo = ()=>{
    const nick = $("#guestNick").value.trim().slice(0,20);
    if(!nick){ toast("Isi nama panggilan dulu ya.", "bad"); $("#guestNick").focus(); return; }
    const sess = { username:"guest", role:"guest", nick, did:uid("d"), loginAt:new Date().toISOString() };
    setSession(sess);
    $("#guestModal").hidden = true;
    enterApp(sess, false);
  };
  $("#guestGo").addEventListener("click", guestGo);
  $("#guestNick").addEventListener("keydown", e=>{ if(e.key==="Enter") guestGo(); });
  $("#btnLogout").addEventListener("click", ()=>{ clearSession(); location.reload(); });
}

function enterApp(sess, silent){
  if(sess.role==="guest" && !sess.nick){
    $("#app").classList.remove("app-hidden");
    $("#guestNick").value = "";
    $("#guestModal").hidden = false;
    return;
  }
  const user = sess.role==="guest" ? { u:"guest", role:"guest", name:sess.nick, nick:sess.nick, did:sess.did } : getUser(sess.username);
  if(!user){ clearSession(); location.reload(); return; }
  $("#app").classList.remove("app-hidden");
  $("#screen-login").hidden = true;
  $("#screen-main").hidden = false;
  $("#profileName").textContent = displayName(user);
  $("#profileRole").textContent = user.role==="admin" ? "ADMIN" : user.role==="murid" ? ("MURID " + (user.kelas||"")).trim() : "GUEST";
  $("#profileAvatar").src = user.role==="admin" ? "assets/layla-sit.png" : user.role==="murid" ? "assets/layla-hero.png" : "assets/layla-chibi-peek.png";
  const isAdmin = user.role==="admin";
  const canUpload = user.role!=="guest";
  $("#tabBtnReview").hidden = !isAdmin;
  $("#tabBtnMurid").hidden = !isAdmin;
  $("#adminWaPanel").hidden = !isAdmin;
  $("#adminDbPanel").hidden = !isAdmin;
  $("#announceFormPanel").hidden = !isAdmin;
  $("#tabBtnUpload").style.display = canUpload ? "" : "none";
  $("#bottomUpload").style.display = canUpload ? "" : "none";
  $("#emptyUploadBtn").style.display = canUpload ? "" : "none";
  $("#uploadAs").textContent = "sebagai " + displayName(user);
  renderAll();
  showGuide("beranda");
  if(!silent){ toast(`Halo, ${displayName(user)}!`, "ok"); showGreeting(user); }
}

function showGreeting(user){
  $("#greetTitle").textContent = `Wah halo lagi ${displayName(user)},`;
  $("#greetSub").textContent = "mau upload apa hari ini?";
  try{ $("#greetDate").textContent = new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
  catch{ $("#greetDate").textContent = new Date().toLocaleDateString(); }
  $("#greetModal").hidden = false;
}

/* ---------- tabs + guide ---------- */
function bindTabs(){
  const switchTab = name=>{
    $$("#mainTabs button, .bottombar button").forEach(b=>b.classList.toggle("active", b.dataset.tab===name));
    $$(".tabpane").forEach(p=>p.classList.toggle("active", p.id==="pane-"+name));
    window.scrollTo({top:0, behavior:"smooth"});
    if(name==="galeri") renderGaleri();
    if(name==="favorit") renderFavorit();
    if(name==="reels") renderReels();
    if(name==="beranda") renderHome();
    if(name==="inbox") renderInbox();
    if(name==="chat") renderChat();
    if(name==="review") renderReview();
    if(name==="murid") renderMurid();
    if(name==="announce") renderAnnounce();
    if(name==="upload"){ prefillUpload(); renderMine(); }
    if(name==="akun") renderAkun();
    showGuide(name);
  };
  document.addEventListener("click", e=>{
    const g = e.target.closest("[data-goto]");
    if(g){ switchTab(g.dataset.goto); return; }
    const t = e.target.closest("#mainTabs button, .bottombar button");
    if(t && t.dataset.tab) switchTab(t.dataset.tab);
  });
  $("#brandHome").addEventListener("click", ()=>switchTab("beranda"));
  $("#btnInboxTop").addEventListener("click", ()=>switchTab("inbox"));
}
window.switchTab = t=>$(`#mainTabs button[data-tab="${t}"]`)?.click();

function bindGuide(){
  $("#guideClose").addEventListener("click", ()=>{ $("#guideBubble").hidden = true; });
  $("#guideOff").addEventListener("click", ()=>{ DB.settings.guideOn = false; saveDb(); $("#guideBubble").hidden = true; renderAkun(); });
}
function showGuide(tab){
  if(!DB.settings.guideOn || !GUIDES[tab]){ $("#guideBubble").hidden = true; return; }
  $("#guideText").textContent = GUIDES[tab];
  $("#guideBubble").hidden = false;
  clearTimeout(showGuide._t);
  showGuide._t = setTimeout(()=>{ $("#guideBubble").hidden = true; }, 9000);
}

/* ---------- hero ---------- */
let heroIdx = 0, heroTimer = null;
function bindHero(){
  const track = $("#heroTrack"), dots = $$("#heroDots span");
  const go = i=>{
    heroIdx = (i+3)%3;
    track.style.transform = `translateX(-${heroIdx*100}%)`;
    dots.forEach((d,k)=>d.classList.toggle("on", k===heroIdx));
    restart();
  };
  const restart = ()=>{ clearInterval(heroTimer); heroTimer = setInterval(()=>go(heroIdx+1), 6000); };
  $("#heroPrev").addEventListener("click", ()=>go(heroIdx-1));
  $("#heroNext").addEventListener("click", ()=>go(heroIdx+1));
  dots.forEach((d,k)=>d.addEventListener("click", ()=>go(k)));
  $("#heroJoin").addEventListener("click", openWaJoin);
  $("#btnJoinWa").addEventListener("click", openWaJoin);
  restart();
}
function openWaJoin(){
  const num = (DB.settings.waNumber||"").replace(/\D/g,"");
  if(!num){ toast("Nomor WhatsApp pembina belum diatur admin.", "bad"); return; }
  const msg = encodeURIComponent(DB.settings.waMsg || "Halo kak, saya mau join Eskul Multimedia!");
  window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
}

/* ---------- search / cats ---------- */
function bindSearch(){
  const onSearch = debounce(()=>{
    const q = $("#globalSearch").value.trim();
    if(q && !DB.searches.includes(q)){ DB.searches.unshift(q); DB.searches = DB.searches.slice(0,8); saveDb(); }
    renderRecent();
    window.switchTab("galeri");
    renderGaleri();
  }, 450);
  $("#globalSearch").addEventListener("input", onSearch);
  $("#clearHistory").addEventListener("click", ()=>{ DB.searches = []; saveDb(); renderRecent(); });
}
function buildCatOptions(){
  $("#filterCat").innerHTML = `<option value="all">Semua kategori</option>` + CATEGORIES.map(c=>`<option>${esc(c)}</option>`).join("");
  $("#upCat").innerHTML = CATEGORIES.map(c=>`<option>${esc(c)}</option>`).join("");
  $("#homeCats").innerHTML = [`<button data-cat="all" class="on">Semua</button>`, ...CATEGORIES.map(c=>`<button data-cat="${esc(c)}">${esc(c)}</button>`)].join("");
  $("#homeCats").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    $$("#homeCats button").forEach(x=>x.classList.remove("on")); b.classList.add("on");
    $("#filterCat").value = b.dataset.cat;
    window.switchTab("galeri"); renderGaleri();
  });
}

/* ---------- shared renders ---------- */
function approvedKreas(){ return DB.kreas.filter(k=>k.status==="approved").sort((a,b)=>new Date(b.date)-new Date(a.date)); }
function myKreas(){ const m = me(); if(!m||m.role==="guest") return []; return DB.kreas.filter(k=>k.author===m.u).sort((a,b)=>new Date(b.date)-new Date(a.date)); }
function thumbFor(k){
  if(k.type==="gambar" && k.images?.length) return k.images[0];
  if(k.type==="videoyt" && k.videoId) return ytThumb(k.videoId);
  return null;
}
const reactCount = k=>Object.keys(k.reactions||{}).length;
const favCount = k=>(k.favs||[]).length;
const scoreOf = k=>reactCount(k)+favCount(k);
const myReaction = k=>{ const m = me(); return (m && (k.reactions||{})[idkey(m)]) || null; };
const favedByMe = k=>{ const m = me(); return !!(m && (k.favs||[]).includes(idkey(m))); };
const kelasLabel = k=>(k.kelasUp||"") + (k.roomUp||"");
function reactBreakdown(k){
  const c = {};
  Object.values(k.reactions||{}).forEach(t=>{ c[t] = (c[t]||0)+1; });
  return c;
}

/* ---------- streak ---------- */
function todayKey(d=new Date()){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function bumpActivity(n=1){
  const m = me(); if(!m || m.role==="guest") return;
  const u = getUser(m.u); if(!u) return;
  u.days ||= {}; const k = todayKey();
  u.days[k] = (u.days[k]||0)+n;
  saveDb();
}
function streakInfo(u){
  const keys = new Set(Object.keys(u.days||{}));
  const prevDay = ds=>{ const d = new Date(ds+"T00:00:00"); d.setDate(d.getDate()-1); return todayKey(d); };
  let cur = 0;
  let c = keys.has(todayKey()) ? todayKey() : prevDay(todayKey());
  while(keys.has(c)){ cur++; c = prevDay(c); }
  let longest = 0, run = 0, prev = null;
  [...keys].sort().forEach(k=>{
    run = (prev && prevDay(k)===prev) ? run+1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  });
  return { cur, longest, active:keys.size };
}

function kcardHtml(k, opts={}){
  const t = thumbFor(k);
  const reviewMode = opts.review === true;
  const myR = myReaction(k), faved = favedByMe(k);
  const cc = (k.comments||[]).length;
  const myIcon = myR ? reactMeta(myR).icon : "i-heart";
  return `
  <article class="kcard" data-open="${k.id}" tabindex="0" role="button" aria-label="${esc(k.title)}">
    <div class="kthumb" data-open="${k.id}">
      ${k.type==="vidfile"
        ? `<video muted playsinline preload="metadata" data-media="${esc(k.mediaId||"")}"></video><span class="play-hover"><span><svg class="ic"><use href="#i-film"/></svg></span></span>`
        : t?`<img src="${esc(t)}" alt="${esc(k.title)}" loading="lazy" onerror="this.style.display='none'">`
        :`<div style="display:flex;align-items:center;justify-content:center;height:100%"><svg class="ic big" style="width:44px;height:44px;color:#fff;opacity:.85"><use href="#${TYPE_ICON[k.type]}"/></svg></div>`}
      <span class="type-badge"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg>${TYPE_LABEL[k.type]}</span>
      ${k.reward?`<span class="reward-badge"><svg class="ic"><use href="#i-trophy"/></svg>Reward</span>`:""}
      ${k.type==="gambar"&&k.images?.length>1?`<span class="multi">+${k.images.length} foto</span>`:""}
      ${k.type==="videoyt"?`<span class="play-hover"><span><svg class="ic"><use href="#${TYPE_ICON.videoyt}"/></svg></span></span>`:""}
    </div>
    <div class="kbody" data-open="${k.id}">
      <h4>${esc(k.title)}</h4>
      ${k.type==="note"?`<div class="note-pre">${esc((k.noteText||"").slice(0,140))}${(k.noteText||"").length>140?"…":""}</div>`
        :k.type==="text"?`<div class="text-pre">“${esc((k.textBody||"").slice(0,120))}…”</div>`
        :`<p class="desc">${esc(k.desc||"")}</p>`}
      <div class="kmeta">
        <span class="owner"><svg class="ic"><use href="#i-user"/></svg>${esc(k.owner||"—")}</span>
        <span class="cat-pill">${esc(k.category||"")}</span>
        ${kelasLabel(k)?`<span class="kelas-pill">Kelas ${esc(kelasLabel(k))}</span>`:""}
        ${k.status!=="approved"?`<span class="status-pill ${k.status}">${k.status==="pending"?"Pending":"Declined"}</span>`:""}
      </div>
    </div>
    <div class="social-row">
      ${pickerHtml(k.id, myR)}
      <button class="soc-btn react ${myR?"on":""}" data-react-open="${k.id}" data-my="${myR||""}" aria-label="Reaksi"><svg class="ic"><use href="#${myIcon}"/></svg><span>${reactCount(k)}</span></button>
      <button class="soc-btn fav ${faved?"on":""}" data-fav="${k.id}" aria-label="Favorit"><svg class="ic"><use href="#i-bookmark"/></svg><span>${favCount(k)}</span></button>
      <button class="soc-btn chat-btn" data-open="${k.id}" aria-label="Chat"><svg class="ic"><use href="#i-chat"/></svg><span>${cc}</span></button>
    </div>
    <div class="kfoot">
      <span>${fmtDate(k.date)}</span>
      <span class="actions">
        ${reviewMode
          ?`<button class="chip-btn ok" data-approve="${k.id}"><svg class="ic"><use href="#i-check"/></svg>Approve</button>
            <button class="chip-btn" data-review="${k.id}"><svg class="ic"><use href="#i-eye"/></svg>Review</button>
            <button class="chip-btn danger" data-decline="${k.id}"><svg class="ic"><use href="#i-x"/></svg>Decline</button>`
          :`<span class="chip-btn"><svg class="ic"><use href="#i-eye"/></svg>Lihat</span>`}
      </span>
    </div>
  </article>`;
}

function renderAll(){ renderHome(); renderGaleri(); renderFavorit(); renderReels(); renderAnnounce(); renderMine(); renderReview(); renderMurid(); renderInbox(); renderChat(); renderAkun(); renderBadges(); renderJoin(); }

function renderHome(){
  const ap = approvedKreas();
  $("#statKarya").textContent = ap.length;
  $("#statKategori").textContent = new Set(ap.map(k=>k.category)).size;
  $("#statPending").textContent = DB.kreas.filter(k=>k.status==="pending").length;
  $("#statAnnounce").textContent = DB.announces.length;
  renderStreak();
  const tops = ap.filter(isVideo).sort((a,b)=>scoreOf(b)-scoreOf(a)).slice(0,3);
  $("#topVideoPanel").hidden = tops.length===0;
  $("#topVideoRow").innerHTML = tops.map((k,i)=>`
    <button class="mini-item" data-open="${k.id}">
      ${i===0?`<span class="crown"><svg class="ic"><use href="#i-trophy"/></svg></span>`:""}
      ${thumbFor(k)?`<img src="${esc(thumbFor(k))}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="info-ic"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg></span>`}
      <span><strong>${i===0?"#1 ":""}${esc(k.title)}${k.reward?" • Reward":""}</strong><span>${reactCount(k)} reaksi • ${favCount(k)} favorit • ${esc(k.owner||"")}</span></span>
    </button>`).join("");
  const hot = ap.filter(k=>scoreOf(k)>0).sort((a,b)=>scoreOf(b)-scoreOf(a)).slice(0,5);
  $("#topKaryaPanel").hidden = hot.length===0;
  $("#topKaryaRow").innerHTML = hot.map((k,i)=>`
    <button class="mini-item" data-open="${k.id}">
      ${i===0?`<span class="crown"><svg class="ic"><use href="#i-fire"/></svg></span>`:""}
      ${thumbFor(k)?`<img src="${esc(thumbFor(k))}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="info-ic"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg></span>`}
      <span><strong>#${i+1} ${esc(k.title)}</strong><span>${reactCount(k)} reaksi • ${favCount(k)} favorit • ${(k.comments||[]).length} chat</span></span>
    </button>`).join("");
  $("#homeLatest").innerHTML = ap.slice(0,3).map(k=>`
    <button class="mini-item" data-open="${k.id}">
      ${thumbFor(k)?`<img src="${esc(thumbFor(k))}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="info-ic"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg></span>`}
      <span><strong>${esc(k.title)}</strong><span>${esc(k.owner||"")} • ${esc(k.category||"")}</span></span>
    </button>`).join("") || `<p class="muted small">Belum ada karya tayang.</p>`;
  renderRecent();
  hydrateMedia($("#pane-beranda"));
}
/* ----- streak panel ----- */
function renderStreak(){
  const m = me();
  const show = !!(m && m.role!=="guest");
  $("#streakPanel").hidden = !show;
  if(!show) return;
  const u = getUser(m.u); if(!u) return;
  const s = streakInfo(u);
  $("#streakName").textContent = displayName(u);
  $("#stSesi").textContent = u.logins||0;
  $("#stUpload").textContent = DB.kreas.filter(k=>k.author===u.u).length;
  $("#stDays").textContent = s.active;
  $("#stCur").textContent = s.cur+" hari";
  $("#stLong").textContent = s.longest+" hari";
  const days = u.days||{};
  const cells = [];
  const today = new Date();
  for(let i=181;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const key = todayKey(d);
    const n = days[key]||0;
    const lv = n===0?"":n<=2?"l1":n<=5?"l2":"l3";
    cells.push(`<span class="${lv}${i===0?" today":""}" title="${key}: ${n}"></span>`);
  }
  $("#streakGrid").innerHTML = cells.join("");
}
function renderRecent(){
  const box = $("#recentSearch");
  if(!DB.searches.length){ box.innerHTML = `<span class="empty-note">Belum ada pencarian — coba cari “art”.</span>`; return; }
  box.innerHTML = DB.searches.map((s,i)=>`<button data-q="${esc(s)}" class="${i===3?"dark":""}"><svg class="ic"><use href="#i-search"/></svg>${esc(s)}</button>`).join("");
  box.onclick = e=>{
    const b = e.target.closest("button"); if(!b) return;
    $("#globalSearch").value = b.dataset.q;
    window.switchTab("galeri"); renderGaleri();
  };
}

/* ----- galeri & favorit ----- */
let galType = "all";
function bindGaleri(){
  $("#typeSeg").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    galType = b.dataset.type;
    $$("#typeSeg button").forEach(x=>x.classList.toggle("on", x===b));
    renderGaleri();
  });
  $("#filterCat").addEventListener("change", renderGaleri);
}
function matchType(k, t){
  if(t==="all") return true;
  if(t==="video") return k.type==="videoyt" || k.type==="vidfile";
  return k.type===t;
}
function renderGaleri(){
  const q = ($("#globalSearch").value||"").trim().toLowerCase();
  const cat = $("#filterCat").value || "all";
  let list = approvedKreas();
  if(galType!=="all") list = list.filter(k=>matchType(k,galType));
  if(cat!=="all") list = list.filter(k=>k.category===cat);
  if(q) list = list.filter(k=>[k.title,k.desc,k.owner,k.category].map(x=>(x||"").toLowerCase()).some(x=>x.includes(q)));
  $("#galeriMeta").textContent = list.length ? `Menampilkan ${list.length} karya${cat!=="all"?` • ${cat}`:""}${q?` • “${$("#globalSearch").value.trim()}”`:""}` : "";
  $("#galeriGrid").innerHTML = list.map(k=>kcardHtml(k)).join("");
  $("#galeriEmpty").hidden = list.length>0;
  hydrateMedia($("#pane-galeri"));
}
/* ----- reels ----- */
let reelObserver = null;
function reelMediaHtml(k){
  if(k.type==="gambar" && k.images?.length) return `<img src="${esc(k.images[0])}" alt="${esc(k.title)}" loading="lazy">`;
  if(k.type==="vidfile") return `<video muted loop playsinline preload="metadata" data-media="${esc(k.mediaId||"")}"></video>`;
  if(k.type==="videoyt" && k.videoId) return `<a href="${esc(ytWatch(k.videoId))}" target="_blank" rel="noopener" style="display:contents"><img src="${esc(ytThumb(k.videoId))}" alt="${esc(k.title)}" loading="lazy" onerror="this.style.display='none'"></a>`;
  const txt = k.type==="note" ? (k.noteText||"").slice(0,220) : k.type==="text" ? (k.textBody||"").slice(0,220) : (k.desc||"").slice(0,220);
  return `<div class="reel-quote">“${esc(txt)}”</div>`;
}
function renderReels(){
  const list = approvedKreas();
  $("#reelsFeed").innerHTML = list.map(k=>{
    const myR = myReaction(k), faved = favedByMe(k);
    const myIcon = myR ? reactMeta(myR).icon : "i-heart";
    return `
    <div class="reel-slide" data-slide="${k.id}">
      <div class="reel-media">${reelMediaHtml(k)}</div>
      <div class="reel-shade"></div>
      <div class="reel-info" data-open="${k.id}">
        <h4>${esc(k.title)}${k.reward?' <span class="reward-badge"><svg class="ic"><use href="#i-trophy"/></svg>Reward</span>':""}</h4>
        <p>${esc(k.desc||"")}</p>
        <div class="meta"><span>${esc(k.owner||"")}</span><span>•</span><span>${esc(k.category||"")}</span>${kelasLabel(k)?`<span>•</span><span>Kelas ${esc(kelasLabel(k))}</span>`:""}</div>
      </div>
      <div class="reel-rail">
        <button class="rail-btn ${myR?"react-on":""}" data-react-open="${k.id}" aria-label="Reaksi"><svg class="ic"><use href="#${myIcon}"/></svg><span class="rcount">${reactCount(k)}</span></button>
        ${railPickerHtml(k.id, myR)}
        <button class="rail-btn ${faved?"react-on":""}" data-fav="${k.id}" aria-label="Favorit"><svg class="ic"><use href="#i-bookmark"/></svg><span>${favCount(k)}</span></button>
        <button class="rail-btn" data-open="${k.id}" aria-label="Chat"><svg class="ic"><use href="#i-chat"/></svg><span>${(k.comments||[]).length}</span></button>
      </div>
    </div>`;
  }).join("");
  $("#reelsEmpty").hidden = list.length>0;
  hydrateMedia($("#pane-reels"));
  if(reelObserver) reelObserver.disconnect();
  reelObserver = new IntersectionObserver(es=>es.forEach(en=>{
    const v = en.target;
    if(v.tagName!=="VIDEO") return;
    if(en.intersectionRatio>=0.6){ v.play().catch(()=>{}); }
    else v.pause();
  }), { root:$("#reelsFeed"), threshold:[0,0.6,1] });
  $$("#reelsFeed video").forEach(v=>reelObserver.observe(v));
}
function updateReelUI(id){
  const k = DB.kreas.find(x=>x.id===id); if(!k) return;
  const slide = document.querySelector(`.reel-slide[data-slide="${id}"]`);
  if(!slide) return;
  const myR = myReaction(k);
  const rb = slide.querySelector("[data-react-open]");
  if(rb){
    rb.classList.toggle("react-on", !!myR);
    rb.querySelector("use")?.setAttribute("href", "#"+(myR?reactMeta(myR).icon:"i-heart"));
    const c = rb.querySelector(".rcount"); if(c) c.textContent = reactCount(k);
  }
  const fb = slide.querySelector("[data-fav]");
  if(fb){ fb.classList.toggle("react-on", favedByMe(k)); const c = fb.querySelector("span"); if(c) c.textContent = favCount(k); }
  const cb = slide.querySelector('.rail-btn[aria-label="Chat"] span');
  if(cb) cb.textContent = (k.comments||[]).length;
}
function renderFavorit(){
  const m = me();
  const list = approvedKreas().filter(k=>m && (k.favs||[]).includes(idkey(m)));
  $("#favMeta").textContent = list.length ? `${list.length} karya favoritmu` : "";
  $("#favGrid").innerHTML = list.map(k=>kcardHtml(k)).join("");
  $("#favEmpty").hidden = list.length>0;
  hydrateMedia($("#pane-favorit"));
}

/* ----- social: reactions FB-style + fav ----- */
function pickerHtml(id, mine){
  return `<span class="react-pop" hidden>${REACTIONS.map(r=>
    `<button data-setreact="${id}|${r.id}" class="${mine===r.id?"mine":""}" title="${r.label}" aria-label="${r.label}"><svg class="ic"><use href="#${r.icon}"/></svg></button>`
  ).join("")}</span>`;
}
function railPickerHtml(id, mine){
  return `<span class="react-picker" hidden>${REACTIONS.map(r=>
    `<button data-setreact="${id}|${r.id}" data-r="${r.id}" class="${mine===r.id?"mine":""}" title="${r.label}" aria-label="${r.label}"><svg class="ic"><use href="#${r.icon}"/></svg></button>`
  ).join("")}</span>`;
}
function closePops(){ $$(".react-pop,.react-picker").forEach(p=>p.hidden = true); }
function togglePopFromBtn(btn){
  const scope = btn.closest(".reel-slide,.kcard,.detail-social") || document;
  const pop = scope.querySelector(".react-pop,.react-picker");
  const wasHidden = !pop || pop.hidden;
  closePops();
  if(pop && wasHidden) pop.hidden = false;
}
function bindSocial(){
  document.addEventListener("click", e=>{
    const set = e.target.closest("[data-setreact]");
    if(set){ const [id, type] = set.dataset.setreact.split("|"); setReaction(id, type); closePops(); return; }
    const open = e.target.closest("[data-react-open]");
    if(open){ togglePopFromBtn(open); return; }
    const fav = e.target.closest("[data-fav]");
    if(fav){ toggleFav(fav.dataset.fav); return; }
    if(!e.target.closest(".react-pop,.react-picker")) closePops();
  });
}
function setReaction(id, type){
  const m = me();
  const k = DB.kreas.find(x=>x.id===id); if(!k || !m) return;
  k.reactions ||= {};
  const key = idkey(m);
  if(k.reactions[key]===type) delete k.reactions[key];
  else k.reactions[key] = type;
  saveDb();
  refreshSocialUI(k);
}
function toggleFav(id){
  const m = me();
  const k = DB.kreas.find(x=>x.id===id); if(!k || !m) return;
  k.favs ||= [];
  const key = idkey(m);
  const i = k.favs.indexOf(key);
  if(i>=0) k.favs.splice(i,1); else k.favs.push(key);
  saveDb();
  refreshSocialUI(k);
}
function refreshSocialUI(k){
  renderGaleri(); renderFavorit(); renderMine(); renderHome();
  updateReelUI(k.id);
  if(!$("#kreasiModal").hidden) openDetail(k.id, true);
}

/* ----- detail modal + chat ----- */
let lbImgs = [], lbIdx = 0;
function bindModals(){
  document.addEventListener("click", e=>{
    if(e.target.closest("[data-react-open],[data-setreact],[data-fav],.react-pop,.react-picker")) return; // handled by social listener
    const appr = e.target.closest("[data-approve]");
    if(appr){ e.stopPropagation(); quickApprove(appr.dataset.approve); return; }
    const decl = e.target.closest("[data-decline]");
    if(decl){ e.stopPropagation(); openReview(decl.dataset.decline); setTimeout(()=>$("#declineReason")?.focus(), 350); return; }
    const rev = e.target.closest("[data-review]");
    if(rev){ e.stopPropagation(); openReview(rev.dataset.review); return; }
    const del = e.target.closest("[data-delkreasi]");
    if(del){ decideDelete(del.dataset.delkreasi); return; }
    if(e.target.closest("#btnAccept")) decideReview(true);
    if(e.target.closest("#btnDecline")) decideReview(false);
    if(e.target.closest("#btnDelReview")){ if(reviewId) decideDelete(reviewId); return; }
    const delm = e.target.closest("[data-delmsg]");
    if(delm){
      e.stopPropagation();
      DB.inboxes = DB.inboxes.filter(x=>x.id!==delm.dataset.delmsg);
      saveDb(); renderInbox(); renderBadges();
      toast("Pesan dihapus.");
      return;
    }
    const delc = e.target.closest("[data-delc]");
    if(delc){
      e.stopPropagation();
      const kk = DB.kreas.find(x=>x.id===delc.dataset.kid);
      if(kk){ kk.comments = (kk.comments||[]).filter(c=>c.id!==delc.dataset.delc); saveDb(); openDetail(kk.id, true); }
      return;
    }
    if(e.target.closest("[data-reward]")){
      toggleReward(e.target.closest("[data-reward]").dataset.reward);
      return;
    }
    const opener = e.target.closest("[data-open]");
    if(opener){ openDetail(opener.dataset.open); return; }
    if(e.target.closest("[data-close]")){ e.target.closest(".modal").hidden = true; return; }
  });
  document.addEventListener("keydown", e=>{
    if(e.key==="Escape") $$(".modal").forEach(m=>{ if(m.id!=="guestModal") m.hidden = true; });
    if(!$("#lightbox").hidden){
      if(e.key==="ArrowRight") lbShow(lbIdx+1);
      if(e.key==="ArrowLeft") lbShow(lbIdx-1);
    }
    if(e.key==="Enter" && e.target.matches?.(".kcard")) openDetail(e.target.dataset.open);
  });
  $("#lbPrev").addEventListener("click", e=>{e.stopPropagation(); lbShow(lbIdx-1);});
  $("#lbNext").addEventListener("click", e=>{e.stopPropagation(); lbShow(lbIdx+1);});
  $("#greetGo").addEventListener("click", ()=>{ $("#greetModal").hidden = true; });
}

function contentHtml(k){
  if(k.type==="gambar"){
    const imgs = (k.images&&k.images.length?k.images:[]);
    if(!imgs.length) return `<div class="detail-desc">Gambar tidak tersedia.</div>`;
    return `<div class="detail-hero"><img id="detailMain" src="${esc(imgs[0])}" alt="${esc(k.title)}"></div>
      ${imgs.length>1?`<div class="detail-strip">${imgs.map((s,i)=>`<img src="${esc(s)}" class="${i===0?"on":""}" data-full="${esc(s)}" alt="gambar ${i+1}">`).join("")}</div>`:""}`;
  }
  if(k.type==="videoyt"){
    return `<a class="detail-yt" href="${esc(ytWatch(k.videoId))}" target="_blank" rel="noopener">
      <img src="${esc(ytThumb(k.videoId))}" alt="Thumbnail YouTube" onerror="this.style.display='none'">
      <span><strong>Putar di YouTube</strong><br><span style="color:#9db4d4;font-size:13px">${esc(k.videoUrl||"")}</span><br>
      <span class="chip-btn" style="margin-top:9px"><svg class="ic"><use href="#i-ext"/></svg>Buka YouTube</span></span></a>`;
  }
  if(k.type==="vidfile"){
    return `<div class="detail-hero"><video controls playsinline preload="metadata" data-media="${esc(k.mediaId||"")}"></video></div>
      <p class="muted small">Video file • ${esc(k.fileName||"")} • ${fmtBytes(k.fileSize||0)}</p>`;
  }
  if(k.type==="note"){
    return `<div class="detail-note">${esc(k.noteText||"(kosong)")}</div>
      ${k.noteName?`<p class="muted small" style="margin-top:8px">Sumber file: ${esc(k.noteName)}</p>`:""}`;
  }
  return `<div class="detail-desc detail-textbody">${esc(k.textBody||"")}</div>`;
}

function openDetail(id, keepScroll){
  const k = DB.kreas.find(x=>x.id===id); if(!k) return;
  const m = me();
  const isAdmin = m?.role==="admin";
  const myR = m && (k.reactions||{})[idkey(m)];
  const faved = m && (k.favs||[]).includes(idkey(m));
  const myIcon = myR ? reactMeta(myR).icon : "i-heart";
  const comments = (k.comments||[]).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
  $("#kreasiDetail").innerHTML = `
    ${contentHtml(k)}
    <h3 class="detail-title" style="margin-top:14px">${esc(k.title)}</h3>
    <div class="detail-meta">
      <span class="cat-pill">${esc(k.category||"")}</span>
      <span class="type-badge" style="position:static"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg>${TYPE_LABEL[k.type]}</span>
      ${kelasLabel(k)?`<span class="kelas-pill">Kelas ${esc(kelasLabel(k))}</span>`:""}
      ${k.status!=="approved"?`<span class="status-pill ${k.status}">${k.status}</span>`:""}
      ${k.reward?`<span class="reward-badge"><svg class="ic"><use href="#i-trophy"/></svg>Reward Guru</span>`:""}
      <span>• ${fmtDate(k.date)}</span>
    </div>
    <p style="font-size:13.5px"><strong>Owner:</strong> ${esc(k.owner||"—")}</p>
    <div class="detail-desc" style="margin-top:10px">${esc(k.desc||"")}</div>
    ${k.status==="declined"&&k.declineReason?`<div class="detail-desc" style="margin-top:10px;border-color:#eec3c3;background:var(--bad-bg)"><strong>Alasan decline admin:</strong><br>${esc(k.declineReason)}</div>`:""}
    <div class="detail-social">
      ${pickerHtml(k.id, myR)}
      <button class="soc-btn react ${myR?"on":""}" data-react-open="${k.id}" data-my="${myR||""}"><svg class="ic"><use href="#${myIcon}"/></svg><span>${reactCount(k)}</span> Reaksi</button>
      <button class="soc-btn fav ${faved?"on":""}" data-fav="${k.id}"><svg class="ic"><use href="#i-bookmark"/></svg><span>${favCount(k)}</span> Favorit</button>
    </div>
    ${isAdmin?`<div class="form-actions" style="justify-content:flex-start;flex-wrap:wrap">
      ${isVideo(k)?`<button class="chip-btn" data-reward="${k.id}"><svg class="ic"><use href="#i-trophy"/></svg>${k.reward?"Cabut reward":"Jadikan pemenang"}</button>`:""}
      <button class="btn btn-danger" data-delkreasi="${k.id}"><svg class="ic"><use href="#i-trash"/></svg>Hapus karya ini</button>
    </div>`:""}
    <div class="panel-head" style="margin:18px 0 8px"><h3><svg class="ic" style="vertical-align:-4px"><use href="#i-chat"/></svg> Chat (${comments.length})</h3></div>
    <div class="comments" id="commentList">
      ${comments.map(c=>`
        <div class="comment">
          <span class="avatar">${esc(firstName(c.name).slice(0,1).toUpperCase())}</span>
          <span style="flex:1"><strong>${esc(c.name)}</strong> <span class="cmeta">• ${fmtDate(c.date)}</span><p>${esc(c.text)}</p></span>
          ${(isAdmin || (m && c.by===idkey(m)))?`<button class="c-del" data-delc="${c.id}" data-kid="${k.id}" title="Hapus chat"><svg class="ic" style="width:14px;height:14px"><use href="#i-x"/></svg></button>`:""}
        </div>`).join("") || `<p class="muted small">Belum ada chat. Jadilah yang pertama menyapa!</p>`}
    </div>
    <div class="comment-form">
      <input id="chatInput" type="text" maxlength="500" placeholder="Tulis komentar sebagai ${esc(m?displayName(m):"Guest")}…">
      <button class="btn btn-primary" id="chatSend"><svg class="ic"><use href="#i-send"/></svg></button>
    </div>`;
  const modal = $("#kreasiModal");
  const scroller = modal.querySelector(".modal-card");
  const keep = keepScroll ? scroller.scrollTop : 0;
  modal.hidden = false;
  scroller.scrollTop = keep;
  hydrateMedia($("#kreasiDetail"));
  const main = $("#detailMain");
  $$("#kreasiDetail .detail-strip img").forEach(im=>im.addEventListener("click", ()=>{
    $$("#kreasiDetail .detail-strip img").forEach(x=>x.classList.remove("on"));
    im.classList.add("on"); if(main) main.src = im.dataset.full;
  }));
  if(main) main.addEventListener("click", ()=>{ lbImgs = k.images||[]; lbShow(0); });
  const send = ()=>{
    const inp = $("#chatInput");
    const text = (inp.value||"").trim();
    if(!text) return;
    const who = me();
    k.comments ||= [];
    k.comments.push({ id:uid("c"), by:who?idkey(who):"guest", name:who?displayName(who):"Guest", text:text.slice(0,500), date:new Date().toISOString() });
    saveDb(); bumpActivity(1); openDetail(k.id, true); refreshSocialUI(k);
  };
  $("#chatSend").addEventListener("click", send);
  $("#chatInput").addEventListener("keydown", e=>{ if(e.key==="Enter") send(); });
}

function toggleReward(id){
  const m = me();
  if(!m || m.role!=="admin"){ toast("Hanya admin.", "bad"); return; }
  const k = DB.kreas.find(x=>x.id===id); if(!k) return;
  if(k.reward){ k.reward = null; saveDb(); openDetail(k.id, true); renderHome(); toast("Reward dicabut."); return; }
  if(!confirm(`Jadikan “${k.title}” pemenang reward guru? Semua murid akan diberi tahu.`)) return;
  k.reward = { text:"Pemenang Reward Guru", by:m.u, date:new Date().toISOString() };
  DB.users.filter(u=>u.role==="murid"&&u.status==="aktif").forEach(u=>{
    DB.inboxes.unshift({ id:uid("m"), to:u.u, from:m.u, kind:"good", title:`Pemenang reward: “${k.title}”`, body:`Video karya ${k.owner} memenangkan reward dari guru! Cek Top Video di beranda.\n— ${displayName(m)}`, date:new Date().toISOString(), read:false, relatedId:k.id });
  });
  saveDb(); openDetail(k.id, true); renderHome(); renderBadges();
  toast("Pemenang diumumkan!", "ok");
}

function lbShow(i){
  if(!lbImgs.length) return;
  lbIdx = (i+lbImgs.length)%lbImgs.length;
  $("#lbImg").src = lbImgs[lbIdx];
  $("#lbCount").textContent = lbImgs.length>1 ? `${lbIdx+1} / ${lbImgs.length}` : "";
  $("#lightbox").hidden = false;
}

/* ----- upload ----- */
function bindUpload(){
  $("#upTypeSeg").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    upState.type = b.dataset.type;
    $$("#upTypeSeg button").forEach(x=>x.classList.toggle("on", x===b));
    ["gambar","videoyt","vidfile","note","text"].forEach(t=>$("#upType-"+t).hidden = t!==upState.type);
  });
  const imgInput = $("#upImages");
  $("#imgDrop").addEventListener("click", e=>{ if(e.target.tagName!=="BUTTON") imgInput.click(); });
  ["dragover","dragenter"].forEach(ev=>$("#imgDrop").addEventListener(ev, e=>{e.preventDefault(); $("#imgDrop").classList.add("drag");}));
  ["dragleave","drop"].forEach(ev=>$("#imgDrop").addEventListener(ev, e=>{e.preventDefault(); $("#imgDrop").classList.remove("drag");}));
  $("#imgDrop").addEventListener("drop", e=>{ addImages(e.dataTransfer.files); });
  imgInput.addEventListener("change", ()=>{ addImages(imgInput.files); imgInput.value=""; });

  $("#upVideoUrl").addEventListener("input", ()=>{
    const id = youtubeId($("#upVideoUrl").value);
    upState.videoId = id;
    $("#ytPreview").hidden = !id;
    if(id){ $("#ytThumb").src = ytThumb(id); $("#ytIdLabel").textContent = "ID: "+id; }
  });

  const vidInput = $("#upVideoFile");
  $("#vidDrop").addEventListener("click", e=>{ if(!e.target.closest("button")) vidInput.click(); });
  vidInput.addEventListener("change", ()=>{ setVideoFile(vidInput.files[0]); vidInput.value=""; });
  $("#btnVidRemove").addEventListener("click", clearVideoFile);

  const noteInput = $("#upNoteFile");
  $("#noteDrop").addEventListener("click", e=>{ if(!e.target.closest("textarea")) noteInput.click(); });
  noteInput.addEventListener("change", ()=>{
    const f = noteInput.files[0]; if(!f) return;
    if(!/\.(txt|md|markdown|text)$/i.test(f.name) && f.type!=="text/plain" && !f.type.includes("markdown")){ toast("File harus .txt / .md", "bad"); return; }
    const r = new FileReader();
    r.onload = ()=>{ $("#upNoteText").value = String(r.result||"").slice(0,20000); toast("File note terbaca.", "ok"); };
    r.readAsText(f);
    noteInput.value = "";
  });

  $("#btnUpReset").addEventListener("click", resetUploadForm);
  $("#btnUpSubmit").addEventListener("click", submitUpload);
}
function setVideoFile(f){
  if(!f) return;
  if(!f.type.startsWith("video/")){ toast("File harus video.", "bad"); return; }
  if(f.size > MAX_VIDEO_BYTES){ toast(`Video ${(f.size/1048576).toFixed(1)}MB melebihi batas 30MB. Pakai link YouTube saja.`, "bad"); return; }
  clearVideoURL();
  upState.videoFile = f;
  upState.videoURL = URL.createObjectURL(f);
  $("#vidPrevEl").src = upState.videoURL;
  $("#vidNameLabel").textContent = f.name;
  $("#vidSizeLabel").textContent = fmtBytes(f.size) + " • siap diupload";
  $("#vidPreview").hidden = false;
}
function clearVideoURL(){ if(upState.videoURL){ URL.revokeObjectURL(upState.videoURL); upState.videoURL = null; } }
function clearVideoFile(){ upState.videoFile = null; clearVideoURL(); $("#vidPrevEl").removeAttribute("src"); $("#vidPreview").hidden = true; }
function addImages(files){
  [...files].filter(f=>f.type.startsWith("image/")).forEach(f=>{
    const r = new FileReader();
    r.onload = ()=>compressImage(r.result, dataUrl=>{ upState.images.push(dataUrl); renderImgPreview(); });
    r.readAsDataURL(f);
  });
  if([...files].some(f=>!f.type.startsWith("image/"))) toast("File non-gambar diabaikan.", "bad");
}
function compressImage(dataUrl, cb){
  const img = new Image();
  img.onload = ()=>{
    const max = 1000;
    let { width:w, height:h } = img;
    const s = Math.min(1, max/Math.max(w,h));
    w = Math.round(w*s); h = Math.round(h*s);
    const c = document.createElement("canvas"); c.width=w; c.height=h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,w,h);
    ctx.drawImage(img,0,0,w,h);
    cb(c.toDataURL("image/jpeg", .82));
  };
  img.onerror = ()=>cb(dataUrl);
  img.src = dataUrl;
}
function renderImgPreview(){
  $("#imgPreview").innerHTML = upState.images.map((s,i)=>`<span class="thumb"><img src="${esc(s)}" alt="pratinjau ${i+1}"><button data-del="${i}" aria-label="Hapus"><svg class="ic"><use href="#i-x"/></svg></button></span>`).join("");
  $$("#imgPreview [data-del]").forEach(b=>b.addEventListener("click", ()=>{ upState.images.splice(+b.dataset.del,1); renderImgPreview(); }));
}
function prefillUpload(){
  const m = me();
  if(m && m.role==="murid"){
    if(!$("#upOwner").value) $("#upOwner").value = m.name;
    const g = gradeOf(m.kelas), r = roomOf(m.kelas);
    if(g && !$("#upKelas").value) $("#upKelas").value = String(g);
    if(r && !$("#upRoom").value) $("#upRoom").value = r;
  }
}
function resetUploadForm(){
  $("#upTitle").value=""; $("#upDesc").value="";
  const m = me();
  if(!(m && m.role==="murid")){ $("#upOwner").value=""; $("#upKelas").value=""; $("#upRoom").value=""; }
  $("#upVideoUrl").value=""; $("#ytPreview").hidden=true;
  $("#upNoteText").value=""; $("#upTextBody").value="";
  upState.images=[]; upState.videoId=null;
  clearVideoFile(); renderImgPreview(); $("#uploadError").hidden=true;
  prefillUpload();
}
async function submitUpload(){
  const m = me();
  if(!m || m.role==="guest"){ toast("Guest tidak bisa upload. Login akun murid dulu.", "bad"); return; }
  const err = $("#uploadError");
  const title = $("#upTitle").value.trim(), owner = $("#upOwner").value.trim(), desc = $("#upDesc").value.trim();
  const cat = $("#upCat").value, type = upState.type;
  const kelasUp = $("#upKelas").value, roomUp = $("#upRoom").value;
  const fail = txt=>{ err.hidden=false; err.textContent=txt; err.scrollIntoView({block:"center",behavior:"smooth"}); };
  if(!title) return fail("Judul kreasi wajib diisi.");
  if(!owner) return fail("Owner / copyright wajib diisi (bukan opsi).");
  if(!desc) return fail("Deskripsi kreasi wajib diisi (bukan opsi).");
  if(!kelasUp) return fail("Kelas wajib dipilih (7 / 8 / 9).");
  if(!roomUp) return fail("Ruangan wajib dipilih (A / B / C / D).");
  const base = { id:uid("k"), title, owner, desc, category:cat, type, kelasUp, roomUp,
    status:"pending", author:m.u, date:new Date().toISOString(), declineReason:"",
    reactions:{}, favs:[], comments:[], reward:null };
  if(type==="gambar"){
    if(!upState.images.length) return fail("Upload minimal 1 gambar.");
    base.images = [...upState.images];
  }else if(type==="videoyt"){
    const id = youtubeId($("#upVideoUrl").value);
    if(!id) return fail("Link YouTube tidak valid (pakai watch / youtu.be / shorts).");
    base.videoId = id; base.videoUrl = $("#upVideoUrl").value.trim();
  }else if(type==="vidfile"){
    const f = upState.videoFile;
    if(!f) return fail("Pilih file video dulu (maks 30MB).");
    if(f.size > MAX_VIDEO_BYTES) return fail("Video melebihi 30MB. Pakai link YouTube saja.");
    err.hidden = true;
    $("#btnUpSubmit").disabled = true;
    try{
      base.mediaId = uid("mfile"); base.fileName = f.name; base.fileSize = f.size;
      await MediaDB.put(base.mediaId, f);
    }catch{ $("#btnUpSubmit").disabled = false; return fail("Gagal menyimpan video di perangkat ini."); }
    $("#btnUpSubmit").disabled = false;
  }else if(type==="note"){
    const txt = $("#upNoteText").value.trim();
    if(!txt) return fail("Isi note kosong — upload file .txt/.md atau ketik langsung.");
    base.noteText = txt.slice(0,20000); base.noteName = "note-upload.txt";
  }else{
    const body = $("#upTextBody").value.trim();
    if(!body) return fail("Tulisan masih kosong.");
    base.textBody = body.slice(0,20000);
  }
  err.hidden = true;
  DB.kreas.unshift(base);
  const adminUs = DB.users.filter(u=>u.role==="admin").map(u=>u.u);
  const msgIds = adminUs.map(a=>{
    const mm = { id:uid("m"), to:a, from:m.u, kind:"", title:`Review baru: “${title}”`, body:`${displayName(m)} (Kelas ${kelasUp}${roomUp}) mengupload ${TYPE_LABEL[type]} kategori ${cat}.\nOwner: ${owner}\n\nBuka tab Review untuk accept / decline.`, date:new Date().toISOString(), read:false, relatedId:base.id };
    DB.inboxes.unshift(mm); return mm.id;
  });
  if(!saveDb()){
    DB.kreas = DB.kreas.filter(k=>k.id!==base.id);
    DB.inboxes = DB.inboxes.filter(x=>!msgIds.includes(x.id));
    if(base.mediaId) MediaDB.del(base.mediaId);
    return;
  }
  resetUploadForm(); renderAll(); renderMine();
  bumpActivity(3);
  toast("Terkirim! Menunggu review admin.", "ok");
  window.switchTab("galeri");
}
function renderMine(){
  const m = me();
  const box = $("#myGrid"); if(!box) return;
  if(!m || m.role==="guest"){ box.innerHTML = `<p class="muted small">Guest tidak punya upload. Login akun murid untuk upload.</p>`; return; }
  const mine = myKreas();
  box.innerHTML = mine.map(k=>kcardHtml(k)).join("") || `<p class="muted small">Belum ada upload. Kirim karya pertamamu di form atas.</p>`;
  hydrateMedia(box);
}

/* ----- review (admin) ----- */
let reviewId = null;
function renderReview(){
  const m = me();
  if(!m || m.role!=="admin") return;
  const pend = DB.kreas.filter(k=>k.status==="pending").sort((a,b)=>new Date(b.date)-new Date(a.date));
  $("#reviewCount").textContent = `${pend.length} pending`;
  $("#reviewGrid").innerHTML = pend.map(k=>kcardHtml(k,{review:true})).join("");
  $("#reviewEmpty").hidden = pend.length>0;
  hydrateMedia($("#pane-review"));
}
function openReview(id){
  const k = DB.kreas.find(x=>x.id===id); if(!k) return;
  reviewId = id;
  $("#declineReason").value = k.declineReason||"";
  $("#reviewDetail").innerHTML = `
    ${contentHtml(k)}
    <h3 class="detail-title" style="margin-top:14px">${esc(k.title)}</h3>
    <div class="detail-meta"><span class="cat-pill">${esc(k.category)}</span>
      <span class="type-badge" style="position:static"><svg class="ic"><use href="#${TYPE_ICON[k.type]}"/></svg>${TYPE_LABEL[k.type]}</span>
      ${kelasLabel(k)?`<span class="kelas-pill">Kelas ${esc(kelasLabel(k))}</span>`:""}
      <span>• dari ${esc(k.author)} • ${fmtDate(k.date)}</span></div>
    <p style="font-size:13.5px"><strong>Owner:</strong> ${esc(k.owner||"—")}</p>
    <div class="detail-desc" style="margin-top:10px">${esc(k.desc||"")}</div>`;
  $("#reviewModal").hidden = false;
  hydrateMedia($("#reviewDetail"));
  const main = $("#detailMain");
  $$("#reviewDetail .detail-strip img").forEach(im=>im.addEventListener("click", ()=>{
    $$("#reviewDetail .detail-strip img").forEach(x=>x.classList.remove("on"));
    im.classList.add("on"); if(main) main.src = im.dataset.full;
  }));
  if(main) main.addEventListener("click", ()=>{ lbImgs = k.images||[]; lbShow(0); });
}
function quickApprove(id){
  const m = me();
  if(!m || m.role!=="admin"){ toast("Hanya admin.", "bad"); return; }
  const k = DB.kreas.find(x=>x.id===id);
  if(!k || k.status!=="pending") return;
  k.status = "approved"; k.declineReason = "";
  DB.inboxes.unshift({ id:uid("m"), to:k.author, from:m.u, kind:"good",
    title:`Karyamu tayang: “${k.title}”`,
    body:`Selamat! ${TYPE_LABEL[k.type]} kategori ${k.category} sudah tayang di galeri.\n\n— ${displayName(m)}`,
    date:new Date().toISOString(), read:false, relatedId:k.id });
  DB.inboxes.forEach(x=>{ if(x.relatedId===k.id && x.to!==k.author) x.read = true; });
  saveDb(); renderAll(); renderMine();
  toast(`“${k.title}” tayang di galeri.`, "ok");
}
function decideReview(accept){
  const k = DB.kreas.find(x=>x.id===reviewId); if(!k) return;
  const reason = $("#declineReason").value.trim();
  if(!accept && !reason){ toast("Decline wajib disertai alasan jelas.", "bad"); $("#declineReason").focus(); return; }
  k.status = accept ? "approved" : "declined";
  k.declineReason = accept ? "" : reason;
  const m = me();
  DB.inboxes.unshift({ id:uid("m"), to:k.author, from:m.u, kind:accept?"good":"bad",
    title: accept?`Karyamu tayang: “${k.title}”`:`Karya di-decline: “${k.title}”`,
    body: accept?`Selamat! ${TYPE_LABEL[k.type]} kategori ${k.category} sudah tayang di galeri.\n\n— ${displayName(m)}`
      :`Admin me-decline karyamu dengan alasan:\n\n${reason}\n\nPerbaiki lalu upload ulang ya.\n— ${displayName(m)}`,
    date:new Date().toISOString(), read:false, relatedId:k.id });
  DB.inboxes.forEach(x=>{ if(x.relatedId===k.id && x.to!==k.author) x.read = true; });
  saveDb(); $("#reviewModal").hidden = true; reviewId = null;
  renderAll(); renderMine();
  toast(accept?"Karya tayang di galeri.":"Karya di-decline + alasan terkirim.", accept?"ok":"");
}
function decideDelete(id){
  const m = me();
  if(!m || m.role!=="admin"){ toast("Hanya admin bisa menghapus.", "bad"); return; }
  const k = DB.kreas.find(x=>x.id===id); if(!k) return;
  if(!confirm(`Hapus karya “${k.title}” permanen? Penulis akan diberi tahu via inbox.`)) return;
  DB.kreas = DB.kreas.filter(x=>x.id!==id);
  if(k.mediaId) MediaDB.del(k.mediaId);
  DB.inboxes.forEach(x=>{ if(x.relatedId===id) x.read = true; });
  if(k.author && k.author!==m.u){
    DB.inboxes.unshift({ id:uid("m"), to:k.author, from:m.u, kind:"bad",
      title:`Karya dihapus admin: “${k.title}”`,
      body:`Admin menghapus karyamu (${TYPE_LABEL[k.type]} • ${k.category}). Hubungi pembina jika butuh penjelasan.\n— ${displayName(m)}`,
      date:new Date().toISOString(), read:false, relatedId:null });
  }
  saveDb();
  $("#kreasiModal").hidden = true; $("#reviewModal").hidden = true; reviewId = null;
  renderAll(); renderMine();
  toast("Karya dihapus permanen.", "ok");
}

/* ----- inbox ----- */
function bindInbox(){
  $("#btnReadAll").addEventListener("click", ()=>{
    const m = me();
    DB.inboxes.forEach(x=>{ if(m && x.to===m.u) x.read = true; });
    saveDb(); renderInbox(); renderBadges();
  });
}
function myInbox(){
  const m = me(); if(!m) return [];
  if(m.role==="guest") return DB.inboxes.filter(x=>x.to==="guest").sort((a,b)=>new Date(b.date)-new Date(a.date));
  return DB.inboxes.filter(x=>x.to===m.u).sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function renderInbox(){
  const list = myInbox();
  $("#inboxList").innerHTML = list.map(x=>`
    <button class="inbox-item ${x.read?"":"unread"} ${x.kind||""}" data-msg="${x.id}">
      <span class="inbox-ic"><svg class="ic"><use href="#${x.kind==="bad"?"i-x":x.kind==="good"?"i-check":"i-mega"}"/></svg></span>
      <span style="flex:1"><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p>
      <span class="meta"><span>dari ${esc(x.from)}</span><span>•</span><span>${fmtDate(x.date)}</span></span></span>
      ${x.read?"":'<span class="unread-dot"></span>'}
      <span class="msg-del" data-delmsg="${x.id}" title="Hapus pesan"><svg class="ic"><use href="#i-x"/></svg></span>
    </button>`).join("");
  $("#inboxEmpty").hidden = list.length>0;
  $$("#inboxList [data-msg]").forEach(b=>b.addEventListener("click", (e)=>{
    if(e.target.closest("[data-delmsg]")) return;
    const mm = DB.inboxes.find(y=>y.id===b.dataset.msg); if(!mm) return;
    mm.read = true; saveDb(); renderInbox(); renderBadges();
    if(mm.relatedId && DB.kreas.some(k=>k.id===mm.relatedId)) openDetail(mm.relatedId);
  }));
}
function renderBadges(){
  const m = me(); if(!m) return;
  const key = m.role==="guest" ? "guest" : m.u;
  const unread = DB.inboxes.filter(x=>x.to===key && !x.read).length;
  [["#inboxBadge"],["#inboxBadgeTab"],["#inboxBadgeBottom"]].forEach(([s])=>{
    const el = $(s); if(!el) return;
    el.hidden = unread===0; el.textContent = unread>99?"99+":unread;
  });
  if(m.role==="admin"){
    const p = DB.kreas.filter(k=>k.status==="pending").length;
    const rb = $("#reviewBadge"); rb.hidden = p===0; rb.textContent = p;
  }
  const cu = chatTotalUnread();
  [["#chatBadge"],["#chatBadgeBottom"]].forEach(([s])=>{
    const el = $(s); if(!el) return;
    el.hidden = cu===0; el.textContent = cu>99?"99+":cu;
  });
}

/* ----- chat komunitas ----- */
let activeThread = null;
function threadVisible(t, m){
  if(!m) return false;
  if(t.type==="public") return true;
  return m.role!=="guest" && t.members.includes(m.u);
}
function threadName(t, m){
  if(t.type==="public") return t.name || "Grup Publik";
  const other = (t.members||[]).find(x=>x!==m.u);
  const u = other && getUser(other);
  return u ? displayName(u) : (t.name || "Chat");
}
function threadKey(){ const m = me(); return m ? idkey(m) : "guest"; }
function threadUnread(t){
  const key = threadKey();
  const lr = (t.lastRead||{})[key] || "";
  return DB.messages.filter(x=>x.threadId===t.id && x.date > lr && x.by!==key).length;
}
function chatTotalUnread(){
  const m = me(); if(!m) return 0;
  return DB.threads.filter(t=>threadVisible(t,m)).reduce((a,t)=>a+threadUnread(t), 0);
}
function threadLast(t){
  const msgs = DB.messages.filter(x=>x.threadId===t.id);
  return msgs.length ? msgs[msgs.length-1] : null;
}
function bindChat(){
  $("#btnNewDm").addEventListener("click", ()=>{
    const m = me();
    if(!m || m.role==="guest"){ toast("Guest hanya bisa chat di grup publik.", "bad"); return; }
    const form = $("#chatNewForm");
    form.hidden = !form.hidden;
    if(!form.hidden){
      const opts = DB.users.filter(u=>u.u!==m.u && (u.role==="admin" || (u.role==="murid"&&u.status==="aktif")))
        .sort((a,b)=>a.name.localeCompare(b.name))
        .map(u=>`<option value="${esc(u.u)}">${esc(displayName(u))} • ${u.role==="admin"?"ADMIN":esc(u.kelas||"")}</option>`).join("");
      $("#dmUser").innerHTML = opts || `<option value="">— tidak ada —</option>`;
    }
  });
  $("#btnStartDm").addEventListener("click", ()=>{
    const m = me(); if(!m || m.role==="guest") return;
    const other = $("#dmUser").value; if(!other) return;
    const set = [m.u, other].sort().join("|");
    let t = DB.threads.find(x=>x.type==="dm" && [...x.members].sort().join("|")===set);
    if(!t){
      t = { id:uid("th"), type:"dm", name:"", members:[m.u, other], by:m.u, date:new Date().toISOString(), lastRead:{} };
      DB.threads.unshift(t); saveDb();
    }
    $("#chatNewForm").hidden = true;
    openThread(t.id);
  });
  const send = ()=>{
    const inp = $("#chatMsgInput");
    const text = (inp.value||"").trim();
    if(!text || !activeThread) return;
    const t = DB.threads.find(x=>x.id===activeThread); if(!t) return;
    const m = me(); if(!m) return;
    if(!threadVisible(t, m)){ toast("Tidak punya akses.", "bad"); return; }
    DB.messages.push({ id:uid("cm"), threadId:t.id, by:idkey(m), name:displayName(m), text:text.slice(0,1000), date:new Date().toISOString() });
    t.lastRead ||= {}; t.lastRead[threadKey()] = new Date().toISOString();
    saveDb(); inp.value = "";
    renderThreads(); renderRoom(); renderBadges();
    bumpActivity(1);
  };
  $("#chatMsgSend").addEventListener("click", send);
  $("#chatMsgInput").addEventListener("keydown", e=>{ if(e.key==="Enter") send(); });
  $("#chatBack").addEventListener("click", ()=>{
    activeThread = null;
    $(".chat-shell")?.classList.remove("room-open");
    renderThreads();
  });
}
function renderChat(){
  renderThreads();
  const m = me();
  const t = DB.threads.find(x=>x.id===activeThread);
  if(t && m && threadVisible(t, m)) renderRoom();
  else{
    activeThread = null;
    $("#chatRoom").hidden = true; $("#chatEmpty").hidden = false;
    $(".chat-shell")?.classList.remove("room-open");
  }
}
function renderThreads(){
  const m = me();
  const box = $("#threadList"); if(!box) return;
  const list = DB.threads.filter(t=>threadVisible(t, m)).sort((a,b)=>{
    const la = threadLast(a), lb = threadLast(b);
    return new Date(lb?lb.date:(b.date||0)) - new Date(la?la.date:(a.date||0));
  });
  box.innerHTML = list.map(t=>{
    const last = threadLast(t);
    const un = threadUnread(t);
    const init = t.type==="public" ? `<span class="avatar group"><svg class="ic"><use href="#i-users"/></svg></span>`
      : `<span class="avatar">${esc(firstName(threadName(t,m)).slice(0,1).toUpperCase())}</span>`;
    return `<button class="thread ${t.id===activeThread?"on":""}" data-thread="${t.id}">
      ${init}
      <span style="flex:1;min-width:0"><strong>${esc(threadName(t,m))}${t.type==="public"?' <span class="kelas-pill">PUBLIK</span>':""}</strong>
      <span class="last">${last?esc(last.name+": "+last.text):"Belum ada pesan"}</span></span>
      ${un?`<span class="unread-n">${un>99?"99+":un}</span>`:""}
    </button>`;
  }).join("") || `<p class="muted small" style="padding:12px">Belum ada percakapan.</p>`;
  $$("#threadList [data-thread]").forEach(b=>b.addEventListener("click", ()=>openThread(b.dataset.thread)));
  const canDm = m && m.role!=="guest";
  $("#btnNewDm").style.display = canDm ? "" : "none";
  if(!canDm) $("#chatNewForm").hidden = true;
}
function openThread(id){
  const m = me(); if(!m) return;
  const t = DB.threads.find(x=>x.id===id); if(!t || !threadVisible(t, m)) return;
  activeThread = id;
  t.lastRead ||= {}; t.lastRead[threadKey()] = new Date().toISOString();
  saveDb();
  renderThreads(); renderRoom(); renderBadges();
  $(".chat-shell")?.classList.add("room-open");
}
function renderRoom(){
  const m = me();
  const t = DB.threads.find(x=>x.id===activeThread);
  if(!t || !m){ $("#chatRoom").hidden = true; $("#chatEmpty").hidden = false; return; }
  $("#chatRoom").hidden = false; $("#chatEmpty").hidden = true;
  $("#chatRoomName").textContent = threadName(t, m);
  $("#chatRoomSub").textContent = t.type==="public" ? "Grup publik • semua bisa ikut" : "Chat pribadi";
  $("#chatMsgInput").placeholder = `Tulis pesan sebagai ${displayName(m)}…`;
  const key = idkey(m);
  const msgs = DB.messages.filter(x=>x.threadId===t.id).sort((a,b)=>new Date(a.date)-new Date(b.date));
  $("#chatMsgs").innerHTML = msgs.map(x=>`
    <div class="msg ${x.by===key?"mine":""}">
      ${x.by!==key?`<span class="who">${esc(x.name)}</span>`:""}
      <p>${esc(x.text)}</p>
      <span class="when">${fmtDate(x.date)}</span>
      ${(m.role==="admin" || x.by===key)?`<button class="m-del" data-delchat="${x.id}" title="Hapus"><svg class="ic"><use href="#i-x"/></svg></button>`:""}
    </div>`).join("") || `<p class="muted small">Belum ada pesan. Sapa duluan!</p>`;
  $$("#chatMsgs [data-delchat]").forEach(b=>b.addEventListener("click", ()=>{
    DB.messages = DB.messages.filter(x=>x.id!==b.dataset.delchat);
    saveDb(); renderRoom(); renderThreads();
    toast("Pesan dihapus.");
  }));
  const box = $("#chatMsgs");
  box.scrollTop = box.scrollHeight;
}

/* ----- announce ----- */
function bindAnnounce(){
  $("#btnPostAnn").addEventListener("click", ()=>{
    const m = me();
    if(!m || m.role!=="admin"){ toast("Hanya admin bisa posting announce.", "bad"); return; }
    const t = $("#annTitle").value.trim(), b = $("#annBody").value.trim();
    if(!t || !b){ toast("Judul + isi announce wajib diisi.", "bad"); return; }
    DB.announces.unshift({ id:uid("ann"), title:t, body:b, author:m.u, date:new Date().toISOString(), pin:false });
    saveDb(); $("#annTitle").value=""; $("#annBody").value="";
    renderAnnounce(); renderBadges(); toast("Announce diposting.", "ok");
  });
}
function renderAnnounce(){
  const m = me();
  const isAdmin = m?.role==="admin";
  const tugas = DB.announces.filter(a=>/tugas/i.test(a.title+" "+a.body));
  $("#tugasSpot").innerHTML = tugas.length ? `
    <div class="mascot-note">
      <img src="assets/mascot-semangat.png" alt="" onerror="this.onerror=null;this.src='assets/layla-chibi-peek.png'">
      <div class="bubble"><strong>Ada tugas dari admin! Giat upload ya</strong><p>${tugas.length} announce tugas aktif — selesaikan lalu upload hasilnya ke galeri biar makin bersinar.</p></div>
    </div>` : "";
  const list = [...DB.announces].sort((a,b)=>(b.pin-a.pin)||(new Date(b.date)-new Date(a.date)));
  $("#annList").innerHTML = list.map(a=>`
    <article class="ann-card ${a.pin?"pin":""}">
      ${a.pin?'<span class="pin-tag">PINNED</span>':""}
      <h4>${esc(a.title)}</h4>
      <p class="body">${esc(a.body)}</p>
      <div class="meta"><span>oleh ${esc(a.author)}</span><span>•</span><span>${fmtDate(a.date)}</span>
      ${isAdmin?`<span>•</span><button class="mini-link" data-pin="${a.id}">${a.pin?"Lepas pin":"Pin"}</button>
      <button class="mini-link" data-delann="${a.id}" style="color:var(--bad)">Hapus</button>`:""}</div>
    </article>`).join("") || `<div class="empty"><h4>Belum ada announce</h4></div>`;
  $$("#annList [data-delann]").forEach(b=>b.addEventListener("click", ()=>{
    DB.announces = DB.announces.filter(a=>a.id!==b.dataset.delann);
    saveDb(); renderAnnounce();
  }));
  $$("#annList [data-pin]").forEach(b=>b.addEventListener("click", ()=>{
    const a = DB.announces.find(x=>x.id===b.dataset.pin); if(a) a.pin = !a.pin;
    saveDb(); renderAnnounce();
  }));
  const dot = $("#announceDot");
  if(dot) dot.hidden = !list.some(a=>Date.now()-new Date(a.date).getTime() < 3*24*3600*1000);
}

/* ----- murid (admin) ----- */
let muridQ = "";
function bindMurid(){
  $("#btnAddMurid").addEventListener("click", ()=>{
    const m = me();
    if(!m || m.role!=="admin"){ toast("Hanya admin.", "bad"); return; }
    const name = $("#nuName").value.trim(), kelas = $("#nuKelas").value;
    if(!name || !kelas){ toast("Nama + kelas wajib diisi.", "bad"); return; }
    const taken = new Set(DB.users.map(u=>u.u));
    const u = studentUsername(name, kelas, taken);
    DB.users.push({ u, p:firstName(name).toLowerCase(), role:"murid", name, nick:name, kelas, status:"aktif" });
    saveDb(); $("#nuName").value=""; $("#nuKelas").value="";
    $("#addMuridInfo").textContent = `Akun dibuat: ${u} / ${firstName(name).toLowerCase()}`;
    renderMurid(); toast(`Akun ${name} dibuat.`, "ok");
  });
  $("#muridSearch").addEventListener("input", e=>{ muridQ = e.target.value.trim().toLowerCase(); renderMurid(); });
  $("#btnPromote").addEventListener("click", ()=>{
    const m = me();
    if(!m || m.role!=="admin"){ toast("Hanya admin.", "bad"); return; }
    const ny = $("#newYear").value.trim();
    if(!/^\d{4}\/\d{4}$/.test(ny)){ toast("Format tahun: 2027/2028", "bad"); return; }
    if(!confirm(`Naikkan kelas SEMUA murid ke tahun ajaran ${ny}? Kelas 9 menjadi Alumni.`)) return;
    const res = promoteYear(ny);
    saveDb(); renderMurid(); renderBadges();
    toast(`Promosi selesai: ${res.up} naik kelas, ${res.alumni} alumni.`, "ok");
  });
}
function promoteYear(newYear){
  const taken = new Set(DB.users.map(u=>u.u));
  const rename = {};
  let up = 0, alumni = 0;
  DB.users.filter(u=>u.role==="murid" && u.status==="aktif").forEach(u=>{
    const g = gradeOf(u.kelas), r = roomOf(u.kelas);
    if(g===9){ u.status = "Alumni"; alumni++; return; }
    if(!g || !r) return;
    const nk = `${g+1}${r}`;
    taken.delete(u.u);
    const nu = studentUsername(u.name, nk, taken);
    rename[u.u] = nu;
    u.u = nu; u.kelas = nk; up++;
  });
  if(Object.keys(rename).length){
    DB.kreas.forEach(k=>{
      if(rename[k.author]) k.author = rename[k.author];
      if(k.reactions){ const nr = {}; Object.entries(k.reactions).forEach(([u,t])=>{ nr[rename[u]||u] = t; }); k.reactions = nr; }
      if(Array.isArray(k.favs)) k.favs = k.favs.map(x=>rename[x]||x);
      (k.comments||[]).forEach(c=>{ if(rename[c.by]) c.by = rename[c.by]; });
    });
    DB.inboxes.forEach(x=>{ if(rename[x.to]) x.to = rename[x.to]; if(rename[x.from]) x.from = rename[x.from]; });
  }
  DB.settings.schoolYear = newYear;
  return { up, alumni };
}
function renderMurid(){
  const m = me();
  if(!m || m.role!=="admin") return;
  $("#yearLabel").textContent = DB.settings.schoolYear || "—";
  const all = DB.users.filter(u=>u.role==="murid").sort((a,b)=>(a.status!==b.status?(a.status==="aktif"?-1:1):(a.kelas||"").localeCompare(b.kelas||"")||a.name.localeCompare(b.name)));
  const list = muridQ ? all.filter(u=>[u.name,u.u,u.kelas].join(" ").toLowerCase().includes(muridQ)) : all;
  $("#muridCount").textContent = `${all.filter(u=>u.status==="aktif").length} aktif`;
  $("#muridBody").innerHTML = list.map(u=>`
    <tr>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${u.status==="Alumni"?`<span class="alumni-tag">Alumni</span>`:`<span class="kelas-pill">${esc(u.kelas)}</span>`}</td>
      <td><code>${esc(u.u)}</code></td>
      <td class="muted small">pw: <code>${esc(u.p)}</code></td>
      <td><span class="row-actions">
        <button class="chip-btn" data-resetpw="${esc(u.u)}"><svg class="ic"><use href="#i-key"/></svg>Reset</button>
        ${u.status!=="Alumni"?`<button class="chip-btn" data-promote="${esc(u.u)}" title="Naikkan jadi admin"><svg class="ic"><use href="#i-shield"/></svg>Admin</button>`:""}
        <button class="chip-btn danger" data-delmurid="${esc(u.u)}"><svg class="ic"><use href="#i-trash"/></svg></button>
      </span></td>
    </tr>`).join("") || `<tr><td colspan="5" class="muted">Tidak ada murid cocok.</td></tr>`;
  $$("#muridBody [data-resetpw]").forEach(b=>b.addEventListener("click", ()=>{
    const u = getUser(b.dataset.resetpw); if(!u) return;
    u.p = firstName(u.name).toLowerCase();
    saveDb(); renderMurid();
    toast(`Password ${u.name} di-reset ke: ${u.p}`, "ok");
  }));
  $$("#muridBody [data-promote]").forEach(b=>b.addEventListener("click", ()=>{
    const u = getUser(b.dataset.promote); if(!u || u.role!=="murid") return;
    if(!confirm(`Naikkan ${u.name} menjadi ADMIN? Ia langsung dapat semua akses admin.`)) return;
    u.role = "admin"; u.kelas = ""; u.status = "aktif";
    saveDb(); renderMurid(); renderBadges();
    toast(`${u.name} sekarang admin.`, "ok");
  }));
  $$("#muridBody [data-delmurid]").forEach(b=>b.addEventListener("click", ()=>{
    const u = getUser(b.dataset.delmurid); if(!u) return;
    if(!confirm(`Hapus akun ${u.name} (${u.u})? Karya mereka tetap tersimpan.`)) return;
    DB.users = DB.users.filter(x=>x.u!==u.u);
    saveDb(); renderMurid();
    toast("Akun murid dihapus.", "ok");
  }));
}

/* ----- akun ----- */
function bindAkun(){
  $("#btnSaveNick").addEventListener("click", ()=>{
    const m = me(); if(!m){ toast("Login dulu.", "bad"); return; }
    const v = $("#setNick").value.trim().slice(0, m.role==="guest"?20:40);
    if(!v){ toast("Nama panggilan tidak boleh kosong.", "bad"); return; }
    if(m.role==="guest"){
      const s = getSession(); s.nick = v; setSession(s);
      $("#profileName").textContent = v;
      renderThreads();
      toast("Nama panggilan disimpan di perangkat ini.", "ok");
      return;
    }
    const u = getUser(m.u); u.nick = v;
    saveDb(); $("#profileName").textContent = displayName(u);
    toast("Nama panggilan disimpan.", "ok");
  });
  $("#btnChangePw").addEventListener("click", ()=>{
    const m = me(); if(!m || m.role==="guest"){ toast("Guest tidak punya password.", "bad"); return; }
    const u = getUser(m.u);
    const oldOk = u.role==="admin" ? ($("#pwOld").value===u.p) : (String($("#pwOld").value).toLowerCase()===String(u.p).toLowerCase());
    if(!oldOk){ toast("Password lama salah.", "bad"); return; }
    const nw = $("#pwNew").value;
    if(nw.length < 4){ toast("Password baru min 4 karakter.", "bad"); return; }
    u.p = u.role==="admin" ? nw : nw.toLowerCase();
    saveDb(); $("#pwOld").value=""; $("#pwNew").value="";
    toast("Password diganti. Jangan bagikan ke siapa pun.", "ok");
  });
  $("#btnGuideToggle").addEventListener("click", ()=>{
    DB.settings.guideOn = !DB.settings.guideOn;
    saveDb(); renderAkun();
  });
  renderJoin();
  $("#btnSaveWa").addEventListener("click", ()=>{
    const m = me();
    if(!m || m.role!=="admin"){ toast("Hanya admin.", "bad"); return; }
    const n = $("#setWa").value.replace(/\D/g,"");
    if(n.length < 9){ toast("Nomor WhatsApp tidak valid.", "bad"); return; }
    DB.settings.waNumber = n;
    DB.settings.waMsg = $("#setWaMsg").value.trim();
    saveDb(); renderJoin(); toast("Kontak WhatsApp disimpan.", "ok");
  });
  $("#btnResetDb").addEventListener("click", ()=>{
    if(!confirm("Reset SEMUA data ke bawaan? Upload, akun tambahan & inbox akan hilang.")) return;
    DB = seedDb(); saveDb(); renderAll(); renderMine();
    toast("Database di-reset.", "ok");
  });
  $("#btnExportDb").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(DB,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "multimedia-eskul-db.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
  });
  $("#btnImportDb").addEventListener("click", ()=>$("#importFile").click());
  $("#importFile").addEventListener("change", ()=>{
    const f = $("#importFile").files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{
      try{
        const data = JSON.parse(String(r.result||""));
        if(!data || data.v!==3 || !Array.isArray(data.kreas) || !Array.isArray(data.users)) throw 0;
        data.settings ||= { waNumber:"", waMsg:"", schoolYear:"", guideOn:true };
        data.searches ||= [];
        DB = data;
        if(!saveDb()) return;
        renderAll(); renderMine();
        toast("Database berhasil di-import.", "ok");
      }catch{ toast("File backup tidak valid.", "bad"); }
      $("#importFile").value = "";
    };
    r.readAsText(f);
  });
}
function renderAkun(){
  const m = me(); if(!m) return;
  $("#akunRole").textContent = m.role==="admin" ? "ADMIN" : m.role==="murid" ? ("MURID " + (m.kelas||"") + (m.status==="Alumni"?" • ALUMNI":"")) : "GUEST • PERANGKAT INI";
  $("#setNick").value = m.nick||"";
  $("#setNick").disabled = false;
  $("#setNick").maxLength = m.role==="guest" ? 20 : 40;
  $("#pwPanel").hidden = m.role==="guest";
  $("#btnGuideToggle").textContent = DB.settings.guideOn ? "Matikan" : "Nyalakan";
  const s = getSession();
  $("#settingSession").textContent = `${displayName(m)} (${m.role}) — login ${s?fmtDate(s.loginAt):"—"}`;
  const isAdmin = m.role==="admin";
  $("#adminWaPanel").hidden = !isAdmin;
  $("#adminDbPanel").hidden = !isAdmin;
  if(isAdmin){
    $("#setWa").value = DB.settings.waNumber||"";
    $("#setWaMsg").value = DB.settings.waMsg||"";
  }
}
function renderJoin(){
  const n = DB.settings.waNumber||"";
  $("#joinWaLabel").textContent = n ? `Join via WhatsApp (${n})` : "Join via WhatsApp";
}

/* ----- reveal on scroll ----- */
function observeReveals(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }), {threshold:.12});
  $$(".reveal").forEach(el=>io.observe(el));
}
