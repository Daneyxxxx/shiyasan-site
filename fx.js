/* Shiya-san fx: tip capsule on every page, rank effects, "what would my card look like". Text is set with textContent only. */
(()=>{
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches,rnd=(a,b)=>a+Math.random()*(b-a);
const R=[["Connector","🌱","#8fe3b8"],["Starter","🐣","#c6f0a0"],["Logic Newbie","🧩","#9fe0ff"],["Striker","⚡","#ffd479"],["Biggy Placement","🎯","#ffb38a"],
["Biggy","🌸","#ffb3c7"],["Senior","🦋","#d6a8ff"],["Logic Master","🔮","#a8b4ff"],["Logic Senior","💫","#ff9ad5"],["Overall Master","👑","#ffe27a"]];
const RB=["#ff9ad5","#ffd479","#8fe3b8","#9fe0ff","#d6a8ff"],G=l=>l<4?["✦","♡"]:l<8?["✦","♡","✧","★"]:["✦","♡","★","✧","💗","✨"],T=[[3,"shim"],[5,"ring"],[10,"max"]];
/* rank text ("Striker II", "Biggy Placement"...) -> level 1..10, 0 if unknown */
const lv=s=>{s=String(s||"").toLowerCase();let b=0,bl=0;R.forEach((r,i)=>{const n=r[0].toLowerCase();if(s.includes(n)&&n.length>bl){b=i+1;bl=n.length}});return b};
function clear(h){if(!h)return;[...h.classList].filter(c=>c==="fxk"||c.startsWith("fx-")).forEach(c=>h.classList.remove(c));
 h.style.removeProperty("--lv");h.style.removeProperty("--c");delete h.dataset.fx;h.querySelectorAll(":scope>.fxl,:scope>.fxb").forEach(n=>n.remove())}
/* put the rank effect on a card or capsule: more sparkle, glow, speed as the level goes up */
function skin(h,l){if(!h)return;l=Math.max(0,Math.min(10,l|0));if(!l){clear(h);return}
 if(+h.dataset.fx===l&&h.querySelector(":scope>.fxl"))return;clear(h);
 h.dataset.fx=l;h.classList.add("fxk");h.style.setProperty("--lv",l);h.style.setProperty("--c",R[l-1][2]);T.forEach(([n,k])=>{if(l>=n)h.classList.add("fx-"+k)});
 const L=mk("span","fxl"),g=G(l);L.setAttribute("aria-hidden","true");
 if(!RM){const n=Math.round(l*1.6)+2;for(let k=0;k<n;k++){const s=mk("span","s",g[k%g.length]);
  s.style.cssText=`--x:${rnd(3,94)}%;--y:${rnd(8,90)}%;--s:${rnd(9,12+l*.8)}px;--d:${rnd(3.4,5.2)-l*.2}s;--dl:${-rnd(0,5)}s`;if(l===10)s.style.color=RB[k%5];L.append(s)}}
 h.append(L)}
function burst(h,x,y,n){if(RM)return;const l=+h.dataset.fx||1,g=G(l);for(let k=0;k<n;k++){const p=mk("span","fxb",g[k%g.length]),a=rnd(0,6.283),d=rnd(40,80+l*14);
 p.style.cssText=`left:${x}px;top:${y}px;--s:${rnd(11,17+l)}px;--d:${rnd(.8,1.4)}s;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-24}px;--r:${rnd(-220,220)}deg`;
 if(l===10)p.style.color=RB[k%5];p.onanimationend=()=>p.remove();h.append(p)}}

/* ---------- preview: your card wearing a rank's effect ---------- */
let pv=null,pvBusy=false;
function preview(l){l=Math.max(1,Math.min(10,l|0));if(pvBusy||!l)return;pvBusy=true;const r=R[l-1],me=typeof window.SHIYA_ME==="function"?window.SHIYA_ME():null;
 const d=mk("dialog","fxpv"),t=mk("h2","fxpv-t","This is what your card would look like"),c=mk("div","fxpv-card"),h=mk("div","fxpv-h"),w=mk("div"),tg=mk("div","tags");
 d.setAttribute("aria-label","Card preview for "+r[0]);
 const nm=me&&me.name||"Your name";
 let av;if(me&&me.av){av=mk("img","av big");av.src=me.av;av.alt="";av.onerror=()=>av.replaceWith(mk("span","av big",nm[0].toUpperCase()))}else av=mk("span","av big",me?nm[0].toUpperCase():"✦");
 w.append(mk("h3","",nm));if(me&&me.title)tg.append(mk("span","tag",me.title));tg.append(mk("span","tag",r[1]+" "+r[0]));w.append(tg);h.append(av,w);
 const m=mk("div","fxpv-m");m.append(mk("small","","Sparkle power "+l+"/10"));for(let k=0;k<10;k++){const i=mk("i",k<l?"on":"",k<l?"♥":"♡");i.style.setProperty("--k",k);m.append(i)}
 const n=mk("p","fxpv-n",me?(me.rank?"Your rank now: "+me.rank+". Reach "+r[0]+" to get this.":"Play a ranked match to get a rank, then this can be yours."):"Log in to see your own name and avatar here.");
 const x=mk("div","fxpv-x"),ok=mk("button","btn sm","Close");ok.type="button";x.append(ok);
 if(!me){const li=document.getElementById("login");if(li){const b=mk("button","btn sm dc","Log in");b.type="button";b.onclick=()=>{close();setTimeout(()=>li.click(),280)};x.prepend(b)}}
 c.append(h,m,n,x);d.append(t,c);document.body.append(d);pv=d;
 let closing=false;const close=()=>{if(closing)return;closing=true;d.classList.add("out");setTimeout(()=>{d.close&&d.open&&d.close();d.remove();pv=null;pvBusy=false},RM?0:260)};
 ok.onclick=e=>{e.stopPropagation();close()};d.addEventListener("click",e=>{if(!c.contains(e.target))close()});d.addEventListener("cancel",e=>{e.preventDefault();close()});
 d.showModal?d.showModal():d.setAttribute("open","");
 skin(c,l);requestAnimationFrame(()=>setTimeout(()=>burst(c,c.offsetWidth/2,70,6+l*3),RM?0:420));
 c.addEventListener("click",e=>{if(e.target.closest("button"))return;const b=c.getBoundingClientRect();burst(c,e.clientX-b.left,e.clientY-b.top,3+l*2)});ok.focus({preventScroll:true})}

/* ---------- tip capsule ---------- */
const TIPS=[["🛡️","Every rank-up earns a protection point. You can hold up to 3."],["🌸","Seasons last 120 days, then ranks reset. Fresh start!"],["🌱","Connector and Starter never lose stars, so climb freely."],
["🧩","Logic Newbie is marked as your floor on the ladder."],["🎯","Biggy Placement needs 10 stars to place you."],["💗","Multi Stars begin at Biggy, so every star counts more."],["👑","Overall Master is the very top of the ladder."],
["✨","Tap any rank on the Ranks page to see your card wearing its sparkles."],["🔎","Search any player by name or game ID on the Players page."],["🦋","Butterflies taste with their feet. Imagine tasting a lie that way!"],
["🐙","Octopuses have three hearts, and Shiya-san only needs one to love logic."],["🍯","Honey never spoils. Neither does a good streak."],["🐧","Penguins propose with a pebble. Cute, and very strategic."],["🌙","Moonlight is just reflected sunshine. Shine a little, reflect a lot."]];
function tips(){if(document.querySelector(".tipcap"))return;let i=Math.floor(rnd(0,TIPS.length)),tm=0,hold=7000;
 const c=mk("div","tipcap"),e=mk("span","e"),tt=mk("span","tt"),lab=mk("b","","Cute trivia"),tx=mk("span","t");c.setAttribute("role","status");c.setAttribute("aria-live","polite");c.title="Tap to hide";
 tt.append(lab,tx);c.append(e,tt);document.body.append(c);
 const hide=()=>{clearTimeout(tm);c.classList.remove("on");tm=setTimeout(show,32000)};
 const show=()=>{clearTimeout(tm);if(document.hidden||document.querySelector("dialog[open]")||document.documentElement.classList.contains("acopen")){tm=setTimeout(show,5000);return}
  const t=TIPS[i++%TIPS.length];e.textContent=t[0];tx.textContent=t[1];c.style.setProperty("--hold",hold+"ms");c.classList.remove("on");void c.offsetWidth;c.classList.add("on");tm=setTimeout(hide,hold)};
 c.onclick=hide;c.addEventListener("mouseenter",()=>{if(c.classList.contains("on")){clearTimeout(tm);c.style.setProperty("--ps","paused")}});
 c.addEventListener("mouseleave",()=>{c.style.setProperty("--ps","running");if(c.classList.contains("on")){clearTimeout(tm);tm=setTimeout(hide,2500)}});
 tm=setTimeout(show,2200)}
window.SHIYA_FX={lv,skin,clear,burst,preview,ranks:R};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",tips);else tips();
})();
