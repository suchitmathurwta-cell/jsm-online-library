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
uniform vec3 u_color1; // Primary category tone (e.g. sapphire, amber, emerald)
uniform vec3 u_color2; // Secondary / deeper harmonic
uniform vec3 u_color3; // Luminous electric highlight crest

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv * 2.0 - 1.0);
  p.x *= (u_resolution.x / max(u_resolution.y, 1.0));

  // Fluid motion rate
  float t = u_time * 0.38;

  // Fluid domain distortion: creates the organic liquid silk folding
  float warp = sin(p.x * 1.8 + t * 0.7) * cos(p.y * 1.4 - t * 0.5) * 0.22;

  // -------------------------------------------------------------
  // Ribbon 1: Primary sweeping fluid silk wave
  // Curves diagonally with shifting sine & cosine harmonics
  // -------------------------------------------------------------
  float curve1 = (p.y - 0.08) 
               - (sin(p.x * 1.1 + t * 0.85) * 0.42 
                  + cos(p.x * 2.3 - t * 0.45) * 0.20 
                  + sin(p.x * 0.5 + t * 0.25) * 0.28 
                  + warp);

  float dist1 = abs(curve1);

  // Intense electric neon razor crest along the edge of the ribbon
  float core1 = 0.015 / (dist1 + 0.016);
  core1 = clamp(core1, 0.0, 4.0);

  // Volumetric silk sheet glow fanning out on the upper side
  float body1 = exp(-max(0.0, curve1) * 2.4) * smoothstep(-0.85, 0.25, curve1);
  // Soft atmospheric aura on the lower edge
  float underGlow1 = exp(-max(0.0, -curve1) * 4.2);

  // -------------------------------------------------------------
  // Ribbon 2: Secondary harmonic ribbon with opposing flow
  // -------------------------------------------------------------
  float curve2 = (p.y + 0.18) 
               - (cos(p.x * 1.4 - t * 0.65) * 0.36 
                  + sin(p.x * 2.7 + t * 0.40) * 0.16 
                  + cos(p.x * 0.7 - t * 0.20) * 0.22 
                  - warp * 0.8);

  float dist2 = abs(curve2);
  float core2 = 0.011 / (dist2 + 0.020);
  core2 = clamp(core2, 0.0, 3.0);
  float body2 = exp(-max(0.0, curve2) * 2.9) * smoothstep(-0.65, 0.3, curve2);

  // -------------------------------------------------------------
  // Ribbon 3: Upper atmospheric wisp
  // -------------------------------------------------------------
  float curve3 = (p.y - 0.45) 
               - (sin(p.x * 2.1 + t * 0.9) * 0.22 
                  + cos(p.x * 1.2 - t * 0.3) * 0.15);
  float dist3 = abs(curve3);
  float core3 = 0.008 / (dist3 + 0.028);

  // -------------------------------------------------------------
  // Dynamic Color Compositing
  // -------------------------------------------------------------
  vec3 col = vec3(0.0);

  // Deep volumetric colored silk
  col += u_color1 * (body1 * 0.85 + underGlow1 * 0.32);
  col += u_color2 * (body2 * 0.60);

  // Blinding electric neon filaments along the ribbon crests
  vec3 crest1 = mix(u_color1, u_color3, 0.72);
  vec3 crest2 = mix(u_color2, u_color3, 0.60);
  col += crest1 * (core1 * 0.90);
  col += crest2 * (core2 * 0.65);
  col += u_color3 * (core3 * 0.45);

  // Smooth vertical bottom vignette into deep canvas background (#0E0E0E)
  float bottomFade = smoothstep(0.0, 0.32, uv.y);
  float topFade = smoothstep(1.0, 0.82, uv.y);
  col *= (bottomFade * topFade);

  // Subtle natural film grain to eliminate 8-bit color banding
  float grain = hash(gl_FragCoord.xy + fract(t)) * 0.024;
  col += grain * col;

  float alpha = clamp(length(col) * 1.35, 0.0, 0.94);
  gl_FragColor = vec4(col, alpha);
}
`;

/**
 * FluidRibbonBackdrop
 * Renders an authentic, continuous fluid ribbon / animated mesh gradient
 * of colored light flowing across the right-hand main content stream.
 * Smoothly morphs colors in real time as the user scrolls between taxonomy sections.
 */
export default function FluidRibbonBackdrop({ activeSection = 'novel' }) {
  const canvasRef = useRef(null);
  const color = getCategoryColor(activeSection);

  // Interpolated RGB colors
  const currentColors = useRef({
    c1: hexToRgb(color.hex),
    c2: hexToRgb(color.subtleHex || color.hex),
    c3: [1.0, 1.0, 1.0], // Electric white/highlight core
  });

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
      Math.min(1.0, light[0] * 0.6 + 0.4),
      Math.min(1.0, light[1] * 0.6 + 0.4),
      Math.min(1.0, light[2] * 0.6 + 0.4),
    ];

    targetColors.current = { c1, c2, c3 };
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

        // Smooth color interpolation (lerp)
        const cur = currentColors.current;
        const tgt = targetColors.current;
        const lerpFactor = 0.045;

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
    // Fallback: 2D Canvas Fluid Wave Simulation
    // -------------------------------------------------------------
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize2d = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = 750;
    };
    window.addEventListener('resize', resize2d);
    resize2d();

    const render2d = (now) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cur = currentColors.current;
      const tgt = targetColors.current;
      for (let i = 0; i < 3; i++) {
        cur.c1[i] += (tgt.c1[i] - cur.c1[i]) * 0.05;
      }

      const r = Math.round(cur.c1[0] * 255);
      const g = Math.round(cur.c1[1] * 255);
      const b = Math.round(cur.c1[2] * 255);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const baseHeight = 240 + w * 85;
        ctx.moveTo(0, baseHeight);

        for (let x = 0; x <= canvas.width; x += 15) {
          const y =
            baseHeight +
            Math.sin(x * 0.004 + elapsed * 1.2 + w) * 60 +
            Math.cos(x * 0.008 - elapsed * 0.7) * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, baseHeight + 120);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
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
      <div className="absolute top-0 left-0 right-0 h-[750px] overflow-hidden">
        {/* Real-time Fluid Silk Wave & Mesh Ribbon */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-[750px] mix-blend-screen pointer-events-none opacity-90 sm:opacity-95"
        />

        {/* Soft bottom falloff vignette melting into #0E0E0E */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E0E]/10 via-60% to-[#0E0E0E] pointer-events-none" />
      </div>
    </div>
  );
}
