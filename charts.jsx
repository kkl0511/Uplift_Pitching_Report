/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// ----------------- Radar Chart -----------------
function RadarChart({ data }) {
  const size = 420, pad = 70;
  const cx = size/2, cy = size/2;
  const rMax = size/2 - pad;
  const n = data.length;

  // normalize each value relative to its axis: map [0..lo] to [0..0.5], [lo..hi] to [0.5..1.0], above hi saturates at ~1.15
  const norm = (axis) => {
    if (axis.value == null) return 0.15;
    const { lo, hi, value } = axis;
    if (value <= lo) return Math.max(0.15, (value / lo) * 0.55);
    if (value <= hi) return 0.55 + ((value - lo) / (hi - lo)) * 0.35;
    // above hi
    const over = (value - hi) / hi;
    return Math.min(1.12, 0.90 + over * 0.35);
  };

  const pt = (i, r) => {
    const ang = -Math.PI/2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(ang) * r * rMax, cy + Math.sin(ang) * r * rMax];
  };

  const polyPoints = data.map((d,i) => pt(i, norm(d)).join(',')).join(' ');
  const ringVals = [0.3, 0.55, 0.78, 1.0];
  const axisLines = data.map((_,i) => pt(i, 1.0));

  return (
    <svg className="chart" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: 480 }}>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.25"/>
        </radialGradient>
      </defs>
      {/* rings */}
      {ringVals.map((r,i) => (
        <circle key={i} cx={cx} cy={cy} r={r*rMax}
          fill={r === 0.55 ? "rgba(148,163,184,0.04)" : "none"}
          stroke={r === 0.55 ? "rgba(239,68,68,0.28)" : r === 0.9 ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}
          strokeDasharray={r === 0.55 || r === 0.9 ? "4 4" : "0"}
          strokeWidth={1}/>
      ))}
      {/* axes */}
      {axisLines.map(([x,y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />
      ))}
      {/* polygon */}
      <polygon points={polyPoints}
        fill="url(#radarFill)"
        stroke="#2563EB" strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 12px rgba(37,99,235,0.4))' }}/>
      {/* dots */}
      {data.map((d, i) => {
        const [x,y] = pt(i, norm(d));
        return d.value != null ? (
          <circle key={i} cx={x} cy={y} r="5" fill="#60a5fa" stroke="#08080c" strokeWidth="2"/>
        ) : null;
      })}
      {/* axis labels */}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.22);
        return (
          <g key={i}>
            <text x={x} y={y-8} textAnchor="middle" className="label-ko">{d.label}</text>
            <text x={x} y={y+6} textAnchor="middle" className="label-en">({d.sub})</text>
            <text x={x} y={y+22} textAnchor="middle" className="value" style={{ fontSize: 14 }}>{d.display}</text>
          </g>
        );
      })}
      {/* band labels */}
      <text x={cx} y={cy - 0.55*rMax - 4} textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="9" fontFamily="Inter">기준 미만</text>
      <text x={cx} y={cy - 0.9*rMax - 4} textAnchor="middle" fill="rgba(34,197,94,0.6)" fontSize="9" fontFamily="Inter">기준 상위</text>
    </svg>
  );
}

// ----------------- Kinematic Sequence (timeline) -----------------
function SequenceChart({ sequence }) {
  const { pelvisMs, trunkMs, armMs, g1, g2 } = sequence;
  const maxMs = 150;
  const w = 800, h = 280;
  const padL = 100, padR = 40, padT = 30, padB = 50;
  const plotW = w - padL - padR;
  const toX = (ms) => padL + (ms / maxMs) * plotW;

  const rows = [
    { y: padT + 30, ko: '골반', en: 'Pelvis', ms: pelvisMs, color: '#4a90c2' },
    { y: padT + 90, ko: '몸통', en: 'Trunk', ms: trunkMs, color: '#5db885' },
    { y: padT + 150, ko: '상완', en: 'Arm', ms: armMs, color: '#e8965a' },
  ];
  const ideal = [
    { from: 30, to: 60, y1: padT + 30, y2: padT + 90, label: `골반→몸통 ${g1} ms`, ok: g1 >= 30 && g1 <= 60 },
    { from: 60, to: 120, y1: padT + 90, y2: padT + 150, label: `몸통→상완 ${g2} ms`, ok: g2 >= 30 && g2 <= 60 },
  ];

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <filter id="glowDot">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* gridlines */}
      {[0,20,40,60,80,100,120,140].map(t => (
        <g key={t}>
          <line x1={toX(t)} x2={toX(t)} y1={padT} y2={h-padB} className="gridline"/>
          <text x={toX(t)} y={h-padB+18} textAnchor="middle" className="axis">{t}</text>
        </g>
      ))}
      <text x={padL + plotW/2} y={h - 10} textAnchor="middle" className="axis" fontSize="11">
        골반 최대 회전을 0 ms로 한 상대 시간 (ms)
      </text>
      {/* rows */}
      {rows.map((r,i) => (
        <g key={i}>
          <text x={padL - 16} y={r.y + 4} textAnchor="end" className="label-ko">{r.ko}</text>
          <text x={padL - 16} y={r.y + 18} textAnchor="end" className="label-en" fontFamily="Inter">({r.en})</text>
          <line x1={padL} x2={toX(r.ms > 0 ? r.ms : 2)} y1={r.y} y2={r.y}
            stroke={r.color} strokeWidth="3" opacity="0.35" strokeLinecap="round"/>
          <circle cx={toX(r.ms)} cy={r.y} r="11" fill={r.color} filter="url(#glowDot)"/>
          <circle cx={toX(r.ms)} cy={r.y} r="7" fill={r.color} stroke="#08080c" strokeWidth="2"/>
          <text x={toX(r.ms) + 16} y={r.y + 5} className="value" fontSize="14" fill={r.color}>{r.ms} ms</text>
        </g>
      ))}
      {/* ideal bands */}
      {ideal.map((b,i) => {
        const x1 = toX(b.from), x2 = toX(b.to);
        const yMid = (b.y1 + b.y2)/2;
        const stroke = b.ok ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
        const fill = b.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)';
        return (
          <g key={i}>
            <rect x={x1} y={b.y1 + 10} width={x2 - x1} height={b.y2 - b.y1 - 20}
              fill={fill} stroke={stroke} strokeDasharray="4 4" rx="4"/>
            <rect x={x1 + 4} y={yMid - 10} width={Math.max(10,(b.label.length * 6.5))} height={20}
              fill="#0c0c14" stroke={stroke} rx="4"/>
            <text x={x1 + 8} y={yMid + 4} fontSize="11" fill={b.ok ? '#4ade80' : '#f87171'} fontWeight="600">{b.label}</text>
          </g>
        );
      })}
      <text x={w - padR} y={h - padB - 6} textAnchor="end" className="axis" fontSize="10" opacity="0.7">
        초록 띠 = 이상적 타이밍 범위 (30–60 ms)
      </text>
    </svg>
  );
}

// ----------------- Angular Velocity Bars -----------------
function AngularChart({ angular }) {
  const segs = [
    { ko: '골반', en: 'Pelvis', val: angular.pelvis, band: angular.pelvisBand, lo: 580, hi: 640, color: '#4a90c2' },
    { ko: '몸통', en: 'Trunk',  val: angular.trunk,  band: angular.trunkBand,  lo: 800, hi: 900, color: '#5db885' },
    { ko: '상완', en: 'Arm',    val: angular.arm,    band: angular.armBand,    lo: 1450, hi: 1600, color: '#e8965a' },
  ];
  const w = 800, h = 300;
  const padL = 110, padR = 50, padT = 20, padB = 50;
  const maxX = 1700;
  const plotW = w - padL - padR;
  const toX = (v) => padL + (v / maxX) * plotW;
  const rowH = (h - padT - padB) / segs.length;
  const barH = 34;

  const bandLabel = (b) => b === 'high' ? '기준 상위' : b === 'mid' ? '기준 범위' : '기준 미만';
  const bandClr = (b) => b === 'high' ? '#4ade80' : b === 'mid' ? '#c8c8d8' : '#f87171';

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`}>
      {/* vertical grid */}
      {[0, 400, 800, 1200, 1600].map(t => (
        <g key={t}>
          <line x1={toX(t)} x2={toX(t)} y1={padT} y2={h - padB} className="gridline"/>
          <text x={toX(t)} y={h - padB + 18} textAnchor="middle" className="axis">{t}</text>
        </g>
      ))}
      <text x={padL + plotW/2} y={h - 10} textAnchor="middle" className="axis" fontSize="11">
        최대 회전 속도 (°/s) — 프로 투수 범위 대비
      </text>
      {segs.map((s, i) => {
        const y = padT + rowH * i + (rowH - barH)/2;
        const x1 = toX(s.lo), x2 = toX(s.hi);
        return (
          <g key={i}>
            <text x={padL - 14} y={y + barH/2 - 2} textAnchor="end" className="label-ko">{s.ko}</text>
            <text x={padL - 14} y={y + barH/2 + 14} textAnchor="end" className="label-en" fontFamily="Inter">({s.en})</text>
            {/* reference band */}
            <rect x={x1} y={y - 4} width={x2 - x1} height={barH + 8}
              fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.3)" strokeDasharray="4 3"/>
            {/* bar */}
            <rect x={padL} y={y} width={toX(s.val) - padL} height={barH}
              fill={s.color} rx="4"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}/>
            {/* band pill */}
            <g transform={`translate(${padL + 14}, ${y + barH/2 - 9})`}>
              <rect width="68" height="18" rx="3" fill="rgba(8,8,12,0.5)" stroke={bandClr(s.band)} strokeWidth="1"/>
              <text x="34" y="13" textAnchor="middle" fontSize="11" fill={bandClr(s.band)} fontWeight="700">{bandLabel(s.band)}</text>
            </g>
            {/* value */}
            <text x={toX(s.val) + 8} y={y + barH/2 + 5} fontSize="15" fill={s.color} fontWeight="800" fontFamily="Inter">
              {s.val} °/s
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ----------------- Energy flow (React component, mixed SVG/HTML) -----------------
function EnergyFlow({ energy }) {
  const { etiPT, etiTA, leakPct } = energy;
  const ptLeak = false; // ETI 1+ between pelvis→trunk is normal (ratio denominator different)
  const taLeak = etiTA < 0.85;

  const Arrow = ({ leak, eti }) => (
    <div className="arrow-block">
      <div className={`arrow-eti ${leak ? 'leak' : 'ok'}`}>ETI {eti.toFixed(2)} {leak ? '· 누수' : '· 정상'}</div>
      <svg className="arrow-svg" viewBox="0 0 120 40">
        <defs>
          <linearGradient id={`arrG${leak ? 'L' : 'O'}`} x1="0" x2="1">
            <stop offset="0" stopColor={leak ? '#f87171' : '#60a5fa'} stopOpacity="0.3"/>
            <stop offset="1" stopColor={leak ? '#ef4444' : '#2563EB'} stopOpacity="0.95"/>
          </linearGradient>
        </defs>
        <rect x="0" y="14" width="94" height="12" rx="6" fill={`url(#arrG${leak ? 'L' : 'O'})`}/>
        <polygon points="90,6 116,20 90,34" fill={leak ? '#ef4444' : '#2563EB'}/>
      </svg>
      {leak && <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>에너지 누수 {leakPct}%</div>}
    </div>
  );

  return (
    <div>
      <div className="energy-flow">
        <div className="segment-box pelvis">
          <div className="ko">골반</div>
          <div className="en">Pelvis</div>
        </div>
        <Arrow leak={ptLeak} eti={etiPT}/>
        <div className="segment-box trunk">
          <div className="ko">몸통</div>
          <div className="en">Trunk</div>
        </div>
        <Arrow leak={taLeak} eti={etiTA}/>
        <div className="segment-box arm">
          <div className="ko">상완</div>
          <div className="en">Arm</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--bbl-fg3)', textAlign: 'center', marginTop: 4, fontFamily: 'Inter' }}>
        ETI 1.0 근처 = 에너지가 다음 분절로 거의 전부 전달 · 0.85 미만 = 누수 신호
      </div>
    </div>
  );
}

// ----------------- Layback meter -----------------
function LaybackMeter({ deg }) {
  // half-circle dial from -10° to 220°
  const size = 300;
  const cx = size/2, cy = size * 0.82;
  const r = size * 0.38;
  const startAng = 180, endAng = 360; // top half
  const angle = Math.min(220, Math.max(0, deg));
  // map 0..220 to startAng..endAng
  const toRad = (a) => (a * Math.PI) / 180;
  const angleToPos = (a) => {
    const t = a / 220;
    const deg2 = startAng + t * (endAng - startAng);
    return [cx + Math.cos(toRad(deg2)) * r, cy + Math.sin(toRad(deg2)) * r];
  };
  const arc = (from, to, color, w = 6) => {
    const [x1,y1] = angleToPos(from), [x2,y2] = angleToPos(to);
    const large = 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"/>;
  };

  const [needle, setNeedle] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const dur = 1400;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setNeedle(angle * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [angle]);

  const [nx, ny] = angleToPos(needle);

  return (
    <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
      <defs>
        <linearGradient id="laybackG" x1="0" x2="1">
          <stop offset="0" stopColor="#2563EB"/>
          <stop offset="1" stopColor="#60a5fa"/>
        </linearGradient>
      </defs>
      {/* track */}
      {arc(0, 220, 'rgba(255,255,255,0.08)', 10)}
      {/* pro band 160-180 */}
      {arc(160, 180, 'rgba(34,197,94,0.7)', 10)}
      {/* needle arc up to current */}
      {arc(0, Math.max(1, needle), 'url(#laybackG)', 10)}
      {/* tick marks */}
      {[0,60,120,180,220].map(t => {
        const [x,y] = angleToPos(t);
        const rOut = r + 16;
        const ang = startAng + (t/220)*(endAng-startAng);
        const [xo,yo] = [cx + Math.cos(toRad(ang)) * rOut, cy + Math.sin(toRad(ang)) * rOut];
        return <g key={t}>
          <line x1={x} y1={y} x2={cx + Math.cos(toRad(ang)) * (r-8)} y2={cy + Math.sin(toRad(ang)) * (r-8)} stroke="rgba(255,255,255,0.18)"/>
          <text x={xo} y={yo + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#cbd5e1" fontFamily="Inter">{t}°</text>
        </g>;
      })}
      {/* needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="6" fill="#fff"/>
    </svg>
  );
}

window.RadarChart = RadarChart;
window.SequenceChart = SequenceChart;
window.AngularChart = AngularChart;
window.EnergyFlow = EnergyFlow;
window.LaybackMeter = LaybackMeter;
