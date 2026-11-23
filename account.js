/* Shiya-san account: Discord login, bottom capsule, editable player card, shop, activity.
   Uses helpers from app.js ($, el, jget, nf, ago, profile, C). Text is always set with textContent. */
(()=>{
"use strict";
const API="https://discord.com/api/v10",HOOK_RE=/^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\//;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const sget=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  sset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},sdel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(x=>x.toString(16).padStart(2,"0")).join("");
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,"0")).join("");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const anim=(e,k,o)=>(reduce||!e.animate)?{finished:Promise.resolve()}:e.animate(k,o);
const EASE="cubic-bezier(.2,.8,.2,1)";
let memIk="";const ik=()=>{try{let v=localStorage.getItem("shiya_ik");if(!/^[0-9a-f]{32}$/.test(v||"")){v=hex(16);localStorage.setItem("shiya_ik",v)}return v}catch(e){return memIk=memIk||hex(16)}};
const S={auth:null,h:"",p:null,acct:null,shop:null,hook:"",fid:"",tab:"card",open:false,busy:false,q:{},draft:null,pulled:0,syncing:false,failed:false};
const ui={},loginBtn=$("#login"),cur=location.pathname.split("/").pop()||"index.html";
function welcome(a){const w=el("div","welcome"),k=el("div","w-card"),t=el("div","w-t"),v=a.av?Object.assign(el("img","w-av"),{src:"https://cdn.discordapp.com/avatars/"+a.id+"/"+a.av+".png?size=128",alt:""}):el("span","w-av","♡");
 t.append(el("small","","Logged in ✓"),el("b","","Welcome, "+a.un+"!"));k.append(v,t);w.append(k);
 if(!reduce)for(let i=0;i<10;i++){const h=el("span","w-h","♡");h.style.cssText="--x:"+Math.round(Math.random()*240-120)+"px;--r:"+Math.round(Math.random()*60-30)+"deg;left:"+(35+Math.random()*30)+"%;animation-delay:"+(.2+i*.12)+"s";w.append(h)}
 w.onclick=()=>w.remove();document.body.append(w);setTimeout(()=>w.remove(),3500)}

/* ---------- login (Discord implicit grant: the site never sees a password, and needs no server) ---------- */
const redirect=()=>location.origin+location.pathname.replace(/[^\/]*$/,"");
loginBtn.onclick=()=>{if(!C.clientId){alert("Login isn't set up yet: add clientId in config.js.");return}
  const st=hex(16);sset("shiya_st",st);sset("shiya_back",cur);
  location.assign("https://discord.com/oauth2/authorize?"+new URLSearchParams({client_id:C.clientId,response_type:"token",redirect_uri:redirect(),scope:"identify",state:st}))};
function takeHash(){if(!/access_token=|error=/.test(location.hash))return null;
  const q=new URLSearchParams(location.hash.slice(1));history.replaceState(null,"",location.pathname+location.search);   // token leaves the address bar at once
  const ok=q.get("access_token")&&q.get("state")&&q.get("state")===sget("shiya_st");sdel("shiya_st");
  return ok?{t:q.get("access_token"),exp:Date.now()+Math.min(+q.get("expires_in")||0,604800)*1000}:null}
async function loadMe(a){const r=await fetch(API+"/users/@me",{headers:{Authorization:"Bearer "+a.t}});if(!r.ok)throw new Error("auth");
  const u=await r.json();return{t:a.t,exp:a.exp,id:String(u.id),un:u.global_name||u.username||"Player",av:u.avatar||""}}
function logout(){sdel("shiya_auth");sdel("shiya_seen");try{localStorage.removeItem("shiya_ik")}catch(e){}memIk="";
  const done=()=>{if(ui.root)ui.root.remove();ui.scrim&&ui.scrim.remove();document.documentElement.classList.remove("acopen");document.body.classList.remove("hasacct");
    Object.keys(ui).forEach(k=>delete ui[k]);Object.assign(S,{auth:null,p:null,acct:null,open:false,tab:"card",draft:null,failed:false});loginBtn.hidden=false};
  if(ui.root){anim(ui.root,[{opacity:1,transform:"translate(-50%,0)"},{opacity:0,transform:"translate(-50%,90px)"}],{duration:300,easing:"ease-in",fill:"forwards"}).finished.then(done,done)}else done()}

/* ---------- small helpers ---------- */
const clean=s=>String(s||"").split(/\s+/).filter(Boolean).join(" ");
const nameErr=v=>v.length<2||v.length>20?"2 to 20 characters.":/[@<>`]/.test(v)||/[\u0000-\u001f]/.test(v)?"No @ < > or backticks.":"";
const gname=()=>(S.p&&S.p.name)||(S.auth&&S.auth.un)||"Player";
const rankTxt=()=>{const p=S.p;if(!p)return"No ranked profile yet";const n=p.lb&&p.lb[0];return p.rank+(n?" · #"+n:" · Unranked")};
const avUrl=()=>{if(S.p&&S.p.avatar)return S.p.avatar;const a=S.auth;if(!a)return"";
  return a.av?"https://cdn.discordapp.com/avatars/"+a.id+"/"+a.av+".png?size=128":"https://cdn.discordapp.com/embed/avatars/"+Number((BigInt(a.id)>>22n)%6n)+".png"};
function avatar(c){const u=avUrl(),f=()=>el("span",c,gname()[0].toUpperCase());if(!u)return f();
  const i=Object.assign(el("img",c),{src:u,alt:"",referrerPolicy:"no-referrer"});i.onerror=()=>i.replaceWith(f());return i}
const pts=()=>S.acct?S.acct.pts:(S.p?S.p.points:0);
const taxOf=b=>{const t=S.acct&&S.acct.tax||0;return t>0?Math.floor(b*t/100+.5):0};

/* ---------- talking to the bot: a message through the bot's webhook, checked with Discord by the bot ---------- */
async function send(a,args){const n=hex(8),pl=Object.assign({v:1,k:S.fid,t:S.auth.t,a,n,ts:Math.floor(Date.now()/1000)},args||{});
  const b=btoa(unescape(encodeURIComponent(JSON.stringify(pl)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const fd=new FormData();fd.append("payload_json",JSON.stringify({content:"WA1|"+b,username:"Shiya Web",allowed_mentions:{parse:[]}}));
  await fetch(S.hook,{method:"POST",body:fd,mode:"no-cors"});return n}
async function pull(){const f=S.fid;let t=null;
  if(C.ghRepo){try{const r=await fetch("https://api.github.com/repos/"+C.ghRepo+"/contents/"+"data"+"/ac/"+f+".json?ref="+encodeURIComponent(C.ghBranch||"main"),
    {headers:{Accept:"application/vnd.github.raw+json"},cache:"no-cache"});if(r.ok)t=await r.json();else if(r.status===404)return null}catch(e){}}
  if(!t){try{t=await jget((C.static||"data")+"/ac/"+f+".json")}catch(e){return null}}
  if(t&&typeof t==="object"&&typeof t.pts==="number"){S.pulled=Date.now();return t}return null}
async function waitFor(n){const gap=C.ghRepo?2500:6000;
  for(let i=0;i<Math.round(110000/gap);i++){await sleep(gap);const a=await pull();
    if(a){S.acct=a;if(a.last&&a.last.n===n)return a.last}}return null}
async function act(a,args){if(S.busy)return;S.busy=true;busy("Sending…");
  try{const n=await send(a,args);busy("Waiting for Shiya-san…");const r=await waitFor(n);
    note(r?r.msg:"No answer yet. If it went through, it will show up soon.",r?(r.ok?"ok":"err"):"err");if(r&&r.ok)S.draft=null}
  catch(e){note("Couldn't send that. Check your connection.","err")}
  S.busy=false;busy(false);paint()}
async function sync(){if(S.syncing)return;S.syncing=true;S.failed=false;paint();
  try{const d=await jget((C.static||"data")+"/status.json");S.hook=HOOK_RE.test(d.ahook||"")?d.ahook:""}catch(e){S.hook=""}
  S.fid=(await sha(ik())).slice(0,32);S.acct=await pull();
  if(!S.acct&&S.hook){try{await send("hello");for(let i=0;i<22&&!S.acct;i++){await sleep(i<6?2500:6000);S.acct=await pull()}}catch(e){}}
  S.failed=!S.acct;S.syncing=false;paint()}
function loadShop(){jget((C.static||"data")+"/shop.json").then(d=>{S.shop=d;paint()},()=>{S.shop={items:[]}})}

/* ---------- capsule ---------- */
function build(){
  const root=ui.root=el("div","acap"),box=ui.box=el("div","acbox"),bar=ui.bar=el("button","acbar"),tx=el("span","tx");
  root.id="acct";bar.type="button";bar.setAttribute("aria-expanded","false");bar.setAttribute("aria-label","Open your player card");
  ui.an=el("b","an");ui.ar=el("small","ar");tx.append(ui.an,ui.ar);ui.avs=el("span","avs");bar.append(ui.avs,tx,el("i","chev"));
  const body=ui.body=el("div","acbody"),tabs=ui.tabs=el("div","actabs");tabs.setAttribute("role","tablist");
  [["card","Card"],["shop","Shop"],["act","Activity"]].forEach(([k,t])=>{const b=el("button","actab",t);b.type="button";b.dataset.t=k;b.setAttribute("role","tab");b.onclick=()=>setTab(k);tabs.append(b)});
  ui.note=el("p","acnote");ui.note.hidden=true;ui.note.setAttribute("aria-live","polite");ui.bar2=el("i","acbusy");
  ui.pn=el("div","acpanes");const foot=el("div","acfoot"),out=el("button","btn ghost sm","Log out");out.type="button";out.onclick=logout;
  ui.who=el("small","muted");foot.append(ui.who,out);body.append(tabs,ui.note,ui.pn,foot);box.append(bar,ui.bar2,body);root.append(box);
  ui.scrim=el("div","acscrim");ui.scrim.onclick=()=>toggle(false);bar.onclick=()=>toggle(!S.open);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&S.open)toggle(false)});
  document.body.append(ui.scrim,root);document.body.classList.add("hasacct");
  anim(root,[{opacity:0,transform:"translate(-50%,90px)"},{opacity:1,transform:"translate(-50%,0)"}],{duration:520,easing:EASE})}
function toggle(on){if(on===S.open||ui.moving)return;ui.moving=true;const {root,box,body,bar,scrim}=ui;
  if(on){const w0=root.offsetWidth,h0=box.offsetHeight;S.open=true;root.classList.add("open");bar.setAttribute("aria-expanded","true");
    document.documentElement.classList.add("acopen");scrim.classList.add("on");paint();
    const w1=root.offsetWidth,h1=box.offsetHeight;
    anim(root,[{width:w0+"px"},{width:w1+"px"}],{duration:460,easing:EASE});
    anim(box,[{height:h0+"px",borderRadius:"999px"},{height:h1+"px",borderRadius:"26px"}],{duration:460,easing:EASE});
    anim(body,[{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{duration:340,delay:150,easing:"ease-out",fill:"backwards"}).finished.then(()=>ui.moving=false,()=>ui.moving=false);
    if(S.acct&&!S.busy&&Date.now()-S.pulled>120000)pull().then(a=>{if(a){S.acct=a;paint()}});
    if(S.tab==="act")seen()}
  else{const h1=box.offsetHeight,w1=root.offsetWidth;
    anim(body,[{opacity:1},{opacity:0,transform:"translateY(8px)"}],{duration:150,easing:"ease-in",fill:"forwards"}).finished.then(()=>{
      S.open=false;root.classList.remove("open");bar.setAttribute("aria-expanded","false");scrim.classList.remove("on");document.documentElement.classList.remove("acopen");
      const w0=root.offsetWidth,h0=box.offsetHeight;
      anim(root,[{width:w1+"px"},{width:w0+"px"}],{duration:380,easing:EASE});
      anim(box,[{height:h1+"px",borderRadius:"26px"},{height:h0+"px",borderRadius:"999px"}],{duration:380,easing:EASE}).finished.then(()=>ui.moving=false,()=>ui.moving=false)},()=>ui.moving=false)}}
function setTab(t){if(t===S.tab)return;const box=ui.box,h0=box.offsetHeight;S.tab=t;paint();
  if(t==="act")seen();const h1=box.offsetHeight;
  if(h0!==h1)anim(box,[{height:h0+"px"},{height:h1+"px"}],{duration:300,easing:EASE});
  anim(ui.pn,[{opacity:0,transform:"translateX("+(t==="card"?-16:16)+"px)"},{opacity:1,transform:"none"}],{duration:280,easing:EASE})}
const seen=()=>{const a=S.acct&&S.acct.notes&&S.acct.notes[0];if(a)sset("shiya_seen",a.ts);paintTabs()};
function busy(t){ui.box.classList.toggle("busy",!!t);if(t)note(t,"info")}
let nt=0;function note(t,k){const n=ui.note;if(!n)return;clearTimeout(nt);n.textContent=t;n.className="acnote "+k;n.hidden=false;
  anim(n,[{opacity:0,transform:"translateY(-6px)"},{opacity:1,transform:"none"}],{duration:240,easing:EASE});
  if(k!=="info")nt=setTimeout(()=>{n.hidden=true},7000)}

/* ---------- painting ---------- */
function paintTabs(){const unread=S.acct&&S.acct.notes&&S.acct.notes[0]&&S.acct.notes[0].ts>(sget("shiya_seen")||0)&&S.tab!=="act";
  ui.tabs.querySelectorAll(".actab").forEach(b=>{b.classList.toggle("on",b.dataset.t===S.tab);b.setAttribute("aria-selected",b.dataset.t===S.tab);b.classList.toggle("dot",b.dataset.t==="act"&&!!unread)})}
function paint(){if(!ui.root)return;
  ui.an.textContent=gname();ui.ar.textContent=rankTxt();ui.avs.replaceChildren(avatar("av"));ui.who.textContent="Signed in as "+S.auth.un;paintTabs();
  const keep=ui.pn.firstElementChild&&ui.pn.dataset.t===S.tab?ui.pn.scrollTop:0;
  ui.pn.dataset.t=S.tab;ui.pn.replaceChildren(S.tab==="card"?cardPane():S.tab==="shop"?shopPane():actPane());ui.body.scrollTop=keep}
const state=()=>S.syncing?"Syncing your account…":S.failed?(S.hook?"Shiya-san hasn't answered yet. The bot may be asleep.":"Account tools aren't switched on yet."):"";
function cardPane(){const p=S.p,a=S.acct,w=el("div","pn"),id=el("div","acid"),d=el("div"),tg=el("div","tags");
  d.append(el("h3","",gname()));if(p&&p.title)tg.append(el("span","tag",p.title));tg.append(el("span","tag",rankTxt()));d.append(tg);id.append(avatar("av big"),d);w.append(id);
  /* name editor: only usable with a Rename Card */
  const f=el("div","acname"),lab=el("label","","In-game name"),row=el("div","ed"),inp=el("input"),sv=el("button","btn sm","Save"),msg=el("p","hint"),
    can=!!(a&&a.rc>0&&S.hook&&!S.busy);lab.htmlFor=inp.id="ac-nm";inp.maxLength=20;inp.autocomplete="off";inp.spellcheck=false;inp.value=S.draft!==null?S.draft:gname();inp.disabled=!can;sv.type="button";
  const chk=()=>{const v=clean(inp.value),e=v===clean(gname())?"":nameErr(v);sv.disabled=!can||!v||v===clean(gname())||!!e;msg.className="hint"+(e?" bad":"");if(can)msg.textContent=e||"Uses 1 Rename Card ("+a.rc+" left). Your new name shows on Discord too."};
  inp.oninput=()=>{S.draft=inp.value;chk()};inp.onkeydown=e=>{if(e.key==="Enter"&&!sv.disabled)sv.click()};
  sv.onclick=()=>{const v=clean(inp.value);if(!sv.disabled)act("rename",{name:v})};row.append(inp,sv);f.append(lab,row,msg);
  if(!a||!S.hook)msg.textContent=state()||"Syncing your account…";else if(a.rc<1){msg.textContent="You need a Rename Card to change your name. ";const g=el("button","lnk","Get one in the Shop");g.type="button";g.onclick=()=>setTab("shop");msg.append(g)}else chk();
  w.append(f);
  if(p){const g=el("div","acstats");[["Rank",p.rank+", "+p.stars+" stars"],["Level",p.lvl&&p.lvl.length?"Lv "+p.lvl[0]:"-"],["ChuPoints",nf(pts())],["Win rate",p.win],["Games",nf(p.games)],
    ["Leaderboard","#"+(p.lb&&p.lb[0]||"–")+" · Points #"+(p.lb&&p.lb[1]||"–")]].forEach(([k,v])=>{const c=el("div");c.append(el("small","",k),el("b","",String(v)));g.append(c)});w.append(g)}
  else w.append(el("p","muted","No ranked profile yet. Play a match on Discord and you will show up here."));return w}
function shopPane(){const a=S.acct,w=el("div","pn"),top=el("div","wal"),it=S.shop&&S.shop.items;
  top.append(el("b","","💰 "+nf(pts())+" ChuPoints"));if(a&&a.tax>0)top.append(el("small","","+"+a.tax+"% tax"));w.append(top);
  if(!a||!S.hook){w.append(el("p","muted",state()||"Syncing your account…"));if(S.failed&&S.hook){const b=el("button","btn sm","Try again");b.type="button";b.onclick=sync;w.append(b)}return w}
  if(!it){w.append(el("p","muted","Loading the shop…"));return w}
  const list=el("div","acitems");it.forEach(i=>{const row=el("div","it"),tx=el("div","tx2"),own=a.inv&&a.inv[i.k]||0,ctl=el("div","ctl"),minus=el("button","qb","−"),plus=el("button","qb","+"),qn=el("b","qn"),buy=el("button","btn sm");
    minus.type=plus.type=buy.type="button";minus.setAttribute("aria-label","Less");plus.setAttribute("aria-label","More");S.q[i.k]=S.q[i.k]||1;
    tx.append(el("b","",i.n+(own?"  ×"+own:"")),el("small","",i.d));
    const upd=()=>{const q=S.q[i.k],base=i.p*q,tot=base+taxOf(base);qn.textContent=q;buy.textContent="Buy · "+nf(tot);
      buy.disabled=S.busy||tot>pts()||own+q>999;minus.disabled=q<=1;plus.disabled=q>=Math.min(99,999-own)};
    minus.onclick=()=>{S.q[i.k]--;upd()};plus.onclick=()=>{S.q[i.k]++;upd()};buy.onclick=()=>act("buy",{key:i.k,qty:S.q[i.k]});
    upd();ctl.append(minus,qn,plus,buy);row.append(el("span","em",i.e),tx,ctl);row.dataset.k=i.k;list.append(row)});
  w.append(list);return w}
function actPane(){const w=el("div","pn"),n=S.acct&&S.acct.notes||[];
  if(!S.acct){w.append(el("p","muted",state()||"Syncing your account…"));return w}
  if(!n.length){w.append(el("p","muted","Nothing yet. Purchases and name changes show up here."));return w}
  const l=el("ul","acact");n.forEach(x=>{const li=el("li");li.append(el("span","",x.t),el("small","",ago(x.ts)));l.append(li)});w.append(l);return w}

/* ---------- start ---------- */
(async()=>{let a=sget("shiya_auth");const t=takeHash();
  if(t){try{a=await loadMe(t);sset("shiya_auth",a);sset("shiya_welcome",1)}catch(e){a=null}}
  if(a&&a.exp<Date.now()){sdel("shiya_auth");a=null}
  if(!a)return;const bk=sget("shiya_back");sdel("shiya_back");if(t&&/^[a-z]+\.html$/.test(bk||"")&&bk!==cur){location.replace(bk);return}
  S.auth=a;loginBtn.hidden=true;S.h=(await sha(a.id)).slice(0,16);build();paint();if(sget("shiya_welcome")){sdel("shiya_welcome");welcome(a)}
  try{S.p=await profile(S.h)||null}catch(e){S.p=null}paint();loadShop();sync()})();
})();
