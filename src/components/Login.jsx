import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, provider } from '../firebase';

export default function Login() {
  async function handleLogin() {
    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      padding: '32px',
      gap: '24px',
      background: 'var(--bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: 'var(--accent)', letterSpacing: '-1px' }}>
          PostureScreen
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '8px' }}>
          Tamizaje postural · No diagnóstico
        </p>
      </div>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r)',
        border: '1px solid var(--border)',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500' }}>
          Inicia sesión para continuar
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
          Tu historial de evaluaciones se guardará de forma segura en la nube.
        </p>
        <button onClick={handleLogin} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--r-sm)',
          padding: '13px',
          fontSize: '15px',
          fontWeight: '500',
          fontFamily: 'DM Sans',
          cursor: 'pointer',
          width: '100%',
          transition: 'background 0.15s'
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', lineHeight: '1.6', maxWidth: '280px' }}>
        Esta app realiza tamizaje postural, no diagnóstico médico. Consulta a un profesional de salud ante cualquier hallazgo.
      </p>
    </div>
  );
}