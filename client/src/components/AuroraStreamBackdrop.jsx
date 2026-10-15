import React, { useEffect, useRef } from 'react';
import { getCategoryColor } from '../data/categoryColors';

function hexToRgbNorm(hex) {
  if (!hex) return [0.96, 0.62, 0.04];
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0.96, 0.62, 0.04];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.1 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= (u_resolution.x / max(u_resolution.y, 1.0));

  // Fluid time speed
  float t = u_time * 0.45;

  // 1. Primary Aurora Ribbon: Undulating vertical drapery
  float wave1 = sin(p.x * 1.6 + t * 0.9) * 0.14
              + sin(p.x * 3.0 - t * 0.6) * 0.08
              + fbm(vec2(p.x * 1.5 + t * 0.25, t * 0.15)) * 0.16;
  float base1 = 0.36 + wave1;
  float dist1 = uv.y - base1;
  float ray1 = noise(vec2(p.x * 26.0 + sin(t * 0.4) * 3.0, uv.y * 3.0 - t * 0.5));
  ray1 = smoothstep(0.2, 0.85, ray1);
  float curtain1 = dist1 > 0.0 ? exp(-dist1 * 4.2) * (0.65 + 0.45 * ray1) : 0.0;

  // 2. Secondary Harmonic Ribbon: Counter-flowing wave
  float wave2 = sin(p.x * 2.3 - t * 0.75) * 0.15
              + cos(p.x * 3.5 + t * 0.5) * 0.07
              + fbm(vec2(p.x * 1.3 - t * 0.2, t * 0.12)) * 0.14;
  float base2 = 0.22 + wave2;
  float dist2 = uv.y - base2;
  float ray2 = noise(vec2(p.x * 32.0 - t * 0.6, uv.y * 3.5 + t * 0.3));
  ray2 = smoothstep(0.25, 0.85, ray2);
  float curtain2 = dist2 > 0.0 ? exp(-dist2 * 4.8) * (0.6 + 0.4 * ray2) : 0.0;

  // 3. Floating High Shimmer Veil: Upper celestial glow
  float wave3 = sin(p.x * 3.2 + t * 0.85) * 0.11
              + sin(p.x * 1.1 - t * 0.3) * 0.09;
  float base3 = 0.50 + wave3;
  float dist3 = uv.y - base3;
  float ray3 = noise(vec2(p.x * 20.0 + t * 0.5, uv.y * 2.0));
  float curtain3 = dist3 > 0.0 ? exp(-dist3 * 5.5) * (0.5 + 0.5 * ray3) : 0.0;

  // 4. Fluid Mesh Turbulence Ambient
  float fluid = fbm(vec2(p.x * 1.2 + t * 0.18, uv.y * 1.2 - t * 0.12));
  float ambientMesh = smoothstep(0.35, 0.8, fluid) * 0.38;

  // Composite Colors
  vec3 col = vec3(0.0);
  col += u_color1 * (curtain1 * 1.5);
  col += u_color2 * (curtain2 * 1.3);
  col += u_color3 * (curtain3 * 1.1);
  col += mix(u_color1, u_color2, fluid) * ambientMesh;

  // Smooth vertical falloff into website background
  float bottomFade = smoothstep(0.01, 0.32, uv.y);
  float topFade = smoothstep(1.0, 0.80, uv.y);
  col *= (bottomFade * topFade);

  // Subtle organic stardust shimmer
  float grain = hash(gl_FragCoord.xy + fract(t)) * 0.03;
  col += grain * col;

  float alpha = clamp(length(col) * 1.45, 0.0, 0.88);
  gl_FragColor = vec4(col, alpha);
}
`;

/**
 * AuroraStreamBackdrop
 * Renders an authentic, animated WebGL Aurora Borealis simulation with fluid
 * undulating curtains, vertical light striations, and continuous real-time motion.
 * The shader smoothly lerps its color palette whenever activeSection changes.
 */
export default function AuroraStreamBackdrop({ activeSection = 'novel' }) {
  const canvasRef = useRef(null);
  const color = getCategoryColor(activeSection);

  // Current interpolated RGB values
  const colorsRef = useRef({
    c1: hexToRgbNorm(color.hex),
    c2: hexToRgbNorm(color.subtleHex || color.hex),
    c3: hexToRgbNorm(color.lightHex || color.hex),
  });

  // Target RGB values based on active category
  const targetColorsRef = useRef({
    c1: hexToRgbNorm(color.hex),
    c2: hexToRgbNorm(color.subtleHex || color.hex),
    c3: hexToRgbNorm(color.lightHex || color.hex),
  });

  useEffect(() => {
    targetColorsRef.current = {
      c1: hexToRgbNorm(color.hex),
      c2: hexToRgbNorm(color.subtleHex || color.hex),
      c3: hexToRgbNorm(color.lightHex || color.hex),
    };
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL init failed, using fallback', e);
    }

    let animationFrameId;
    let startTime = performance.now();

    // -------------------------------------------------------------
    // WebGL Path
    // -------------------------------------------------------------
    if (gl) {
      function createShader(glCtx, type, source) {
        const shader = glCtx.createShader(type);
        glCtx.shaderSource(shader, source);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
          console.error(glCtx.getShaderInfoLog(shader));
          glCtx.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      // Full screen quad geometry
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      const uResolution = gl.getUniformLocation(program, 'u_resolution');
      const uTime = gl.getUniformLocation(program, 'u_time');
      const uColor1 = gl.getUniformLocation(program, 'u_color1');
      const uColor2 = gl.getUniformLocation(program, 'u_color2');
      const uColor3 = gl.getUniformLocation(program, 'u_color3');

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(Math.floor(rect.width * dpr), 300);
        const height = Math.max(Math.floor(rect.height * dpr), 300);

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
      };

      window.addEventListener('resize', resize);
      resize();

      const render = (now) => {
        resize();

        const elapsed = (now - startTime) * 0.001;

        // Smoothly interpolate RGB colors towards active category targets
        const current = colorsRef.current;
        const target = targetColorsRef.current;
        const lerpFactor = 0.045;

        for (let i = 0; i < 3; i++) {
          current.c1[i] += (target.c1[i] - current.c1[i]) * lerpFactor;
          current.c2[i] += (target.c2[i] - current.c2[i]) * lerpFactor;
          current.c3[i] += (target.c3[i] - current.c3[i]) * lerpFactor;
        }

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsed);
        gl.uniform3f(uColor1, current.c1[0], current.c1[1], current.c1[2]);
        gl.uniform3f(uColor2, current.c2[0], current.c2[1], current.c2[2]);
        gl.uniform3f(uColor3, current.c3[0], current.c3[1], current.c3[2]);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
        if (gl) {
          gl.deleteBuffer(positionBuffer);
          gl.deleteProgram(program);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
        }
      };
    }

    // -------------------------------------------------------------
    // Fallback: 2D Canvas Fluid Wave Ribbon Simulation
    // -------------------------------------------------------------
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize2d = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = 700;
    };
    window.addEventListener('resize', resize2d);
    resize2d();

    const render2d = (now) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const current = colorsRef.current;
      const target = targetColorsRef.current;
      for (let i = 0; i < 3; i++) {
        current.c1[i] += (target.c1[i] - current.c1[i]) * 0.05;
      }

      const r = Math.round(current.c1[0] * 255);
      const g = Math.round(current.c1[1] * 255);
      const b = Math.round(current.c1[2] * 255);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const baseHeight = 220 + w * 80;
        ctx.moveTo(0, baseHeight);

        for (let x = 0; x <= canvas.width; x += 15) {
          const y =
            baseHeight +
            Math.sin(x * 0.004 + elapsed * 1.2 + w) * 55 +
            Math.cos(x * 0.007 - elapsed * 0.8) * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, baseHeight + 100);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.15)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render2d);
    };

    animationFrameId = requestAnimationFrame(render2d);

    return () => {
      window.removeEventListener('resize', resize2d);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 h-0 w-full overflow-visible z-0 select-none"
    >
      <div className="absolute top-0 left-0 right-0 h-[720px] overflow-hidden">
        {/* Dynamic WebGL / Canvas Aurora Borealis */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-[720px] mix-blend-screen pointer-events-none opacity-80 sm:opacity-90"
        />

        {/* Soft bottom falloff vignette into website black background (#0E0E0E) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E0E]/15 via-60% to-[#0E0E0E] pointer-events-none" />
      </div>
    </div>
  );
}
