/* Tru Heart v4. GSAP + ScrollTrigger + Lenis (vendored). Motion always on; one Pause control (WCAG 2.2.2). */
(function(){
var d=document.documentElement,motionOn=true,lenis=null;
var hv=document.getElementById('heroV'),held=document.getElementById('held');
var vids=[].slice.call(document.querySelectorAll('video'));

/* enquiry: prefilled email, nothing sent automatically */
var form=document.getElementById('inquiry');
form.addEventListener('submit',function(e){e.preventDefault();if(!form.reportValidity())return;
  var v=function(id){return document.getElementById(id).value.trim()};
  var body=['Name: '+v('f-name'),'Company: '+v('f-company'),'Work email: '+v('f-email'),'Phone: '+v('f-phone'),'','What are you launching?',v('f-launch')].join('\r\n');
  location.href='mailto:careers@truheartconsultinginc.com?subject='+encodeURIComponent('Brand inquiry, '+v('f-company'))+'&body='+encodeURIComponent(body)});

/* films play only while on screen */
function play(v){if(!motionOn)return;v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
var onScreen=new Map();
var vio=new IntersectionObserver(function(es){es.forEach(function(e){onScreen.set(e.target,e.isIntersecting);e.isIntersecting?play(e.target):e.target.pause()})},{threshold:.05});
vids.forEach(function(v){vio.observe(v)});
['pointerdown','touchstart','keydown','wheel'].forEach(function(ev){addEventListener(ev,function(){vids.forEach(function(v){if(onScreen.get(v))play(v)})},{passive:true,once:true})});

/* payoff: TEAMS. lands 0.25s after the cheque cut (0.95s), on the film's own clock, then stays */
var PAYOFF=1.2;
held.style.opacity=0;
(function watch(){if(hv.currentTime>=PAYOFF){held.style.transition='opacity .45s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)';held.style.opacity=1;held.style.transform='none';return}requestAnimationFrame(watch)})();
held.style.transform='translateY(.12em)';

if(!window.gsap||!window.ScrollTrigger){d.classList.remove('m');held.style.opacity=1;return}
gsap.registerPlugin(ScrollTrigger);

if(window.Lenis){lenis=new Lenis({autoRaf:false,lerp:.1});lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
  var id=a.getAttribute('href');if(!lenis)return;e.preventDefault();
  if(id==='#top')lenis.scrollTo(0,{duration:1.8,easing:ease});else lenis.scrollTo(document.querySelector(id),{duration:1.4,easing:ease})})});

function fmt(n,dec,pre){return(pre||'')+n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function counter(el,delay){if(el.__done)return;el.__done=1;var to=parseFloat(el.dataset.count),dec=parseInt(el.dataset.dec||'0',10),pre=el.dataset.prefix||'',o={v:0};
  el.textContent=fmt(0,dec,pre);gsap.to(o,{v:to,duration:1.6,delay:delay||0,ease:'power2.out',onUpdate:function(){el.textContent=fmt(dec?o.v:Math.round(o.v),dec,pre)},onComplete:function(){el.textContent=fmt(to,dec,pre)}})}

function boot(){
  /* intro: headline lines rise */
  gsap.to('.h-hero .w',{yPercent:0,y:0,duration:1.1,ease:'expo.out',stagger:.09,delay:.15,onStart:function(){}});
  gsap.set('.h-hero .w',{yPercent:105});
  gsap.from('.hero-foot,.hero .eyebrow',{opacity:0,y:24,duration:1,ease:'expo.out',delay:.5});

  /* hero: the window in BUILDING grows into the framed cheque film (<=1.25x native) */
  var pin=document.querySelector('.hero-pin'),win=document.querySelector('.win'),card=document.getElementById('card'),cap=card.querySelector('.card-cap'),txt=document.querySelector('.hero-text');
  var geo={};
  var h1=document.querySelector('.h-hero'),l2w=document.querySelectorAll('.h-hero .w')[1],l1w=document.querySelector('.h-hero .l1 .w');
  function fitType(){
    var avail=txt.clientWidth;h1.style.fontSize='100px';
    var w=l2w.getBoundingClientRect().width/100;var fs=avail/w;
    var vh=pin.clientHeight,mob=innerWidth<1000,foot=document.querySelector('.hero-foot').offsetHeight+30;
    fs=Math.min(fs,(vh-(mob?260:230)-foot)/(3*.9));h1.style.fontSize=fs.toFixed(1)+'px';
    /* the window fills the rest of line one, rising into the space above the headline */
    var rest=avail-l1w.getBoundingClientRect().width-fs*.16;
    var above=txt.getBoundingClientRect().top-pin.getBoundingClientRect().top-(mob?120:130)+fs*.75;
    var wh=mob?Math.min(avail*608/1080,above+fs*.2):Math.max(fs*.7,Math.min(rest*608/1080,above));win.style.height=wh.toFixed(1)+'px';
  }
  function measure(){
    fitType();
    var vw=innerWidth,vh=pin.clientHeight,g=parseFloat(getComputedStyle(txt).left)||20,capH=cap.offsetHeight+16;
    var W=Math.min(1350,vw-2*g,(vh-capH-(vw<1000?140:150))*1080/608);
    card.style.width=W+'px';
    var H=W*608/1080,ex=(vw-W)/2,ey=Math.max(vw<1000?110:120,(vh-H-capH)/2+ (vw<1000?20:30));
    var pr=pin.getBoundingClientRect(),wr=win.getBoundingClientRect();
    geo={W:W,ex:ex,ey:ey,sx:wr.left-pr.left,sy:wr.top-pr.top-(gsap.getProperty(txt,'y')||0),s:wr.width/W};
  }
  var st={p:0,t:0};
  /* damped follow so the card glides instead of tracking the wheel 1:1 */
  gsap.ticker.add(function(){var dp=st.t-st.p;if(Math.abs(dp)>.0004){st.p+=dp*.09;render()}});
  function render(){var p=st.p,k=gsap.parseEase('power2.inOut')(Math.min(1,p/.72));
    var s=geo.s+(1-geo.s)*k,x=geo.sx+(geo.ex-geo.sx)*k,y=geo.sy+(geo.ey-geo.sy)*k;
    card.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) scale('+s.toFixed(4)+')';
    var t=Math.min(1,Math.max(0,(p-.04)/.3));txt.style.opacity=(1-t).toFixed(3);txt.style.transform='translateY('+(-t*8).toFixed(2)+'vh)';
    var c=Math.min(1,Math.max(0,(p-.72)/.14));cap.style.opacity=c.toFixed(3);if(c>.2)counter(cap.querySelector('[data-count]'));
    txt.style.pointerEvents=t>.5?'none':'auto'}
  measure();render();
  ScrollTrigger.create({trigger:'.hero',start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,onRefresh:function(){measure();render()},onUpdate:function(self){st.t=self.progress}});
  addEventListener('resize',function(){measure();render()});

  /* statement: lit word by word */
  var stmt=document.querySelector('[data-words]');
  stmt.innerHTML=stmt.textContent.trim().split(/\s+/).map(function(w){return'<span class="wd">'+w+'</span>'}).join(' ');
  var wds=stmt.querySelectorAll('.wd');
  ScrollTrigger.create({trigger:stmt,start:'top 78%',end:'bottom 42%',scrub:true,onUpdate:function(s){var n=Math.round(s.progress*wds.length);wds.forEach(function(w,i){w.classList.toggle('lit',i<n)})},onLeave:function(){wds.forEach(function(w){w.classList.add('lit')})}});
  ScrollTrigger.batch('.stat',{start:'top 88%',once:true,onEnter:function(b){gsap.from(b,{opacity:0,y:40,duration:.9,ease:'expo.out',stagger:.1});b.forEach(function(el,i){counter(el.querySelector('[data-count]'),.1+i*.1)})}});

  gsap.fromTo('.ghost span',{xPercent:6},{xPercent:-34,ease:'none',scrollTrigger:{trigger:'.ghost',start:'top bottom',end:'bottom top',scrub:true}});

  /* services: the one you are reading lights */
  document.querySelectorAll('.svc>li').forEach(function(li){ScrollTrigger.create({trigger:li,start:'top 62%',end:'bottom 62%',toggleClass:'on'})});

  /* reps: cards land tilted, settle */
  gsap.fromTo('.rep-a',{y:180,rotation:-9},{y:0,rotation:-2,ease:'none',scrollTrigger:{trigger:'.reps',start:'top bottom',end:'center 58%',scrub:true}});
  gsap.fromTo('.rep-b',{y:260,rotation:8},{y:0,rotation:2.5,ease:'none',scrollTrigger:{trigger:'.reps',start:'top bottom',end:'center 52%',scrub:true}});
  ScrollTrigger.batch('.rep figcaption',{start:'top 92%',once:true,onEnter:function(b){b.forEach(function(el,i){counter(el.querySelector('[data-count]'),.1+i*.12)})}});

  /* ask: the two lines meet */
  gsap.fromTo('.ask-l1',{xPercent:-45},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.ask',start:'top bottom',end:'top 25%',scrub:true}});
  gsap.fromTo('.ask-l2',{xPercent:45},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.ask',start:'top bottom',end:'top 25%',scrub:true}});

  window.__thReady=true;
  requestAnimationFrame(function(){ScrollTrigger.refresh()});addEventListener('load',function(){ScrollTrigger.refresh()});
}

function setMotion(on){motionOn=on;d.classList.toggle('motion-off',!on);var b=document.getElementById('motion-toggle');
  b.setAttribute('aria-pressed',on?'false':'true');b.setAttribute('aria-label',on?'Pause motion':'Play motion');b.textContent=on?'Pause':'Play';
  if(on){gsap.globalTimeline.play();lenis&&lenis.start();vids.forEach(function(v){if(onScreen.get(v))play(v)})}
  else{vids.forEach(function(v){v.pause()});lenis&&lenis.stop();gsap.globalTimeline.pause();held.style.opacity=1;held.style.transform='none';
    document.querySelectorAll('[data-count]').forEach(function(el){var dec=parseInt(el.dataset.dec||'0',10);el.textContent=fmt(parseFloat(el.dataset.count),dec,el.dataset.prefix||'')})}}
document.getElementById('motion-toggle').addEventListener('click',function(){setMotion(!motionOn)});

(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){try{boot()}catch(e){d.classList.remove('m');console.error(e)}});
})();
