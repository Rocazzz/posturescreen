import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { usePoseAnalysis } from '../hooks/usePoseAnalysis';

export default function Capture({ onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(-1);
  const [view, setView] = useState('posterior');
  const [status, setStatus] = useState('Cargando...');
  const [statusType, setStatusType] = useState('waiting');
  const [liveAngles, setLiveAngles] = useState(null);
  const [ready, setReady] = useState(false);
  const lastResultRef = useRef(null);
  const { analyze, clearBuffers } = usePoseAnalysis();

  useEffect(() => {
    initMediaPipe();
    return () => {
      stopCamera();
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []);

  async function initMediaPipe() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      setReady(true);
      startCamera();
    } catch (e) {
      setStatus('Error cargando MediaPipe');
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      detectLoop();
    } catch (e) {
      setStatus('No se pudo acceder a la cámara');
    }
  }

  function stopCamera() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }

  function detectLoop() {
    if (!landmarkerRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = video.videoWidth  || canvas.offsetWidth;
    canvas.height = video.videoHeight || canvas.offsetHeight;

    if (video.currentTime !== lastTimeRef.current && video.readyState >= 2) {
      lastTimeRef.current = video.currentTime;
      const result = landmarkerRef.current.detectForVideo(video, performance.now());
      processResult(result, canvas);
    }
    animRef.current = requestAnimationFrame(detectLoop);
  }

  function processResult(result, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!result.landmarks || result.landmarks.length === 0) {
      setStatus('Sin detección');
      setStatusType('waiting');
      setLiveAngles(null);
      lastResultRef.current = null;
      return;
    }

    const lm = result.landmarks[0];
    const dUtils = new DrawingUtils(ctx);
    dUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: 'rgba(74,63,247,0.6)', lineWidth: 2 });
    dUtils.drawLandmarks(lm, { color: '#4a3ff7', lineWidth: 1, radius: 4 });

    const analysis = analyze(lm, canvas.width, canvas.height);

    if (!analysis.valid) {
      setStatus(analysis.reason);
      setStatusType('waiting');
      setLiveAngles(null);
      lastResultRef.current = null;
      return;
    }

    setStatus('Analizando');
    setStatusType('analyzing');
    setLiveAngles(analysis);
    lastResultRef.current = analysis;
  }

  function captureAnalysis() {
    if (!lastResultRef.current) {
      alert('Espera a que se detecte una pose');
      return;
    }
    onResult(lastResultRef.current, view);
  }

  function handleGallery(e) {
    const file = e.target.files[0];
    if (!file || !landmarkerRef.current) return;
    const img = new Image();
    img.onload = async () => {
      landmarkerRef.current.setOptions({ runningMode: 'IMAGE' });
      const result = landmarkerRef.current.detect(img);
      landmarkerRef.current.setOptions({ runningMode: 'VIDEO' });
      if (!result.landmarks || result.landmarks.length === 0) {
        alert('No se detectó ninguna pose en la imagen');
        return;
      }
      const analysis = analyze(result.landmarks[0], img.width, img.height);
      if (!analysis.valid) { alert('Colócate de frente o de lado'); return; }
      onResult(analysis, view);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  }

  function handleViewChange(v) {
    setView(v);
    clearBuffers();
  }

  const pillColors = {
    waiting:   { bg: 'rgba(192,41,42,0.85)' },
    analyzing: { bg: 'rgba(186,117,23,0.85)' },
    detecting: { bg: 'rgba(58,125,10,0.85)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Nueva evaluación</h1>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>Posiciona a 2–3 metros de la cámara</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {['posterior', 'lateral'].map(v => (
          <button key={v} onClick={() => handleViewChange(v)} style={{
            flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', fontSize: '13px', fontWeight: '500',
            fontFamily: 'DM Sans', cursor: 'pointer', border: '1px solid',
            borderColor: view === v ? '#afa9ec' : 'var(--border2)',
            background: view === v ? 'var(--accent-light)' : 'var(--surface2)',
            color: view === v ? 'var(--accent)' : 'var(--text2)'
          }}>Vista {v}</button>
        ))}
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#0a0a12', overflow: 'hidden' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }} />

        <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(74,63,247,0.85)', color: 'white', fontSize: '11px', fontWeight: '500', padding: '5px 12px', borderRadius: '99px', zIndex: 10 }}>
          Vista {view}
        </div>

        <div style={{ position: 'absolute', top: '14px', right: '14px', background: pillColors[statusType]?.bg || pillColors.waiting.bg, color: 'white', fontSize: '10px', fontWeight: '500', padding: '5px 12px', borderRadius: '99px', zIndex: 10 }}>
          {status}
        </div>

        {liveAngles && (
          <div style={{ position: 'absolute', bottom: '90px', left: '14px', right: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', zIndex: 10 }}>
            {[
              { label: 'STA',     val: liveAngles.sta },
              { label: 'TPA',     val: liveAngles.tpa },
              { label: 'Cobb',    val: liveAngles.cobb },
              { label: 'Cranial', val: liveAngles.cranial }
            ].map(a => (
              <div key={a.label} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{a.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'white', fontFamily: 'DM Mono' }}>{a.val.toFixed(1)}°</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', zIndex: 10 }}>
          <label style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <input type="file" accept="image/*" onChange={handleGallery} style={{ display: 'none' }} />
          </label>

          <button onClick={captureAnalysis} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a3ff7" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>
          </button>

          <div style={{ width: '44px' }} />
        </div>
      </div>
    </div>
  );
}