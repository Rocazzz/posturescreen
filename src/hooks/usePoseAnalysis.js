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

  function classify(val, warn, alert) {
    if (val > alert) return 'rojo';
    if (val > warn) return 'amarillo';
    return 'verde';
  }

  function analyze(landmarks, width, height) {
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

    return { valid: true, sta, tpa, cobb, cranial, classes };
  }

  function clearBuffers() {
    buffers.current = {};
  }

  return { analyze, clearBuffers };
}