/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- THEME ---------------- */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('bbl-theme') || 'dark'; } catch(_) { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('bbl-theme', theme); } catch(_) {}
  }, [theme]);
  return [theme, setTheme];
}

/* ---------------- ICONS ---------------- */
const Ic = {
  home:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M3 12L12 4l9 8M5 10v10h14V10"/></svg>,
  body:    <svg className="ic-svg" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.4"/><path d="M12 8v6m-3 7l3-7 3 7M9 11h6"/></svg>,
  motion:  <svg className="ic-svg" viewBox="0 0 24 24"><path d="M3 18l5-10 4 6 5-9 4 8"/></svg>,
  velocity:<svg className="ic-svg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1118 0M12 12l5-3"/></svg>,
  flag:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M5 21V4m0 0l10 3-3 4 5 3-12 2"/></svg>,
  dumbbell:<svg className="ic-svg" viewBox="0 0 24 24"><path d="M3 9v6m4-9v12m0-6h10m0-6v12m4-9v6"/></svg>,
  star:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>,
  download:<svg className="ic-svg" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"/></svg>,
  compare: <svg className="ic-svg" viewBox="0 0 24 24"><path d="M8 4v16m8-16v16M3 8h5m8 0h5M3 16h5m8 0h5"/></svg>,
  filter:  <svg className="ic-svg" viewBox="0 0 24 24"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
  sun:     <svg className="ic-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>,
  moon:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M20 14A8 8 0 119 4a7 7 0 0011 10z"/></svg>,
  chev:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>,
  menu:    <svg className="ic-svg" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  printer: <svg className="ic-svg" viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v6H8z"/></svg>,
};

/* ---------------- PITCHER SELECT (combobox) ---------------- */
function PitcherSelect({ pitchers, activeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  const active = pitchers.find(p => p.id === activeId) || pitchers[0];

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = pitchers.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="ps-wrap" ref={ref}>
      <button className="ps-trigger" onClick={() => setOpen(o => !o)}>
        <div className="ps-avatar">{active.name[0]}</div>
        <div className="ps-info">
          <div className="ps-name">{active.name}</div>
        </div>
        <svg className="ic-svg ps-chev" viewBox="0 0 24 24" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="ps-dropdown">
          <input
            className="ps-search"
            type="text"
            placeholder="선수 검색..."
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          <div className="ps-list">
            {filtered.length === 0 ? (
              <div className="ps-empty">검색 결과 없음</div>
            ) : filtered.map(p => (
              <button key={p.id}
                className={`ps-item ${p.id === activeId ? 'active' : ''}`}
                onClick={() => { onSelect(p.id); setOpen(false); setQ(''); }}>
                <div className="ps-avatar sm">{p.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ps-name">{p.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- SIDEBAR ---------------- */
function Sidebar({ pitchers, activeId, onSelect, mode, onMode, navItems, activeNav, onNavSelect, isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sb-brand">
        <img src="assets/logo-bbl.png" alt="BBL"/>
        <div>
          <div className="name">BioMotion Lab</div>
          <div className="sub">Pitcher Dashboard</div>
        </div>
      </div>

      <div className="sb-section-title">Pitcher</div>
      <PitcherSelect pitchers={pitchers} activeId={activeId} onSelect={(id) => { onSelect(id); onClose && onClose(); }}/>

      <div className="sb-section-title">Sections</div>
      <div className="sb-nav">
        {navItems.map(n => (
          <button key={n.id}
            className={`sb-nav-item ${activeNav === n.id ? 'active' : ''}`}
            onClick={() => { onNavSelect(n.id); onClose && onClose(); }}>
            <span className="ic">{n.icon}</span>
            {n.label}
            <span className="num">{n.num}</span>
          </button>
        ))}
      </div>

      <div className="sb-section-title">View Mode</div>
      <div className="sb-nav">
        <button className={`sb-nav-item ${mode === 'single' ? 'active' : ''}`} onClick={() => onMode('single')}>
          <span className="ic">{Ic.home}</span>
          개별 분석
        </button>
        <button className={`sb-nav-item ${mode === 'compare' ? 'active' : ''}`} onClick={() => onMode('compare')}>
          <span className="ic">{Ic.compare}</span>
          선수 비교
        </button>
      </div>

      <div className="sb-foot">
        <button className="sb-foot-btn" onClick={() => window.print()}>
          {Ic.printer}
          <span>PDF</span>
        </button>
      </div>
    </aside>
  );
}

/* ---------------- TOP BAR ---------------- */
function DashTopBar({ pitcher, mode, theme, onTheme, onMenu }) {
  return (
    <div className="topbar2">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-toggle" onClick={onMenu}>{Ic.menu}</button>
        <div className="tb-crumbs">
          <span>BBL</span><span className="sep">/</span>
          <span>{mode === 'compare' ? 'Compare Mode' : '개별 분석'}</span>
          {mode !== 'compare' && pitcher && <>
            <span className="sep">/</span>
            <span className="now">{pitcher.name}</span>
          </>}
        </div>
      </div>
      <div className="tb-actions">
        <span className="tb-filter">
          {Ic.filter}
          측정일&nbsp;<b>{pitcher?.date || '2026-04-24'}</b>
        </span>
        <div className="seg-toggle">
          <button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')} title="Light">
            {Ic.sun}
          </button>
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')} title="Dark">
            {Ic.moon}
          </button>
        </div>
        <button className="tb-btn primary" onClick={() => window.print()}>
          {Ic.download} <span>PDF</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------- KPI CARDS ---------------- */
function KPI({ hero, label, value, unit, deg, band, foot, sparkData }) {
  const bandLabel = { high: '기준 상위', mid: '기준 범위', low: '기준 미만', na: '미측정' };
  return (
    <div className={`kpi ${hero ? 'kpi-hero' : ''}`}>
      <div className="kpi-label"><span className="dot"/>{label}</div>
      <div className="kpi-value">
        {value}
        {deg && <span className="deg">°</span>}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        {band && <span className={`kpi-band ${band}`}>{bandLabel[band]}</span>}
        {foot && <span className="kpi-trend">{foot}</span>}
      </div>
      {sparkData && <Spark data={sparkData}/>}
    </div>
  );
}

function Spark({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => `${(i / (data.length-1)) * 100},${100 - ((v-min)/range)*90}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--bbl-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

/* ---------------- OVERVIEW PANELS ---------------- */
function VelocityPanel({ p }) {
  const trials = useMemo(() => {
    // synth 10 trials with peak = velocity, avg = velocityAvg
    const base = p.velocityAvg;
    const peak = p.velocity;
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push(base - 1.5 + Math.sin(i * 0.7) * 1.2 + (Math.random() * 0.6));
    }
    arr[Math.floor(Math.random() * 10)] = peak;
    return arr;
  }, [p.id]);
  const max = Math.max(...trials, peak(p));
  const min = Math.min(...trials) - 1;
  function peak(p) { return p.velocity; }
  return (
    <div className="panel" style={{ minHeight: 280 }}>
      <div className="panel-head">
        <div>
          <div className="kicker">Velocity Profile</div>
          <h3>구속 추이 — 10회 시기별</h3>
          <div className="sub">· 피크 {p.velocity.toFixed(1)} · 평균 {p.velocityAvg.toFixed(1)} km/h</div>
        </div>
        <div className="panel-toolbar">
          <span className="panel-pill">10 trials</span>
        </div>
      </div>
      <svg viewBox="0 0 600 200" style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id="velgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2563EB" stopOpacity="0.3"/>
            <stop offset="1" stopColor="#2563EB" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* horizontal grid */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="40" x2="580" y1={20 + i * 40} y2={20 + i * 40}
            stroke="var(--d-border)" strokeWidth="1"/>
        ))}
        {/* Y labels */}
        {[max, min + (max-min)*0.66, min + (max-min)*0.33, min].map((v,i) => (
          <text key={i} x="34" y={24 + i * 40} fill="var(--d-fg3)" fontSize="10"
            fontFamily="Inter" textAnchor="end" fontWeight="600">{v.toFixed(0)}</text>
        ))}
        {/* avg line */}
        <line x1="40" x2="580" y1={20 + (1 - (p.velocityAvg-min)/(max-min)) * 160}
          y2={20 + (1 - (p.velocityAvg-min)/(max-min)) * 160}
          stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
        <text x="576" y={20 + (1 - (p.velocityAvg-min)/(max-min)) * 160 - 4}
          fill="#60a5fa" fontSize="9" fontFamily="Inter" textAnchor="end" fontWeight="700">
          AVG {p.velocityAvg.toFixed(1)}
        </text>
        {/* area + line */}
        {(() => {
          const xs = trials.map((_, i) => 40 + (i / 9) * 540);
          const ys = trials.map(v => 20 + (1 - (v-min)/(max-min)) * 160);
          const path = xs.map((x,i) => `${i===0?'M':'L'}${x},${ys[i]}`).join('');
          const area = path + `L${xs[xs.length-1]},180 L${xs[0]},180 Z`;
          return (<g>
            <path d={area} fill="url(#velgrad)"/>
            <path d={path} fill="none" stroke="#2563EB" strokeWidth="2.5"/>
            {xs.map((x,i) => {
              const isPeak = trials[i] === Math.max(...trials);
              return (
                <g key={i}>
                  <circle cx={x} cy={ys[i]} r={isPeak ? 5 : 3.5} fill={isPeak ? '#fff' : '#2563EB'}
                    stroke="#2563EB" strokeWidth="2"/>
                  {isPeak && <text x={x} y={ys[i]-12} fill="var(--d-fg1)"
                    fontSize="11" fontFamily="Inter" fontWeight="800" textAnchor="middle">
                    {trials[i].toFixed(1)} <tspan fill="var(--d-fg3)" fontSize="8">km/h</tspan>
                  </text>}
                </g>
              );
            })}
          </g>);
        })()}
      </svg>
    </div>
  );
}

function VideoPanel({ p }) {
  const videoRef = useRef(null);
  const [rate, setRate] = useState(0.1);
  const [isPaused, setIsPaused] = useState(true);
  const rates = [0.1, 0.25, 1];
  const src = p.mocapUrl || p.video || p.videoUrl;
  const isYouTube = src && /youtu\.?be/.test(src);
  let ytEmbed = null;
  if (isYouTube) {
    const m = src.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    if (m) ytEmbed = `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`;
  }

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);

  const FRAME = 1 / 30;
  const step = async (dir) => {
    const v = videoRef.current;
    if (!v) return;
    try { await v.pause(); } catch(_) {}
    const dur = isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.max(0, Math.min(dur, v.currentTime + dir * FRAME));
  };
  const toggle = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { try { await v.play(); } catch(_) {} } else v.pause();
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === ' ') { e.preventDefault(); toggle(); }
  };

  const showScrubber = !!src && !ytEmbed;

  return (
    <div className="panel" style={{ minHeight: 280, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-head">
        <div>
          <div className="kicker">Motion Capture</div>
          <h3>투구 영상 시퀀스</h3>
          <div className="sub">· {p.name} {showScrubber ? '· ← → 프레임 · Space 재생/정지' : '· 3D 스켈레톤 트래킹'}</div>
        </div>
        {showScrubber ? (
          <div className="rate-switch">
            {rates.map(r => (
              <button key={r}
                className={`rate-btn ${rate === r ? 'active' : ''}`}
                onClick={() => setRate(r)}>{r}×</button>
            ))}
          </div>
        ) : (
          <div className="mocap-badge">
            <span className="mocap-dot"/> LIVE
          </div>
        )}
      </div>

      <div className="video-wrap" tabIndex={0} onKeyDown={onKey}>
        {ytEmbed ? (
          <iframe src={ytEmbed} title={`${p.name} mocap`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
        ) : src ? (
          <video ref={videoRef} src={src} playsInline preload="auto"
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
            onLoadedMetadata={(e) => { e.currentTarget.playbackRate = rate; }}/>
        ) : (
          <MocapPlaceholder p={p}/>
        )}
        {showScrubber && (
          <div className="frame-controls">
            <button className="frame-btn" onClick={() => step(-1)}>◀ −1f</button>
            <button className="frame-btn play" onClick={toggle}>{isPaused ? '▶ 재생' : '❚❚ 정지'}</button>
            <button className="frame-btn" onClick={() => step(1)}>+1f ▶</button>
          </div>
        )}
      </div>

      <div className="video-tags">
        <span className="video-tag">{p.archetype}</span>
        <span className="video-tag">{p.velocity.toFixed(0)} km/h</span>
        <span className="video-tag">{p.pitchType || 'Fastball'}</span>
        <span className="video-tag">측정 · {p.date}</span>
      </div>
    </div>
  );
}

/* Motion Capture Placeholder — 3D-스켈레톤 애니메이션 */
function MocapPlaceholder({ p }) {
  return (
    <div className="mocap-stage">
      {/* 그리드 바닥 */}
      <svg className="mocap-grid" viewBox="0 0 400 225" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(96,165,250,0)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.25)" />
          </linearGradient>
        </defs>
        {/* 원근 그리드 */}
        {[...Array(8)].map((_, i) => {
          const y = 140 + i * 12;
          const inset = i * 14;
          return <line key={'h'+i} x1={inset} y1={y} x2={400-inset} y2={y} stroke="url(#grid-fade)" strokeWidth="0.5"/>;
        })}
        {[...Array(11)].map((_, i) => {
          const x1 = 40 + i * 32;
          const x2 = 100 + i * 20;
          return <line key={'v'+i} x1={x1} y1={140} x2={x2} y2={225} stroke="url(#grid-fade)" strokeWidth="0.5"/>;
        })}
      </svg>

      {/* 스켈레톤 (애니메이션 SVG) */}
      <svg className="mocap-skeleton" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="joint-glow">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* 본 (라인) */}
        <g className="bones" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* 척추 */}
          <line x1="200" y1="60" x2="200" y2="130" className="bone"/>
          {/* 어깨 라인 */}
          <line x1="170" y1="80" x2="230" y2="80" className="bone"/>
          {/* 좌측 팔 (글러브) */}
          <line x1="170" y1="80" x2="145" y2="105" className="bone"/>
          <line x1="145" y1="105" x2="125" y2="125" className="bone"/>
          {/* 우측 팔 (투구) — 동적 */}
          <line x1="230" y1="80" x2="265" y2="65" className="bone arm-up"/>
          <line x1="265" y1="65" x2="295" y2="55" className="bone arm-up"/>
          {/* 골반 */}
          <line x1="180" y1="130" x2="220" y2="130" className="bone"/>
          {/* 좌측 다리 (앞발) */}
          <line x1="180" y1="130" x2="165" y2="170" className="bone"/>
          <line x1="165" y1="170" x2="155" y2="205" className="bone"/>
          {/* 우측 다리 (축발) */}
          <line x1="220" y1="130" x2="235" y2="170" className="bone"/>
          <line x1="235" y1="170" x2="225" y2="205" className="bone"/>
        </g>

        {/* 관절 (점) */}
        <g className="joints" fill="#60a5fa">
          {[
            [200,55,3.5,'head'],
            [200,60,2.5,'neck'],
            [170,80,2.5,'sh-l'],
            [230,80,2.5,'sh-r'],
            [145,105,2,'el-l'],
            [125,125,2,'wr-l'],
            [265,65,2,'el-r'],
            [295,55,2.5,'wr-r'],
            [200,130,2.5,'pelvis'],
            [180,130,2,'hip-l'],
            [220,130,2,'hip-r'],
            [165,170,2,'kn-l'],
            [155,205,2,'an-l'],
            [235,170,2,'kn-r'],
            [225,205,2,'an-r'],
          ].map(([x,y,r,k]) => (
            <g key={k}>
              <circle cx={x} cy={y} r={r*2.5} fill="url(#joint-glow)"/>
              <circle cx={x} cy={y} r={r}/>
            </g>
          ))}
        </g>

        {/* 머리 */}
        <circle cx="200" cy="48" r="10" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>

        {/* 공 궤적 */}
        <g className="ball-trace">
          <path d="M 295 55 Q 340 40 380 30" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3" fill="none" opacity="0.5"/>
          <circle cx="295" cy="55" r="3" fill="#fbbf24" className="ball"/>
        </g>

        {/* 측정 라벨 */}
        <g className="mocap-labels" fontSize="7" fontFamily="ui-monospace, monospace" fill="#60a5fa" opacity="0.7">
          <text x="305" y="48">WR · {(p.velocity * 0.27).toFixed(1)} m/s</text>
          <text x="100" y="138">PEL · {p.layback?.deg.toFixed(0) || 90}°</text>
          <text x="155" y="220">FT · stride</text>
        </g>
      </svg>

      {/* HUD */}
      <div className="mocap-hud">
        <div className="hud-l">
          <div className="hud-row"><span>SUBJECT</span><b>{p.name}</b></div>
          <div className="hud-row"><span>FRAME</span><b className="frame-counter">000 / 240</b></div>
          <div className="hud-row"><span>FPS</span><b>240</b></div>
        </div>
        <div className="hud-r">
          <div className="hud-row"><span>BALL VEL</span><b>{p.velocity.toFixed(1)} km/h</b></div>
          <div className="hud-row"><span>MAX LAYBACK</span><b>{p.layback?.deg.toFixed(1) || '—'}°</b></div>
          <div className="hud-row"><span>STATUS</span><b style={{color:'#4ade80'}}>● TRACKING</b></div>
        </div>
      </div>
    </div>
  );
}

function CoreIssuePanel({ p }) {
  return (
    <div className="panel" style={{ minHeight: 280 }}>
      <div className="panel-head">
        <div>
          <div className="kicker">Core Issue</div>
          <h3>핵심 진단</h3>
          <div className="sub">· 통합 분석 자동 추출</div>
        </div>
      </div>
      <div className="diag-row" style={{ marginTop: 8 }}>
        <span className={`sev sev-${p.severity}`}>{p.severity === 'NONE' ? 'BALANCED' : p.severity}</span>
        <div style={{ fontSize: 13, color: 'var(--d-fg1)', lineHeight: 1.5, fontWeight: 600 }}>
          {p.coreIssue}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--d-fg2)' }}>
          <svg className="ic-svg" viewBox="0 0 24 24" style={{ color: '#4ade80' }}><path d="M5 12l5 5 9-11"/></svg>
          <b>강점 {p.strengths.length}</b>
          <span style={{ color: 'var(--d-fg3)' }}>· {p.strengths[0]?.title || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--d-fg2)' }}>
          <svg className="ic-svg" viewBox="0 0 24 24" style={{ color: '#f87171' }}><path d="M5 5l14 14M19 5L5 19"/></svg>
          <b>약점 {p.weaknesses.length}</b>
          <span style={{ color: 'var(--d-fg3)' }}>· {p.weaknesses[0]?.title || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--d-fg2)' }}>
          <svg className="ic-svg" viewBox="0 0 24 24" style={{ color: '#fbbf24' }}><path d="M12 9v4m0 3v.01M12 3l10 18H2z"/></svg>
          <b>플래그 {p.flags.length}</b>
          <span style={{ color: 'var(--d-fg3)' }}>· {p.flags[0]?.title || '특이 신호 없음'}</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--d-border)', fontSize: 11, color: 'var(--d-fg3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>측정일 · {p.date}</span>
        <span>{p.archetype}</span>
      </div>
    </div>
  );
}

/* ---------------- COLLAPSIBLE SECTION ---------------- */
function SectionBlock({ num, title, sub, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section-block ${open ? 'open' : ''}`}>
      <button className="section-bar" onClick={() => setOpen(o => !o)}>
        <div className="num">{num}</div>
        <div>
          <h2>{title}</h2>
          {sub && <div className="sub">{sub}</div>}
        </div>
        <span className="chev">{Ic.chev}</span>
      </button>
      <div className="section-body">
        {children}
      </div>
    </div>
  );
}

/* ---------------- VIDEO CARD (reused) ---------------- */
function VideoCard({ src }) {
  const videoRef = useRef(null);
  const [rate, setRate] = useState(0.1);
  const [isPaused, setIsPaused] = useState(true);
  const rates = [0.1, 1];
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);
  const FRAME = 1 / 30;
  const step = async (dir) => {
    const v = videoRef.current;
    if (!v) return;
    try { await v.pause(); } catch(_) {}
    const dur = isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.max(0, Math.min(dur, v.currentTime + dir * FRAME));
  };
  const toggle = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { try { await v.play(); } catch(_) {} } else v.pause();
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === ' ') { e.preventDefault(); toggle(); }
  };
  return (
    <div className="video-card">
      <div className="card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="section-kicker" style={{ fontSize: 10 }}>Motion Capture</div>
          <h3 className="card-title" style={{ marginTop: 4, fontSize: 14 }}>투구 영상 시퀀스</h3>
          <div className="card-sub" style={{ fontSize: 11 }}>← → 프레임 · Space 재생/정지</div>
        </div>
        <div className="rate-switch">
          {rates.map(r => (
            <button key={r}
              className={`rate-btn ${rate === r ? 'active' : ''}`}
              onClick={() => setRate(r)}>{r}×</button>
          ))}
        </div>
      </div>
      <div className="video-wrap" tabIndex={0} onKeyDown={onKey}>
        <video ref={videoRef} src={src} playsInline preload="auto"
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = rate; }}
          style={{ width: '100%', display: 'block', borderRadius: 12, background: '#000' }}/>
        <div className="frame-controls">
          <button className="frame-btn" onClick={() => step(-1)}>◀ −1f</button>
          <button className="frame-btn play" onClick={toggle}>{isPaused ? '▶ 재생' : '❚❚ 정지'}</button>
          <button className="frame-btn" onClick={() => step(1)}>+1f ▶</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SINGLE PITCHER VIEW ---------------- */
function SinglePitcherView({ p }) {
  const physRows = [
    { k: 'CMJ 단위파워', sub: 'W/kg', val: p.physical.cmjPower.cmj, band: p.physical.cmjPower.band },
    { k: '절대근력 IMTP', sub: 'N/kg', val: p.physical.maxStrength.perKg ?? '—', band: p.physical.maxStrength.band },
    { k: '반응성 RSI-mod', sub: 'm/s', val: p.physical.reactive.cmj, band: p.physical.reactive.band },
    { k: '반동 활용 EUR', sub: '비율', val: p.physical.ssc.value, band: p.physical.ssc.band },
    { k: '악력', sub: 'kg', val: p.physical.release.value, band: p.physical.release.band },
  ];
  const bandLabel = { high: '상위', mid: '범위', low: '미만', na: '미측정' };
  const taLeak = p.energy.etiTA < 0.85;

  return (
    <>
      {/* Page head */}
      <div className="page-head">
        <div>
          <h1 className="page-title">{p.name}</h1>
          <div className="pitcher-meta" style={{ marginTop: 8 }}>
            <div>유형<b>{p.archetype}</b></div>
            <div>측정일<b>{p.date}</b></div>
            <div>태그<b>{p.tags.join(' · ') || '—'}</b></div>
          </div>
        </div>
        <span className={`sev sev-${p.severity}`} style={{ fontSize: 11, padding: '6px 12px' }}>
          {p.severity === 'NONE' ? 'BALANCED' : p.severity + ' PRIORITY'}
        </span>
      </div>

      {/* Hero — Video + Core Issue */}
      <div className="hero-grid">
        <VideoPanel p={p}/>
        <CoreIssuePanel p={p}/>
      </div>

      {/* KPI grid */}
      <div className="kpi-grid">
        <KPI hero label="Peak Velocity" value={p.velocity.toFixed(1)} unit="km/h"
          foot={`평균 ${p.velocityAvg.toFixed(1)}`}/>
        <KPI label="Max Layback" value={p.layback.deg.toFixed(1)} deg
          band={p.layback.band}
          foot="프로 160°–180°"/>
        <KPI label="Trunk → Arm ETI" value={p.energy.etiTA.toFixed(2)}
          band={taLeak ? 'low' : 'high'}
          foot={taLeak ? `${p.energy.leakPct}% 손실` : '효율 전달'}/>
        <KPI label="CMJ 단위파워" value={p.physical.cmjPower.cmj} unit="W/kg"
          band={p.physical.cmjPower.band}
          foot="기준 50+"/>
      </div>

      {/* Section: Physical */}
      <SectionBlock num="01" title="Physical Profile · 체력 프로파일"
        sub="· 5개 핵심 역량 종합 평가">
        <div className="dash-grid">
          <div className="panel" style={{ background: 'transparent', border: '1px solid var(--d-border)' }}>
            <div className="panel-head">
              <div>
                <div className="kicker">Physical Radar</div>
                <h3>5축 역량 레이더</h3>
                <div className="sub">· 안쪽 · 기준 미만 / 바깥 · 기준 상위</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <RadarChart data={p.radar}/>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="kicker">Detailed Metrics</div>
                <h3>세부 측정값</h3>
              </div>
            </div>
            <div>
              {physRows.map((r,i) => (
                <div className="metric-row" key={i}>
                  <div className="lbl">{r.k}<small>{r.sub}</small></div>
                  <div className="val">{r.val}</div>
                  <div className={`band band-${r.band}`}>{bandLabel[r.band]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section: Mechanics */}
      <SectionBlock num="02" title="Pitching Mechanics · 투구 메카닉스"
        sub="· 키네매틱 시퀀스 · 분절 회전 속도 · 에너지 전달">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="kicker">Sequence Timing</div>
                <h3>키네매틱 시퀀스 — 분절 회전 순서</h3>
                <div className="sub">· 이상적: 골반 → 몸통 → 상완 (proximal-to-distal) · 간격 30–60ms</div>
              </div>
            </div>
            <SequenceChart sequence={p.sequence}/>
            <div className="chart-caption">{p.sequence.comment}</div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="kicker">Peak Angular Velocity</div>
                <h3>분절별 최대 회전 속도</h3>
                <div className="sub">· 프로 범위: 골반 580–640 · 몸통 800–900 · 상완 1450–1600 °/s</div>
              </div>
            </div>
            <AngularChart angular={p.angular}/>
            <div className="chart-caption">{p.angular.comment}</div>
            <div className="chip-row">
              <div className="gain-chip">골반→몸통 <b>×{p.angular.gainPT.toFixed(2)}</b></div>
              <div className="gain-chip">몸통→상완 <b>×{p.angular.gainTA.toFixed(2)}</b></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="kicker">Energy Transfer</div>
                <h3>에너지 전달과 누수</h3>
                <div className="sub">· ETI = 분절 간 에너지 전달 비율 · 1.0이면 손실 없음</div>
              </div>
            </div>
            <EnergyFlow energy={p.energy}/>
            <div className="chart-caption">{p.energy.comment}</div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="kicker">Max Layback</div>
                <h3>팔 뒤로 젖힘 — 가속 거리</h3>
                <div className="sub">· 프로 범위 160°–180°</div>
              </div>
            </div>
            <div className="layback-card" style={{ padding: 0, background: 'transparent', border: 'none', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <div className="layback-value">{p.layback.deg.toFixed(1)}<span className="deg">°</span></div>
                  <div className={`band band-${p.layback.band}`} style={{ fontSize: 11 }}>
                    {bandLabel[p.layback.band]}
                  </div>
                </div>
                <div style={{ color: 'var(--d-fg2)', marginTop: 12, fontSize: 13 }}>{p.layback.note}</div>
              </div>
              <div>
                <div className="layback-photo" style={{ maxWidth: 200 }}>
                  <img src="assets/max-layback.png" alt="Max Layback reference"/>
                </div>
                <div className="layback-photo-caption">Reference</div>
              </div>
              <LaybackMeter deg={p.layback.deg}/>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section: SW */}
      <SectionBlock num="03" title="Strengths & Weaknesses · 강점·약점"
        sub="· 통합 판정 기반">
        <div className="sw-grid">
          <div>
            <div className="sw-title pos">
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 8l4 4 6-8" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              강점 · Strengths
            </div>
            <div className="sw-list">
              {p.strengths.map((s,i) => (
                <div className="sw-item pos" key={i}>
                  <div className="t">{s.title}</div>
                  <div className="d">{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sw-title neg">
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="#f87171" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
              약점 · Improvement
            </div>
            <div className="sw-list">
              {p.weaknesses.map((w,i) => (
                <div className="sw-item neg" key={i}>
                  <div className="t">{w.title}</div>
                  <div className="d">{w.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section: Flags */}
      {p.flags.length > 0 && (
        <SectionBlock num="04" title="Diagnostic Flags · 진단 플래그"
          sub="· 자동 규칙 엔진이 감지한 주의·경계 신호">
          {p.flags.map((f,i) => (
            <div className={`flag-item ${f.severity}`} key={i}>
              <div className="head">
                <span className={`sev sev-${f.severity}`} style={{ padding: '4px 8px', fontSize: 10 }}>{f.severity}</span>
                <span className="t">{f.title}</span>
              </div>
              <ul>{f.evidence.map((e,j) => <li key={j}>{e}</li>)}</ul>
              <div className="impl">{f.implication}</div>
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Section: Training */}
      <SectionBlock num={p.flags.length ? '05' : '04'}
        title="Training Priorities · 훈련 우선순위"
        sub="· 진단 기반 4–12주 블록">
        <div className="training-list">
          {p.training.map((t,i) => (
            <div className="training-card" data-idx={`0${i+1}`} key={i}>
              <div className="tc-head">
                <span className="tc-cat">{t.cat}</span>
                <h3 className="tc-title">{t.title}</h3>
                <span className="tc-weeks">{t.weeks}</span>
              </div>
              <div className="tc-reason">{t.rationale}</div>
              <ul className="tc-drills">
                {t.drills.map((d,j) => <li key={j}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </SectionBlock>

      <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: 'var(--d-surface)', border: '1px solid var(--d-border)', fontSize: 11, color: 'var(--d-fg3)', textAlign: 'center' }}>
        <b style={{ color: 'var(--d-fg1)' }}>BioMotion Baseball Lab</b> · Kookmin University · 
        <a href="https://biomotion.kr" style={{ color: 'var(--bbl-primary)', marginLeft: 4 }}>biomotion.kr</a>
        <div style={{ marginTop: 4 }}>· Uplift Labs 마커리스 모션캡처 · VALD ForceDecks · 랩소도 통합 분석</div>
      </div>
    </>
  );
}

/* ---------------- COMPARE VIEW ---------------- */
function CompareCol({ p }) {
  const bandLabel = { high: '상위', mid: '범위', low: '미만', na: '—' };
  const taLeak = p.energy.etiTA < 0.85;
  return (
    <div className="compare-col">
      <div className="col-head">
        <div className="av">{p.name[0]}</div>
        <div>
          <div className="nm">{p.name}</div>
          <div className="meta">{p.archetype} · {p.date}</div>
        </div>
      </div>
      <div className="col-body">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 36, fontWeight: 900, color: 'var(--d-fg1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {p.velocity.toFixed(1)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--d-fg3)', fontWeight: 600 }}>km/h · peak</div>
          <span className={`sev sev-${p.severity}`} style={{ marginLeft: 'auto', fontSize: 10, padding: '4px 8px' }}>
            {p.severity === 'NONE' ? 'BAL' : p.severity}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <RadarChart data={p.radar}/>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="compare-stat">
            <span className="lbl">CMJ 단위파워</span>
            <span className="val">{p.physical.cmjPower.cmj}</span>
            <span className={`band ${p.physical.cmjPower.band}`}>{bandLabel[p.physical.cmjPower.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">절대근력 (N/kg)</span>
            <span className="val">{p.physical.maxStrength.perKg ?? '—'}</span>
            <span className={`band ${p.physical.maxStrength.band}`}>{bandLabel[p.physical.maxStrength.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">RSI-mod</span>
            <span className="val">{p.physical.reactive.cmj}</span>
            <span className={`band ${p.physical.reactive.band}`}>{bandLabel[p.physical.reactive.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">EUR</span>
            <span className="val">{p.physical.ssc.value}</span>
            <span className={`band ${p.physical.ssc.band}`}>{bandLabel[p.physical.ssc.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">악력 (kg)</span>
            <span className="val">{p.physical.release.value}</span>
            <span className={`band ${p.physical.release.band}`}>{bandLabel[p.physical.release.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">Max Layback</span>
            <span className="val">{p.layback.deg.toFixed(1)}°</span>
            <span className={`band ${p.layback.band}`}>{bandLabel[p.layback.band]}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">Trunk→Arm ETI</span>
            <span className="val">{p.energy.etiTA.toFixed(2)}</span>
            <span className={`band ${taLeak ? 'low' : 'high'}`}>{taLeak ? '미만' : '상위'}</span>
          </div>
          <div className="compare-stat">
            <span className="lbl">상완 회전속도</span>
            <span className="val">{p.angular.arm}<span style={{fontSize:10,color:'var(--d-fg3)',marginLeft:2}}>°/s</span></span>
            <span className={`band ${p.angular.armBand}`}>{bandLabel[p.angular.armBand]}</span>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--d-surface-3)', border: '1px solid var(--d-border)' }}>
          <div style={{ fontSize: 10, color: 'var(--d-fg3)', fontFamily: 'Inter', letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Core Issue</div>
          <div style={{ fontSize: 13, color: 'var(--d-fg1)', fontWeight: 600, lineHeight: 1.5 }}>{p.coreIssue}</div>
        </div>
      </div>
    </div>
  );
}

function CompareView({ pitchers, leftId, rightId, onLeft, onRight }) {
  const left = pitchers.find(p => p.id === leftId);
  const right = pitchers.find(p => p.id === rightId);
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Compare Mode</h1>
          <div className="page-sub">선수 간 동일 지표 비교 · 색상 띠로 기준 대비 위치 확인</div>
        </div>
      </div>
      <div className="compare-bar">
        <span className="label">A</span>
        <div className="compare-slot">
          <select value={leftId} onChange={(e) => onLeft(e.target.value)}>
            {pitchers.map(p => <option key={p.id} value={p.id}>{p.name} · {p.velocity.toFixed(1)} km/h</option>)}
          </select>
        </div>
        <span className="label" style={{ marginLeft: 12 }}>vs</span>
        <span className="label">B</span>
        <div className="compare-slot">
          <select value={rightId} onChange={(e) => onRight(e.target.value)}>
            {pitchers.map(p => <option key={p.id} value={p.id}>{p.name} · {p.velocity.toFixed(1)} km/h</option>)}
          </select>
        </div>
      </div>
      <div className="compare-grid">
        {left && <CompareCol p={left}/>}
        {right && <CompareCol p={right}/>}
      </div>
    </>
  );
}

/* ---------------- APP ---------------- */
function App() {
  const pitchers = window.BBL_PITCHERS;
  const [activeId, setActiveId] = useState(pitchers[0].id);
  const [mode, setMode] = useState('single');
  const [leftId, setLeftId] = useState(pitchers[0].id);
  const [rightId, setRightId] = useState(pitchers[1].id);
  const [theme, setTheme] = useTheme();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const active = pitchers.find(p => p.id === activeId);

  const navItems = [
    { id: 'overview', label: 'Overview',     icon: Ic.home,     num: '00' },
    { id: 'physical', label: '체력 프로파일', icon: Ic.body,     num: '01' },
    { id: 'mech',     label: '투구 메카닉스', icon: Ic.motion,   num: '02' },
    { id: 'sw',       label: '강점·약점',     icon: Ic.star,     num: '03' },
    { id: 'flags',    label: '진단 플래그',   icon: Ic.flag,     num: '04' },
    { id: 'training', label: '훈련 우선순위', icon: Ic.dumbbell, num: '05' },
  ];

  // Smooth scroll to section
  const onNavSelect = (id) => {
    setActiveNav(id);
    if (id === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const numMap = { physical: '01', mech: '02', sw: '03', flags: '04', training: '05' };
    setTimeout(() => {
      const blocks = document.querySelectorAll('.section-block');
      blocks.forEach(b => {
        const num = b.querySelector('.num')?.textContent;
        if (num === numMap[id]) {
          b.classList.add('open');
          b.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }, 50);
  };

  return (
    <>
      <div className="scene" aria-hidden="true"/>
      <div className="dash">
        <Sidebar pitchers={pitchers} activeId={activeId} onSelect={setActiveId}
          mode={mode} onMode={setMode}
          navItems={navItems} activeNav={activeNav} onNavSelect={onNavSelect}
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <div className="main">
          <DashTopBar pitcher={active} mode={mode} theme={theme} onTheme={setTheme}
            onMenu={() => setSidebarOpen(o => !o)}/>
          <div className="content">
            {mode === 'single' && active && <SinglePitcherView p={active} key={activeId}/>}
            {mode === 'compare' && (
              <CompareView pitchers={pitchers}
                leftId={leftId} rightId={rightId}
                onLeft={setLeftId} onRight={setRightId}/>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
