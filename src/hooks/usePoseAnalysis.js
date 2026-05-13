import { useRef } from 'react';

const WINDOW = 10;

export function usePoseAnalysis() {
  const buffers = useRef({});

  function filteredPoint(idx, x, y) {
    if (!buffers.current[idx]) buffers.current[idx] = [];
    buffers.current[idx].push([x, y]);
    if (buffers.current[idx].length > WINDOW) buffers.current[idx].shift();
    const n = buffers.current[idx].length;
    return [
      buffers.current[idx].reduce((s, p) => s + p[0], 0) / n,
      buffers.current[idx].reduce((s, p) => s + p[1], 0) / n
    ];
  }

  // ─── FUNCIONES ANGULARES ────────────────────────────────────────────────
  function angleWithHorizontal(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = -(p2[1] - p1[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  function angleWithVertical(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = -(p2[1] - p1[1]);
    return (Math.atan2(dx, dy) * 180) / Math.PI;
  }

  function normalizeAngle(a) {
    a = Math.abs(a);
    return a > 90 ? 180 - a : a;
  }

  // ─── ÁNGULO RESPECTO A VERTICAL GRAVITATORIA ───────────────────────────
  // 0° = perfectamente vertical, positivo = inclinado hacia adelante
  function angleFromVertical(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1]; // eje Y hacia abajo en canvas
    // Ángulo respecto al eje Y (vertical): arctan(dx/dy)
    const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
    return angle;
  }

  // ─── CLASIFICACIÓN ──────────────────────────────────────────────────────
  function classify(val, warn, alert) {
    if (val > alert) return 'rojo';
    if (val > warn) return 'amarillo';
    return 'verde';
  }

  // ─── ANÁLISIS VISTA POSTERIOR ──────────────────────────────────────────
  function analyzePosterior(landmarks, width, height) {
    function px(i) {
      return filteredPoint(i, landmarks[i].x * width, landmarks[i].y * height);
    }

    const ls = px(11), rs = px(12);
    const lh = px(23), rh = px(24);
    const le = px(7),  re = px(8);

    const depthDiff = Math.abs(landmarks[11].z - landmarks[12].z);
    if (depthDiff > 0.1) return { valid: false, reason: 'PONTE DE FRENTE' };

    const sta  = normalizeAngle(angleWithHorizontal(ls, rs));
    const tpa  = normalizeAngle(angleWithHorizontal(lh, rh));
    const mNeck   = [(ls[0]+rs[0])/2, (ls[1]+rs[1])/2];
    const mPelvis = [(lh[0]+rh[0])/2, (lh[1]+rh[1])/2];
    const cobb    = normalizeAngle(angleWithVertical(mNeck, mPelvis));
    const cranialL = angleWithHorizontal(le, ls);
    const cranialR = angleWithHorizontal(re, rs);
    const cranial  = normalizeAngle((cranialL + cranialR) / 2);

    const classes = {
      hombros: classify(sta,    3, 5),
      pelvis:  classify(tpa,    3, 5),
      columna: classify(cobb,   6, 10),
      cabeza:  classify(cranial, 5, 10)
    };

    return { valid: true, view: 'posterior', sta, tpa, cobb, cranial, classes };
  }

  // ─── ANÁLISIS VISTA LATERAL ─────────────────────────────────────────────
  // Landmarks laterales: usa el lado visible según cuál tenga mayor visibilidad
  function analyzeLateral(landmarks, width, height) {
    function px(i) {
      return filteredPoint(i, landmarks[i].x * width, landmarks[i].y * height);
    }

    // Detectar qué lado está de frente a la cámara
    // En vista lateral el hombro visible tiene z más cercano a 0
    const useLeft = landmarks[11].z < landmarks[12].z;
    const earIdx     = useLeft ? 7  : 8;
    const shoulderIdx = useLeft ? 11 : 12;
    const hipIdx     = useLeft ? 23 : 24;
    const kneeIdx    = useLeft ? 25 : 26;
    const ankleIdx   = useLeft ? 27 : 28;

    const ear     = px(earIdx);
    const shoulder = px(shoulderIdx);
    const hip     = px(hipIdx);
    const knee    = px(kneeIdx);
    const ankle   = px(ankleIdx);

    // Validar que es vista lateral (diferencia z entre hombros)
    const depthDiff = Math.abs(landmarks[11].z - landmarks[12].z);
    if (depthDiff < 0.08) return { valid: false, reason: 'PONTE DE LADO' };

    // ── 1. FHP — Forward Head Posture (Ángulo Craneovertebral) ──────────
    // Ángulo entre la línea oreja→hombro y la vertical gravitatoria
    // 0° = cabeza perfectamente sobre el hombro
    // Positivo = cabeza adelantada
    const fhp = angleFromVertical(shoulder, ear);

    // ── 2. Trunk Sway — Alineación del Tronco ───────────────────────────
    // Ángulo de la línea hombro→cadera respecto a la vertical
    // 0° = tronco perfectamente vertical
    // Positivo = inclinado hacia adelante
    const trunkSway = angleFromVertical(hip, shoulder);

    // ── 3. Pelvic Tilt Sagital — Inclinación Pélvica ────────────────────
    // Ángulo de la línea cadera→rodilla respecto a la vertical
    // Indica inclinación anterior/posterior de pelvis
    // 0° = muslo perfectamente vertical
    // Positivo = inclinación anterior (hiperlordosis)
    const pelvicTilt = angleFromVertical(knee, hip);

    // Valores absolutos para clasificación
    const fhpAbs       = Math.abs(fhp);
    const trunkAbs     = Math.abs(trunkSway);
    const pelvicAbs    = Math.abs(pelvicTilt);

    const classes = {
      fhp:        classify(fhpAbs,    10, 15),  // >15° riesgo clínico FHP
      trunkSway:  classify(trunkAbs,  5,  10),  // >10° desalineación significativa
      pelvicTilt: classify(pelvicAbs, 10, 15),  // >15° hiperlordosis probable
    };

    return {
      valid: true,
      view: 'lateral',
      fhp,
      trunkSway,
      pelvicTilt,
      fhpAbs,
      trunkAbs,
      pelvicAbs,
      side: useLeft ? 'izquierdo' : 'derecho',
      // Puntos para dibujar referencias
      points: { ear, shoulder, hip, knee, ankle },
      classes
    };
  }

  // ─── DIBUJO VISTA LATERAL ───────────────────────────────────────────────
  function drawLateralReferences(ctx, analysis, canvasWidth, canvasHeight) {
    if (!analysis || !analysis.valid) return;
    const { points, fhp, trunkSway, pelvicTilt } = analysis;
    const { ear, shoulder, hip, knee, ankle } = points;

    // Línea vertical gravitatoria desde tobillo hacia arriba
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ankle[0], ankle[1]);
    ctx.lineTo(ankle[0], 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Línea oreja → hombro (FHP)
    ctx.strokeStyle = fhp > 15 ? '#E24B4A' : fhp > 10 ? '#BA7517' : '#3a7d0a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ear[0], ear[1]);
    ctx.lineTo(shoulder[0], shoulder[1]);
    ctx.stroke();

    // Línea hombro → cadera (Trunk Sway)
    ctx.strokeStyle = Math.abs(trunkSway) > 10 ? '#E24B4A' : Math.abs(trunkSway) > 5 ? '#BA7517' : '#3a7d0a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(shoulder[0], shoulder[1]);
    ctx.lineTo(hip[0], hip[1]);
    ctx.stroke();

    // Línea cadera → rodilla (Pelvic Tilt)
    ctx.strokeStyle = Math.abs(pelvicTilt) > 15 ? '#E24B4A' : Math.abs(pelvicTilt) > 10 ? '#BA7517' : '#3a7d0a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(hip[0], hip[1]);
    ctx.lineTo(knee[0], knee[1]);
    ctx.stroke();

    // Puntos clave
    [[ear, '#4a3ff7'], [shoulder, '#4a3ff7'], [hip, '#4a3ff7'], [knee, '#4a3ff7'], [ankle, '#4a3ff7']].forEach(([pt, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function clearBuffers() {
    buffers.current = {};
  }

  return {
    analyzePosterior,
    analyzeLateral,
    drawLateralReferences,
    clearBuffers
  };
}