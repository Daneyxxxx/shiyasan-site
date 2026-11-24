const $=s=>document.querySelector(s)||document.createElement("input");let HOOK="";
document.querySelectorAll("[data-p]").forEach(e=>e.textContent=new URL(e.dataset.p.replace(/^\//,""),location.href).href);
const C=Object.assign({statusUrl:"",widgetGuildId:"",botName:"Shiya-san"},window.SHIYA||{});
const SAME=C.apiUrl==="same",A=SAME?"":(C.apiUrl||"").replace(/\/$/,""),ON=SAME||!!A||!!C.static;
async function st(){const p=$("#st"),t=$("#stt"),set=(c,x)=>{p.className="pill "+c;t.textContent=x};
try{if(C.static){const d=await jget(C.static+"/status.json");HOOK=/^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\//.test(d.hook||"")?d.hook:"";const fresh=d.online&&(Date.now()/1000-d.ts)<(C.maxAge||900);set(fresh?"on":"off",fresh?"Online, "+d.ping+" ms ping, "+d.servers+" servers":"Offline");return}const SU=C.statusUrl||(ON?A+"/api/status":"");if(SU){const d=await(await fetch(SU,{cache:"no-store"})).json();
set(d.online?"on":"wait",d.online?"Online, "+d.ping+" ms ping, "+d.servers+" servers":"Starting up…");return}
if(C.widgetGuildId){const d=await(await fetch("https://discord.com/api/guilds/"+C.widgetGuildId+"/widget.json",{cache:"no-store"})).json();
if(!d.members){set("wait","Turn on Server Widget to show status");return}
const n=C.botName.toLowerCase(),on=d.members.some(x=>(x.username||"").toLowerCase().includes(n));
if(!on&&d.presence_count>d.members.length){set("wait","Status unavailable");return}
set(on?"on":"off",on?"Online":"Offline");return}
set("wait","Status setup needed: add Server ID in config.js")}catch(e){set("off","Offline")}}st();setInterval(st,15000);
(()=>{const W=100,sl=[...document.querySelectorAll(".slot")],msg=$("#msg"),go=$("#go"),R=()=>Math.floor(Math.random()*3);
let pos=[0,1,2],ball=0,ph="idle",streak=0,best=0;
const place=()=>sl.forEach((s,i)=>s.style.transform="translateX("+pos[i]*W+"px)"),lift=(i,u)=>sl[i].classList.toggle("up",u),zz=ms=>new Promise(r=>setTimeout(r,ms));place();
go.onclick=async()=>{if(ph!=="idle")return;ph="busy";go.disabled=true;sl.forEach((s,i)=>{lift(i,false);s.classList.remove("has")});
ball=R();sl[ball].classList.add("has");msg.textContent="Watch the ball…";await zz(300);lift(ball,true);await zz(1000);lift(ball,false);await zz(500);msg.textContent="Shuffling…";
for(let n=0;n<7;n++){const a=R(),b=(a+1+Math.floor(Math.random()*2))%3;[pos[a],pos[b]]=[pos[b],pos[a]];place();await zz(420)}
ph="pick";msg.textContent="Which cup hides the ball?"};
sl.forEach((s,i)=>s.onclick=()=>{if(ph!=="pick")return;ph="idle";lift(i,true);const ok=i===ball;if(!ok)lift(ball,true);
streak=ok?streak+1:0;best=Math.max(best,streak);msg.textContent=ok?"Found it! Streak: "+streak:"Not that one. Streak reset.";
$("#best").textContent="Best streak "+best;go.disabled=false;go.textContent="Play again"})})();
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
async function jget(u){const r=await fetch(u+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error(r.status);return r.json()}
const nf=n=>Number(n||0).toLocaleString(),pos=x=>x?"#"+x:"–",ago=t=>{const s=Math.max(0,Date.now()/1000-t);return s<3600?Math.max(1,Math.round(s/60))+"m ago":s<86400?Math.round(s/3600)+"h ago":Math.round(s/86400)+"d ago"};
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const off="Not connected yet. The site owner still needs to add the data folder in config.js.";
let PL=null,PF={},CL=[],memV="";const LK=new Set(lsGet("shiya_liked",[])),LB=(o=>o&&typeof o==="object"&&!Array.isArray(o)?o:{})(lsGet("shiya_likebase",{}));
const players=async()=>PL=PL||(await jget(C.static+"/players.json")).players;
async function profile(h){const k=h[0];PF[k]=PF[k]||jget(C.static+"/pf/"+k+".json").catch(e=>{delete PF[k];throw e});return(await PF[k])[h]}
async function find(q){q=q.trim().toLowerCase().slice(0,40);if(q.length<2)return[];const L=await players();let h="";
if(/^\d{15,22}$/.test(q)&&window.crypto&&crypto.subtle){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(q));h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,16)}
const ex=[],pt=[];for(const x of L){const n=String(x.n).toLowerCase();if((h&&x.h===h)||q===String(x.i).toLowerCase()||q===n)ex.push(x);else if(n.includes(q))pt.push(x)}return ex.concat(pt).slice(0,8)}
/* leaderboards: top 10, tap a name to open that player */
async function board(t){const o=$("#lb");if(!o.isConnected)return;o.replaceChildren(el("li","muted","Loading…"));
if(!C.static){o.replaceChildren(el("li","muted",off));return}
try{const d=await jget(C.static+"/lb-"+t+".json");o.replaceChildren(...(d.rows.length?d.rows.slice(0,10).map((r,i)=>{const li=el("li",i<3?"top":""),n=r.h?el("button","nm lk",r.name):el("span","nm",r.name);if(r.h){n.type="button";n.onclick=()=>openPlayer(r.h)}
li.append(el("b","pos","#"+(i+1)),n,el("span","vl",r.value),el("small","sb",r.sub));return li}):[el("li","muted","No players here yet.")]))}
catch(e){o.replaceChildren(el("li","muted","Couldn’t load the leaderboard. Try again soon."))}}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===b));board(b.dataset.t)});board("rank");
/* player cards */
const line=(k,v)=>{const s=el("span","pc-line");s.append(el("small","",k),el("em","",v));return s};
function pcard(x){const b=el("button","pc"),m=el("span","pc-main"),r=el("span","pc-rank"+(String(x.r).length>3?" sm":""),x.r?"#"+x.r:"–");b.type="button";
m.append(el("b","pc-name",x.n),line("Performance Rating",x.p),line("Ranked Score",nf(x.s)));b.append(m,r);b.setAttribute("aria-label",x.n+", tap for player info");b.onclick=()=>openPlayer(x.h);return b}
let seq=0,tm;
async function search(){const r=$("#res"),q=$("#q").value,my=++seq;
if(q.trim().length<2){r.replaceChildren(el("p","muted","Type a name or game ID, then tap a player card to see everything."));return}
if(!C.static){r.replaceChildren(el("p","muted",off));return}
try{const L=await find(q);if(my!==seq)return;r.replaceChildren(...(L.length?L.map(pcard):[el("p","muted","No player found. Check the spelling or try their game ID.")]))}
catch(e){if(my===seq)r.replaceChildren(el("p","muted","Search isn’t available right now."))}}
$("#find").onsubmit=e=>{e.preventDefault();clearTimeout(tm);search()};
$("#q").oninput=()=>{clearTimeout(tm);tm=setTimeout(search,220)};
$("#q").addEventListener("focus",()=>{if(C.static)players().catch(()=>{})},{once:true});if($("#q").isConnected)search();
/* player info window */
const dlg=$("#pw"),closePw=()=>dlg.close?dlg.close():dlg.removeAttribute("open");
dlg.onclick=e=>{if(e.target===dlg)closePw()};
const closeBtn=()=>{const b=el("button","x","✕");b.type="button";b.setAttribute("aria-label","Close");b.onclick=closePw;return b};
async function openPlayer(h){const box=dlg.firstElementChild;window.SHIYA_FX&&SHIYA_FX.clear(box);box.replaceChildren(closeBtn(),el("p","muted","Loading…"));
if(!dlg.open)dlg.showModal?dlg.showModal():dlg.setAttribute("open","");
try{const p=await profile(h);if(!p)throw 0;fill(box,p,h);window.SHIYA_FX&&SHIYA_FX.skin(box,SHIYA_FX.lv(p.rank))}catch(e){box.replaceChildren(closeBtn(),el("p","muted","Couldn’t load this player. Try again soon."))}}
const stat=(k,v)=>{const d=el("div");d.append(el("dt","",k),el("dd","",String(v)));return d};
function fill(box,p,h){const head=el("div","pw-head"),w=el("div"),tags=el("div"),av=p.avatar?Object.assign(el("img","av"),{src:(window.SHIYA_AV&&window.SHIYA_AV.h===h&&window.SHIYA_AV.url)||p.avatar,alt:"",onerror(){this.replaceWith(el("span","av",(p.name||"?")[0].toUpperCase()))}}):el("span","av",(p.name||"?")[0].toUpperCase());
w.append(el("h3","",p.name));if(p.title)tags.append(el("span","tag",p.title));tags.append(el("span","tag",p.rank+", "+p.stars+" stars"));w.append(tags);if(p.game_id)w.append(el("small","muted","Game ID: "+p.game_id));head.append(av,w);
const g=el("dl","stats");[["Leaderboard","Rank "+pos(p.lb&&p.lb[0])+" · Points "+pos(p.lb&&p.lb[1])],["Level",p.lvl&&p.lvl.length?"Lv "+p.lvl[0]+" · "+nf(p.lvl[1])+"/"+nf(p.lvl[2])+" XP":"-"],
["Rank",p.rank],["Highest rank",p.best],["Truth rate",p.truth],["Win rate",p.win],["Performance rating",p.perf],["Ranked score",nf(p.score)],["Games",nf(p.games)],["Ranked games",nf(p.ranked)],["ChuPoints",nf(p.points)],
["Country",p.country?(p.flag?p.flag+" ":"")+p.country+(p.region?", "+p.region:""):"-"]].forEach(([k,v])=>g.append(stat(k,v)));
const kids=[closeBtn(),head,g];
if(p.titles)kids.push(el("h4","","Rank titles"),el("p","muted",p.titles));
if(p.badges&&p.badges.length){const b=el("div","bds");p.badges.forEach(([e,n])=>{const s=el("span","bd",e);s.title=n;b.append(s)});kids.push(el("h4","","Badges"+(p.badges_total?" ("+p.badges.length+"/"+p.badges_total+")":"")),b)}
if(p.recent&&p.recent.length){const l=el("ul","recent");p.recent.forEach(x=>l.append(el("li",x.res.toLowerCase(),x.res+", "+x.mode+", "+x.score+(x.vs?" vs "+x.vs:"")+(x.ts?" · "+ago(x.ts):""))));kids.push(el("h4","","Recent matches"),l)}
if(typeof p.likes==="number")kids.push(likeRow(p,h));
const rr=window.SHIYA_X&&SHIYA_X.reportRow(p,h);if(rr)kids.push(rr);box.replaceChildren(...kids)}
/* likes: shown in the player info; the button needs the bot's like webhook (published in status.json after /cmd type:update) */
async function sendLike(h){let v=lsGet("shiya_voter","");if(!/^[0-9a-f]{16}$/.test(v)){v=memV||[...crypto.getRandomValues(new Uint8Array(8))].map(x=>x.toString(16).padStart(2,"0")).join("");memV=v;lsSet("shiya_voter",v)}
const fd=new FormData();fd.append("payload_json",JSON.stringify({content:"PLIKE|"+h+"|"+v,username:"Shiya Web",allowed_mentions:{parse:[]}}));await fetch(HOOK,{method:"POST",body:fd,mode:"no-cors"})}
function burst(r){if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;for(let i=0;i<7;i++){const s=el("span","fh","♥");s.style.cssText="right:"+(18+Math.random()*70)+"px;bottom:26px;--dx:"+Math.round(Math.random()*70-35)+"px;animation-delay:"+i*60+"ms";r.append(s);setTimeout(()=>s.remove(),1300)}}
function likeRow(p,h){if(LK.has(h)&&typeof LB[h]==="number")p.likes=Math.max(p.likes,LB[h]+1);const r=el("div","likes"),c=el("span"),n=el("b","",nf(p.likes));c.append(el("small","","Likes "),n);r.append(c);
if(HOOK){const b=el("button","lkbtn");b.type="button";const paint=()=>{const d=LK.has(h);b.className="lkbtn"+(d?" done":"");b.textContent=d?"♥ Liked":"♡ Like";b.disabled=d};paint();
b.onclick=()=>{if(LK.has(h))return;LK.add(h);lsSet("shiya_liked",[...LK]);LB[h]=p.likes;lsSet("shiya_likebase",LB);p.likes++;n.textContent=nf(p.likes);paint();burst(r);
sendLike(h).catch(()=>{LK.delete(h);delete LB[h];lsSet("shiya_liked",[...LK]);lsSet("shiya_likebase",LB);p.likes--;n.textContent=nf(p.likes);paint()})};r.append(b)}return r}
/* changelogs: the same text as /changelogs in Discord, with search */
function md(s){const f=document.createDocumentFragment();s.split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(t=>{if(!t)return;
if(t.length>4&&t.startsWith("**")&&t.endsWith("**"))f.append(el("b","",t.slice(2,-2)));else if(t.length>2&&t[0]==="`"&&t.endsWith("`"))f.append(el("code","",t.slice(1,-1)));else f.append(document.createTextNode(t))});return f}
function entry(e,open){const d=el("details","cl-e"),s=el("summary"),b=el("div","cl-body");d.open=open;
s.append(el("b","","#"+e.n),el("small","",e.ts?new Date(e.ts*1000).toLocaleDateString(undefined,{month:"short",day:"numeric"}):""),el("span","cl-pv",e.s[0]?e.s[0].t.replace(/[*`]/g,""):""));d.append(s,b);
e.s.forEach(x=>{const h=el("h4"),ul=el("ul","cl-list");h.append(md(x.t));x.v.split("\n").map(l=>l.trim()).filter(Boolean).forEach(l=>{const li=el("li");li.append(md(l.replace(/^[•*-]\s+/,"")));ul.append(li)});b.append(h,ul)});
d._t=("update "+e.n+" "+e.s.map(x=>x.t+" "+x.v).join(" ")).toLowerCase();return d}
function clFilter(){const w=$("#clq").value.trim().toLowerCase().split(/\s+/).filter(Boolean);let n=0;
CL.forEach((d,i)=>{const hit=w.every(x=>d._t.includes(x));d.hidden=!hit;if(hit){n++;d.open=w.length&&n===1&&hit}});
$("#clmsg").textContent=w.length?(n?n+" found":"No match"):""}
(async()=>{const o=$("#cl");if(!o.isConnected)return;if(!C.static){o.replaceChildren(el("p","muted",off));return}
try{const d=await jget(C.static+"/changelog.json");CL=(d.entries||[]).map((e,i)=>entry(e,false));
if(!CL.length){o.replaceChildren(el("p","muted","No updates yet."));return}CL[0].querySelector("summary").append(el("span","tag new","NEW"));o.replaceChildren(...CL);CL.forEach(x=>x.addEventListener("toggle",()=>{if(x.open)CL.forEach(y=>{if(y!==x)y.open=false})}));$("#clq").oninput=clFilter}
catch(e){o.replaceChildren(el("p","muted","Couldn’t load the changelog. Try again soon."))}})();
if("IntersectionObserver"in window&&!matchMedia("(prefers-reduced-motion:reduce)").matches){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll("section").forEach(s=>{s.classList.add("rv");io.observe(s)})}

/* menu */
(()=>{const b=$("#mb"),p=$("#mp");if(!b.isConnected)return;const cur=location.pathname.split("/").pop()||"index.html",it=[...p.querySelectorAll("a")],gi=p.querySelector(".glass-i");
it.forEach(x=>{if(x.getAttribute("href")===cur)x.setAttribute("aria-current","page")});
const sel=()=>p.querySelector("[aria-current]")||it[0],mv=x=>{gi.style.transform="translateY("+x.offsetTop+"px)";gi.style.height=x.offsetHeight+"px"};
const open=v=>{b.setAttribute("aria-expanded",v);b.classList.toggle("on",v);if(v){p.hidden=false;requestAnimationFrame(()=>{p.classList.add("show");mv(sel())})}else{p.classList.remove("show");setTimeout(()=>{if(!p.classList.contains("show"))p.hidden=true},280)}};
b.onclick=e=>{e.stopPropagation();open(b.getAttribute("aria-expanded")!=="true")};
document.addEventListener("click",e=>{if(!p.contains(e.target))open(false)});addEventListener("keydown",e=>{if(e.key==="Escape")open(false)});
it.forEach(x=>{x.addEventListener("pointerenter",()=>mv(x));x.addEventListener("focus",()=>mv(x))});p.addEventListener("pointerleave",()=>mv(sel()));
window.SHIYA_MENU_ADD=x=>{it.push(x);x.addEventListener("pointerenter",()=>mv(x));x.addEventListener("focus",()=>mv(x));if(x.getAttribute("href")===cur)x.setAttribute("aria-current","page")}})();
