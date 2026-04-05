import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const LABEL = { verde: 'Normal', amarillo: 'Atención', rojo: 'Revisar' };

function Badge({ cls }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: '500', padding: '3px 10px',
      borderRadius: '99px',
      background: cls === 'verde' ? 'var(--green-bg)' : cls === 'amarillo' ? 'var(--amber-bg)' : 'var(--red-bg)',
      color: cls === 'verde' ? 'var(--green)' : cls === 'amarillo' ? 'var(--amber)' : 'var(--red)'
    }}>{LABEL[cls]}</span>
  );
}

function SemItem({ label, cls }) {
  const colors = {
    verde:    { bg: 'var(--green-bg)',  dot: 'var(--green)',  text: 'var(--green)' },
    amarillo: { bg: 'var(--amber-bg)',  dot: '#BA7517',       text: 'var(--amber)' },
    rojo:     { bg: 'var(--red-bg)',    dot: 'var(--red)',    text: 'var(--red)'   },
    default:  { bg: 'var(--surface2)', dot: 'var(--text3)',  text: 'var(--text2)' }
  };
  const c = colors[cls] || colors.default;
  return (
    <div style={{ background: c.bg, borderRadius: 'var(--r-sm)', padding: '10px 6px', textAlign: 'center' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.dot, margin: '0 auto 6px' }}/>
      <span style={{ fontSize: '9px', fontWeight: '500', color: c.text }}>{label}</span>
    </div>
  );
}

export default function Home({ onNavigate, lastResult, user }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>PostureScreen</h1>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>Tamizaje postural · No diagnóstico</p>
          </div>
          <button onClick={() => signOut(auth)} style={{
            background: 'none', border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)',
            padding: '6px 12px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans'
          }}>Salir</button>
        </div>
        {user && <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>{user.email}</p>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <SemItem label="Hombros" cls={lastResult?.classes?.hombros} />
          <SemItem label="Columna" cls={lastResult?.classes?.columna} />
          <SemItem label="Pelvis"  cls={lastResult?.classes?.pelvis}  />
          <SemItem label="Cabeza"  cls={lastResult?.classes?.cabeza}  />
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '16px' }}>
          {!lastResult ? (
            <>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sin evaluaciones aún</p>
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text2)' }}>
                <p style={{ fontSize: '14px' }}>Realiza tu primera evaluación</p>
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Toca "Nueva evaluación" para comenzar</span>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Último análisis · {lastResult.date}
              </p>
              {[
                { label: 'Hombros (STA)',   val: lastResult.sta,     cls: lastResult.classes.hombros },
                { label: 'Columna (Cobb)',  val: lastResult.cobb,    cls: lastResult.classes.columna },
                { label: 'Pelvis (TPA)',    val: lastResult.tpa,     cls: lastResult.classes.pelvis  },
                { label: 'Cabeza (Cranial)',val: lastResult.cranial, cls: lastResult.classes.cabeza  },
              ].map((z, i, arr) => (
                <div key={z.label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none', gap: '8px' }}>
                  <span style={{ flex: 1, fontSize: '13px' }}>{z.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'DM Mono' }}>{z.val.toFixed(1)}°</span>
                  <Badge cls={z.cls} />
                </div>
              ))}
            </>
          )}
        </div>

        <button onClick={() => onNavigate('capture')} style={{
          background: 'var(--accent)', color: 'white', border: 'none',
          borderRadius: 'var(--r-sm)', padding: '14px', fontSize: '15px',
          fontWeight: '500', fontFamily: 'DM Sans', cursor: 'pointer', width: '100%'
        }}>Nueva evaluación</button>

        <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', lineHeight: '1.6', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--r-sm)' }}>
          Esta app realiza tamizaje postural, no diagnóstico médico. Consulta a un profesional de salud ante cualquier hallazgo relevante.
        </p>
      </div>
    </div>
  );
}