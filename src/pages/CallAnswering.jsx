import React, { useState, useEffect } from "react";
import {
  Phone,
  Clock,
  FileText,
  Mic,
  Home,
  ShieldCheck,
  Mail,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const CALL_FEATURES = [
  {
    icon: <Clock size={20} />,
    title: "Answers 24/7",
    desc: "Nights, weekends, while you're on site. Every call gets picked up.",
  },
  {
    icon: <Mic size={20} />,
    title: "Natural, human voice",
    desc: "Callers feel heard, not fobbed off by a robot menu.",
  },
  {
    icon: <FileText size={20} />,
    title: "Captures every detail",
    desc: "Name, reason for calling and contact number, saved every time.",
  },
  {
    icon: <Mail size={20} />,
    title: "Instant summaries",
    desc: "Get the call summary by email or SMS the moment the call ends.",
  },
  {
    icon: <Home size={20} />,
    title: "Home & office automation",
    desc: "Verified callers can open gates, unlock doors and switch on lights (Elite add-on).",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "PIN-verified actions",
    desc: "Sensitive actions need a PIN or whitelisted number, and every one is logged.",
  },
];

const CALL_STEPS = [
  {
    n: 1,
    title: "Divert your calls",
    desc: "Forward your number to GerboAI. No technical setup, we help you onboard.",
  },
  {
    n: 2,
    title: "AI greets and helps",
    desc: "It answers questions, collects details and represents your brand.",
  },
  {
    n: 3,
    title: "Get the summary",
    desc: "Follow up when it suits you, with everything already written down.",
  },
];

const CALL_PLANS = [
  {
    name: "Essential",
    usd: 29,
    popular: false,
    cta: "Start Essential",
    features: [
      "75 calls / month",
      "AI answering, natural voice",
      "Instant email summaries",
      "24/7 call answering",
    ],
  },
  {
    name: "Pro",
    usd: 49,
    popular: true,
    cta: "Choose Pro",
    features: [
      "200 calls / month",
      "Everything in Essential",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    usd: 89,
    popular: false,
    cta: "Contact sales",
    features: [
      "1,000 calls / month",
      "Everything in Pro",
      "Dedicated account manager",
      "Custom features (SMS, CRM)",
      "Home & office automation add-on",
    ],
  },
];

const CALL_SCRIPT = [
  { who: "ai", text: "Good afternoon, Mokoena Plumbing. How can I help?" },
  { who: "caller", text: "Hi, my geyser has burst in Sandton." },
  { who: "ai", text: "Sorry to hear that. Can I take your name and number?" },
  { who: "caller", text: "Lerato, 082 555 0142." },
];

/* ─── Animated call demo ─────────────────────────────────────────────────── */
const CallDemo = () => {
  const [step, setStep] = useState(0); // 0..CALL_SCRIPT.length, +1 = summary

  useEffect(() => {
    const last = CALL_SCRIPT.length + 1;
    const t = setTimeout(
      () => setStep((s) => (s >= last ? 0 : s + 1)),
      step >= last ? 4200 : 1500,
    );
    return () => clearTimeout(t);
  }, [step]);

  const showSummary = step > CALL_SCRIPT.length;

  return (
    <div
      className="cl-demo"
      aria-label="Example of GerboAI AI answering a call"
    >
      <div className="cl-phone">
        <div className="cl-phone-head">
          <span className="cl-ring">
            <Phone size={14} />
          </span>
          <div>
            <strong>Incoming call</strong>
            <small>082 555 0142</small>
          </div>
        </div>
        <div className="cl-chat">
          {CALL_SCRIPT.slice(0, Math.min(step, CALL_SCRIPT.length)).map(
            (m, i) => (
              <div key={i} className={`cl-msg ${m.who}`}>
                {m.text}
              </div>
            ),
          )}
        </div>
      </div>

      <div className={`cl-summary${showSummary ? " on" : ""}`}>
        <div className="cl-summary-title">
          <Mail size={14} /> Call summary sent
        </div>
        <div className="cl-row">
          <span>Caller</span>
          <span>Lerato</span>
        </div>
        <div className="cl-row">
          <span>Issue</span>
          <span>Burst geyser, Sandton</span>
        </div>
        <div className="cl-row">
          <span>Urgency</span>
          <span className="cl-tag">High</span>
        </div>
        <div className="cl-row">
          <span>Callback</span>
          <span>082 555 0142</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Section ────────────────────────────────────────────────────────────── */
const CallAnswering = ({ localPrice, currencyLoading, onStart, onContact }) => (
  <section id="call-answering" className="lp-section">
    <div className="lp-section-inner">
      <div className="lp-section-head center">
        <h2>Never miss a call. Your AI receptionist answers for you.</h2>
        <p>
          80% of missed calls never ring again. GerboAI answers every call,
          captures the lead and sends you a summary, so the job lands in your
          invoices instead of with a competitor.
        </p>
      </div>

      <div className="cl-layout">
        <CallDemo />
        <div className="cl-steps">
          {CALL_STEPS.map((s) => (
            <div key={s.n} className="lp-card visible">
              <div className="lp-card-icon">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-cards cl-features">
        {CALL_FEATURES.map((f) => (
          <div key={f.title} className="lp-card visible">
            <div className="lp-card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

   
     
    </div>
  </section>
);

export default CallAnswering;

/* Append to the <style> in LandingPage: <style>{css + callAnsweringCss}</style> */
export const callAnsweringCss = `
.cl-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:32px;align-items:start;margin-top:40px}
.cl-steps{display:grid;gap:16px}
.cl-features{margin-top:32px}
.cl-demo{display:grid;gap:16px}
.cl-phone{background:#1a2340;color:#fff;border-radius:20px;padding:20px;min-height:290px}
.cl-phone-head{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.12)}
.cl-phone-head small{display:block;opacity:.65;font-size:12px}
.cl-ring{width:34px;height:34px;border-radius:50%;background:#e8442a;display:grid;place-items:center;animation:clPulse 1.6s infinite}
.cl-chat{display:flex;flex-direction:column;gap:10px;margin-top:16px}
.cl-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.4;animation:clIn .35s ease}
.cl-msg.ai{background:rgba(255,255,255,.12);align-self:flex-start;border-bottom-left-radius:4px}
.cl-msg.caller{background:#e8442a;align-self:flex-end;border-bottom-right-radius:4px}
.cl-summary{background:#fff;color:#1a2340;border:1px solid rgba(26,35,64,.12);border-radius:16px;padding:16px;opacity:.35;transform:translateY(6px);transition:all .5s ease}
.cl-summary.on{opacity:1;transform:none;box-shadow:0 10px 30px rgba(26,35,64,.12)}
.cl-summary-title{display:flex;align-items:center;gap:6px;font-weight:600;font-size:13px;margin-bottom:10px}
.cl-row{display:flex;justify-content:space-between;font-size:14px;padding:6px 0;border-top:1px solid rgba(26,35,64,.07)}
.cl-row span:first-child{opacity:.6}
.cl-tag{background:#fde7e3;color:#e8442a;padding:1px 10px;border-radius:99px;font-weight:600;font-size:12px}
@keyframes clPulse{0%{box-shadow:0 0 0 0 rgba(232,68,42,.55)}70%{box-shadow:0 0 0 12px rgba(232,68,42,0)}100%{box-shadow:0 0 0 0 rgba(232,68,42,0)}}
@keyframes clIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media(max-width:900px){.cl-layout{grid-template-columns:1fr}}
`;
