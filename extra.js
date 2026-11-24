/* Shiya-san extras: visit ping, Owner Dashboard menu link, Report button on player cards, shared helpers.
   Uses helpers from app.js ($, el, C, HOOK, jget, lsGet, lsSet) and window.SHIYA_API from account.js. Text is always set with textContent. */
(()=>{
"use strict";
const A=window.SHIYA_API,X=window.SHIYA_X={};
const P=location.pathname.split("/").pop()||"index.html";
const hex8=()=>[...crypto.getRandomValues(new Uint8Array(8))].map(x=>x.toString(16).padStart(2,"0")).join("");

X.clean=s=>String(s||"").replace(/\s+/g," ").trim();

/* data files written by the bot. fresh=true asks GitHub directly (a few seconds old instead of a few minutes) */
X.data=async(path,fresh)=>{
  if(fresh&&C.ghRepo){try{const r=await fetch("https://api.github.com/repos/"+C.ghRepo+"/contents/data/"+path+"?ref="+encodeURIComponent(C.ghBranch||"main"),
    {headers:{Accept:"application/vnd.github.raw+json"},cache:"no-cache"});if(r.ok)return await r.json();if(r.status===404)return null}catch(e){}}
  try{return await jget((C.static||"data")+"/"+path)}catch(e){return null}};

/* a button that needs two taps (delete, apply) */
X.danger=(label,fn)=>{const b=el("button","btn ghost sm",label);b.type="button";let a=false,tm=0;
  b.onclick=async()=>{if(!a){a=true;b.textContent="Sure?";tm=setTimeout(()=>{a=false;b.textContent=label},3500);return}
    clearTimeout(tm);b.disabled=true;try{await fn()}catch(e){}b.disabled=false;a=false;b.textContent=label};return b};

/* ---------- website visits: one small ping per page per tab session, sent to the bot's webhook ---------- */
(async()=>{
  if(!C.trackVisits||P==="owner.html")return;
  let seen;try{seen=JSON.parse(sessionStorage.getItem("shiya_vp")||"[]")}catch(e){return}
  if(!Array.isArray(seen)||seen.includes(P)||seen.length>=8)return;
  await A.ready;if(A.isOwner())return;                       // your own visits aren't counted
  for(let i=0;i<20&&!HOOK;i++)await new Promise(r=>setTimeout(r,500));
  if(!HOOK)return;
  let v=lsGet("shiya_voter","");if(!/^[0-9a-f]{16}$/.test(v)){v=hex8();lsSet("shiya_voter",v)}
  try{sessionStorage.setItem("shiya_vp",JSON.stringify(seen.concat(P)))}catch(e){return}
  const me=A.me(),fd=new FormData();
  fd.append("payload_json",JSON.stringify({content:"VIS|"+P+"|"+v+"|"+(me?me.h:"-"),username:"Shiya Web",allowed_mentions:{parse:[]}}));
  fetch(HOOK,{method:"POST",body:fd,mode:"no-cors"}).catch(()=>{});
})();

/* ---------- Owner Dashboard shows up in the menu for the owner only ---------- */
A.ready.then(()=>{
  if(!A.isOwner()||!window.SHIYA_MENU_ADD)return;
  const l=document.querySelector("#mp .menu-list");if(!l||l.querySelector("[data-own]"))return;
  const a=el("a");a.href="owner.html";a.dataset.own="1";a.setAttribute("role","menuitem");a.append(el("b","","👑"),"Owner Dashboard");l.append(a);window.SHIYA_MENU_ADD(a)});

/* ---------- Report button on another player's card ---------- */
const RK="shiya_rep";
X.reportRow=(p,h)=>{
  const me=A.me();if(!me||me.h===h||!A.hook())return null;
  const w=el("div","x-rpt"),open=el("button","btn ghost sm","⚑ Report player"),f=el("form","x-rf"),lab=el("label","","Why are you reporting "+(p.name||"this player")+"?"),
    ta=el("textarea"),cnt=el("small","muted","0 / 400"),row=el("div","x-rr"),go=el("button","btn sm","Send report"),no=el("button","btn ghost sm","Cancel"),msg=el("p","hint");
  open.type="button";no.type="button";go.type="submit";lab.htmlFor=ta.id="x-rt";ta.maxLength=400;ta.rows=4;ta.placeholder="Tell the owner what happened (10 to 400 characters).";f.hidden=true;
  ta.oninput=()=>{cnt.textContent=ta.value.length+" / 400"};
  open.onclick=()=>{f.hidden=false;open.hidden=true;ta.focus()};
  no.onclick=()=>{f.hidden=true;open.hidden=false;msg.textContent=""};
  f.onsubmit=async e=>{e.preventDefault();const reason=X.clean(ta.value),done=lsGet(RK,{});
    if(reason.length<10){msg.className="hint bad";msg.textContent="Please write at least 10 characters.";return}
    if(done[h]&&Date.now()-done[h]<864e5){msg.className="hint bad";msg.textContent="You already reported this player today.";return}
    go.disabled=true;msg.className="hint";msg.textContent="Sending…";
    try{const r=await A.call("report",{target:h,reason});
      if(r.ok){done[h]=Date.now();lsSet(RK,done);ta.value="";cnt.textContent="0 / 400";f.hidden=true;open.hidden=false;open.disabled=true;open.textContent="⚑ Report sent";msg.className="hint";msg.textContent=r.msg||"Thanks. The owner will review it."}
      else{msg.className="hint bad";msg.textContent=r.msg||"Couldn’t send the report."}}
    catch(x){msg.className="hint bad";msg.textContent=x&&x.message==="long"?"That’s too long. Shorten it a little.":"Couldn’t send. Check your connection."}
    go.disabled=false};
  row.append(go,no);f.append(lab,ta,cnt,row);w.append(open,f,msg);return w};
})();
