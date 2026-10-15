import React, { useEffect, useRef } from 'react';
import { getCategoryColor } from '../data/categoryColors';

function hexToRgb(hex) {
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
uniform vec3 u_color1; // Primary active category tone (Amber, Cobalt, Emerald, Ruby, Amethyst...)
uniform vec3 u_color2; // Subtle companion harmonic
uniform vec3 u_color3; // Luminous electric crest highlight

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.42;

  // Multi-frequency fluid domain warping: simulates rich liquid silk folds
  float warp = sin(uv.x * 2.6 + t * 0.75) * cos(uv.y * 2.0 - t * 0.55) * 0.12
             + cos(uv.x * 1.6 - uv.y * 1.8 + t * 0.40) * 0.065;

  // Dynamic wandering & breathing of the ribbon spine
  float wanderX1 = sin(t * 0.45) * 0.095 + cos(t * 0.28) * 0.055;
  float wanderY1 = cos(t * 0.36) * 0.065;
  float curveFactor1 = 1.48 + sin(t * 0.32) * 0.32;

  // -------------------------------------------------------------------
  // Primary Ribbon (Astrid Mueller S-Curve Fluid Light Filament)
  // Sweeps from top-left, arches gracefully, and drapes down toward right
  // -------------------------------------------------------------------
  float baseArc1 = (0.14 + wanderX1) 
                 + (0.68 + wanderY1) * pow(clamp(1.0 - uv.y, 0.0, 1.0), curveFactor1);

  // Deep, rich fluid undulation harmonics (enhanced amplitude for lifelike fluidity)
  float undulation1 = sin(uv.y * 3.8 + uv.x * 1.6 - t * 0.90) * 0.115
                    + cos(uv.y * 6.5 - uv.x * 2.0 + t * 0.55) * 0.065
                    + sin(uv.y * 9.2 - t * 1.15) * 0.035
                    + warp;

  float curve1 = uv.x - (baseArc1 + undulation1);
  float dist1 = abs(curve1);

  // 1. Sleek, razor-sharp luminous crest filament line (Astrid Mueller neon edge)
  float core1 = 0.0055 / (dist1 + 0.009);
  core1 = clamp(core1, 0.0, 1.8);

  // 2. Controlled volumetric silk veil on the inner curve (curve1 > 0)
  // Steep exponential falloff guarantees >85% of canvas remains velvety #0E0E0E
  float body1 = exp(-max(0.0, curve1) * 9.0) * 0.32;

  // 3. Very tight falloff on the outer edge (curve1 < 0)
  float rim1 = exp(-max(0.0, -curve1) * 22.0) * 0.08;

  // -------------------------------------------------------------------
  // Secondary Ribbon Harmonic (Delicate trailing silk fold for 3D depth)
  // Dances and intertwines with the primary ribbon
  // -------------------------------------------------------------------
  float wanderX2 = cos(t * 0.40) * 0.085 - sin(t * 0.24) * 0.045;
  float wanderY2 = sin(t * 0.38) * 0.055;
  float curveFactor2 = 1.35 + cos(t * 0.30) * 0.28;

  float baseArc2 = (0.20 + wanderX2) 
                 + (0.62 + wanderY2) * pow(clamp(1.0 - uv.y, 0.0, 1.0), curveFactor2);

  float undulation2 = cos(uv.y * 3.4 - uv.x * 1.3 - t * 0.80) * 0.120
                    + sin(uv.y * 5.8 + uv.x * 1.9 + t * 0.50) * 0.055
                    + cos(uv.y * 8.6 + t * 0.95) * 0.030
                    - warp * 0.75;

  float curve2 = uv.x - (baseArc2 + undulation2);
  float dist2 = abs(curve2);

  float core2 = 0.0035 / (dist2 + 0.012);
  core2 = clamp(core2, 0.0, 1.1);

  float body2 = exp(-max(0.0, curve2) * 11.0) * 0.16;
  float rim2 = exp(-max(0.0, -curve2) * 25.0) * 0.04;

  // -------------------------------------------------------------------
  // Low-Luminescence Color Compositing (Preserving High Contrast)
  // -------------------------------------------------------------------
  vec3 col = vec3(0.0);

  // Ethereal atmospheric colored silk veil
  col += u_color1 * (body1 + rim1);
  col += u_color2 * (body2 + rim2);

  // Electric highlight filaments along the crest lines
  vec3 crest1 = mix(u_color1, u_color3, 0.82);
  vec3 crest2 = mix(u_color2, u_color3, 0.68);
  col += crest1 * (core1 * 0.80);
  col += crest2 * (core2 * 0.40);

  // Deep dark obsidian canvas (#0E0E0E = 14 / 255 = 0.0549)
  vec3 bg = vec3(0.0549, 0.0549, 0.0549);

  // Subtle organic micro-film grain to prevent 8-bit banding on dark displays
  float grain = (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.010;

  vec3 finalColor = bg + col + grain;
  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

/**
 * FluidRibbonBackdrop
 * Renders an authentic, continuous fluid ribbon / animated mesh gradient
 * of colored light flowing across the right-hand main content stream.
 * Smoothly morphs colors in real time as the user scrolls between taxonomy sections.
 * 
 * Strict aesthetic adherence:
 * 1. Reduced luminescence: >85% pure obsidian black canvas (#0E0E0E), with a sleek glowing filament.
 * 2. Unbroken background: spans the full viewport height permanently behind the scroll stream without breaking.
 * 3. Color synchronization: smoothly lerps between category signature colors while undulating continuously.
 */
export default function FluidRibbonBackdrop({ activeSection = 'novel' }) {
  const canvasRef = useRef(null);
  const color = getCategoryColor(activeSection);

  // Current interpolated RGB colors
  const currentColors = useRef({
    c1: hexToRgb(color.hex),
    c2: hexToRgb(color.subtleHex || color.hex),
    c3: [1.0, 1.0, 1.0], // Electric white/highlight crest
  });

  // Target RGB colors based on active section
  const targetColors = useRef({
    c1: hexToRgb(color.hex),
    c2: hexToRgb(color.subtleHex || color.hex),
    c3: [1.0, 1.0, 1.0],
  });

  useEffect(() => {
    const c1 = hexToRgb(color.hex);
    const c2 = hexToRgb(color.subtleHex || color.hex);
    // Dynamic light crest: bright luminous tint of the section color
    const light = hexToRgb(color.lightHex || '#FFFFFF');
    const c3 = [
      Math.min(1.0, light[0] * 0.65 + 0.35),
      Math.min(1.0, light[1] * 0.65 + 0.35),
      Math.min(1.0, light[2] * 0.65 + 0.35),
    ];

    targetColors.current = { c1, c2, c3 };
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D Canvas', e);
    }

    let animationFrameId;
    let startTime = performance.now();

    // -------------------------------------------------------------
    // WebGL Pipeline
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

      // Full-screen quad buffer
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

        // Smooth, butter-like color interpolation (lerp)
        const cur = currentColors.current;
        const tgt = targetColors.current;
        const lerpFactor = 0.040;

        for (let i = 0; i < 3; i++) {
          cur.c1[i] += (tgt.c1[i] - cur.c1[i]) * lerpFactor;
          cur.c2[i] += (tgt.c2[i] - cur.c2[i]) * lerpFactor;
          cur.c3[i] += (tgt.c3[i] - cur.c3[i]) * lerpFactor;
        }

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsed);
        gl.uniform3f(uColor1, cur.c1[0], cur.c1[1], cur.c1[2]);
        gl.uniform3f(uColor2, cur.c2[0], cur.c2[1], cur.c2[2]);
        gl.uniform3f(uColor3, cur.c3[0], cur.c3[1], cur.c3[2]);

        gl.clearColor(0.0549, 0.0549, 0.0549, 1.0);
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
    // Fallback: 2D Canvas Fluid Wave Simulation
    // -------------------------------------------------------------
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize2d = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize2d);
    resize2d();

    const render2d = (now) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.fillStyle = '#0E0E0E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cur = currentColors.current;
      const tgt = targetColors.current;
      for (let i = 0; i < 3; i++) {
        cur.c1[i] += (tgt.c1[i] - cur.c1[i]) * 0.04;
      }

      const r = Math.round(cur.c1[0] * 255);
      const g = Math.round(cur.c1[1] * 255);
      const b = Math.round(cur.c1[2] * 255);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const w = canvas.width;
      const h = canvas.height;

      // Slender swooping fluid curve with enhanced breathing and fluidity
      ctx.beginPath();
      const wanderX = Math.sin(elapsed * 0.45) * 0.09 * w;
      const curveFactor = 1.48 + Math.sin(elapsed * 0.32) * 0.32;

      for (let y = 0; y <= h; y += 12) {
        const ny = y / h;
        const baseArc = 0.14 * w + wanderX + 0.68 * w * Math.pow(ny, curveFactor);
        const undulation = Math.sin(ny * 3.8 - elapsed * 0.90) * 45 + Math.cos(ny * 6.5 + elapsed * 0.55) * 25;
        const x = baseArc + undulation;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Delicate silk glow stroke
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
      ctx.lineWidth = 42;
      ctx.stroke();

      // Sharp luminous crest line
      ctx.strokeStyle = `rgba(255, 255, 255, 0.70)`;
      ctx.lineWidth = 2.2;
      ctx.stroke();

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
      className="pointer-events-none fixed inset-0 lg:left-[380px] xl:left-[420px] rtl:lg:left-0 rtl:lg:right-[380px] rtl:xl:right-[420px] z-0 select-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
