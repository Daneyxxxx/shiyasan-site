/* Announcements page: posts from the owner, with comments and replies. Posts and comments come from the bot's data files. Text is set with textContent only. */
(async()=>{
"use strict";
const A=window.SHIYA_API,X=window.SHIYA_X,root=$("#nw");
let posts=[],cmt=[],reply=null,draft="",lastPost=0;
const me=()=>A.me(),stamp=t=>new Date(t*1000).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
const paras=s=>{const d=el("div","x-body");String(s||"").split(/\n+/).map(x=>x.trim()).filter(Boolean).forEach(l=>{const p=el("p");p.append(md(l));d.append(p)});return d};
const kindTag=k=>el("span","tag"+(k==="news"?" mint":""),k==="news"?"News":"Announcement");
async function loadPosts(fresh){const d=await X.data("news.json",fresh);
  posts=((d&&Array.isArray(d.items)&&d.items)||[]).filter(p=>p&&/^[\w-]+$/.test(String(p.id))).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||(b.ts||0)-(a.ts||0))}
async function loadComments(p,fresh){const d=await X.data("comments/"+p.id+".json",fresh);cmt=(d&&Array.isArray(d.c)&&d.c)||[]}

function list(){
  if(!posts.length){root.replaceChildren(el("p","muted","No announcements yet. Check back soon!"));return}
  root.replaceChildren(...posts.map(p=>{const a=el("a","x-post"),h=el("div","x-ph"),snip=String(p.b||"").replace(/\s+/g," ").replace(/[*`]/g,"");
    a.href="#"+p.id;h.append(kindTag(p.k));if(p.pin)h.append(el("span","tag","📌 Pinned"));h.append(el("small","muted",stamp(p.ts||0)));
    a.append(h,el("h3","",p.t||"Untitled"),el("p","",snip.length>150?snip.slice(0,147)+"…":snip));
    if(p.cm!==0)a.append(el("small","muted","💬 "+nf(p.cc||0)+(p.cc===1?" comment":" comments")));return a}))}

async function detail(p){
  const back=el("a","btn ghost sm","← All posts"),art=el("article","x-panel"),box=el("section","x-cm");back.href="news.html";
  art.append(kindTag(p.k),el("h2","x-pt",p.t||"Untitled"),el("small","muted",stamp(p.ts||0)+(p.by?" · "+p.by:"")),paras(p.b));
  root.replaceChildren(back,art,box);scrollTo(0,0);reply=null;
  if(p.cm===0){box.append(el("p","muted","Comments are turned off for this post."));return}
  box.append(el("h3","","Discussion"),el("p","muted","Loading…"));
  await loadComments(p,false);draw(p,box)}

function item(c,p,box){
  const d=el("div","x-c"),h=el("div","x-ch"),row=el("div","x-cr"),m=me();
  h.append(el("b","",c.n||"Player"));if(c.o)h.append(el("span","tag","Owner"));h.append(el("small","muted",c.ts?ago(c.ts):""));d.append(h,el("p","x-ct",c.t||""));
  if(m){const r=el("button","lnk","Reply");r.type="button";r.onclick=()=>{reply=cmt.find(x=>x.id===(c.re||c.id))||null;draw(p,box);const t=box.querySelector("textarea");if(t)t.focus()};row.append(r)}
  if(A.isOwner()||(m&&c.h&&c.h===m.h))row.append(X.danger("Delete",async()=>{const r=await A.call("uncomment",{post:p.id,id:c.id});if(r.ok){await loadComments(p,true);draw(p,box)}}));
  d.append(row);return d}

function composer(p,box){
  const w=el("form","x-comp"),m=me();
  if(!m){w.append(el("p","muted","Log in with Discord to join the discussion."));return w}
  if(!A.hook()){w.append(el("p","muted","Comments aren’t switched on yet."));return w}
  if(reply){const r=el("p","hint"),x=el("button","lnk","Cancel");x.type="button";x.onclick=()=>{reply=null;draw(p,box)};r.append("Replying to "+(reply.n||"a player")+" · ",x);w.append(r)}
  const ta=el("textarea"),go=el("button","btn sm","Post"),msg=el("p","hint");ta.maxLength=400;ta.rows=3;ta.placeholder=reply?"Write a reply…":"Write a comment…";ta.setAttribute("aria-label","Comment");ta.value=draft;ta.oninput=()=>{draft=ta.value};go.type="submit";
  w.onsubmit=async e=>{e.preventDefault();const t=X.clean(ta.value);
    if(t.length<2){msg.className="hint bad";msg.textContent="Write something first.";return}
    if(Date.now()-lastPost<15000){msg.className="hint bad";msg.textContent="Slow down a little, then try again.";return}
    go.disabled=true;msg.className="hint";msg.textContent="Sending…";
    try{const r=await A.call("comment",{post:p.id,text:t,re:reply?reply.id:undefined});
      if(r.ok){lastPost=Date.now();draft="";reply=null;await loadComments(p,true);draw(p,box);return}
      msg.className="hint bad";msg.textContent=r.msg||"Couldn’t post that."}
    catch(x){msg.className="hint bad";msg.textContent="Couldn’t send. Check your connection."}
    go.disabled=false};
  w.append(ta,go,msg);return w}

function draw(p,box){
  const roots=cmt.filter(c=>!c.re),kids=[el("h3","","Discussion ("+cmt.length+")"),composer(p,box)];
  roots.forEach(c=>{const th=el("div","x-thread");th.append(item(c,p,box));cmt.filter(r=>r.re===c.id).forEach(r=>{const w=el("div","x-reply");w.append(item(r,p,box));th.append(w)});kids.push(th)});
  if(!roots.length)kids.push(el("p","muted","No comments yet. Start the discussion!"));
  box.replaceChildren(...kids)}

async function route(){const id=decodeURIComponent(location.hash.slice(1)),p=posts.find(x=>x.id===id);if(p)await detail(p);else list()}
root.replaceChildren(el("p","muted","Loading…"));
await A.ready;if(me())for(let i=0;i<20&&!A.hook();i++)await new Promise(r=>setTimeout(r,250));   // wait for login and the bot link
await loadPosts();await route();addEventListener("hashchange",route);
})();
