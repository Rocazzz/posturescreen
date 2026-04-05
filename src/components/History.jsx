export default function History({ history, onSelect }) {
  function renderTrend() {
    const data = [...history].reverse().slice(0, 6);
    const vals = data.map(e => e.tpa);
    const min = Math.min(...vals) - 2;
    const max = Math.max(...vals) + 2;
    const W = 300, H = 80, pad = 20;
    const xStep = (W - pad * 2) / (data.length - 1 || 1);
    const yScale = (H - pad * 2) / (max - min || 1);
    const pts = data.map((e, i) => [pad + i * xStep, H - pad - (e.tpa - min) * yScale]);
    const polyline = pts.map(p => p.join(',')).join(' ');
    const first = vals[0], last = vals[vals.length - 1];
    const diff = first - last;
    const trendLabel = diff > 0 ? `Mejora de ${diff.toFixed(1)}° en pelvis` : diff < 0 ? `Aumento de ${Math.abs(diff).toFixed(1)}° en pelvis` : 'Sin cambio en pelvis';

    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tendencia · Pelvis (TPA)</p>
        <svg width="100%" viewBox="0 0 300 80">
          <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="4" fill="var(--accent)" />
              <text x={p[0]} y={p[1] - 8} textAnchor="middle" fontSize="9" fill="var(--accent)" fontFamily="DM Mono">
                {data[i].tpa.toFixed(1)}°
              </text>
            </g>
          ))}
        </svg>
        <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '6px' }}>{trendLabel}</p>
      </div>
    );
  }

  const LABEL = { verde: 'Normal', amarillo: 'Atención', rojo: 'Revisar' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Historial</h1>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>
          {history.length === 0 ? 'Sin evaluaciones' : `${history.length} evaluación${history.length > 1 ? 'es' : ''} registrada${history.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text2)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            <p style={{ fontSize: '14px' }}>Sin evaluaciones aún</p>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Realiza tu primera captura</span>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '4px 16px' }}>
              {history.slice(0, 10).map((e, i) => {
                const vals = [e.classes.hombros, e.classes.columna, e.classes.pelvis, e.classes.cabeza];
                const n = vals.filter(v => v === 'verde').length;
                const a = vals.filter(v => v === 'amarillo').length;
                const r = vals.filter(v => v === 'rojo').length;
                return (
                  <div key={e.id} onClick={() => onSelect(e)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < Math.min(history.length, 10) - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-sm)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500' }}>Evaluación #{history.length - i}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{e.date} · Vista {e.view}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {n > 0 && <span style={{ fontSize: '10px', fontWeight: '500', padding: '3px 8px', borderRadius: '99px', background: 'var(--green-bg)', color: 'var(--green)' }}>{n}</span>}
                      {a > 0 && <span style={{ fontSize: '10px', fontWeight: '500', padding: '3px 8px', borderRadius: '99px', background: 'var(--amber-bg)', color: 'var(--amber)' }}>{a}</span>}
                      {r > 0 && <span style={{ fontSize: '10px', fontWeight: '500', padding: '3px 8px', borderRadius: '99px', background: 'var(--red-bg)', color: 'var(--red)' }}>{r}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {history.length >= 2 && renderTrend()}
          </>
        )}
      </div>
    </div>
  );
}