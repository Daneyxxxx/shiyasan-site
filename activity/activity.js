/* Shiya-san Activity (runs inside Discord): profile with animated rank border, game history, rank ladder, leaderboards.
   It shows the same data as the bot's messages and the website: it reads the files the bot publishes. */
(()=>{"use strict";
const C=window.SHIYA||{},FX=window.SHIYA_FX,q=new URLSearchParams(location.search),DEMO=q.has("demo"),IN=q.has("frame_id");
const $=s=>document.querySelector(s),el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const U=p=>IN?"/.proxy/"+p:"../"+p,nf=n=>Number(n||0).toLocaleString(),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ago=t=>{const s=Math.max(0,Date.now()/1000-t);return s<60?"just now":s<3600?Math.floor(s/60)+"m ago":s<86400?Math.floor(s/3600)+"h ago":Math.floor(s/86400)+"d ago"};
const S={t0:Date.now(),sdk:null,rp:false,ek:"",tab:"home",me:null,hist:[],avatar:"",lb:"rank",busy:false},root=$("#a-main"),nav=$("#a-nav"),foot=$("#a-st");
const say=(t,bad)=>{foot.textContent=t||"";foot.className="a-st"+(bad?" bad":"")};
const lsGet=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(x=>x.toString(16).padStart(2,"0")).join("");
const getj=async u=>{const r=await fetch(u+(u.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error(r.status);return r.json()};
const lv=r=>FX?FX.lv(r):0,ring=(n,l)=>FX?FX.ring(n,l):n;

/* ---------- logging in with Discord (the bot swaps Discord's one-time code for a login, same bridge as the website) ---------- */
function mini(){return new Promise((res,rej)=>{        // tiny stand-in for Discord's SDK handshake, used only if the SDK can't load
  const src=window.parent.opener||window.parent,org=document.referrer||"*",nonce=crypto.randomUUID();let t;
  const on=e=>{const d=e.data;if(!Array.isArray(d)||d[0]!==1||!d[1])return;const p=d[1];
    if(p.evt==="READY")src.postMessage([1,{cmd:"AUTHORIZE",args:{client_id:C.clientId,response_type:"code",state:"",prompt:"none",scope:["identify","rpc.activities.write"]},nonce}],org);
    else if(p.nonce===nonce){removeEventListener("message",on);clearTimeout(t);p.evt==="ERROR"?rej(new Error("Discord declined the login")):res(p.data.code)}};
  addEventListener("message",on);src.postMessage([0,{v:1,encoding:"json",client_id:C.clientId,frame_id:q.get("frame_id")}],org);
  t=setTimeout(()=>{removeEventListener("message",on);rej(new Error("Discord didn’t answer"))},15000)})}
async function getCode(){
  let sdk=null;try{const m=await import("/.proxy/cdn/npm/@discord/embedded-app-sdk@1/+esm");sdk=new m.DiscordSDK(C.clientId);await sdk.ready()}catch(e){sdk=null}
  if(sdk){S.sdk=sdk;const r=await sdk.commands.authorize({client_id:C.clientId,response_type:"code",state:"",prompt:"none",scope:["identify","rpc.activities.write"]});return r.code}
  return mini()}
async function readAcct(fid){
  if(C.ghRepo){try{const r=await fetch((IN?"/.proxy/gh":"https://api.github.com")+"/repos/"+C.ghRepo+"/contents/data/ac/"+fid+".json?ref="+(C.ghBranch||"main"),{headers:{Accept:"application/vnd.github.raw+json"},cache:"no-cache"});
    if(r.ok)return await r.json();if(r.status===404)return null}catch(e){}}
  try{return await getj(U("data/ac/"+fid+".json"))}catch(e){return null}}
async function login(){
  say("Connecting to Discord…");const code=await getCode();
  say("Signing you in…");const st=await getj(U("data/status.json")),hook=st.ahook||"";
  if(!/^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\//.test(hook))throw new Error("The bot isn’t taking website logins yet");
  let fid=lsGet("shiya_act_fid","");if(!/^[0-9a-f]{32}$/.test(fid)){fid=hex(16);lsSet("shiya_act_fid",fid)}
  S.ek=hex(32);const n=hex(8),pl={v:1,k:fid,n,ts:Math.floor(Date.now()/1000),a:"act_login",code,ek:S.ek},b=btoa(unescape(encodeURIComponent(JSON.stringify(pl)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),fd=new FormData();
  fd.append("payload_json",JSON.stringify({content:"WA1|"+b,username:"Shiya Activity",allowed_mentions:{parse:[]}}));
  await fetch(hook,{method:"POST",body:fd,mode:"no-cors"});
  say("Waiting for Shiya-san…");
  for(let i=0;i<40;i++){await sleep(2500);const a=await readAcct(fid);
    if(a&&a.last&&a.last.n===n){if(!a.last.ok)throw new Error(a.last.msg||"Login failed");return a}
    if(a&&a.gone)throw new Error("Login was replaced by another device. Try again")}
  throw new Error("Shiya-san didn’t answer in time")}

/* ---------- Rich Presence: shows on your Discord profile while the Activity is open ---------- */
async function unseal(keyHex,enc){          // the bot hands over the login token sealed with a one-time key that only this screen knows
  const te=new TextEncoder(),imp=r=>crypto.subtle.importKey("raw",r,{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]),H=(k,m)=>crypto.subtle.sign("HMAC",k,m),
    root=await imp(Uint8Array.from(keyHex.match(/../g).map(x=>parseInt(x,16)))),ke=await imp(await H(root,te.encode("enc"))),km=await imp(await H(root,te.encode("mac"))),
    b=Uint8Array.from(atob(enc.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)),iv=b.slice(0,12),tag=b.slice(12,44),ct=b.slice(44),body=new Uint8Array(12+ct.length);
  body.set(iv);body.set(ct,12);if(!await crypto.subtle.verify("HMAC",km,tag,body))throw new Error("bad seal");
  const blocks=await Promise.all(Array.from({length:Math.ceil(ct.length/32)},(_,i)=>{const m=new Uint8Array(16);m.set(iv);new DataView(m.buffer).setUint32(12,i);return H(ke,m)})),pt=new Uint8Array(ct.length);
  blocks.forEach((bl,i)=>{const k=new Uint8Array(bl);for(let j=0;j<32&&i*32+j<ct.length;j++)pt[i*32+j]=ct[i*32+j]^k[j]});
  return JSON.parse(new TextDecoder().decode(pt))}
async function enablePresence(a){
  if(!S.sdk||!a.act||!a.act.tok)return;
  try{const t=(await unseal(S.ek,a.act.tok)).t;await S.sdk.commands.authenticate({access_token:t});S.rp=true;setPresence()}catch(e){}}
let pt=0;
function setPresence(){
  if(!S.rp||!S.me)return;clearTimeout(pt);
  pt=setTimeout(()=>{const m=S.me,what={home:"Checking their profile",hist:"Reading their game history",ranks:"Browsing the rank ladder",top:"Checking the leaderboards"}[S.tab];
    S.sdk.commands.setActivity({activity:{type:0,details:(m.rank||"Unranked")+" · ★"+(m.stars||0),state:what,timestamps:{start:S.t0}}}).catch(()=>{})},700)}

/* ---------- screens ---------- */
function stat(k,v){const t=el("div","a-tile");t.append(el("small","",k),el("b","",v));return t}
function card(title){const c=el("section","a-card");c.append(el("h2","",title));return c}
function pic(name,url){const ini=(name||"?")[0].toUpperCase();if(!url)return el("span","av",ini);const i=Object.assign(el("img","av"),{src:url,alt:"",referrerPolicy:"no-referrer"});i.onerror=()=>i.replaceWith(el("span","av",ini));return i}
function home(){
  const m=S.me,l=lv(m.rank),R=FX&&l?FX.ranks[l-1]:null,w=el("div","a-v"),hero=el("section","a-hero"),pill=el("div","a-pill",(R?R[1]+" ":"")+(m.rank||"Unranked"));
  hero.style.setProperty("--c",R?R[2]:"#8fe3b8");pill.style.setProperty("--c",R?R[2]:"#8fe3b8");
  const sub=el("p","a-sub");sub.append("★ ",el("b","",nf(m.stars)+" stars"));if(FX&&l)sub.append(" · Border: ",el("b","",FX.bn[l-1]));
  hero.append(ring(pic(m.name,S.avatar),l),el("h1","",m.name||"Player"),pill,sub);
  const g=el("div","a-grid"),wr=m.games?Math.round(m.wins*1000/m.games)/10:0;
  g.append(stat("Games",nf(m.games)),stat("Wins",nf(m.wins)),stat("Win rate",wr+"%"),stat("Ranked games",nf(m.ranked)));
  const play=card("Jump into a match"),ul=el("ul","a-list");
  [["Truth or Lie","/torlclassic","Classic match"],["Truth or Lie Ranked","/torlranked","Climb the ladder"],["Cup Game","/cupgame","Classic match"],["Cup Game Ranked","/cupgameranked","Climb the ladder"],["Cross-server Ranked","/torlcrossranked","Play other servers"],["Daily reward","/daily","Claim your points"]].forEach(([n,c,d])=>{
    const li=el("li","a-row"),b=el("div");b.append(el("b","",n),el("small","",d));li.append(b,el("span","a-cmd",c));ul.append(li)});
  play.append(ul);if(m.best)w.dataset.best=m.best;
  const best=el("p","a-sub","Best rank so far: "+(m.best||"–"));
  w.append(hero,g,play,best);return w}
function history(){
  const w=el("div","a-v"),c=card("Recent games");
  if(!S.hist.length){c.append(el("p","a-note","No games yet. Play a match and it shows up here."));w.append(c);return w}
  const ul=el("ul","a-list");S.hist.forEach(h=>{const k=(h.res||"").toLowerCase(),li=el("li","a-row "+(k==="win"||k==="loss"||k==="draw"?k:"")),b=el("div"),
    s=el("small","",[h.vs?"vs "+h.vs:"",h.detail||"",h.score?"Score "+h.score:"",h.ts?ago(h.ts):""].filter(Boolean).join(" · "));
    b.append(el("b","",h.mode||"Match"),s);li.append(b,el("span","a-res",h.res||"?"));ul.append(li)});
  c.append(ul);w.append(c);return w}
function ranks(){
  const w=el("div","a-v"),c=card("Rank ladder"),ul=el("ul","a-list"),mine=lv(S.me&&S.me.rank);
  (FX?FX.ranks:[]).forEach((r,i)=>{const li=el("li","a-row a-rk"+(mine===i+1?" me":"")),b=el("div"),p=el("span","av",r[1]);li.style.setProperty("--c",r[2]);
    b.append(el("b","",r[0]),el("small","","Border: "+FX.bn[i]));li.append(ring(p,i+1),b);if(mine===i+1)li.append(el("span","a-you","You"));ul.append(li)});
  c.append(ul);w.append(c);return w}
function top(){
  const w=el("div","a-v"),c=card("Leaderboards"),seg=el("div","a-seg"),box=el("ul","a-list");
  [["rank","Rank"],["points","Points"],["perf","Performance"],["score","Score"]].forEach(([k,t])=>{const b=el("button",k===S.lb?"on":"",t);b.type="button";b.onclick=()=>{S.lb=k;render()};seg.append(b)});
  c.append(seg,box);w.append(c);box.append(el("li","a-note","Loading…"));
  (DEMO?Promise.resolve(DEMO_LB):getj(U("data/lb-"+S.lb+".json"))).then(d=>{const rows=(d.rows||[]).slice(0,10);
    box.replaceChildren(...(rows.length?rows.map((r,i)=>{const li=el("li","a-row"+(i<3?" a-podium":"")+(S.me&&r.h&&r.h===S.me.h?" me":"")),b=el("div");
      b.append(el("b","",r.name||"Player"),el("small","",r.sub||""));li.append(el("span","a-pos","#"+(i+1)),b,el("span","a-vl",r.value==null?"":String(r.value)));return li}):[el("li","a-note","No players here yet.")]))
  }).catch(()=>box.replaceChildren(el("li","a-note","Couldn’t load the leaderboard. Try again soon.")));
  return w}
const TABS=[["home","🏠","Home",home],["hist","🕘","History",history],["ranks","🏆","Ranks",ranks],["top","📊","Top",top]];
function render(){
  nav.replaceChildren(...TABS.map(([k,i,t])=>{const b=el("button",k===S.tab?"on":"");b.type="button";b.setAttribute("role","tab");b.setAttribute("aria-selected",k===S.tab);b.append(el("span","",i),t);b.onclick=()=>{S.tab=k;render();scrollTo(0,0)};return b}));
  if(!S.me){return}
  root.replaceChildren(TABS.find(t=>t[0]===S.tab)[3]());setPresence()}
function fail(e){say("");nav.replaceChildren();const b=el("button","btn",IN?"Try again":"Reload");b.type="button";b.onclick=()=>location.reload();b.className="btn a-retry";
  root.replaceChildren(el("p","a-note",(e&&e.message)||"Something went wrong."),b)}

/* ---------- start ---------- */
const DEMO_ME={name:"Mitsuka",rank:"Striker",stars:3,best:"Striker",games:128,wins:77,ranked:61,h:"demo"};
const DEMO_LB={rows:[{name:"Mitsuka",value:"Striker ★3",sub:"61 ranked",h:"demo"},{name:"Pip",value:"Logic Newbie ★5",sub:"40 ranked"},{name:"Nori",value:"Starter ★2",sub:"22 ranked"}]};
async function start(){
  if(DEMO){S.me=DEMO_ME;S.hist=[{res:"Win",mode:"Truth or Lie Ranked",score:"3-1",vs:"Pip",detail:"Best of 3",ts:Date.now()/1000-600},{res:"Loss",mode:"Cup Game Ranked",score:"1-2",vs:"Nori",ts:Date.now()/1000-7200},{res:"Draw",mode:"Truth or Lie",score:"2-2",vs:"Kai",ts:Date.now()/1000-90000}];render();return}
  if(!IN){root.replaceChildren(el("p","a-note","Open this from Discord: join a voice channel or DM and pick the Shiya-san Activity."));return}
  try{const a=await login();S.me=a.me||{};S.hist=a.hist||[];say("");render();enablePresence(a);
    try{const h=S.me.h;if(h){const p=(await getj(U("data/pf/"+h[0]+".json")))[h];if(p&&p.avatar){S.avatar=p.avatar;render()}}}catch(e){}}
  catch(e){fail(e)}}
render();start();
})();
