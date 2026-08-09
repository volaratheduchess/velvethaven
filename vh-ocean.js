/* vh-ocean.js — The Velvet Haven underwater canvas + shared utilities */

(function () {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.width  = window.innerWidth  * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    initCaustics(vW(), vH());
    initRays(vW());
    initBubbles(vW(), vH());
  }

  const vW = () => W / dpr;
  const vH = () => H / dpr;

  /* CAUSTICS */
  const caustics = [];
  function initCaustics(w, h) {
    caustics.length = 0;
    for (let i = 0; i < Math.floor(w * 0.08); i++) {
      caustics.push({ x: Math.random()*w, y: Math.random()*h*0.08, rx: Math.random()*60+20, ry: Math.random()*6+2, rot: (Math.random()-0.5)*0.5, rotV: (Math.random()-0.5)*0.004, alpha: Math.random()*0.28+0.05, pulse: Math.random()*Math.PI*2, pulseV: Math.random()*0.012+0.006, drift: (Math.random()-0.5)*0.3 });
    }
  }
  function drawSurface(w, h) {
    const g = ctx.createLinearGradient(0,0,0,h*0.12);
    g.addColorStop(0,'rgba(14,74,107,0.95)'); g.addColorStop(0.4,'rgba(14,74,107,0.5)'); g.addColorStop(1,'transparent');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h*0.12);
    caustics.forEach(c => {
      c.pulse+=c.pulseV; c.rot+=c.rotV; c.x+=c.drift;
      if (c.x>w+80) c.x=-80; if (c.x<-80) c.x=w+80;
      const a = c.alpha*(0.6+0.4*Math.sin(c.pulse));
      ctx.save(); ctx.translate(c.x, c.y+Math.sin(c.pulse*0.7)*4); ctx.rotate(c.rot);
      ctx.beginPath(); ctx.ellipse(0,0,c.rx,c.ry,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(180,230,240,${a})`; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    });
  }

  /* RAYS */
  const rays = [];
  function initRays(w) {
    rays.length = 0;
    for (let i = 0; i < 8; i++) rays.push({ x:(i/8+Math.random()*0.08)*w, width:Math.random()*80+30, alpha:Math.random()*0.06+0.015, pulse:Math.random()*Math.PI*2, pulseV:Math.random()*0.006+0.003, sway:0, swayV:(Math.random()-0.5)*0.4 });
  }
  function drawRays(w, h) {
    rays.forEach(r => {
      r.pulse+=r.pulseV; r.sway+=r.swayV*0.01;
      const a=r.alpha*(0.6+0.4*Math.sin(r.pulse));
      const g=ctx.createLinearGradient(r.x,0,r.x+Math.sin(r.sway)*40,h*0.75);
      g.addColorStop(0,`rgba(180,230,240,${a})`); g.addColorStop(0.5,`rgba(100,180,210,${a*0.4})`); g.addColorStop(1,'transparent');
      ctx.beginPath();
      ctx.moveTo(r.x-r.width*0.5,0); ctx.lineTo(r.x+r.width*0.5,0);
      ctx.lineTo(r.x+r.width*0.5+Math.sin(r.sway)*60+r.width*0.3,h*0.75);
      ctx.lineTo(r.x-r.width*0.5+Math.sin(r.sway)*60-r.width*0.3,h*0.75);
      ctx.closePath(); ctx.fillStyle=g; ctx.fill();
    });
  }

  /* BUBBLES */
  const bubbles = [];
  function spawnBubble(w, h) {
    const lg = Math.random()<0.18;
    return { x:Math.random()*w, y:h*(0.6+Math.random()*0.35), r:lg?Math.random()*28+14:Math.random()*7+2, vy:lg?-(Math.random()*0.6+0.25):-(Math.random()*1.1+0.4), wobble:Math.random()*Math.PI*2, wobbleV:(Math.random()-0.5)*0.06, wobbleAmp:Math.random()*18+4, alpha:Math.random()*0.35+0.1, large:lg };
  }
  function initBubbles(w, h) {
    bubbles.length = 0;
    for (let i=0;i<55;i++) { const b=spawnBubble(w,h); b.y=Math.random()*h; bubbles.push(b); }
  }
  function drawBubbles(w, h) {
    if (Math.random()<0.04) bubbles.push(spawnBubble(w,h));
    for (let i=bubbles.length-1;i>=0;i--) {
      const b=bubbles[i];
      b.wobble+=b.wobbleV; b.x+=Math.sin(b.wobble)*(b.r*0.04); b.y+=b.vy;
      if (b.y<-b.r*2) { bubbles.splice(i,1); continue; }
      ctx.save();
      const g=ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.35,b.r*0.05,b.x,b.y,b.r);
      g.addColorStop(0,`rgba(220,245,255,${b.alpha*0.9})`); g.addColorStop(0.35,`rgba(140,210,230,${b.alpha*0.3})`); g.addColorStop(0.7,`rgba(80,160,200,${b.alpha*0.1})`); g.addColorStop(1,`rgba(40,100,150,${b.alpha*0.05})`);
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.strokeStyle=`rgba(180,230,245,${b.alpha*0.55})`; ctx.lineWidth=b.large?1.4:0.8; ctx.stroke();
      if (b.r>5) { ctx.beginPath(); ctx.arc(b.x-b.r*0.28,b.y-b.r*0.3,b.r*0.22,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${b.alpha*0.7})`; ctx.fill(); }
      ctx.restore();
    }
  }

  /* SEABED */
  let seabedData=null;
  const sandPebbles=[],shellsData=[];
  function buildSeabed() {
    const w=vW(),h=vH(),bedY=h*0.82;
    seabedData={y:bedY,w};
    sandPebbles.length=0;
    for (let i=0;i<60;i++) sandPebbles.push({x:Math.random()*w,y:bedY+Math.random()*8,rx:Math.random()*6+2,ry:Math.random()*3+1,rot:Math.random()*Math.PI,c:Math.random()});
    shellsData.length=0;
    for (let i=0;i<12;i++) shellsData.push({x:Math.random()*w,y:bedY+2+Math.random()*6,size:Math.random()*8+4,rot:Math.random()*Math.PI*2,type:Math.floor(Math.random()*3)});
  }
  function drawSeabed(w, h) {
    if (!seabedData) return;
    const bedY=seabedData.y, t=Date.now()*0.00008;
    const sg=ctx.createLinearGradient(0,bedY-10,0,h);
    sg.addColorStop(0,'rgba(156,130,90,0.95)'); sg.addColorStop(0.08,'rgba(180,152,106,0.98)'); sg.addColorStop(0.3,'rgba(164,136,92,1)'); sg.addColorStop(1,'rgba(120,96,60,1)');
    ctx.fillStyle=sg; ctx.fillRect(0,bedY,w,h-bedY);
    ctx.beginPath(); ctx.moveTo(0,bedY);
    for (let x=0;x<=w;x+=3) ctx.lineTo(x,bedY+Math.sin(x*0.018+t)*3+Math.sin(x*0.04+t*1.3)*1.5);
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    const wg=ctx.createLinearGradient(0,bedY-4,0,bedY+8);
    wg.addColorStop(0,'rgba(200,175,130,0.9)'); wg.addColorStop(1,'rgba(156,130,90,0)');
    ctx.fillStyle=wg; ctx.fill();
    ctx.save(); ctx.globalAlpha=0.22;
    for (let ry=bedY+8;ry<h-4;ry+=10) {
      ctx.beginPath();
      for (let x=0;x<=w;x+=3) { const y=ry+Math.sin(x*0.025+t*0.7+ry*0.05)*2; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
      ctx.strokeStyle='rgba(120,96,60,0.8)'; ctx.lineWidth=0.7; ctx.stroke();
    }
    ctx.restore();
    sandPebbles.forEach(p => {
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.beginPath(); ctx.ellipse(0,0,p.rx,p.ry,0,0,Math.PI*2);
      const tone=Math.floor(100+p.c*60);
      ctx.fillStyle=`rgba(${tone},${Math.floor(tone*0.88)},${Math.floor(tone*0.7)},0.7)`;
      ctx.fill(); ctx.restore();
    });
    shellsData.forEach(s => {
      ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot);
      if (s.type===0) {
        ctx.beginPath(); ctx.ellipse(0,0,s.size,s.size*0.6,0,0,Math.PI*2);
        ctx.fillStyle='rgba(220,200,165,0.75)'; ctx.fill();
        ctx.strokeStyle='rgba(180,155,110,0.5)'; ctx.lineWidth=0.6; ctx.stroke();
        for (let r=0;r<5;r++) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(r*0.35-0.7)*s.size,Math.sin(r*0.35-0.7)*s.size*0.6); ctx.strokeStyle='rgba(160,135,90,0.4)'; ctx.lineWidth=0.5; ctx.stroke(); }
      } else if (s.type===1) {
        ctx.beginPath();
        for (let a=0;a<Math.PI*4;a+=0.15) { const rr=(a/(Math.PI*4))*s.size; const sx=Math.cos(a)*rr; const sy=Math.sin(a)*rr; a===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy); }
        ctx.strokeStyle='rgba(210,185,140,0.7)'; ctx.lineWidth=1.2; ctx.stroke();
      } else {
        for (let arm=0;arm<5;arm++) { const angle=(arm/5)*Math.PI*2-Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(angle)*s.size,Math.sin(angle)*s.size); ctx.strokeStyle='rgba(200,120,80,0.6)'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke(); }
      }
      ctx.restore();
    });
  }

  /* PLANTS */
  const plants=[];
  function initPlants(w, h) {
    plants.length=0;
    const bedY=h*0.82, n=Math.floor(w*0.025);
    for (let i=0;i<n;i++) plants.push({x:Math.random()*w,baseY:bedY,height:Math.random()*(h*0.15)+h*0.06,segs:Math.floor(Math.random()*4)+5,phase:Math.random()*Math.PI*2,speed:Math.random()*0.008+0.004,amp:Math.random()*12+5,thick:Math.random()*2.5+0.8,hue:Math.random()<0.3?'crimson':(Math.random()<0.5?'teal':'green')});
  }
  function drawPlants() {
    const t=Date.now()*0.001;
    plants.forEach(p => {
      const segH=p.height/p.segs;
      ctx.beginPath();
      let px=p.x,py=p.baseY;
      for (let s=0;s<p.segs;s++) {
        const frac=(s+1)/p.segs;
        const sway=Math.sin(t*p.speed*60+p.phase+frac*1.2)*p.amp*frac;
        const cpx=px+sway*0.6,cpy=py-segH*0.5;
        const npx=px+sway,npy=py-segH;
        s===0?ctx.moveTo(px,py):null;
        ctx.quadraticCurveTo(cpx,cpy,npx,npy);
        px=npx; py=npy;
      }
      ctx.strokeStyle=p.hue==='crimson'?'rgba(140,40,20,0.65)':p.hue==='teal'?'rgba(20,100,100,0.7)':'rgba(20,80,40,0.7)';
      ctx.lineWidth=p.thick; ctx.lineCap='round'; ctx.stroke();
    });
  }

  /* WATER BG */
  function drawWater(w,h) {
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#0e3a52'); g.addColorStop(0.12,'#082a40'); g.addColorStop(0.45,'#061e30'); g.addColorStop(0.78,'#04151f'); g.addColorStop(1,'#020c14');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }

  /* DRAW LOOP */
  function draw() {
    const w=vW(),h=vH();
    ctx.clearRect(0,0,w,h);
    drawRays(w,h);
    drawSurface(w,h);
    drawBubbles(w,h);
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

/* ── SHARED: loader, audio, mobile menu ──
   Runs immediately (script tag sits at the end of body, so the DOM
   is already parsed) instead of waiting on window 'load', which
   would otherwise block on every image/font finishing download and
   make the loader's visible duration unpredictable. */
(function () {
  const loader   = document.getElementById('loader');
  const pageRoot = document.getElementById('page-root');
  const btn      = document.getElementById('audio-btn');

  if (loader) {
    document.body.classList.add('loading');
    setTimeout(() => loader.classList.add('fade-out'), 1400);
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.classList.remove('loading');
      if (pageRoot) pageRoot.classList.add('show');
    }, 2800);
  } else if (pageRoot) {
    pageRoot.classList.add('show');
  }

  /* ── TRACK LIST ──
     Add more soundtracks here — name is what shows in the modal,
     src is the mp3 filename (must sit alongside the other site files). */
  const TRACKS = [
    { name: 'The Velvet Haven', src: 'The Velvet Haven.mp3' },
    { name: 'A Remembering of Sky', src: 'A Remembering of Sky.mp3' },
    { name: 'Coral and Sand', src: 'Coral and Sand.mp3' },
    { name: 'Sunlight Undersea', src: 'Sunlight Undersea.mp3' },
    { name: "The Captain's Lament", src: 'The Captain_s Lament.mp3' },
    { name: 'The Copper Seamstress', src: 'The Copper Seamstress.mp3' },
    { name: "The Sea's Eaving", src: "The Sea's Eaving.mp3" },
    { name: "The Siren's Summons", src: "The Siren's Summons.mp3" },
    { name: 'The Taeship', src: 'The Taeship.mp3' },
    { name: 'The Wreck', src: 'The Wreck.mp3' },
    { name: 'Thunderous', src: 'Thunderous.mp3' },
    { name: 'Underwater Waltzes', src: 'Underwater Waltzes.mp3' },
    { name: 'Vindictus', src: 'Vindictus.mp3' },
  ];

  const AUDIO_TIME_KEY = 'vh_audio_time';
  const AUDIO_PLAYING_KEY = 'vh_audio_playing';
  const AUDIO_TRACK_KEY = 'vh_audio_track';

  const savedTrackSrc = localStorage.getItem(AUDIO_TRACK_KEY);
  const AUDIO_SRC = (TRACKS.some(t => t.src === savedTrackSrc) && savedTrackSrc) || TRACKS[0].src;

  if (!window._vhAudio) {
    window._vhAudio = new Audio(AUDIO_SRC);
    window._vhAudio.loop = true;
    window._vhAudio.volume = 0.38;

    // Resume exactly where the previous page left off, instead of restarting at 0.
    const savedTime = parseFloat(localStorage.getItem(AUDIO_TIME_KEY));
    const wasPlaying = localStorage.getItem(AUDIO_PLAYING_KEY) === '1';
    if (!isNaN(savedTime)) {
      window._vhAudio.addEventListener('loadedmetadata', () => {
        window._vhAudio.currentTime = savedTime;
      }, { once: true });
    }
    if (wasPlaying) {
      // Browsers only allow this without a fresh click if the user already
      // interacted with audio on this site once before — which they have,
      // since wasPlaying can only be true after a manual play.
      window._vhAudio.play().catch(() => {});
    }

    // Save position/state continuously so a hard refresh, tab close, or the
    // next page navigation always has a fresh spot to resume from.
    const saveAudioState = () => {
      localStorage.setItem(AUDIO_TIME_KEY, String(window._vhAudio.currentTime));
      localStorage.setItem(AUDIO_PLAYING_KEY, window._vhAudio.paused ? '0' : '1');
      localStorage.setItem(AUDIO_TRACK_KEY, decodeURIComponent(window._vhAudio.src.split('/').pop()));
    };
    setInterval(saveAudioState, 1000);
    window.addEventListener('pagehide', saveAudioState);
    window.addEventListener('beforeunload', saveAudioState);
  }
  const audio = window._vhAudio;
  function syncBtn() {
    if (!btn) return;
    btn.textContent = audio.paused ? '♪' : '♬';
    btn.classList.toggle('playing', !audio.paused);
    btn.title = audio.paused ? 'Play music' : 'Pause music';
  }
  if (btn) {
    syncBtn();
    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          syncBtn();
          localStorage.setItem(AUDIO_PLAYING_KEY, '1');
        }).catch(err => {
          console.error('[Velvet Haven] audio.play() failed:', err.name, err.message, '| src:', audio.currentSrc);
          syncBtn();
          localStorage.setItem(AUDIO_PLAYING_KEY, '0');
        });
      } else {
        audio.pause();
        syncBtn();
        localStorage.setItem(AUDIO_PLAYING_KEY, '0');
      }
    });
  }
  audio.addEventListener('error', () => {
    console.error('[Velvet Haven] audio failed to load:', audio.error, '| src:', audio.currentSrc);
  });
  audio.addEventListener('play', syncBtn);
  audio.addEventListener('pause', syncBtn);

  /* ── SOUNDTRACK MODAL ── */
  (function setupMusicModal() {
    if (document.getElementById('vh-music-modal-styles')) return; // already built on this page

    const style = document.createElement('style');
    style.id = 'vh-music-modal-styles';
    style.textContent = `
      #playlist-btn { position: fixed; bottom: 22px; left: 76px; z-index: 9998; width: 46px; height: 46px; border-radius: 50%; background: rgba(4,17,31,0.85); border: 1px solid rgba(58,181,197,0.35); color: var(--teal-pale); font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s; box-shadow: 0 0 12px rgba(26,122,138,0.15); }
      #playlist-btn:hover { transform: scale(1.1); box-shadow: 0 0 22px rgba(58,181,197,0.3); }
      #music-modal-overlay { position: fixed; inset: 0; z-index: 20000; background: rgba(4,17,31,0.78); backdrop-filter: blur(6px); display: none; align-items: center; justify-content: center; padding: 20px; }
      #music-modal-overlay.open { display: flex; }
      .music-modal { background: var(--panel); border: 1px solid var(--panel-b); border-top: 3px solid var(--gold); border-radius: 4px; max-width: 420px; width: 100%; padding: 30px 28px 26px; position: relative; backdrop-filter: blur(14px); box-shadow: 0 24px 70px rgba(0,0,0,0.55); }
      .music-modal-close { position: absolute; top: 12px; right: 14px; background: none; border: none; color: var(--text-mute); font-size: 1.4rem; cursor: pointer; line-height: 1; transition: color 0.2s; padding: 6px; }
      .music-modal-close:hover { color: var(--teal-pale); }
      .music-modal h2 { font-family: var(--f-disp); font-size: 0.95rem; letter-spacing: 0.22em; color: var(--gold-lt); text-transform: uppercase; margin: 0 0 4px; text-align: center; }
      .music-modal .mm-sub { font-family: var(--f-it); font-style: italic; font-size: 0.85rem; color: var(--text-mute); text-align: center; margin-bottom: 22px; }
      .track-list { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
      .track-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: rgba(26,122,138,0.06); border: 1px solid rgba(26,122,138,0.18); border-left: 2px solid rgba(58,181,197,0.3); border-radius: 2px; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; font-family: var(--f-body); }
      .track-item:hover { background: rgba(26,122,138,0.12); border-color: rgba(58,181,197,0.35); }
      .track-item.active { border-left-color: var(--gold); background: rgba(201,168,76,0.08); }
      .track-icon { font-size: 1rem; color: var(--teal-pale); flex-shrink: 0; width: 18px; text-align: center; }
      .track-item.active .track-icon { color: var(--gold); }
      .track-name { font-size: 1rem; color: var(--text-dim); flex: 1; }
      .track-item.active .track-name { color: var(--gold-lt); }
      .track-status { font-family: var(--f-disp); font-size: 0.55rem; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; opacity: 0; }
      .track-item.active .track-status { opacity: 0.85; }
    `;
    document.head.appendChild(style);

    const playlistBtn = document.createElement('button');
    playlistBtn.id = 'playlist-btn';
    playlistBtn.title = 'Choose soundtrack';
    playlistBtn.innerHTML = '🎶';
    document.body.appendChild(playlistBtn);

    const overlay = document.createElement('div');
    overlay.id = 'music-modal-overlay';
    overlay.innerHTML = `
      <div class="music-modal">
        <button class="music-modal-close" title="Close">&times;</button>
        <h2>The Haven's Soundtrack</h2>
        <div class="mm-sub">Choose the tide you'd like to sail to</div>
        <div class="track-list"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const trackList = overlay.querySelector('.track-list');
    TRACKS.forEach(track => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'track-item';
      item.dataset.src = track.src;
      item.innerHTML = `<span class="track-icon">🎵</span><span class="track-name">${track.name}</span><span class="track-status">Playing</span>`;
      item.addEventListener('click', () => {
        const wasPaused = audio.paused;
        audio.src = track.src;
        audio.currentTime = 0;
        localStorage.setItem(AUDIO_TRACK_KEY, track.src);
        localStorage.setItem(AUDIO_TIME_KEY, '0');
        if (!wasPaused) audio.play().catch(() => {});
        highlightActive();
      });
      trackList.appendChild(item);
    });

    function highlightActive() {
      const current = decodeURIComponent(audio.src.split('/').pop());
      trackList.querySelectorAll('.track-item').forEach(item => {
        item.classList.toggle('active', item.dataset.src === current);
      });
    }

    function closeModal() { overlay.classList.remove('open'); }
    overlay.querySelector('.music-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    playlistBtn.addEventListener('click', () => {
      highlightActive();
      overlay.classList.add('open');
    });
  })();
})();

/* ── SPA-STYLE NAVIGATION ──
   Every page load destroys the JS context (and with it, the <audio>
   element), which is why music used to stop/restart on every click.
   This intercepts clicks on internal site links, fetches the target
   page in the background, and swaps in just its #page-root content
   and page-specific <style id="page-style"> block — leaving the nav,
   canvas, audio element, and playlist modal untouched and running
   continuously. A real page load never happens after the first one. */
(function setupRouter() {
  const SITE_PAGES = ['index.html', 'vh-about.html', 'vh-gilded.html', 'vh-tidal-court.html', 'vh-connect.html'];

  function pageNameFromUrl(url) {
    const path = url.split('#')[0].split('?')[0];
    const name = path.split('/').pop();
    return name === '' ? 'index.html' : name;
  }

  function isInternalPageLink(a) {
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
    let url;
    try { url = new URL(href, window.location.href); } catch (e) { return false; }
    if (url.origin !== window.location.origin) return false;
    return SITE_PAGES.includes(pageNameFromUrl(url.pathname));
  }

  function updateActiveNav(pageName) {
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === pageName);
    });
  }

  function closeMobileMenu() {
    const m = document.getElementById('mobileMenu');
    if (m) m.classList.remove('open');
  }

  let navigating = false;
  function navigateTo(url, push) {
    if (navigating) return;
    navigating = true;

    fetch(url).then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newRoot = doc.getElementById('page-root');
      const newStyle = doc.getElementById('page-style');
      const newTitle = doc.querySelector('title');
      if (!newRoot) throw new Error('no #page-root in fetched page');

      const pageRoot = document.getElementById('page-root');
      const pageStyle = document.getElementById('page-style');

      closeMobileMenu();
      pageRoot.classList.remove('show');

      setTimeout(() => {
        pageRoot.innerHTML = newRoot.innerHTML;
        if (pageStyle && newStyle) pageStyle.textContent = newStyle.textContent;
        if (newTitle) document.title = newTitle.textContent;
        updateActiveNav(pageNameFromUrl(url));
        window.scrollTo(0, 0);
        // Force a reflow so the opacity transition actually replays.
        void pageRoot.offsetWidth;
        pageRoot.classList.add('show');

        if (push) history.pushState({ vh: true }, '', url);
        navigating = false;
      }, 260);
    }).catch(err => {
      console.error('[Velvet Haven] SPA navigation failed, falling back to full load:', err);
      window.location.href = url;
    });
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!isInternalPageLink(a)) return;
    e.preventDefault();
    const url = new URL(a.getAttribute('href'), window.location.href).href;
    if (pageNameFromUrl(url) === pageNameFromUrl(window.location.pathname) ) return; // already here
    navigateTo(url, true);
  });

  window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
  });
})();

function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

/* Touch-device fallback for the Gilded Threads flip cards (see the
   @media (hover: none) rules in vh-gilded.html). Delegated on document
   so it keeps working after an SPA content swap without re-binding. */
document.addEventListener('click', (e) => {
  const card = e.target.closest('.g-card');
  if (!card) return;
  if (e.target.closest('a')) return; // let real links navigate normally
  if (window.matchMedia('(hover: none)').matches) {
    card.classList.toggle('flipped');
  }
});