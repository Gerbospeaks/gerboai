import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "../assets/img/logo.png";
const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FIELDS = [
  { key: "clientName", text: "Naledi Mokoena" },
  { key: "clientDetail", text: "082 555 0134" },
  { key: "billName", text: "Mokoena Logistics Pty Ltd" },
  { key: "billDetail", text: "accounts@mokologistics.co.za" },
  { key: "description", text: "Full service and brake replacement" },
  { key: "qty", text: "2" },
  { key: "rate", text: "850.00" },
];

function buildSequence() {
  const seq = [];
  FIELDS.forEach(({ key, text }) => {
    text.split("").forEach((char) => seq.push({ field: key, char }));
  });
  return seq;
}

function keyIdForChar(ch) {
  if (ch === " ") return "SPACE";
  if (ch === ".") return ".";
  if (ch === ",") return ",";
  if (ch === "@") return "@";
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  if (/[0-9]/.test(ch)) return ch;
  return null;
}

const KEY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "@"],
];

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(4);
    } catch {
      /* not permitted — fine, it's a nicety */
    }
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

// ── Ambient background: WebGPU → Canvas2D → (CSS handles the rest) ────────

const WGSL = /* wgsl */ `
struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vidx: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var out: VertexOutput;
  let p = positions[vidx];
  out.pos = vec4<f32>(p, 0.0, 1.0);
  out.uv = p * 0.5 + vec2<f32>(0.5, 0.5);
  return out;
}

struct Uniforms {
  time: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let p = in.uv * 2.0 - vec2<f32>(1.0, 1.0);
  let t = u.time * 0.15;
  var v = sin(p.x * 3.0 + t) + sin(p.y * 3.0 + t * 1.3) + sin((p.x + p.y) * 2.0 + t * 0.7);
  v = v * 0.25 + 0.5;
  let colA = vec3<f32>(0.04, 0.30, 0.18);
  let colB = vec3<f32>(0.14, 0.80, 0.46);
  let col = mix(colA, colB, v);
  let d = length(p);
  let alpha = clamp(1.0 - d * 0.75, 0.0, 1.0) * 0.55;
  return vec4<f32>(col, alpha);
}
`;

function startWebGPU(canvas, device) {
  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const module = device.createShaderModule({ code: WGSL });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vs_main" },
    fragment: {
      module,
      entryPoint: "fs_main",
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
    primitive: { topology: "triangle-list" },
  });

  // Referenced via `window` because GPUBufferUsage is a WebGPU global that
  // most lint configs (including CRA's default) don't know about yet —
  // this avoids a false-positive no-undef without disabling the rule.
  const { UNIFORM, COPY_DST } = window.GPUBufferUsage;
  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: UNIFORM | COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let rafId;
  let stopped = false;
  function frame(now) {
    if (stopped) return;
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      new Float32Array([now / 1000, 0, 0, 0]),
    );
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    device.destroy?.();
  };
}

function start2DFallback(canvas) {
  const ctx = canvas.getContext("2d");
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, canvas.clientWidth * dpr);
    canvas.height = Math.max(1, canvas.clientHeight * dpr);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let rafId;
  function frame(t) {
    const w = canvas.width;
    const h = canvas.height;
    const time = t / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const cx = w * (0.3 + 0.25 * Math.sin(time * 0.3 + i * 2.1));
      const cy = h * (0.3 + 0.25 * Math.cos(time * 0.25 + i * 1.7));
      const r = Math.min(w, h) * 0.55;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `hsla(${140 + i * 18}, 70%, 55%, 0.30)`);
      grad.addColorStop(1, "hsla(140, 70%, 55%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
  };
}

function AmbientField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let cleanup = () => {};

    async function init() {
      if (typeof navigator !== "undefined" && navigator.gpu) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          const device = adapter && (await adapter.requestDevice());
          if (device && !cancelled) {
            cleanup = startWebGPU(canvas, device);
            return;
          }
        } catch {
          /* WebGPU present but denied/unsupported here — fall through */
        }
      }
      if (!cancelled) cleanup = start2DFallback(canvas);
    }

    init();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <>
      <div className="hio-ambient-css" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="hio-ambient-canvas"
        aria-hidden="true"
      />
    </>
  );
}

// ── Keyboard ────────────────────────────────────────────────────────────

function Keyboard({ activeKeys, idle, onKeyRef, surfaceRef, children }) {
  return (
    <div className={`hio-kb ${idle ? "hio-kb-idle" : ""}`}>
      <div className="hio-kb-surface" ref={surfaceRef}>
        {KEY_ROWS.map((row, i) => (
          <div className={`hio-kb-row hio-kb-row-${i}`} key={i}>
            {row.map((k) => (
              <div
                key={k}
                ref={(el) => onKeyRef(k, el)}
                className={`hio-key ${
                  k === "SHIFT" ? "hio-key-wide" : ""
                } ${activeKeys.has(k) ? "hio-key-active" : ""}`}
              >
                {k === "SHIFT" ? "⇧" : k}
              </div>
            ))}
          </div>
        ))}
        <div className="hio-kb-row hio-kb-row-space">
          <div
            ref={(el) => onKeyRef("SPACE", el)}
            className={`hio-key hio-key-space ${
              activeKeys.has("SPACE") ? "hio-key-active" : ""
            }`}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function HeroInvoiceOverlay() {
  const sequence = useMemo(buildSequence, []);
  const totalSteps = sequence.length;
  const reducedMotion = useReducedMotion();

  const fieldStarts = useMemo(() => {
    const starts = {};
    let running = 0;
    FIELDS.forEach(({ key, text }) => {
      starts[key] = running;
      running += text.length;
    });
    return starts;
  }, []);

  const [step, setStep] = useState(reducedMotion ? totalSteps : 0);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [fingertip, setFingertip] = useState({ x: 0, y: 0, visible: false });
  const timeoutRef = useRef(null);
  const keyRefs = useRef({});
  const surfaceRef = useRef(null);

  const moveFingertipTo = (id) => {
    const keyEl = keyRefs.current[id];
    const surfaceEl = surfaceRef.current;
    if (!keyEl || !surfaceEl) return;
    const kRect = keyEl.getBoundingClientRect();
    const sRect = surfaceEl.getBoundingClientRect();
    setFingertip({
      x: kRect.left - sRect.left + kRect.width / 2,
      y: kRect.top - sRect.top + kRect.height / 2,
      visible: true,
    });
  };

  useEffect(() => {
    if (reducedMotion) {
      setStep(totalSteps);
      setActiveKeys(new Set());
      setFingertip((f) => ({ ...f, visible: false }));
      return;
    }

    let cancelled = false;

    function releaseKeysSoon() {
      setTimeout(() => {
        if (!cancelled) setActiveKeys(new Set());
      }, 100);
    }

    function tick(current) {
      if (cancelled) return;

      if (current >= totalSteps) {
        setActiveKeys(new Set());
        setFingertip((f) => ({ ...f, visible: false }));
        timeoutRef.current = setTimeout(() => {
          if (cancelled) return;
          setStep(0);
          tick(0);
        }, 1900);
        return;
      }

      const entry = sequence[current];
      const isNewField =
        current > 0 && sequence[current - 1].field !== entry.field;

      setStep(current + 1);

      const id = keyIdForChar(entry.char);
      const next = new Set();
      if (id) next.add(id);
      if (/[A-Z]/.test(entry.char) && entry.char !== entry.char.toLowerCase()) {
        next.add("SHIFT");
      }
      setActiveKeys(next);
      if (id) moveFingertipTo(id);
      vibrate();
      releaseKeysSoon();

      const delay = isNewField ? 320 : 48 + Math.random() * 55;
      timeoutRef.current = setTimeout(() => tick(current + 1), delay);
    }

    tick(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence, totalSteps, reducedMotion]);

  const typed = {};
  let currentFieldKey = null;
  FIELDS.forEach(({ key, text }) => {
    const count = Math.max(0, Math.min(text.length, step - fieldStarts[key]));
    typed[key] = text.slice(0, count);
    if (step < totalSteps && sequence[step]?.field === key) {
      currentFieldKey = key;
    }
  });

  const qtyNum = parseFloat(typed.qty) || 0;
  const rateNum = parseFloat(typed.rate) || 0;
  const { subtotal, vat, total } = useMemo(() => {
    const subtotal = qtyNum * rateNum;
    const vat = subtotal * 0.15;
    return { subtotal, vat, total: subtotal + vat };
  }, [qtyNum, rateNum]);

  const Cursor = ({ show }) =>
    show && !reducedMotion ? <span className="hio-cursor">|</span> : null;

  const fingerStyle = {
    transform: `translate(${fingertip.x - 13}px, ${fingertip.y - 13}px)`,
    opacity: fingertip.visible ? 1 : 0,
  };
  const trailAStyle = { ...fingerStyle, opacity: fingertip.visible ? 0.45 : 0 };
  const trailBStyle = { ...fingerStyle, opacity: fingertip.visible ? 0.25 : 0 };

  return (
    <div className="hio-stage">
      

      <div className="hio-card" role="group" aria-label="Live invoice preview">
        <div className="hio-livebadge">
          <span className="hio-dot" />
          {reducedMotion ? "Drafted by agent" : "SolidAgent drafting on-device"}
        </div>

        <div className="hio-head">
          <div className="hio-brand">
           <img src={logo} alt="SolidFlo logo" className="hio-brand-mark" />
            <div className="hio-brand-copy">
              <div className="hio-brand-name">
                SolidFlo Saas
                <button
                  type="button"
                  className="hio-verified"
                  popoverTarget="hio-tip"
                  aria-label="Verification details"
                  title="Signed with passkey · processed on-device"
                >
                  ✓
                </button>
                <div id="hio-tip" popover="auto" className="hio-tip">
                  Signed with passkey · processed on-device
                </div>
              </div>
              <div className="hio-brand-sub">Invoicing Made Simple</div>
            </div>
          </div>
          <div className="hio-doctype">
            <div className="hio-doctype-label">INVOICE</div>
            <div className="hio-doctype-no">#INV-0248</div>
          </div>
        </div>

        <div className="hio-parties">
          <div className="hio-party">
            <div className="hio-party-label">Invoice to</div>
            <div className="hio-party-name">
              {typed.clientName}
              <Cursor show={currentFieldKey === "clientName"} />
            </div>
            <div className="hio-party-detail">
              {typed.clientDetail}
              <Cursor show={currentFieldKey === "clientDetail"} />
            </div>
          </div>
          <div className="hio-party">
            <div className="hio-party-label">Bill to</div>
            <div className="hio-party-name">
              {typed.billName}
              <Cursor show={currentFieldKey === "billName"} />
            </div>
            <div className="hio-party-detail">
              {typed.billDetail}
              <Cursor show={currentFieldKey === "billDetail"} />
            </div>
          </div>
        </div>

        <div className="hio-table">
          <div className="hio-row hio-row-head">
            <span>Description</span>
            <span className="hio-col-qty">Qty</span>
            <span className="hio-col-rate">Rate</span>
            <span className="hio-col-amt">Amount</span>
          </div>
          <div className="hio-row">
            <span className="hio-desc">
              {typed.description}
              <Cursor show={currentFieldKey === "description"} />
            </span>
            <span className="hio-col-qty hio-num">
              {typed.qty}
              <Cursor show={currentFieldKey === "qty"} />
            </span>
            <span className="hio-col-rate hio-num">
              R {typed.rate}
              <Cursor show={currentFieldKey === "rate"} />
            </span>
            <span className="hio-col-amt hio-num hio-amount">
              R {fmt(qtyNum * rateNum)}
            </span>
          </div>
        </div>

        <div className="hio-totals">
          <div className="hio-total-line">
            <span>Subtotal</span>
            <span>R {fmt(subtotal)}</span>
          </div>
          <div className="hio-total-line">
            <span>VAT (15%)</span>
            <span>R {fmt(vat)}</span>
          </div>
          <div className="hio-total-line hio-total-final">
            <span>Total due</span>
            <span>R {fmt(total)}</span>
          </div>
        </div>
      </div>

      <Keyboard
        activeKeys={activeKeys}
        idle={reducedMotion}
        onKeyRef={(k, el) => {
          keyRefs.current[k] = el;
        }}
        surfaceRef={surfaceRef}
      >
        {!reducedMotion && (
          <>
            <div
              className="hio-finger-wrap hio-finger-trail-b"
              style={trailBStyle}
            >
              <div className="hio-finger-dot" />
            </div>
            <div
              className="hio-finger-wrap hio-finger-trail-a"
              style={trailAStyle}
            >
              <div className="hio-finger-dot" />
            </div>
            <div className="hio-finger-wrap" style={fingerStyle}>
              <div
                className={`hio-finger-dot ${
                  activeKeys.size ? "hio-finger-dot-press" : ""
                }`}
              />
            </div>
          </>
        )}
      </Keyboard>

      <style>{`
        @property --hio-hue {
          syntax: '<number>';
          inherits: false;
          initial-value: 140;
        }

        .hio-stage{
          container-type: inline-size;
          container-name: hio;
          position:relative;
          width:100%;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:18px;
          color-scheme: light dark;
          --hio-accent: oklch(58% 0.16 145);
          --hio-accent-strong: oklch(52% 0.18 145);
          --hio-paper: oklch(98% 0.006 95 0.95);
          --hio-ink: oklch(20% 0.01 95);
          --hio-muted: oklch(58% 0.01 95);
          --hio-kb-bg: light-dark(oklch(18% 0.01 145 / 0.78), oklch(12% 0.01 145 / 0.85));
        }

        /* Bottom-most safety net — always renders, costs nothing, and is
           what visitors see for the split second before WebGPU/Canvas2D
           spin up (or forever, if both are blocked). */
        .hio-ambient-css{
          position:absolute;
          inset:-20% -10% auto -10%;
          height:75%;
          z-index:0;
          pointer-events:none;
          background: radial-gradient(circle, oklch(70% 0.14 145 / 0.35) 0%, transparent 70%);
          filter: blur(50px);
        }
        .hio-ambient-canvas{
          position:absolute;
          inset:-20% -10% auto -10%;
          height:75%;
          width:120%;
          z-index:0;
          pointer-events:none;
        }
        @media (prefers-reduced-motion: reduce){
          .hio-ambient-canvas{ display:none; }
        }

        .hio-card{
          position:relative;
          z-index:1;
          container-type: inline-size;
          width:min(420px, 92cqi, 92vw);
          background:var(--hio-paper);
          color:var(--hio-ink);
          border-radius:14px;
          padding:26px 26px 20px;
          box-shadow:
            0 30px 60px -20px rgba(0,0,0,0.55),
            0 8px 24px -8px rgba(0,0,0,0.35),
            0 0 0 1px rgba(255,255,255,0.06);
          transform:rotateY(-8deg) rotateX(3deg);
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          transition: transform 240ms linear(0, 0.42 40%, 1.06 78%, 1);
        }
        .hio-card:hover{ transform:rotateY(-3deg) rotateX(1deg) translateY(-4px); }

        .hio-livebadge{
          position:absolute;
          top:-14px;
          right:20px;
          background:var(--hio-accent);
          color:#fff;
          font-size:11px;
          font-weight:600;
          letter-spacing:0.02em;
          padding:5px 10px 5px 8px;
          border-radius:999px;
          display:flex;
          align-items:center;
          gap:6px;
          box-shadow:0 6px 14px oklch(58% 0.16 145 / 0.45);
          white-space:nowrap;
        }
        .hio-dot{
          width:6px;height:6px;border-radius:50%;
          background:#fff;
          animation:hio-pulse 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce){ .hio-dot{ animation:none; } }
        @keyframes hio-pulse{
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:0.4;transform:scale(0.7);}
        }

        .hio-head{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          border-bottom:2px solid var(--hio-ink);
          padding-bottom:14px;
          margin-bottom:14px;
        }
        .hio-brand{display:flex;align-items:center;gap:10px;}
        .hio-brand-mark{
          width:34px;height:34px;border-radius:8px;
          background:transparent;color:var(--hio-paper);
          display:flex;align-items:center;justify-content:center;
          font-family:Georgia,serif;font-weight:700;font-size:13px;
        }
        .hio-brand-name{
         color:white;
          font-weight:700;font-size:13.5px;line-height:1.2;
          display:flex; align-items:center; gap:5px;
        }
        .hio-brand-sub{font-size:10.5px;color:var(--hio-muted);}

        .hio-verified{
          anchor-name: --hio-verified-anchor;
          all:unset;
          cursor:pointer;
          width:14px; height:14px;
          border-radius:50%;
          background:var(--hio-accent);
          color:#fff;
          font-size:9px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          line-height:1;
        }
        .hio-tip{
          position-anchor: --hio-verified-anchor;
          position-area: bottom center;
          margin:6px 0 0;
          font-size:10.5px;
          padding:6px 10px;
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.1);
          background:var(--hio-ink);
          color:var(--hio-paper);
          white-space:nowrap;
        }
        @supports not (position-area: bottom center){
          .hio-tip{ position:fixed; inset:auto auto 20px 20px; }
        }

        .hio-doctype{text-align:right;}
        .hio-doctype-label{
          font-family:Georgia,serif; color:var(--hio-accent);text-transform:uppercase;
          font-size:20px;font-weight:700;letter-spacing:0.04em;
        }
        .hio-doctype-no{font-size:10.5px;color:var(--hio-muted);margin-top:2px;}

        .hio-parties{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
          margin-bottom:16px;
          min-height:56px;
        }
        @container (max-width: 360px){
          .hio-parties{ grid-template-columns:1fr; }
        }
        .hio-party-label{
          font-size:9.5px;font-weight:700;letter-spacing:0.08em;
          color:var(--hio-accent-strong);text-transform:uppercase;margin-bottom:4px;
        }
        .hio-party-name{font-size:12.5px;color:grey;font-weight:600;min-height:16px;}
        .hio-party-detail{font-size:11px;color:white;min-height:14px;}

        .hio-table{margin-bottom:14px;}
        .hio-row{
          display:grid;
          grid-template-columns:1fr 40px 68px 78px;
          gap:8px;
          align-items:center;
          padding:8px 0;
          min-height:34px;
        }
        .hio-row-head{
          font-size:9.5px;font-weight:700;letter-spacing:0.06em;
          text-transform:uppercase;color:var(--hio-muted);
          border-bottom:1px solid oklch(90% 0.01 95);
          padding-bottom:6px;
        }
        .hio-col-qty{text-align:center;}
        .hio-col-rate{text-align:right;}
        .hio-col-amt{text-align:right;}
        .hio-desc{font-size:12px;color:white;line-height:1.3;}
        .hio-num{font-size:12px;color:white;font-variant-numeric:tabular-nums;}
        .hio-amount{font-weight:700;}

        .hio-cursor{
          display:inline-block;
          margin-left:1px;
          color:var(--hio-accent-strong);
          animation:hio-blink 0.9s steps(1) infinite;
        }
        @keyframes hio-blink{ 0%,49%{opacity:1;} 50%,100%{opacity:0;} }

        .hio-totals{
          border-top:2px solid var(--hio-ink);
          padding-top:10px;
          display:flex;
          flex-direction:column;
          gap:5px;
        }
        .hio-total-line{
          display:flex;justify-content:space-between;
          font-size:12px;color:var(--hio-muted);
        }
        .hio-total-final{
          font-size:14px;color:red;font-weight:700;
          margin-top:4px;padding-top:8px;
          border-top:1px dashed oklch(88% 0.01 95);
        }

        /* ── Keyboard ─────────────────────────────────────────────── */
        .hio-kb{
          position:relative;
          z-index:1;
          width:min(420px, 92cqi, 92vw);
          background:var(--hio-kb-bg);
          backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:14px 12px 12px;
          box-shadow:0 20px 40px -18px rgba(0,0,0,0.6);
        }
        .hio-kb-idle{ opacity:0.55; }
        .hio-kb-surface{
          position:relative;
          display:flex;
          flex-direction:column;
          gap:6px;
        }
        .hio-kb-row{ display:flex; justify-content:center; gap:6px; }
        .hio-kb-row-1{ padding-left:10px; }
        .hio-kb-row-2{ padding-left:22px; }
        .hio-kb-row-3{ padding-left:4px; }
        .hio-key{
          flex:1;
          max-width:34px;
          height:30px;
          border-radius:6px;
          background:linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
          border:1px solid rgba(255,255,255,0.10);
          color:#d8d8d2;
          font-size:11px;
          font-weight:600;
          display:flex;
          align-items:center;
          justify-content:center;
          transition: transform 200ms linear(0, 0.5 55%, 1.05 80%, 1),
                      background 120ms ease-out, box-shadow 120ms ease-out;
        }
        .hio-key-wide{ max-width:52px; font-size:13px; }
        .hio-key-active{
          background:var(--hio-accent);
          border-color:var(--hio-accent);
          color:#fff;
          transform:translateY(2px) scale(0.94);
          box-shadow:0 0 14px oklch(58% 0.16 145 / 0.75);
        }
        .hio-kb-row-space{ justify-content:center; margin-top:2px; }
        .hio-key-space{
          flex:none; width:70%; max-width:none; height:26px; border-radius:6px;
        }

        /* ── Spatial fingertip cursor ─────────────────────────────── */
        .hio-finger-wrap{
          position:absolute;
          top:0; left:0;
          width:26px; height:26px;
          pointer-events:none;
          z-index:5;
          transition: transform 170ms linear(0, 0.4 50%, 1.05 80%, 1), opacity 200ms ease;
        }
        .hio-finger-trail-a{ transition-delay: 45ms; }
        .hio-finger-trail-b{ transition-delay: 95ms; }
        .hio-finger-dot{
          width:100%; height:100%; border-radius:50%;
          background: radial-gradient(circle, oklch(88% 0.13 145 / 0.9) 0%, oklch(70% 0.16 145 / 0.5) 45%, transparent 75%);
          box-shadow: 0 0 16px oklch(70% 0.18 145 / 0.6);
          transition: transform 110ms ease-out, opacity 110ms ease-out;
        }
        .hio-finger-dot-press{ transform: scale(0.6); }
        .hio-finger-trail-a .hio-finger-dot{ opacity:0.55; }
        .hio-finger-trail-b .hio-finger-dot{ opacity:0.3; transform:scale(0.85); }

        @container hio (max-width: 480px){
          .hio-card{ transform:none; padding:20px; }
          .hio-row{ grid-template-columns:1fr 32px 60px 68px; }
          .hio-key{ height:26px; font-size:10px; }
        }
      `}</style>
    </div>
  );
}
