/* Owner Dashboard. This page is only a window: the numbers come from the bot, and every action is a message the bot
   checks against your Discord login before doing anything. Text is set with textContent only. */
(async()=>{
"use strict";
const A=window.SHIYA_API,X=window.SHIYA_X,root=$("#ob"),U=C.static||"data",clean=X.clean;
const say=t=>root.replaceChildren(el("p","muted",t));
await A.ready;
if(!A.isOwner()){location.replace("index.html");return}   // players and logged-out visitors never see this page
say("Connecting to Shiya-san…");

const S={tab:"over",d:null,plain:false,bad:false,st:null,t0:0,posts:null,tips:null,rf:"open",flash:"",ti:0};

/* ---- the bot encrypts visits and reports for this browser only, because the data folder is public ---- */
let K="";const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(x=>x.toString(16).padStart(2,"0")).join("");
const okey=()=>{if(K)return K;let k=lsGet("shiya_ok","");if(!/^[0-9a-f]{64}$/.test(k)){k=hex(32);lsSet("shiya_ok",k)}return K=k};
async function openOwner(o){
  if(!o)return null;if(typeof o.enc!=="string")return{d:o,plain:true};
  try{const te=new TextEncoder(),imp=r=>crypto.subtle.importKey("raw",r,{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]),H=(k,m)=>crypto.subtle.sign("HMAC",k,m),
    root=await imp(Uint8Array.from(okey().match(/../g).map(x=>parseInt(x,16)))),ke=await imp(await H(root,te.encode("enc"))),km=await imp(await H(root,te.encode("mac"))),
    b=Uint8Array.from(atob(o.enc.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)),iv=b.slice(0,12),tag=b.slice(12,44),ct=b.slice(44),body=new Uint8Array(12+ct.length);
    body.set(iv);body.set(ct,12);if(!await crypto.subtle.verify("HMAC",km,tag,body))return{bad:true};
    const blocks=await Promise.all(Array.from({length:Math.ceil(ct.length/32)},(_,i)=>{const m=new Uint8Array(16);m.set(iv);new DataView(m.buffer).setUint32(12,i);return H(ke,m)})),pt=new Uint8Array(ct.length);
    blocks.forEach((bl,i)=>{const k=new Uint8Array(bl);for(let j=0;j<32&&i*32+j<ct.length;j++)pt[i*32+j]=ct[i*32+j]^k[j]});
    return{d:JSON.parse(new TextDecoder().decode(pt)),plain:false}}
  catch(e){return{bad:true}}}
async function load(fresh){
  const a=fresh?await A.refresh():A.acct();
  if(a){const o=await openOwner(a.owner);S.d=o&&o.d||null;S.plain=!!(o&&o.plain);S.bad=!!(o&&o.bad)}
  try{S.st=await jget(U+"/status.json");S.t0=Date.now()}catch(e){S.st=null}}
const fail=(m,e)=>{m.className="hint bad";m.textContent=e&&e.message==="long"?"That’s too long for one message. Shorten it a little.":"Couldn’t send. Check your connection."};
const show=(m,r)=>{m.className="hint"+(r.ok?"":" bad");m.textContent=r.msg||(r.ok?"Done.":"That didn’t work.")};
const kpi=(k,v)=>{const d=el("div","x-kpi");d.append(el("small","",k),el("b","",String(v)));return d};
const panel=(title)=>{const p=el("div","x-panel");if(title)p.append(el("h3","",title));return p};

function linkCard(){
  const p=panel("Link this browser"),b=el("button","btn sm","Link this browser"),m=el("p","hint");
  p.append(el("p","muted",S.bad?"This browser’s key can’t open the owner data. Link it again, then wait for the bot’s next update."
    :"Visits and reports are kept encrypted so only your browser can read them. Link it once to start."));b.type="button";
  b.onclick=async()=>{b.disabled=true;m.className="hint";m.textContent="Sending…";
    try{const r=await A.call("owner_key",{key:okey()});show(m,r);if(r.ok){await load(true);S.flash=r.msg||"Linked.";render();return}}catch(e){fail(m,e)}b.disabled=false};
  p.append(b,m);return p}

/* ---- Overview: server status, server time, website visits ---- */
function paneOver(){
  const w=el("div"),st=S.st,fresh=!!(st&&st.online&&Date.now()/1000-st.ts<(C.maxAge||900));
  const p1=panel("Server status"),pill=el("span","pill "+(st?(fresh?"on":"off"):"wait")),k=el("div","x-kpis");
  pill.append(el("i"),el("span","",st?(fresh?"Online":"Offline"):"Status unavailable"));
  [["Ping",st&&fresh?st.ping+" ms":"–"],["Servers",st?nf(st.servers):"–"],["Last heartbeat",st?ago(st.ts):"–"]].forEach(([a,b])=>k.append(kpi(a,b)));
  p1.append(pill,k);

  const p2=panel("Server time"),ck=el("div","x-clock"),dt=el("small","muted"),base=st&&(st.now||st.ts)||0;
  const tick=()=>{if(!ck.isConnected){clearInterval(S.ti);return}const d=new Date(base*1000+(Date.now()-S.t0));ck.textContent=d.toISOString().slice(11,19);dt.textContent=d.toISOString().slice(0,10)+" · UTC"};
  clearInterval(S.ti);if(base){tick();S.ti=setInterval(tick,1000)}else ck.textContent="–";
  p2.append(ck,dt);if(base&&!st.now)p2.append(el("p","hint","Based on the bot’s last heartbeat. Add a “now” field to status.json for an exact clock."));

  const top=el("div","x-row"),rf=el("button","btn ghost sm","↻ Refresh");rf.type="button";
  rf.onclick=async()=>{rf.disabled=true;await load(true);render()};top.append(rf);
  w.append(top,p1,p2);
  if(!S.d){w.append(linkCard());return w}

  const v=S.d.visits||{},p3=panel("Website visits"),kk=el("div","x-kpis");
  [["Total",nf(v.total)],["Today",nf(v.today)],["Visitors",nf(v.uniq)]].forEach(([a,b])=>kk.append(kpi(a,b)));p3.append(kk);
  const pg=Object.entries(v.pages||{}).sort((a,b)=>b[1]-a[1]).slice(0,12);
  if(pg.length){const mx=pg[0][1]||1,l=el("ul","x-list");p3.append(el("h4","","Pages"),l);
    pg.forEach(([n,c])=>{const li=el("li"),b=el("span","x-bar");b.append(el("i"));b.firstChild.style.width=Math.max(4,Math.round(c/mx*100))+"%";li.append(el("span","",n),b,el("b","",nf(c)));l.append(li)})}
  const rc=(v.recent||[]).slice(0,100);p3.append(el("h4","","Recent visits"));
  if(!rc.length)p3.append(el("p","muted","No visits recorded yet."));
  else{const l=el("ul","x-list");rc.forEach(x=>{const li=el("li"),s=el("span","",(x.n||"Guest "+String(x.v||"").slice(0,4))+" · "+(x.p||"?")),t=el("small","",x.ts?ago(x.ts):"");
    if(x.ts)li.title=new Date(x.ts*1000).toLocaleString();li.append(s,t);l.append(li)});p3.append(l)}
  w.append(p3);return w}

/* ---- Reports: Reject, Temporary ban (HH:MM), Reset name, Deduct points, Deduct rank ---- */
const hm=v=>{const d=v.replace(/\D/g,"").slice(0,4);return d.length>2?d.slice(0,2)+":"+d.slice(2):d};
function actions(r){
  const box=el("div"),chips=el("div","x-chips"),fields=el("div"),go=el("button","btn sm","Apply"),msg=el("p","hint"),on=new Set(),F={},CH=[];
  let armed=false,tm=0;go.type="button";go.disabled=true;
  const mk=(k,lab,at)=>{const d=el("div","x-fld"),l=el("label","",lab),i=Object.assign(el("input"),at);l.htmlFor=i.id="f"+r.id+k;d.hidden=true;d.append(l,i);F[k]={d,i};fields.append(d);
    i.oninput=()=>{if(k==="ban")i.value=hm(i.value);check()}};
  mk("ban","Ban time (HH:MM), applies to every match",{type:"text",inputMode:"numeric",placeholder:"00:00",maxLength:5,autocomplete:"off"});
  mk("pts","Points to deduct",{type:"number",min:1,max:1e9,step:1,placeholder:"e.g. 500"});
  mk("rank","Stars to deduct (rank)",{type:"number",min:1,max:100,step:1,placeholder:"1"});
  const build=()=>{if(!on.size)return null;if(on.has("reject"))return[{k:"reject"}];const a=[];
    if(on.has("ban")){const t=F.ban.i.value;if(!/^\d{2}:[0-5]\d$/.test(t)||t==="00:00")return null;a.push({k:"ban",t})}
    if(on.has("rename"))a.push({k:"rename"});
    if(on.has("pts")){const n=+F.pts.i.value;if(!Number.isInteger(n)||n<1||n>1e9)return null;a.push({k:"pts",n})}
    if(on.has("rank")){const n=+F.rank.i.value;if(!Number.isInteger(n)||n<1||n>100)return null;a.push({k:"rank",n})}
    return a};
  const check=()=>{go.disabled=!build();armed=false;go.textContent="Apply"};
  [["reject","Reject"],["ban","Temporary ban"],["rename","Reset name"],["pts","Deduct points"],["rank","Deduct rank"]].forEach(([k,t])=>{
    const b=el("button","x-chip"+(k==="reject"?" dng":""),t);b.type="button";b.setAttribute("aria-pressed","false");
    b.onclick=()=>{if(on.has(k))on.delete(k);else{if(k==="reject")on.clear();else on.delete("reject");on.add(k)}
      CH.forEach(([kk,bb])=>{bb.classList.toggle("on",on.has(kk));bb.setAttribute("aria-pressed",on.has(kk))});
      Object.keys(F).forEach(kk=>F[kk].d.hidden=!on.has(kk));check()};CH.push([k,b]);chips.append(b)});
  go.onclick=async()=>{const acts=build();if(!acts)return;
    if(!armed){armed=true;go.textContent="Tap again to confirm";clearTimeout(tm);tm=setTimeout(()=>{armed=false;go.textContent="Apply"},4000);return}
    clearTimeout(tm);go.disabled=true;go.textContent="Sending…";msg.className="hint";msg.textContent="Waiting for Shiya-san…";
    try{const res=await A.call("resolve",{id:r.id,acts});show(msg,res);if(res.ok){S.flash=res.msg||"Report closed.";await load(true);render();return}}catch(e){fail(msg,e)}
    go.textContent="Apply";check()};
  box.append(chips,fields,go,msg);return box}
function repCard(r){
  const c=el("div","x-panel"),h=el("div","x-rh"),who=el("p","x-who");
  h.append(el("b","","Report #"+r.id),el("small","muted",r.ts?ago(r.ts):""));
  who.append(el("span","",(r.by&&r.by.n)||"Unknown"),el("i","","→"),el("b","",(r.t&&r.t.n)||"Unknown"));
  c.append(h,who,el("blockquote","x-why",r.r||""));
  c.append(r.st==="open"?actions(r):el("p","hint","Closed: "+(r.res||"done")));return c}
function paneReports(){
  const w=el("div");if(!S.d){w.append(linkCard());return w}
  const R=(S.d.reports||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0)),bar=el("div","x-chips");
  [["open","Open"],["done","Closed"]].forEach(([k,t])=>{const b=el("button","x-chip"+(S.rf===k?" on":""),t);b.type="button";b.onclick=()=>{S.rf=k;render()};bar.append(b)});
  const L=R.filter(r=>(S.rf==="open")===(r.st==="open"));w.append(bar);
  if(!L.length)w.append(el("p","muted",S.rf==="open"?"No open reports. 🎉":"No closed reports yet."));
  L.forEach(r=>w.append(repCard(r)));return w}

/* ---- Announcement Maker ---- */
function field(form,labelText,node){const l=el("label","",labelText);l.htmlFor=node.id;form.append(l,node);return node}
async function fillPosts(box,fresh){box.replaceChildren(el("p","muted","Loading posts…"));
  const d=await X.data("news.json",fresh);S.posts=(d&&Array.isArray(d.items)&&d.items)||[];
  if(!S.posts.length){box.replaceChildren(el("p","muted","Nothing posted yet."));return}
  const ul=el("ul","x-list");
  S.posts.slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,30).forEach(p=>{const li=el("li");
    li.append(el("span","",(p.k==="news"?"📰 ":"📣 ")+(p.t||"Untitled")),el("small","",p.ts?ago(p.ts):""),
      X.danger("Delete",async()=>{const r=await A.call("unpost",{id:p.id});if(r.ok)await fillPosts(box,true)}));ul.append(li)});
  box.replaceChildren(ul)}
function panePosts(){
  const w=el("div"),p=panel("Announcement Maker"),f=el("div"),kind={v:"announcement"},bar=el("div","x-chips"),CH=[];
  [["announcement","📣 Announcement"],["news","📰 News"]].forEach(([k,t])=>{const b=el("button","x-chip"+(k===kind.v?" on":""),t);b.type="button";
    b.onclick=()=>{kind.v=k;CH.forEach(([kk,bb])=>bb.classList.toggle("on",kk===k))};CH.push([k,b]);bar.append(b)});
  const ti=Object.assign(el("input"),{type:"text",id:"o-ti",maxLength:80,autocomplete:"off",placeholder:"Title"}),
    bd=Object.assign(el("textarea"),{id:"o-bd",maxLength:1000,rows:6,placeholder:"Write your post. **bold** and `code` work."}),
    cm=Object.assign(el("input"),{type:"checkbox",checked:true}),pn=Object.assign(el("input"),{type:"checkbox"}),
    pub=el("button","btn sm","Publish"),msg=el("p","hint"),lst=el("div");
  f.className="x-form";f.append(bar);field(f,"Title",ti);field(f,"Text",bd);
  [[cm,"Allow comments and discussion"],[pn,"Pin to the top"]].forEach(([i,t])=>{const l=el("label","x-check");l.append(i,t);f.append(l)});
  pub.type="button";pub.style.marginTop="14px";
  pub.onclick=async()=>{const t=clean(ti.value),b=bd.value.replace(/\r/g,"").trim();
    if(t.length<3||b.length<5){msg.className="hint bad";msg.textContent="Add a title (3+ characters) and some text.";return}
    pub.disabled=true;msg.className="hint";msg.textContent="Sending…";
    try{const r=await A.call("post",{kind:kind.v,title:t,body:b,cm:cm.checked?1:0,pin:pn.checked?1:0});show(msg,r);if(r.ok){ti.value=bd.value="";fillPosts(lst,true)}}catch(e){fail(msg,e)}pub.disabled=false};
  p.append(f,pub,msg);const p2=panel("Recent posts");p2.append(lst);w.append(p,p2);fillPosts(lst,false);return w}

/* ---- Tip Maker: your own tips appear in the Tip Capsule on every page ---- */
async function fillTips(box,fresh){box.replaceChildren(el("p","muted","Loading tips…"));
  const d=await X.data("tips.json",fresh);S.tips=(d&&Array.isArray(d.tips)&&d.tips)||[];
  if(!S.tips.length){box.replaceChildren(el("p","muted","No custom tips yet."));return}
  const ul=el("ul","x-list");S.tips.forEach(x=>{const li=el("li");li.append(el("b","",x.e||"💌"),el("span","",x.t||""),
    X.danger("Delete",async()=>{const r=await A.call("tip_del",{id:x.id});if(r.ok)await fillTips(box,true)}));ul.append(li)});box.replaceChildren(ul)}
function paneTips(){
  const w=el("div"),p=panel("Tip Maker"),f=el("div","x-form"),em=Object.assign(el("input"),{type:"text",id:"o-em",maxLength:8,value:"💡",autocomplete:"off"}),
    tx=Object.assign(el("input"),{type:"text",id:"o-tx",maxLength:140,autocomplete:"off",placeholder:"Your tip, up to 140 characters"}),
    add=el("button","btn sm","Add to Tip Capsule"),msg=el("p","hint"),lst=el("div");
  field(f,"Emoji",em);field(f,"Tip",tx);add.type="button";add.style.marginTop="14px";
  add.onclick=async()=>{const e=em.value.trim()||"💡",t=clean(tx.value);if(t.length<3){msg.className="hint bad";msg.textContent="Write a tip (3+ characters).";return}
    add.disabled=true;msg.className="hint";msg.textContent="Sending…";
    try{const r=await A.call("tip_add",{e,t});show(msg,r);if(r.ok){tx.value="";fillTips(lst,true)}}catch(x){fail(msg,x)}add.disabled=false};
  p.append(f,add,msg);const p2=panel("Your tips");p2.append(lst);w.append(p,p2);fillTips(lst,false);return w}

/* ---- tabs ---- */
function render(){
  clearInterval(S.ti);const open=S.d?(S.d.reports||[]).filter(r=>r.st==="open").length:0,tabs=el("div","x-tabs");
  [["over","Overview"],["rep","Reports"+(open?" ("+open+")":"")],["post","Announcement Maker"],["tip","Tip Maker"]].forEach(([k,t])=>{
    const b=el("button","x-tab"+(k===S.tab?" on":""),t);b.type="button";b.onclick=()=>{if(S.tab!==k){S.tab=k;render()}};tabs.append(b)});
  const kids=[tabs];if(S.flash){kids.push(el("p","x-flash",S.flash));S.flash=""}
  if(S.d&&S.plain)kids.push(el("p","hint bad","Owner data isn’t encrypted. Anyone who browses the repo’s data folder can read it."));
  kids.push(S.tab==="over"?paneOver():S.tab==="rep"?paneReports():S.tab==="post"?panePosts():paneTips());root.replaceChildren(...kids)}

await A.synced;
if(!A.acct()){say("Couldn’t reach your account file. Make sure the bot is online, then reload.");return}
await load(false);render();
/* link this browser by itself (once per session), so there is no button to press */
let tried=false;try{tried=!!sessionStorage.getItem("shiya_lk");sessionStorage.setItem("shiya_lk","1")}catch(e){}
if(!S.d&&!tried)A.call("owner_key",{key:okey()}).then(async r=>{if(r.ok){await load(true);if(S.tab==="over"||S.tab==="rep")render()}}).catch(()=>{});
})();
