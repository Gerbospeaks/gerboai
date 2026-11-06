import React, { useState } from "react";

// ─── Auth User type (matches Firebase pattern used in BillingPage) ─────────────

export interface AuthUser {
  userId: string;
  userEmail: string;
  displayName: string;
  getIdToken: () => Promise<string>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Agent" | "Viewer";
  status: "active" | "pending";
  avatarColor: string;
  initial: string;
}

interface KbDocument {
  id: string;
  name: string;
  description: string;
  type: string;
  size: string;
  addedDate: string;
  usageCount: number;
  status: "active" | "indexing";
  iconBg: string;
}

interface TranscriptEntry {
  id: string;
  phone: string;
  sentiment: "positive" | "neutral" | "negative";
  direction: "inbound" | "outbound";
  date: string;
  preview: string;
  escalated?: boolean;
  lines: { speaker: "AI" | "Caller"; text: string }[];
}

interface VoicemailEntry {
  id: string;
  phone: string;
  date: string;
  trigger: string;
  preview: string;
  duration: string;
  read: boolean;
  waveHeights: number[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "2",
    name: "Sarah Dlamini",
    email: "sarah@company.co.za",
    role: "Admin",
    status: "active",
    avatarColor: "#0891b2",
    initial: "S",
  },
  {
    id: "3",
    name: "Thabo Nkosi",
    email: "thabo@company.co.za",
    role: "Agent",
    status: "active",
    avatarColor: "#d97706",
    initial: "T",
  },
  {
    id: "4",
    name: "Lerato Sithole",
    email: "lerato@company.co.za",
    role: "Viewer",
    status: "pending",
    avatarColor: "#6b7280",
    initial: "L",
  },
];

const KB_DOCUMENTS: KbDocument[] = [
  {
    id: "1",
    name: "Company Overview & Services.pdf",
    description:
      "Full description of services offered, pricing tiers, and contact details",
    type: "PDF",
    size: "340 KB",
    addedDate: "May 2 2025",
    usageCount: 48,
    status: "active",
    iconBg: "#fee2e2",
  },
  {
    id: "2",
    name: "FAQ Master List.docx",
    description:
      "Frequently asked questions with scripted answers for common caller scenarios",
    type: "DOCX",
    size: "82 KB",
    addedDate: "Apr 18 2025",
    usageCount: 61,
    status: "active",
    iconBg: "#e8f3fe",
  },
  {
    id: "3",
    name: "Business Hours & Locations.txt",
    description:
      "Opening times per branch, holiday closures, and physical addresses",
    type: "TXT",
    size: "4 KB",
    addedDate: "Apr 10 2025",
    usageCount: 33,
    status: "active",
    iconBg: "#dcfce7",
  },
  {
    id: "4",
    name: "Return & Refund Policy.pdf",
    description:
      "Detailed refund policy, time windows, and escalation procedures",
    type: "PDF",
    size: "128 KB",
    addedDate: "Mar 5 2025",
    usageCount: 0,
    status: "indexing",
    iconBg: "#fef3c7",
  },
];

const TRANSCRIPTS: TranscriptEntry[] = [
  {
    id: "1",
    phone: "+27 82 456 7890",
    sentiment: "positive",
    direction: "inbound",
    date: "Today · 09:14 · 3m 22s",
    preview:
      "Caller asked about business hours and whether the Sandton branch is open on Saturdays. AI confirmed hours and offered to schedule a callback. Caller satisfied.",
    lines: [
      {
        speaker: "AI",
        text: "Thank you for calling! How can I help you today?",
      },
      {
        speaker: "Caller",
        text: "Hi, I wanted to check if your Sandton branch is open on Saturdays?",
      },
      {
        speaker: "AI",
        text: "Yes! Our Sandton branch is open on Saturdays from 9 AM to 2 PM.",
      },
      {
        speaker: "Caller",
        text: "Perfect, and do I need to book an appointment?",
      },
      {
        speaker: "AI",
        text: "Walk-ins are welcome, but I can arrange a callback to book you in if you'd prefer.",
      },
      { speaker: "Caller", text: "That's fine, I'll just walk in. Thanks!" },
      { speaker: "AI", text: "Great! See you Saturday. Have a wonderful day!" },
    ],
  },
  {
    id: "2",
    phone: "+27 11 345 6789",
    sentiment: "negative",
    direction: "inbound",
    escalated: true,
    date: "Today · 08:52 · 7m 05s",
    preview:
      "Caller upset about a billing discrepancy. AI attempted to resolve but caller requested a manager. Call transferred.",
    lines: [
      {
        speaker: "AI",
        text: "Thank you for calling! How can I help you today?",
      },
      {
        speaker: "Caller",
        text: "I've been charged twice this month and nobody is helping me!",
      },
      {
        speaker: "AI",
        text: "I'm so sorry. Let me look into this. Can you confirm your account number?",
      },
      {
        speaker: "Caller",
        text: "I want to speak to a manager. This is unacceptable.",
      },
      {
        speaker: "AI",
        text: "Absolutely, I'll transfer you to a human agent right now. Please hold.",
      },
    ],
  },
  {
    id: "3",
    phone: "+27 73 987 6543",
    sentiment: "neutral",
    direction: "outbound",
    date: "Yesterday · 16:30 · 1m 44s",
    preview:
      "Outbound test call. AI greeted successfully and handled general enquiry about product availability. No action required.",
    lines: [
      {
        speaker: "AI",
        text: "Hi there! I'm calling from Gerbo AI on behalf of your account. Is this a good time?",
      },
      { speaker: "Caller", text: "Yes, go ahead." },
      {
        speaker: "AI",
        text: "Great! I wanted to follow up on your recent enquiry. Any questions I can help with?",
      },
      { speaker: "Caller", text: "Not really, I think I'm sorted. Thanks." },
      {
        speaker: "AI",
        text: "Perfect! Don't hesitate to call if you need anything. Have a great day!",
      },
    ],
  },
];

const VOICEMAILS: VoicemailEntry[] = [
  {
    id: "vm1",
    phone: "+27 82 456 7890",
    date: "Today · 09:45",
    trigger: "After-hours",
    preview:
      '"Hi, I was calling about your delivery service and wanted to know if you do same-day…"',
    duration: "0:34",
    read: false,
    waveHeights: [30, 60, 45, 80, 55, 70, 40, 90, 65, 50, 35, 75, 60, 45, 80],
  },
  {
    id: "vm2",
    phone: "+27 11 234 5678",
    date: "Today · 08:12",
    trigger: "Missed call",
    preview:
      '"Please call me back urgently, it\'s regarding the quote I sent last week…"',
    duration: "1:02",
    read: false,
    waveHeights: [50, 85, 30, 70, 90, 40, 60, 75, 55, 80, 45, 65, 35, 70, 50],
  },
  {
    id: "vm3",
    phone: "+27 73 876 5432",
    date: "Yesterday · 17:55",
    trigger: "After-hours",
    preview:
      '"Hi, just checking if my order has been dispatched yet. Account number is 4421…"',
    duration: "0:48",
    read: true,
    waveHeights: [40, 55, 75, 35, 60, 80, 50, 65, 45, 70, 30, 85, 55, 40, 60],
  },
  {
    id: "vm4",
    phone: "+27 83 654 3210",
    date: "Apr 29 · 10:20",
    trigger: "Missed call",
    preview:
      '"Good morning, I\'d like to reschedule my appointment from Friday to Monday if possible…"',
    duration: "1:15",
    read: true,
    waveHeights: [60, 40, 80, 55, 35, 70, 90, 45, 65, 50, 75, 30, 60, 85, 40],
  },
];

const PERMISSIONS = [
  {
    label: "View call logs & transcripts",
    owner: true,
    admin: true,
    agent: true,
    viewer: true,
  },
  {
    label: "Make outbound calls",
    owner: true,
    admin: true,
    agent: true,
    viewer: false,
  },
  {
    label: "Edit AI agent settings",
    owner: true,
    admin: true,
    agent: false,
    viewer: false,
  },
  {
    label: "Manage knowledge base",
    owner: true,
    admin: true,
    agent: false,
    viewer: false,
  },
  {
    label: "Invite / remove members",
    owner: true,
    admin: true,
    agent: false,
    viewer: false,
  },
  {
    label: "Manage billing",
    owner: true,
    admin: false,
    agent: false,
    viewer: false,
  },
  {
    label: "Delete call records",
    owner: true,
    admin: false,
    agent: false,
    viewer: false,
  },
];

// ─── Design tokens (mirrors Dashboard.css light theme) ────────────────────────

const T = {
  surface: "var(--surface, #ffffff)",
  bgPage: "var(--bg-page, #f4f5f7)",
  bgSecondary: "var(--bg-secondary, #f8f9fb)",
  bgTertiary: "var(--bg-tertiary, #f0f2f5)",
  border: "var(--border, #e2e6ea)",
  borderLight: "var(--border-light, #eef0f3)",
  textPrimary: "var(--text-primary, #111827)",
  textSecondary: "var(--text-secondary, #374151)",
  textMuted: "var(--text-muted, #6b7280)",
  textHint: "var(--text-hint, #9ca3af)",
  primary: "var(--primary, #0078f0)",
  primaryHover: "var(--primary-hover, #0062cc)",
  primaryLight: "var(--primary-light, #e8f3fe)",
  success: "var(--success, #15803d)",
  successBg: "var(--success-bg, #dcfce7)",
  successBorder: "var(--success-border, #86efac)",
  error: "var(--error, #dc2626)",
  errorBg: "var(--error-bg, #fee2e2)",
  warning: "var(--warning, #b45309)",
  warningBg: "var(--warning-bg, #fef3c7)",
  warningBorder: "var(--warning-border, #fcd34d)",
  infoBg: "var(--info-bg, #e8f3fe)",
  infoBorder: "var(--info-border, #93c5fd)",
  radius: "var(--radius, 8px)",
  radiusLg: "var(--radius-lg, 10px)",
  radiusFull: "var(--radius-full, 9999px)",
  shadowSm:
    "var(--shadow-sm, 0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04))",
  shadowMd:
    "var(--shadow-md, 0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.05))",
  font: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Shared small components ──────────────────────────────────────────────────

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "purple" | "muted";

const BADGE: Record<BadgeVariant, { bg: string; color: string }> = {
  green: { bg: "var(--success-bg,#dcfce7)", color: "var(--success,#15803d)" },
  yellow: { bg: "var(--warning-bg,#fef3c7)", color: "var(--warning,#b45309)" },
  red: { bg: "var(--error-bg,#fee2e2)", color: "var(--error,#dc2626)" },
  blue: { bg: "var(--info-bg,#e8f3fe)", color: "var(--primary,#0078f0)" },
  purple: { bg: "#ede9fe", color: "#6d28d9" },
  muted: {
    bg: "var(--bg-tertiary,#f0f2f5)",
    color: "var(--text-muted,#6b7280)",
  },
};

const Badge: React.FC<{
  variant: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ variant, children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 9px",
      borderRadius: T.radiusFull,
      fontSize: 12,
      fontWeight: 600,
      background: BADGE[variant].bg,
      color: BADGE[variant].color,
      fontFamily: T.font,
      ...style,
    }}
  >
    {children}
  </span>
);

const Btn: React.FC<{
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ variant = "ghost", onClick, disabled, style, children }) => {
  const variants = {
    primary: { background: T.primary, color: "#fff", border: "none" },
    ghost: {
      background: T.surface,
      color: T.textSecondary,
      border: `1px solid ${T.border}`,
    },
    danger: {
      background: T.errorBg,
      color: T.error,
      border: `1px solid var(--error-border,#fca5a5)`,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: T.radius,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity .15s",
        fontFamily: T.font,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: 20,
      marginBottom: 16,
      boxShadow: T.shadowSm,
      fontFamily: T.font,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h2
    style={{
      fontSize: 14,
      fontWeight: 700,
      color: T.textPrimary,
      borderBottom: `1px solid ${T.border}`,
      paddingBottom: 10,
      marginBottom: 14,
      fontFamily: T.font,
    }}
  >
    {children}
  </h2>
);

const StatMini: React.FC<{
  icon: string;
  value: string | number;
  label: string;
}> = ({ icon, value, label }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: 16,
      boxShadow: T.shadowSm,
      fontFamily: T.font,
    }}
  >
    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: T.textPrimary,
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
      {label}
    </div>
  </div>
);

const Toggle: React.FC<{ defaultOn?: boolean }> = ({ defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 99,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .2s",
        background: on ? T.primary : T.border,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 19 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
        }}
      />
    </button>
  );
};

const InputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  background: T.bgSecondary,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  color: T.textPrimary,
  fontSize: 13,
  fontFamily: T.font,
  outline: "none",
};

const SelectStyle: React.CSSProperties = { ...InputStyle, cursor: "pointer" };

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div style={{ marginBottom: 24, fontFamily: T.font }}>
    <h1
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: T.textPrimary,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h1>
    <p style={{ color: T.textMuted, marginTop: 3, fontSize: 13 }}>{subtitle}</p>
  </div>
);

// Helper: derive initials + a deterministic avatar color from a display name
function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}
const AVATAR_COLORS = [
  "#0078f0",
  "#0891b2",
  "#d97706",
  "#7c3aed",
  "#059669",
  "#dc2626",
];
function avatarColorFor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── PAGE: Team ───────────────────────────────────────────────────────────────

export const TeamPage: React.FC<{ user: AuthUser }> = ({ user }) => {
  // Build the owner entry dynamically from the signed-in user
  const ownerMember: TeamMember = {
    id: user.userId,
    name: user.displayName || user.userEmail,
    email: user.userEmail,
    role: "Owner",
    status: "active",
    avatarColor: avatarColorFor(user.userId),
    initial: getInitial(user.displayName || user.userEmail),
  };

  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Agent");

  // All members shown: owner (from auth) + the rest
  const allMembers: TeamMember[] = [ownerMember, ...members];

  const roleBadge: Record<TeamMember["role"], BadgeVariant> = {
    Owner: "purple",
    Admin: "blue",
    Agent: "green",
    Viewer: "muted",
  };

  return (
    <div style={{ padding: "0 20px 24px", fontFamily: T.font }}>
      <PageHeader
        title="Team Management"
        subtitle="Invite members and manage their access to your AI assistant"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatMini icon="👥" value={allMembers.length} label="Total Members" />
        <StatMini
          icon="✅"
          value={allMembers.filter((m) => m.status === "active").length}
          label="Active"
        />
        <StatMini
          icon="⏳"
          value={allMembers.filter((m) => m.status === "pending").length}
          label="Pending Invite"
        />
        <StatMini
          icon="🔑"
          value={6 - allMembers.length}
          label="Seats Available"
        />
      </div>

      <Card>
        <SectionTitle>Invite Team Member</SectionTitle>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ ...InputStyle, flex: 2, minWidth: 200 }}
          />
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as TeamMember["role"])
            }
            style={{ ...SelectStyle, flex: 1, minWidth: 140 }}
          >
            <option>Admin</option>
            <option>Agent</option>
            <option>Viewer</option>
          </select>
          <Btn variant="primary" onClick={() => setInviteEmail("")}>
            📧 Send Invite
          </Btn>
        </div>
      </Card>

      <Card>
        <SectionTitle>Members</SectionTitle>
        {allMembers.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i < allMembers.length - 1
                  ? `1px solid ${T.borderLight}`
                  : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: m.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {m.initial}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: T.textPrimary,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {m.name}
                {m.id === user.userId && (
                  <span style={{ fontSize: 11, color: T.textMuted }}>
                    (You)
                  </span>
                )}
                {m.status === "pending" && (
                  <Badge variant="yellow" style={{ fontSize: 11 }}>
                    Pending
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
                {m.email}
              </div>
            </div>
            <Badge variant={roleBadge[m.role]}>{m.role}</Badge>
            {m.role !== "Owner" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={m.role}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((x) =>
                        x.id === m.id
                          ? { ...x, role: e.target.value as TeamMember["role"] }
                          : x,
                      ),
                    )
                  }
                  style={{ ...SelectStyle, width: "auto", minWidth: 110 }}
                >
                  <option>Admin</option>
                  <option>Agent</option>
                  <option>Viewer</option>
                </select>
                {m.status === "pending" && (
                  <Btn style={{ fontSize: 12, padding: "4px 10px" }}>
                    Resend
                  </Btn>
                )}
                <Btn
                  variant="danger"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() =>
                    setMembers((prev) => prev.filter((x) => x.id !== m.id))
                  }
                >
                  Remove
                </Btn>
              </div>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <SectionTitle>Role Permissions</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: T.font,
            }}
          >
            <thead>
              <tr>
                {["Permission", "Owner", "Admin", "Agent", "Viewer"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        padding: "0 0 10px",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: "11px 0",
                      borderBottom: `1px solid ${T.borderLight}`,
                      fontSize: 13,
                      color: T.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {p.label}
                  </td>
                  {[p.owner, p.admin, p.agent, p.viewer].map((val, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "11px 0",
                        borderBottom: `1px solid ${T.borderLight}`,
                        fontSize: 13,
                      }}
                    >
                      {val ? (
                        <span style={{ color: "var(--success,#15803d)" }}>
                          ✓
                        </span>
                      ) : (
                        <span style={{ color: T.border }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── PAGE: Knowledge Base ─────────────────────────────────────────────────────

// Knowledge base is account-scoped, not per-user — no user prop needed here.
export const KnowledgePage: React.FC = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [kbSearch, setKbSearch] = useState("");

  const filtered = KB_DOCUMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(kbSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(kbSearch.toLowerCase()),
  );

  const kbToggles = [
    {
      label: "Use knowledge base when answering",
      desc: "AI will search documents before responding to callers",
      defaultOn: true,
    },
    {
      label: "Admit when unsure",
      desc: "AI says \"I'm not sure\" rather than guessing when answer isn't in KB",
      defaultOn: true,
    },
    {
      label: "Log KB misses",
      desc: "Track questions the AI couldn't answer so you can fill gaps",
      defaultOn: false,
    },
  ];

  return (
    <div style={{ padding: "0 20px 24px", fontFamily: T.font }}>
      <PageHeader
        title="Knowledge Base"
        subtitle="Documents and FAQs your AI references when answering callers"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatMini icon="📄" value={KB_DOCUMENTS.length} label="Documents" />
        <StatMini icon="❓" value={24} label="FAQs" />
        <StatMini icon="🔍" value={142} label="AI Lookups" />
        <StatMini icon="📦" value="1.2 MB" label="Storage Used" />
      </div>

      <Card>
        <SectionTitle>Add Knowledge</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <Btn variant="primary">📄 Upload Document</Btn>
          <Btn>🔗 Import from URL</Btn>
          <Btn>❓ Add FAQ Entry</Btn>
          <Btn>📋 Paste Text</Btn>
        </div>
        <div
          style={{
            border: `2px dashed ${T.border}`,
            borderRadius: T.radiusLg,
            padding: 24,
            textAlign: "center",
            color: T.textMuted,
            fontSize: 13,
            background: T.bgSecondary,
          }}
        >
          Drag &amp; drop files here · PDF, DOCX, TXT, CSV supported · Max 10 MB
          per file
        </div>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <SectionTitle>Documents</SectionTitle>
          <input
            placeholder="Search knowledge…"
            value={kbSearch}
            onChange={(e) => setKbSearch(e.target.value)}
            style={{ ...InputStyle, width: 200 }}
          />
        </div>
        {filtered.map((doc) => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: 14,
              background: T.bgSecondary,
              border: `1px solid ${T.borderLight}`,
              borderRadius: T.radius,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: T.radius,
                background: doc.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              📄
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: T.textPrimary }}
              >
                {doc.name}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                {doc.description}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.textHint,
                  marginTop: 6,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {doc.type} · {doc.size}
                </span>
                <span>Added {doc.addedDate}</span>
                <span>🔍 Used {doc.usageCount} times</span>
              </div>
            </div>
            <Badge
              variant={doc.status === "active" ? "green" : "yellow"}
              style={{ alignSelf: "flex-start", flexShrink: 0 }}
            >
              {doc.status === "active" ? "Active" : "Indexing…"}
            </Badge>
          </div>
        ))}
      </Card>

      <Card>
        <SectionTitle>Knowledge Settings</SectionTitle>
        {kbToggles.map((t, i) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom:
                i < kbToggles.length - 1
                  ? `1px solid ${T.borderLight}`
                  : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}
              >
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                {t.desc}
              </div>
            </div>
            <Toggle defaultOn={t.defaultOn} />
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 0",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}
            >
              Confidence threshold
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              Only use KB answer if AI confidence is above this level
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 160,
            }}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={confidenceThreshold}
              step={1}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              style={{ flex: 1, accentColor: T.primary }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.textPrimary,
                minWidth: 36,
              }}
            >
              {confidenceThreshold}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── PAGE: Transcripts ────────────────────────────────────────────────────────

export const TranscriptsPage: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const filtered = TRANSCRIPTS.filter(
    (t) =>
      (sentimentFilter === "all" || t.sentiment === sentimentFilter) &&
      (t.phone.includes(search) ||
        t.preview.toLowerCase().includes(search.toLowerCase())),
  );

  const sentimentBadge: Record<TranscriptEntry["sentiment"], BadgeVariant> = {
    positive: "green",
    neutral: "muted",
    negative: "red",
  };
  const sentimentEmoji: Record<TranscriptEntry["sentiment"], string> = {
    positive: "😊",
    neutral: "😐",
    negative: "😞",
  };

  return (
    <div style={{ padding: "0 20px 24px", fontFamily: T.font }}>
      <PageHeader
        title="Call Transcripts"
        subtitle="Full text records of every AI-handled conversation"
      />

      {/* Signed-in user context strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          marginBottom: 16,
          background: T.infoBg,
          border: `1px solid ${T.infoBorder}`,
          borderRadius: T.radius,
          fontSize: 13,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: avatarColorFor(user.userId),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {getInitial(user.displayName || user.userEmail)}
        </div>
        <span style={{ color: T.textSecondary }}>
          Viewing transcripts for{" "}
          <strong style={{ color: T.textPrimary }}>
            {user.displayName || user.userEmail}
          </strong>
        </span>
      </div>

      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <input
          placeholder="Search transcripts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...InputStyle, flex: 1, minWidth: 200 }}
        />
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          style={SelectStyle}
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select style={SelectStyle}>
          <option>This Week</option>
          <option>Today</option>
          <option>This Month</option>
        </select>
        <Btn>📥 Export All</Btn>
      </div>

      {filtered.map((t) => (
        <div
          key={t.id}
          onClick={() => toggle(t.id)}
          style={{
            background: T.surface,
            border: `1px solid ${expanded.has(t.id) ? T.primary : T.border}`,
            borderRadius: T.radiusLg,
            padding: 14,
            marginBottom: 10,
            cursor: "pointer",
            boxShadow: T.shadowSm,
            transition: "border-color .15s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <Badge variant={sentimentBadge[t.sentiment]}>
              {sentimentEmoji[t.sentiment]} {t.sentiment}
            </Badge>
            <span
              style={{
                fontWeight: 600,
                color: T.textPrimary,
                fontFamily: T.fontMono,
                fontSize: 13,
              }}
            >
              {t.phone}
            </span>
            <Badge variant={t.direction === "inbound" ? "blue" : "purple"}>
              {t.direction === "inbound" ? "📥 Inbound" : "📤 Outbound"}
            </Badge>
            <span style={{ color: T.textMuted, fontSize: 12 }}>{t.date}</span>
            {t.escalated && <Badge variant="yellow">👤 Escalated</Badge>}
          </div>
          <div
            style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}
          >
            {t.preview}
          </div>

          {expanded.has(t.id) && (
            <div
              style={{
                marginTop: 12,
                borderTop: `1px solid ${T.border}`,
                paddingTop: 12,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {t.lines.map((line, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      minWidth: 56,
                      color:
                        line.speaker === "AI"
                          ? T.primary
                          : "var(--success,#15803d)",
                      fontFamily: T.font,
                    }}
                  >
                    {line.speaker}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: T.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn style={{ fontSize: 12 }}>📋 Copy Text</Btn>
                <Btn style={{ fontSize: 12 }}>📥 Download</Btn>
              </div>
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: T.textMuted,
          fontSize: 13,
        }}
      >
        <span>Showing {filtered.length} of 48 transcripts</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn style={{ padding: "5px 12px" }}>← Prev</Btn>
          <Btn style={{ padding: "5px 12px" }}>Next →</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Voicemails ─────────────────────────────────────────────────────────

export const VoicemailsPage: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [voicemails, setVoicemails] = useState<VoicemailEntry[]>(VOICEMAILS);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = voicemails.filter((v) =>
    filter === "all" ? true : filter === "unread" ? !v.read : v.read,
  );

  // Mark a voicemail as read when played
  const handlePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
    setVoicemails((prev) =>
      prev.map((v) => (v.id === id ? { ...v, read: true } : v)),
    );
  };

  const vmToggles = [
    {
      label: "Email me on new voicemail",
      desc: "Receive transcript + audio link by email",
      defaultOn: true,
    },
    {
      label: "Auto-transcribe voicemails",
      desc: "AI converts audio to text automatically",
      defaultOn: true,
    },
    {
      label: "Auto-delete after 30 days",
      desc: "Old voicemails are permanently removed",
      defaultOn: false,
    },
  ];

  return (
    <div style={{ padding: "0 20px 24px", fontFamily: T.font }}>
      <PageHeader
        title="Voicemails"
        subtitle="Messages left by callers when your AI couldn't assist or was unavailable"
      />

      {/* Delivery address notice — uses signed-in user's email */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          marginBottom: 16,
          background: T.infoBg,
          border: `1px solid ${T.infoBorder}`,
          borderRadius: T.radius,
          fontSize: 13,
          color: T.textSecondary,
        }}
      >
        📧 Voicemail alerts are sent to{" "}
        <strong style={{ color: T.textPrimary, marginLeft: 4 }}>
          {user.userEmail}
        </strong>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatMini
          icon="📬"
          value={voicemails.filter((v) => !v.read).length}
          label="Unread"
        />
        <StatMini icon="📭" value={voicemails.length} label="Total" />
        <StatMini icon="⏱️" value="1:42" label="Avg Duration" />
        <StatMini icon="🗑️" value={4} label="Auto-Deleted (30d)" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 3,
            background: T.bgTertiary,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: 3,
          }}
        >
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: T.font,
                background: filter === f ? T.surface : "transparent",
                color: filter === f ? T.primary : T.textMuted,
                boxShadow: filter === f ? T.shadowSm : "none",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Btn>🗑️ Delete Selected</Btn>
          <Btn>📥 Download All</Btn>
        </div>
      </div>

      <Card>
        {filtered.map((vm, i) => (
          <div
            key={vm.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              borderBottom:
                i < filtered.length - 1 ? `1px solid ${T.borderLight}` : "none",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                background: vm.read ? T.border : T.primary,
              }}
            />

            <button
              onClick={() => handlePlay(vm.id)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: playingId === vm.id ? T.primary : T.primaryLight,
                color: playingId === vm.id ? "#fff" : T.primary,
                transition: "background .15s",
              }}
            >
              {playingId === vm.id ? "⏸" : "▶"}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: T.textPrimary,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: T.fontMono }}>{vm.phone}</span>
                {!vm.read && (
                  <Badge variant="yellow" style={{ fontSize: 11 }}>
                    Unread
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                {vm.date} · {vm.trigger}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  marginTop: 4,
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {vm.preview}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: 120,
                height: 28,
                flexShrink: 0,
              }}
            >
              {vm.waveHeights.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    background: playingId === vm.id ? T.primary : T.border,
                    borderRadius: 2,
                    width: 3,
                    height: `${h}%`,
                    transition: "background .15s",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontSize: 12,
                color: T.textMuted,
                minWidth: 36,
                textAlign: "right",
                flexShrink: 0,
                fontFamily: T.fontMono,
              }}
            >
              {vm.duration}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <Btn style={{ fontSize: 11, padding: "3px 8px" }}>
                📞 Call Back
              </Btn>
              <Btn style={{ fontSize: 11, padding: "3px 8px" }}>
                📋 Transcript
              </Btn>
              <Btn
                variant="danger"
                style={{ fontSize: 11, padding: "3px 8px" }}
                onClick={() =>
                  setVoicemails((prev) => prev.filter((v) => v.id !== vm.id))
                }
              >
                🗑️
              </Btn>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: T.textMuted,
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
            <p>No voicemails found</p>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Voicemail Settings</SectionTitle>
        {vmToggles.map((t, i) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom:
                i < vmToggles.length - 1
                  ? `1px solid ${T.borderLight}`
                  : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}
              >
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                {t.desc}
              </div>
            </div>
            <Toggle defaultOn={t.defaultOn} />
          </div>
        ))}
      </Card>
    </div>
  );
};
