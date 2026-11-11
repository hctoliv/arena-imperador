(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;

  /* WhatsApp */
  var WA={eventos:'5511949476351',futevolei:'5511917875533',escolinha:'5511913453863',funcional:'5511984286735'};
  var FONE={eventos:'(11) 94947-6351',futevolei:'(11) 91787-5533',escolinha:'(11) 91345-3863',funcional:'(11) 98428-6735'};
  function waLink(key,msg){return 'https://wa.me/'+(WA[key]||WA.eventos)+'?text='+encodeURIComponent(msg||'Oi! Vi o site da Arena Imperador.')}
  $$('[data-wa]').forEach(function(a){
    a.href=waLink(a.getAttribute('data-wa'),a.getAttribute('data-msg'));
    a.target='_blank';a.rel='noopener';
  });

  /* intro: uma vez por sessão */
  var intro=$('#intro'),seen=false;
  try{seen=sessionStorage.getItem('ai-intro')==='1'}catch(e){}
  function ready(){root.classList.add('ready')}
  if(reduce||seen||!intro){root.classList.add('no-intro');ready()}
  else{
    try{sessionStorage.setItem('ai-intro','1')}catch(e){}
    var done=false;
    var finish=function(){if(done)return;done=true;intro.classList.add('out');setTimeout(ready,250);setTimeout(function(){root.classList.add('no-intro')},800)};
    setTimeout(function(){intro.classList.add('lit')},950);
    setTimeout(finish,2300);
    window.addEventListener('keydown',finish,{once:true});
    window.addEventListener('pointerdown',finish,{once:true});
  }

  /* header: esconde ao descer, troca cor por zona */
  var hd=$('#hd'),lastY=0,zones=$$('[data-hd]'),ticking=false,barBg=$('.bar-bg img'),bar=$('.bar');
  function onScroll(){
    ticking=false;
    var y=window.scrollY;
    hd.classList.toggle('solid',y>40);
    if(!hd.classList.contains('menu')) hd.classList.toggle('hide',y>lastY&&y>400);
    lastY=y;
    var probe=36,light=false;
    for(var i=0;i<zones.length;i++){var r=zones[i].getBoundingClientRect();if(r.top<=probe&&r.bottom>probe){light=zones[i].getAttribute('data-hd')==='light';break}}
    hd.classList.toggle('light',light&&!hd.classList.contains('menu'));
    if(!reduce&&barBg&&bar){var br=bar.getBoundingClientRect();if(br.bottom>0&&br.top<innerHeight){barBg.style.setProperty('--py',((br.top+br.height/2-innerHeight/2)*-.12).toFixed(1)+'px')}}
    var fab=$('.fab');if(fab)fab.classList.toggle('on',y>innerHeight*.7);
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* menu */
  var burger=$('#burger');
  burger.addEventListener('click',function(){
    var open=!hd.classList.contains('menu');
    hd.classList.toggle('menu',open);burger.setAttribute('aria-expanded',open);
    burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    document.body.style.overflow=open?'hidden':'';
    if(open)hd.classList.remove('hide','light');else onScroll();
  });
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){if(hd.classList.contains('menu'))burger.click()})});

  /* hero: tríptico com o mesmo vídeo em tempos diferentes */
  var heroVids=$$('.hero-vids video');
  heroVids.forEach(function(v){
    var off=parseFloat(v.getAttribute('data-offset')||'0');
    var start=function(){if(off&&v.duration)v.currentTime=off%v.duration;if(!reduce&&v.offsetParent!==null){var p=v.play();if(p&&p.catch)p.catch(function(){})}};
    if(v.readyState>=1)start();else v.addEventListener('loadedmetadata',start,{once:true});
  });
  if(reduce)heroVids.forEach(function(v){v.pause();v.removeAttribute('autoplay')});

  /* status aberto agora (fuso de SP) */
  function spNow(){
    var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var o={};p.forEach(function(x){o[x.type]=x.value});
    var d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
    return {d:d,m:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)};
  }
  // dias 1..5: 8h às 1h | 6 e 0: 7h30 às 22h
  function status(){
    var n=spNow(),d=n.d,m=n.m;
    var prev=(d+6)%7;
    if(m<60&&prev>=1&&prev<=5)return {open:true,txt:'Aberto agora · fecha 1h'};
    if(d>=1&&d<=5){if(m>=480)return {open:true,txt:'Aberto agora · fecha 1h'};return {open:false,txt:'Fechado · abre 8h'}}
    if(m>=450&&m<1320)return {open:true,txt:'Aberto agora · fecha 22h'};
    if(m<450)return {open:false,txt:'Fechado · abre 7h30'};
    return {open:false,txt:d===6?'Fechado · abre amanhã 7h30':'Fechado · abre amanhã 8h'};
  }
  var st=status(),live=$('#live'),now=$('#now');
  if(live){live.classList.toggle('open',st.open);live.querySelector('span').textContent=st.txt}
  if(now){now.classList.toggle('open',st.open);now.textContent=st.txt}
  var today=spNow().d,tr=$('#hours tr[data-d="'+today+'"]');if(tr)tr.classList.add('today');

  /* contadores */
  function countUp(el){
    var to=parseFloat(el.getAttribute('data-count')),dec=parseInt(el.getAttribute('data-dec')||'0',10);
    var fmt=function(v){return v.toFixed(dec).replace('.',',')};
    if(reduce){el.textContent=fmt(to);return}
    var t0=null,dur=1400;
    (function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,3);el.textContent=fmt(to*k);if(k<1)requestAnimationFrame(step)})(performance.now());
  }

  /* reveal + contadores + quadra */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;
    var t=e.target;
    if(t.hasAttribute('data-count'))countUp(t);
    else if(t.id==='court')t.classList.add('lit');
    else t.classList.add('in');
    io.unobserve(t);
  })},{rootMargin:'0px 0px -8% 0px',threshold:.12});
  $$('.rv,#court').forEach(function(el){io.observe(el)});
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target)}})},{threshold:0});
  $$('[data-count]').forEach(function(el){cio.observe(el)});

  /* vídeos preguiçosos: carregam perto da tela e pausam fora dela */
  var vids=$$('video[data-lazy]');
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){
    var v=e.target;
    if(e.isIntersecting){
      if(v.preload!=='auto'){v.preload='auto';v.load()}
      if(!reduce){var p=v.play();if(p&&p.catch)p.catch(function(){})}
    }else if(!v.paused){v.pause()}
  })},{rootMargin:'200px 0px',threshold:.2});
  vids.forEach(function(v){vio.observe(v)});
  $$('.snd').forEach(function(b){
    var v=b.parentNode.querySelector('video');
    b.addEventListener('click',function(){
      var on=v.muted;
      vids.forEach(function(o){o.muted=true});$$('.snd').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-label','Ligar o som')});
      if(on){v.muted=false;if(v.paused)v.play();b.classList.add('on');b.setAttribute('aria-label','Desligar o som')}
    });
  });

  /* quadras: grama x areia */
  var court=$('#court');
  if(court){
    var setMode=function(mode){
      court.setAttribute('data-mode',mode);
      $$('.court-tabs button',court).forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-mode')===mode)});
      $$('.court-img',court).forEach(function(f){f.classList.toggle('on',f.getAttribute('data-mode')===mode)});
      $$('.ci',court).forEach(function(c){c.hidden=c.getAttribute('data-mode')!==mode});
      var tag=$('.court-tag',court);
      tag.querySelector('b').textContent=mode==='grama'?'Society':'Areia';
      tag.querySelector('span').textContent=mode==='grama'?'grama sintética · murais de craques':'futevôlei · vôlei de areia';
    };
    $$('.court-tabs button',court).forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-mode'))})});
    var sx=null;
    $('.court-stage',court).addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    $('.court-stage',court).addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)setMode(dx<0?'areia':'grama');sx=null},{passive:true});
  }

  /* agenda: some com o que já passou */
  var nowMs=Date.now(),first=true,any=false;
  $$('#agList .ag').forEach(function(li){
    var end=new Date(li.getAttribute('data-end')+':00-03:00').getTime();
    if(end<nowMs){li.remove();return}
    any=true;if(first){li.classList.add('ag-next');first=false}
  });
  if(!any){$('#agEmpty').hidden=false}

  /* reserva */
  var rz=$('#rz');
  if(rz){
    var daysBox=$('#rzDays'),DN=['dom','seg','ter','qua','qui','sex','sáb'],MN=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    var base=new Date(),sel=0,dayList=[];
    for(var i=0;i<8;i++){
      var d=new Date(base.getFullYear(),base.getMonth(),base.getDate()+i);dayList.push(d);
      var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-checked',i===0);
      b.innerHTML='<b>'+d.getDate()+'</b><span>'+(i===0?'hoje':i===1?'amanhã':DN[d.getDay()])+'</span>';
      (function(k){b.addEventListener('click',function(){sel=k;$$('button',daysBox).forEach(function(x,j){x.setAttribute('aria-checked',j===k)});build()})})(i);
      daysBox.appendChild(b);
    }
    var range=$('#rzPessoas'),out=$('#rzPessoasOut'),nome=$('#rzNome'),msgEl=$('#rzMsg'),toEl=$('#rzTo');
    var val=function(n){var x=rz.querySelector('input[name="'+n+'"]:checked');return x?x.value:''};
    var target='eventos',msg='';
    var LBL={society:'a quadra society',areia:'a quadra de areia',mesa:'uma mesa no samba'};
    var AULA={futevolei:'aula de futevôlei',funcional:'aula de funcional com o professor Fabrício Alemão',escolinha:'a escolinha de futebol'};
    function build(){
      var tipo=val('tipo'),per=val('periodo'),n=parseInt(range.value,10),d=dayList[sel];
      $('#rzAula').hidden=tipo!=='aula';$('#rzEvento').hidden=tipo!=='evento';
      out.textContent=n+(n===1?' pessoa':' pessoas');
      var dia=(sel===0?'hoje, ':sel===1?'amanhã, ':'')+DN[d.getDay()]+' '+d.getDate()+' de '+MN[d.getMonth()];
      var oi='Oi! '+(nome.value.trim()?'Aqui é '+nome.value.trim()+'. ':'')+'Vi o site da Arena Imperador.\n';
      if(tipo==='aula'){
        var a=val('aula');target=a;
        msg=oi+'Quero agendar '+AULA[a]+'.\nDia: '+dia+' ('+per+')\nPessoas: '+n+'\nPode me passar horários e valores?';
      }else if(tipo==='evento'){
        target='eventos';
        msg=oi+'Quero orçar um evento: '+val('ocasiao')+'.\nData: '+dia+' ('+per+')\nConvidados: cerca de '+n+'\nPode me passar as opções de espaço, churrasqueira e quadra?';
      }else{
        target='eventos';
        msg=oi+'Quero reservar '+LBL[tipo]+'.\nDia: '+dia+' ('+per+')\nPessoas: '+n+'\nTem horário disponível?';
      }
      msgEl.textContent=msg;toEl.textContent=FONE[target];
    }
    rz.addEventListener('change',build);range.addEventListener('input',build);nome.addEventListener('input',build);
    rz.addEventListener('submit',function(e){e.preventDefault();build();window.open(waLink(target,msg),'_blank','noopener')});
    $$('[data-pick]').forEach(function(a){a.addEventListener('click',function(){
      var p=a.getAttribute('data-pick'),inp=rz.querySelector('input[name="tipo"][value="'+p+'"]');
      if(inp){inp.checked=true;if(p==='evento')range.value=Math.max(parseInt(range.value,10),40);build()}
    })});
    build();
  }
})();
