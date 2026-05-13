const LABEL = { verde: 'Normal', amarillo: 'Atención', rojo: 'Revisar' };

function Badge({ cls }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: '500', padding: '3px 10px', borderRadius: '99px',
      background: cls === 'verde' ? 'var(--green-bg)' : cls === 'amarillo' ? 'var(--amber-bg)' : 'var(--red-bg)',
      color: cls === 'verde' ? 'var(--green)' : cls === 'amarillo' ? 'var(--amber)' : 'var(--red)'
    }}>{LABEL[cls]}</span>
  );
}

export default function Results({ result, onNavigate }) {
  if (!result) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Análisis</h1>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'var(--text2)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <p style={{ fontSize: '14px' }}>Sin análisis aún</p>
        <button onClick={() => onNavigate('capture')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', padding: '12px 24px', fontSize: '14px', fontFamily: 'DM Sans', cursor: 'pointer' }}>
          Ir a captura
        </button>
      </div>
    </div>
  );

  const isLateral = result.view === 'lateral';
  const { date, view } = result;

  // ── Zonas según vista ────────────────────────────────────────────────────
  const zones = isLateral ? [
    { label: 'FHP · Adelant. cabeza',  val: result.fhpAbs,    cls: result.classes.fhp        },
    { label: 'Trunk Sway · Tronco',    val: result.trunkAbs,  cls: result.classes.trunkSway  },
    { label: 'Pelvic Tilt · Pelvis',   val: result.pelvicAbs, cls: result.classes.pelvicTilt },
  ] : [
    { label: 'Hombros (STA)',          val: result.sta,       cls: result.classes.hombros    },
    { label: 'Columna (Cobb)',         val: result.cobb,      cls: result.classes.columna    },
    { label: 'Pelvis (TPA)',           val: result.tpa,       cls: result.classes.pelvis     },
    { label: 'Cabeza (Cranial)',       val: result.cranial,   cls: result.classes.cabeza     },
  ];

  const allClasses = isLateral
    ? [result.classes.fhp, result.classes.trunkSway, result.classes.pelvicTilt]
    : [result.classes.hombros, result.classes.columna, result.classes.pelvis, result.classes.cabeza];

  const normal   = allClasses.filter(v => v === 'verde').length;
  const atencion = allClasses.filter(v => v === 'amarillo').length;
  const revisar  = allClasses.filter(v => v === 'rojo').length;
  const score    = Math.round((normal / allClasses.length) * 100);

  // ── Recomendaciones según vista ──────────────────────────────────────────
  const recs = isLateral ? [
    {
      cls: result.classes.fhp,
      rojo:     `Adelantamiento severo de cabeza (${result.fhpAbs.toFixed(1)}°). Evaluación cervical recomendada.`,
      amarillo: `Adelantamiento moderado de cabeza (${result.fhpAbs.toFixed(1)}°). Revisar ergonomía y postura habitual.`,
      verde: null
    },
    {
      cls: result.classes.trunkSway,
      rojo:     `Desalineación significativa del tronco (${result.trunkAbs.toFixed(1)}°). Evaluación postural recomendada.`,
      amarillo: `Inclinación leve del tronco (${result.trunkAbs.toFixed(1)}°). Fortalecer core y revisar postura.`,
      verde: null
    },
    {
      cls: result.classes.pelvicTilt,
      rojo:     `Inclinación pélvica elevada (${result.pelvicAbs.toFixed(1)}°). Posible hiperlordosis. Evaluación lumbar recomendada.`,
      amarillo: `Inclinación pélvica moderada (${result.pelvicAbs.toFixed(1)}°). Observar y fortalecer musculatura lumbar.`,
      verde: null
    },
  ] : [
    {
      cls: result.classes.pelvis,
      rojo:     `Pelvis con inclinación elevada (${result.tpa.toFixed(1)}°). Se recomienda valoración por fisioterapia.`,
      amarillo: `Inclinación pélvica moderada (${result.tpa.toFixed(1)}°). Observar evolución.`,
      verde: null
    },
    {
      cls: result.classes.columna,
      rojo:     `Desviación significativa de columna (${result.cobb.toFixed(1)}°). Evaluación médica recomendada.`,
      amarillo: `Asimetría leve de columna (${result.cobb.toFixed(1)}°). Evitar cargas asimétricas.`,
      verde: null
    },
    {
      cls: result.classes.hombros,
      rojo:     `Desnivelación marcada de hombros (${result.sta.toFixed(1)}°). Revisar con especialista.`,
      amarillo: `Leve desnivelación de hombros (${result.sta.toFixed(1)}°). Observar postura habitual.`,
      verde: null
    },
    {
      cls: result.classes.cabeza,
      rojo:     `Inclinación cefálica elevada (${result.cranial.toFixed(1)}°). Evaluar con profesional.`,
      amarillo: `Leve inclinación cefálica (${result.cranial.toFixed(1)}°). Revisar ergonomía.`,
      verde: null
    },
  ];

  const recColors = {
    rojo:     { border: 'var(--red)',   bg: 'var(--red-bg)',   text: 'var(--red)'   },
    amarillo: { border: '#BA7517',      bg: 'var(--amber-bg)', text: 'var(--amber)' },
    verde:    { border: 'var(--green)', bg: 'var(--green-bg)', text: 'var(--green)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Resultado</h1>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>
          {date} · Vista {view} {isLateral && result.side ? `· Lado ${result.side}` : ''}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Métricas globales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Zonas normales', val: normal,    color: 'var(--green)' },
            { label: 'Atención',       val: atencion,  color: '#BA7517'      },
            { label: 'A revisar',      val: revisar,   color: 'var(--red)'   },
            { label: 'Puntuación',     val: score+'%', color: 'var(--text)'  },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text2)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: m.color, fontFamily: 'DM Mono' }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* Ángulos medidos */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ángulos medidos
          </p>
          {zones.map((z, i, arr) => (
            <div key={z.label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', gap: '8px' }}>
              <span style={{ flex: 1, fontSize: '13px' }}>{z.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'DM Mono' }}>{z.val.toFixed(1)}°</span>
              <Badge cls={z.cls} />
            </div>
          ))}
        </div>

        {/* Recomendaciones */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recomendaciones de screening
          </p>
          {recs.filter(r => r[r.cls]).map((r, i) => {
            const c = recColors[r.cls];
            return (
              <div key={i} style={{ borderLeft: `3px solid ${c.border}`, background: c.bg, borderRadius: '0 var(--r-sm) var(--r-sm) 0', padding: '10px 12px', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', lineHeight: '1.6', color: c.text }}>{r[r.cls]}</p>
              </div>
            );
          })}
        </div>

        <button onClick={() => onNavigate('capture')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', padding: '14px', fontSize: '15px', fontWeight: '500', fontFamily: 'DM Sans', cursor: 'pointer', width: '100%' }}>
          Nueva captura
        </button>

        <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', lineHeight: '1.6', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--r-sm)' }}>
          Este tamizaje no constituye diagnóstico médico. Deriva a profesional de salud ante hallazgos relevantes.
        </p>

      </div>
    </div>
  );
}