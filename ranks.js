(()=>{
const $=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches,rnd=(a,b)=>a+Math.random()*(b-a);
const list=document.getElementById("rl");if(!list)return;
const R=[
{n:"Connector",e:"🌱",c:"#8fe3b8",div:1,tag:"No star loss",d:"Where every climb begins."},
{n:"Starter",e:"🐣",c:"#c6f0a0",div:1,tag:"No star loss",d:"Warming up those instincts."},
{n:"Logic Newbie",e:"🧩",c:"#9fe0ff",div:1,tag:"Your floor",d:"Sharp eyes, tiny steps."},
{n:"Striker",e:"⚡",c:"#ffd479",div:1,d:"Now we're getting serious."},
{n:"Biggy Placement",e:"🎯",c:"#ffb38a",tag:"10 stars to place",d:"Prove yourself to move up."},
{n:"Biggy",e:"🌸",c:"#ffb3c7",tag:"Multi Stars",d:"Multi Stars begin here."},
{n:"Senior",e:"🦋",c:"#d6a8ff",tag:"Multi Stars",d:"Calm, clever, hard to fool."},
{n:"Logic Master",e:"🔮",c:"#a8b4ff",tag:"Multi Stars",d:"Reads a lie like a book."},
{n:"Logic Senior",e:"💫",c:"#ff9ad5",tag:"Multi Stars",d:"Almost untouchable."},
{n:"Overall Master",e:"👑",c:"#ffe27a",tag:"Multi Stars",d:"The very top of the ladder."}];
const GL=lv=>lv<4?["✦","♡"]:lv<8?["✦","♡","✧","★"]:["✦","♡","★","✧","💗","✨"],RB=["#ff9ad5","#ffd479","#8fe3b8","#9fe0ff","#d6a8ff"];
const FX=[[2,"glow"],[3,"shim"],[5,"ring"],[6,"aura"],[8,"orb"],[9,"rain"],[10,"max"]];
function burst(card,x,y,n){if(RM)return;const lv=+card.dataset.lv,g=GL(lv);for(let k=0;k<n;k++){const p=$("span","bt",g[k%g.length]),a=rnd(0,6.283),d=rnd(30,60+lv*12);
p.style.cssText=`--x:${x}px;--y:${y}px;--s:${rnd(10,16+lv)}px;--d:${rnd(.7,1.2)}s;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-20}px;--r:${rnd(-200,200)}deg`;
if(lv===10)p.style.setProperty("--c",RB[k%RB.length]);p.onanimationend=()=>p.remove();card.append(p)}}
const cards=R.map((r,i)=>{const lv=i+1,li=$("li","rk");li.dataset.lv=lv;li.style.setProperty("--lv",lv);li.style.setProperty("--c",r.c);
FX.forEach(([n,k])=>{if(lv>=n)li.classList.add("fx-"+k)});
const bg=$("div","rk-bg"),sp=$("div","rk-sp");bg.append(sp);
if(!RM){const g=GL(lv),n=Math.round(lv*1.6)+1;for(let k=0;k<n;k++){const s=$("span","sp",g[k%g.length]);s.style.cssText=`--x:${rnd(4,94)}%;--s:${rnd(9,13+lv*.8)}px;--d:${rnd(3.2,5)-lv*.18}s;--dl:${-rnd(0,5)}s`;sp.append(s)}}
const ic=$("button","rk-ic");ic.type="button";ic.setAttribute("aria-label","Sparkle: "+r.n);ic.append($("span","em",r.e));
if(lv>=8&&!RM)for(let k=0;k<lv-6;k++){const o=$("span","orb"+(k%2?" h":""));o.style.setProperty("--i",k);ic.append(o)}
const tx=$("div","rk-tx");tx.append($("h2","rk-nm",r.n),$("p","rk-ds",r.d));
const ch=$("div","rk-ch");if(r.div)["I","II","III","IV","V"].forEach(v=>ch.append($("span","",v)));if(r.tag)ch.append($("span","tg",r.tag));tx.append(ch);
const mt=$("div","rk-mt");mt.append($("small","","Sparkle power"));for(let k=0;k<10;k++){const h=$("i",k<lv?"on":"",k<lv?"♥":"♡");h.style.setProperty("--k",k);mt.append(h)}tx.append(mt);
const bd=$("div","rk-bd"),pic=$("span","av",r.e),bt=$("div");bt.append($("small","","Profile border"),$("b","",(window.SHIYA_FX&&SHIYA_FX.bn[i])||"Border"));
bd.append(window.SHIYA_FX?SHIYA_FX.ring(pic,lv):pic,bt);tx.append(bd);
li.append(bg,ic,tx);if(lv===10)li.append($("span","top-b","Top rank"));
li.addEventListener("click",e=>{const r=li.getBoundingClientRect();let x=e.clientX-r.left,y=e.clientY-r.top;
if(!e.detail){const b=ic.getBoundingClientRect();x=b.left-r.left+b.width/2;y=b.top-r.top+b.height/2}burst(li,x,y,3+lv*2);setTimeout(()=>window.SHIYA_FX&&SHIYA_FX.preview(lv),360)});
list.append(li);return li});
if(!("IntersectionObserver"in window))cards.forEach(c=>c.classList.add("in","live"));
else{const io=new IntersectionObserver(es=>es.forEach(en=>{const c=en.target;c.classList.toggle("live",en.isIntersecting);
if(en.isIntersecting&&!c.classList.contains("in")){c.classList.add("in");if(+c.dataset.lv>=6){setTimeout(()=>{const r=c.getBoundingClientRect(),b=c.querySelector(".rk-ic").getBoundingClientRect();burst(c,b.left-r.left+b.width/2,b.top-r.top+b.height/2,+c.dataset.lv*2)},400)}}}),{threshold:.2});cards.forEach(c=>io.observe(c))}
if(!RM){const f=$("div","rk-bgp");for(let k=0;k<14;k++){const i=$("i","",k%3?"♡":"✦");i.style.cssText=`--x:${rnd(2,96)}%;--s:${rnd(12,24)}px;--d:${rnd(12,22)}s;--dl:${-rnd(0,20)}s`;f.append(i)}document.body.append(f)}
})();
