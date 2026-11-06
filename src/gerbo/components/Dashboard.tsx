import React, { useState, useEffect, useCallback} from "react";
import { useAuth } from "../hooks/useAuth";
import logo from "../images/gerbo-logo.png";
import { CallLog, Analytics, AgentSettings } from "../types/index";
import { TeamPage, KnowledgePage, TranscriptsPage, VoicemailsPage } from "./DashboardPages";
import { BillingPage } from "./BillingPage";
import { AuthUser } from "./DashboardPages";
import { CallFlowsPage } from "./CallFlowsPage";
import { useCallerLookup } from '../hooks/useCallerLookup';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import "../styles/gerbo-dashboard.scoped.css";

interface StatusNotification {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  message: string;
  link?: { href: string; label: string };
}

const WORKER_URL =
  process.env.REACT_APP_GERBO_WORKER_URL ||
  "https://backend-api.gerbospeaks.workers.dev";

export const Dashboard: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { user, signOut, getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallLog[]>([]);
  const { lookupOrCreate } = useCallerLookup();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalCalls: 0,
    answeredCalls: 0,
    missedCalls: 0,
    averageDuration: 0,
    topCallers: [],
  });

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    fromTime: "00:00",
    toTime: "23:59",
    callType: "all",
    answerStatus: "all",
    callerNumber: "",
    receiverNumber: "",
    sentiment: "all",
    minDuration: "",
    maxDuration: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleIncomingCall = async (callerPhone: string) => {
    if (!user?.uid) return;

    const result = await lookupOrCreate(
      { phone: callerPhone, name: 'Unknown Caller' },
      user.uid,
    );

    if (result.isNewClient) {
      // New caller — AI greets them fresh, collects their name etc.
      console.log(result.summary);
      // "Unknown Caller is a new client — no previous history on file..."
    } else {
      // Returning client — AI greets by name, mentions outstanding balance
      console.log(result.summary);
      // "Client: John Mthembu. 2 unpaid invoices totalling R4 800,00..."
    }
  };
  const [forwardToNumber, setForwardToNumber] = useState("");
  const [tempForwardNumber, setTempForwardNumber] = useState("");
  const [isEditingForward, setIsEditingForward] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");

  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    agentName: "",
    greetingMessage: "",
    systemInstructions: "",
    voiceId: "default",
    language: "en-US",
    phoneNumber: "",
    updatedAt: new Date().toISOString(),
  });
const currentUser: AuthUser | null = user
  ? {
      userId: user.uid,
      userEmail: user.email ?? "",
      displayName: user.displayName,
      getIdToken: () => getIdToken(),
    }
  : null;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningError, setProvisioningError] = useState("");
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [outboundNumber, setOutboundNumber] = useState("");
  const [isCallingInProgress, setIsCallingInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState("");

 interface AppNotification {
  id: string;
  type: "call" | "success" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  unread: boolean;
  createdAt: string;
}
 const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  type DashboardTab =
    | "overview"
    | "calls"
    | "analytics"
    | "settings"
    | "voicemails"
    | "transcripts"
    | "knowledge"
    | "prompts"
    | "call-flows"
    | "team"
    | "billing";

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "duration" | "sentiment">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [callNotes, setCallNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "custom"
  >("week");
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">(
    "csv",
  );
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [availableTags] = useState([
    "Important",
    "Follow-up",
    "Resolved",
    "Spam",
    "Customer",
  ]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval] = useState(30);
const handleMarkAllRead = async () => {
  if (!user) return;
  const unreadNotifs = notifications.filter((n) => n.unread);
  await Promise.all(
    unreadNotifs.map((n) =>
      updateDoc(doc(db, "users", user.uid, "notifications", n.id), {
        unread: false,
      })
    )
  );
};
  const [serviceNotifications] = useState<StatusNotification[]>([
    {
      id: "expired-services",
      type: "danger",
      message: "TIP – You currently have expired services. Check them in ",
      link: { href: "/settings", label: "Settings → Services" },
    },
  ]);
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Set<string>
  >(new Set());

  const [accountBalance] = useState<{
    amount: string;
    currency: string;
    expiresAt: string | null;
  }>({
    amount: "0.00",
    currency: "R",
    expiresAt: null,
  });
const addNotification = useCallback(async (
  type: AppNotification["type"],
  title: string,
  message: string
) => {
  if (!user) return;
  await addDoc(collection(db, "users", user.uid, "notifications"), {
    type,
    title,
    message,
    time: new Date().toISOString(),
    unread: true,
    createdAt: new Date().toISOString(),
  });
}, [user]);
  const [todayCalls, setTodayCalls] = useState({ inbound: 0, outbound: 0 });
  const [voicemailCounts] = useState({ unread: 0, total: 0 });
  const [supportCode] = useState("759615");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  useEffect(() => {
  if (!user) return;

  const notifRef = collection(db, "users", user.uid, "notifications");
  const q = query(notifRef, orderBy("createdAt", "desc"), limit(20));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifs: AppNotification[] = [];
    snapshot.forEach((doc) => {
      notifs.push({ id: doc.id, ...doc.data() } as AppNotification);
    });
    setNotifications(notifs);
  });

  return () => unsubscribe();
}, [user]);
  useEffect(() => {
    if (!user) return;
    const checkProvisioningStatus = async () => {
      try {
        setIsLoadingSettings(true);
        const firestoreDb = db; // Gerbo-scoped Firestore (never the default SolidFlo app)
        const settingsRef = doc(
          firestoreDb,
          "users",
          user.uid,
          "settings",
          "agentSettings",
        );
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as AgentSettings & {
            forwardToNumber?: string;
            twilioNumber?: string;
            vapiAssistantId?: string;
            vapiPhoneNumberId?: string;
          };
          setAgentSettings(data);
          setUserPhoneNumber(data.twilioNumber || "");
          setForwardToNumber(data.forwardToNumber || "");
          if (data.vapiAssistantId) setIsProvisioned(true);
        }
        setIsLoadingSettings(false);
      } catch (error) {
        console.error("Error checking provisioning:", error);
        setProvisioningError("Failed to check provisioning status");
        setIsLoadingSettings(false);
      }
    };
    checkProvisioningStatus();
  }, [user]);
  const [billingData, setBillingData] = useState({
    plan: "starter",
    status: "active",
    minutesUsed: 0,
    minutesLimit: 500,
    callsThisMonth: 0,
    callsLimit: 200,
    balance: 0,
    renewsAt: "",
    invoices: [],
  });

  useEffect(() => {
    if (!user) return;
    const billingRef = doc(db, "users", user.uid, "settings", "billing");
    const unsubscribe = onSnapshot(billingRef, (snap) => {
      if (snap.exists()) {
        setBillingData(snap.data() as typeof billingData);
      }
    });
    return () => unsubscribe();
  }, [user]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest(".nav-dropdown"))
        setShowNotifications(false);
      if (showUserMenu && !target.closest(".user-dropdown"))
        setShowUserMenu(false);
    };
    if (showNotifications || showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications, showUserMenu]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>(".global-search-input")
          ?.focus();
      }
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

 useEffect(() => {
  if (!user) return;

  const callsRef = collection(db, "callLogs");
  const q = query(
    callsRef,
    where("userId", "==", user.uid),
    orderBy("timestamp", "desc"),
    limit(100),
  );

  let isFirstLoad = true; // ← guard flag

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // ── Build call logs array ─────────────────────────────────────
    const logs: CallLog[] = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as CallLog);
    });

    // ── Notifications — skip the initial load batch ───────────────
    if (!isFirstLoad) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const call = change.doc.data() as CallLog;
          if (call.status === "missed") {
            addNotification(
              "call",
              "Missed Call",
              `Missed call from ${call.phoneNumber}`,
            );
          } else if (call.status === "completed") {
            addNotification(
              "success",
              "Call Completed",
              `Call with ${call.phoneNumber} ended (${formatDuration(call.duration)})`,
            );
          }
        }
      });
    }
    isFirstLoad = false; // ← flip after first snapshot

    // ── State updates ─────────────────────────────────────────────
    setCallLogs(logs);
    setFilteredCalls(logs);
    calculateAnalytics(logs);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter((log) => {
      const d =
        typeof log.timestamp === "object" && "toDate" in log.timestamp
          ? log.timestamp.toDate()
          : new Date(log.timestamp as any);
      return d >= today;
    });

    setTodayCalls({
      inbound: todayLogs.filter((l) => l.direction !== "outbound").length,
      outbound: todayLogs.filter((l) => l.direction === "outbound").length,
    });
  });

  return () => unsubscribe();
}, [addNotification, user]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log("Auto-refreshing…");
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    let filtered = [...callLogs];
    if (searchTerm) {
      filtered = filtered.filter(
        (call) =>
          call.phoneNumber.includes(searchTerm) ||
          call.summary?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (dateRange !== "custom") {
      const now = new Date();
      let startDate = new Date();
      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter((call) => {
        const d =
          typeof call.timestamp === "object" && "toDate" in call.timestamp
            ? call.timestamp.toDate()
            : new Date(call.timestamp as any);
        return d >= startDate;
      });
    }
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((call) => {
        const d =
          typeof call.timestamp === "object" && "toDate" in call.timestamp
            ? call.timestamp.toDate()
            : new Date(call.timestamp as any);
        return d >= fromDate;
      });
    }
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((call) => {
        const d =
          typeof call.timestamp === "object" && "toDate" in call.timestamp
            ? call.timestamp.toDate()
            : new Date(call.timestamp as any);
        return d <= toDate;
      });
    }
    if (filters.callType !== "all")
      filtered = filtered.filter((call) => call.direction === filters.callType);
    if (filters.answerStatus === "answered")
      filtered = filtered.filter((call) => call.status === "completed");
    else if (filters.answerStatus === "unanswered")
      filtered = filtered.filter((call) => call.status === "missed");
    if (filters.sentiment !== "all")
      filtered = filtered.filter(
        (call) => call.sentiment === filters.sentiment,
      );
    if (filters.callerNumber)
      filtered = filtered.filter((call) =>
        call.phoneNumber.includes(filters.callerNumber),
      );
    if (filters.receiverNumber)
      filtered = filtered.filter((call) =>
        call.toNumber?.includes(filters.receiverNumber),
      );
    if (filters.minDuration)
      filtered = filtered.filter(
        (call) => call.duration >= parseInt(filters.minDuration),
      );
    if (filters.maxDuration)
      filtered = filtered.filter(
        (call) => call.duration <= parseInt(filters.maxDuration),
      );
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date": {
          const dateA =
            typeof a.timestamp === "object" && "toDate" in a.timestamp
              ? a.timestamp.toDate()
              : new Date(a.timestamp as any);
          const dateB =
            typeof b.timestamp === "object" && "toDate" in b.timestamp
              ? b.timestamp.toDate()
              : new Date(b.timestamp as any);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "sentiment": {
          const order = { positive: 3, neutral: 2, negative: 1 };
          comparison =
            (order[a.sentiment as keyof typeof order] || 0) -
            (order[b.sentiment as keyof typeof order] || 0);
          break;
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    setFilteredCalls(filtered);
  }, [filters, callLogs, searchTerm, sortBy, sortOrder, dateRange]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const calculateAnalytics = (logs: CallLog[]) => {
    const total = logs.length;
    const answered = logs.filter((l) => l.status === "completed").length;
    const missed = logs.filter((l) => l.status === "missed").length;
    const avgDuration =
      logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.duration, 0) / logs.length)
        : 0;
    const callerCounts = logs.reduce(
      (acc, l) => {
        acc[l.phoneNumber] = (acc[l.phoneNumber] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const topCallers = Object.entries(callerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([phoneNumber, count]) => ({ phoneNumber, count }));
    setAnalytics({
      totalCalls: total,
      answeredCalls: answered,
      missedCalls: missed,
      averageDuration: avgDuration,
      topCallers,
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "N/A";
    const date =
      typeof timestamp === "object" && "toDate" in timestamp
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "neutral":
        return "😐";
      case "negative":
        return "😞";
      default:
        return "📞";
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const getCallsByTimeOfDay = () => {
    const hours = Array(24).fill(0);
    callLogs.forEach((call) => {
      const date =
        typeof call.timestamp === "object" && "toDate" in call.timestamp
          ? call.timestamp.toDate()
          : new Date(call.timestamp as any);
      hours[date.getHours()]++;
    });
    return hours;
  };

  const getCallsBySentiment = () => {
    const s = { positive: 0, neutral: 0, negative: 0 };
    callLogs.forEach((call) => {
      if (call.sentiment in s) s[call.sentiment as keyof typeof s]++;
    });
    return s;
  };

  const getAverageResponseTime = () => 5;

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifications((prev) => new Set([...prev, id]));
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleManualProvision = async () => {
    if (!user?.uid) return;
    if (agentSettings.vapiAssistantId || isProvisioned) {
      setSaveMessage(
        "❌ AI Assistant already exists. You can only have one assistant.",
      );
      setTimeout(() => setSaveMessage(""), 4000);
      return;
    }
    setIsProvisioning(true);
    setProvisioningError("");
    setSaveMessage("Setting up your AI assistant…");
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${WORKER_URL}/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();
      if (result.success) {
        setSaveMessage(
          "✅ AI Assistant created! Now assign a phone number below.",
        );
        if (result.data) {
          setAgentSettings((prev) => ({ ...prev, ...result.data }));
          if (result.data.vapiAssistantId) setIsProvisioned(true);
        }
        setTimeout(() => setSaveMessage(""), 8000);
      } else {
        const msg = result.message || result.error || "Unknown error";
        setSaveMessage("Provisioning failed: " + msg);
        setProvisioningError("Provisioning failed: " + msg);
        setTimeout(() => {
          setSaveMessage("");
          setProvisioningError("");
        }, 10000);
      }
    } catch (error: any) {
      const msg = "Network error: " + error.message;
      setProvisioningError(msg);
      setSaveMessage(msg);
      setTimeout(() => {
        setSaveMessage("");
        setProvisioningError("");
      }, 5000);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSaveForwardingNumber = async () => {
    if (!user?.uid || !tempForwardNumber.trim()) {
      setSaveMessage("Please enter a valid phone number");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }
    setIsSaving(true);
    setSaveMessage("");
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${WORKER_URL}/update-forwarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, forwardToNumber: tempForwardNumber }),
      });
      const result = await response.json();
      if (result.success) {
        setForwardToNumber(tempForwardNumber);
        setIsEditingForward(false);
        setSaveMessage("✅ Forwarding number saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("❌ " + (result.error || "Failed to save"));
        setTimeout(() => setSaveMessage(""), 5000);
      }
    } catch (error: any) {
      setSaveMessage("❌ Error: " + error.message);
      setTimeout(() => setSaveMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelForwardEdit = () => {
    setTempForwardNumber(forwardToNumber);
    setIsEditingForward(false);
  };

  const handleSaveSettings = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${WORKER_URL}/update-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          settings: {
            agentName: agentSettings.agentName,
            greetingMessage: agentSettings.greetingMessage,
            systemInstructions: agentSettings.systemInstructions,
            voiceId: agentSettings.voiceId,
            language: agentSettings.language,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSaveMessage("Settings saved successfully!");
        await addNotification("success", "Settings Saved", "Your AI assistant settings have been updated");
        const firestoreDb = db; // Gerbo-scoped Firestore (never the default SolidFlo app)
        const docRef = doc(
          firestoreDb,
          "users",
          user.uid,
          "settings",
          "agentSettings",
        );
        await setDoc(
          docRef,
          { ...agentSettings, updatedAt: new Date().toISOString() },
          { merge: true },
        );
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage(
          "Error saving settings: " + (result.error || "Unknown error"),
        );
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error: any) {
      setSaveMessage("Error saving settings: " + error.message);
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMakeCall = async (phoneNumber: string) => {
    if (!phoneNumber) {
      setCallStatus("Please enter a phone number");
      return;
    }
    if (!userPhoneNumber) {
      setCallStatus("Please assign a phone number first");
      setTimeout(() => setCallStatus(""), 5000);
      return;
    }
    setIsCallingInProgress(true);
    setCallStatus("Initiating call…");
    try {
      const idToken = await getIdToken();
      const cleanedNumber = phoneNumber.replace(/\D/g, "");
      const response = await fetch(`${WORKER_URL}/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, toNumber: cleanedNumber }),
      });
      const result = await response.json();
      if (result.success) {
        setCallStatus("Call initiated successfully!");
        setTimeout(() => {
          setCallStatus("");
          setOutboundNumber("");
        }, 3000);
      } else {
        setCallStatus(
          "Failed to initiate call: " + (result.error || "Unknown error"),
        );
        setTimeout(() => setCallStatus(""), 5000);
      }
    } catch (error: any) {
      setCallStatus("Failed to initiate call: " + error.message);
      setTimeout(() => setCallStatus(""), 5000);
    } finally {
      setIsCallingInProgress(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      fromTime: "00:00",
      toTime: "23:59",
      callType: "all",
      answerStatus: "all",
      callerNumber: "",
      receiverNumber: "",
      sentiment: "all",
      minDuration: "",
      maxDuration: "",
    });
    setSearchTerm("");
    setDateRange("week");
  };

  const handleDeleteSelected = async () => {
    if (selectedCalls.size === 0) return;
    if (!window.confirm(`Delete ${selectedCalls.size} call(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selectedCalls).map((id) =>
          deleteDoc(doc(db, "callLogs", id)),
        ),
      );
      setSelectedCalls(new Set());
      setSaveMessage("Calls deleted successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Error deleting calls. Please try again.");
    }
  };

  const exportCallData = (calls: CallLog[], format: "csv" | "json" | "pdf") => {
    const data = calls.map((call) => ({
      Date: formatDate(call.timestamp),
      "Phone Number": call.phoneNumber,
      Direction: call.direction || "inbound",
      Duration: formatDuration(call.duration),
      Status: call.status,
      Sentiment: call.sentiment,
      Summary: call.summary || "",
      Tags: tags[call.id]?.join(", ") || "",
      Notes: callNotes[call.id] || "",
    }));
    if (data.length === 0) return;
    if (format === "csv") {
      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map((row) =>
          Object.values(row)
            .map((v) => `"${v}"`)
            .join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `call-data-${getTodayDate()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "json") {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `call-data-${getTodayDate()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleBulkExport = () => {
    if (selectedCalls.size === 0) {
      setSaveMessage("Please select calls to export");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }
    exportCallData(
      filteredCalls.filter((c) => selectedCalls.has(c.id)),
      exportFormat,
    );
    setSaveMessage(`${selectedCalls.size} calls exported!`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleBulkTag = (tag: string) => {
    const newTags = { ...tags };
    selectedCalls.forEach((id) => {
      if (!newTags[id]) newTags[id] = [];
      if (!newTags[id].includes(tag)) newTags[id].push(tag);
    });
    setTags(newTags);
    setSaveMessage(`Tagged ${selectedCalls.size} calls as "${tag}"`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleRemoveTag = (callId: string, tag: string) => {
    const newTags = { ...tags };
    if (newTags[callId])
      newTags[callId] = newTags[callId].filter((t) => t !== tag);
    setTags(newTags);
  };

  const handleDownloadCallData = () =>
    exportCallData(filteredCalls, exportFormat);

  const handleSaveNote = async (callId: string) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, "callLogs", callId), { notes: tempNote });
      setCallNotes({ ...callNotes, [callId]: tempNote });
      setEditingNoteId(null);
      setTempNote("");
      setSaveMessage("Note saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Error saving note.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const toggleCallSelection = (callId: string) => {
    const s = new Set(selectedCalls);
    s.has(callId) ? s.delete(callId) : s.add(callId);
    setSelectedCalls(s);
  };

  const selectAllCalls = () => {
    setSelectedCalls(
      selectedCalls.size === filteredCalls.length
        ? new Set()
        : new Set(filteredCalls.map((c) => c.id)),
    );
  };

  // ── Loading screen ────────────────────────────────────────────────────────

  if (isLoadingSettings) {
    return (
      <div className="dashboard">
        <div className="provisioning-screen">
          <div className="provisioning-card">
            <div className="logo-large">
              <img src={logo} alt="Gerbo AI" />
              <h1>Gerbo AI</h1>
            </div>
            <div className="spinner-large"></div>
            <h2>Loading your dashboard…</h2>
          </div>
        </div>
      </div>
    );
  }

  type SidebarItemProps = { tab: DashboardTab; label: string; icon: string };

  const SidebarItem = ({ tab, label, icon }: SidebarItemProps) => (
    <button
      className={`sidebar-item ${activeTab === tab ? "active" : ""}`}
      onClick={() => {
        setActiveTab(tab);
        setSidebarOpen(false);
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  // ── Page content wrapper (adds consistent padding) ────────────────────────
  const PageWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ padding: "0 20px 24px" }}>{children}</div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-content">
            <div className="sidebar-group">
              <div className="sidebar-title">Dashboard</div>
              <SidebarItem tab="overview" label="Overview" icon="📊" />
            </div>
            <div className="sidebar-group">
              <div className="sidebar-title">Calls</div>
              <SidebarItem tab="calls" label="All Calls" icon="📞" />
              <SidebarItem tab="voicemails" label="Voicemails" icon="🎙️" />
              <SidebarItem tab="transcripts" label="Transcripts" icon="📄" />
            </div>
            <div className="sidebar-group">
              <div className="sidebar-title">AI Setup</div>
              <SidebarItem tab="settings" label="Configuration" icon="⚙️" />
              <SidebarItem tab="knowledge" label="Knowledge Base" icon="📚" />
              <SidebarItem tab="call-flows" label="Call Flows" icon="🔀" />
            </div>
            <div className="sidebar-group">
              <div className="sidebar-title">Business</div>
              <SidebarItem tab="analytics" label="Analytics" icon="📈" />
              <SidebarItem tab="team" label="Team" icon="👥" />
              <SidebarItem tab="billing" label="Billing" icon="💳" />
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              className="user-menu-trigger"
              onClick={signOut}
              title="Sign out"
            >
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user?.email?.split("@")[0]}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
          </div>
        </aside>

        {/* ── Main area ──────────────────────────────────────────────────── */}
        <main className="main-content">
          {/* Top nav */}
          <nav className="dashboard-nav">
            <div className="nav-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
            </div>

            <div className="nav-center">
              <div className="global-search">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search calls, contacts, or settings… (⌘K)"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="global-search-input"
                />
                <kbd className="search-shortcut">⌘K</kbd>
              </div>
            </div>

            <div className="nav-right">
              <div className="nav-actions">
                <button
                  className="nav-copy-btn"
                  title="Click to copy support code"
                  onClick={() => handleCopyToClipboard(supportCode, "support")}
                >
                  Support: {supportCode}
                  <span className="copy-icon">
                    {copiedField === "support" ? "✓" : "⎘"}
                  </span>
                </button>

                <button
                  className="nav-action-btn"
                  onClick={() => setActiveTab("analytics")}
                >
                  Stats
                </button>

                <div className="nav-divider" />

                {/* Notifications */}
                <div className="nav-dropdown">
                  <button
                    className="nav-icon-btn"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <span className="icon-badge">🔔</span>
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="dropdown-menu notifications-menu">
                      <div className="dropdown-header">
                        <h3>Notifications</h3>
                        <button className="mark-all-read" onClick={handleMarkAllRead}>
  Mark all read
</button>
                      </div>
                      <div className="dropdown-content">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notification-item ${notif.unread ? "unread" : ""}`}
                          >
                            <span className="notification-icon">
                              {notif.type === "call"
                                ? "📞"
                                : notif.type === "success"
                                  ? "✅"
                                  : "ℹ️"}
                            </span>
                            <div className="notification-content">
                              <div className="notification-title">
                                {notif.title}
                              </div>
                              <div className="notification-message">
                                {notif.message}
                              </div>
                              <div className="notification-time">
                                {notif.time}
                              </div>
                            </div>
                            {notif.unread && <span className="unread-dot" />}
                          </div>
                        ))}
                      </div>
                      <div className="dropdown-footer">
                        <button className="view-all-btn">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="nav-icon-btn"
                  onClick={() => window.open("https://docs.gerbo.ai", "_blank")}
                >
                  <span className="icon-badge">❓</span>
                </button>

                <div className="nav-divider" />
              </div>

              {/* User menu */}
              <div className="nav-dropdown user-dropdown">
                <button
                  className="user-menu-trigger"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                >
                  <div className="user-avatar">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">
                    {user?.email?.split("@")[0]}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserMenu && (
                  <div className="dropdown-menu user-menu">
                    <div className="user-menu-header">
                      <div className="user-avatar-large">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-email">{user?.email}</div>
                        {userPhoneNumber && (
                          <div className="user-phone">📞 {userPhoneNumber}</div>
                        )}
                        <div className="user-status">
                          <span className="status-dot active" />
                          Account: Active
                        </div>
                      </div>
                    </div>

                    {user?.uid && (
                      <div className="user-menu-copy-row">
                        <button
                          className="copy-code-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              user.uid.slice(0, 8).toUpperCase(),
                              "uid",
                            )
                          }
                        >
                          ID: {user.uid.slice(0, 8).toUpperCase()}
                          <span>
                            {copiedField === "uid" ? "✓ Copied" : "⎘ Copy"}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="user-menu-divider" />
                    <div className="user-menu-items">
                      <button
                        className="user-menu-item"
                        onClick={() => {
                          setActiveTab("settings");
                          setShowUserMenu(false);
                        }}
                      >
                        <span className="menu-item-icon">⚙️</span>Settings
                      </button>
                      <button
                        className="user-menu-item"
                        onClick={() => {
                          setActiveTab("overview");
                          setShowUserMenu(false);
                        }}
                      >
                        <span className="menu-item-icon">📊</span>Dashboard
                      </button>
                      <button className="user-menu-item">
                        <span className="menu-item-icon">👤</span>Profile
                      </button>
                      <button className="user-menu-item">
                        <span className="menu-item-icon">💳</span>Billing
                      </button>
                    </div>
                    <div className="user-menu-divider" />
                    <div className="user-menu-items">
                      <button className="user-menu-item">
                        <span className="menu-item-icon">📚</span>Documentation
                      </button>
                      <button className="user-menu-item">
                        <span className="menu-item-icon">💬</span>Support
                      </button>
                    </div>
                    <div className="user-menu-divider" />
                    <button
                      className="user-menu-item sign-out-item"
                      onClick={signOut}
                    >
                      <span className="menu-item-icon">🚪</span>Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Alert banners */}
          <div className="alert-banner-container">
            {serviceNotifications
              .filter((n) => !dismissedNotifications.has(n.id))
              .map((notif) => (
                <div
                  key={notif.id}
                  className={`alert-banner alert-${notif.type}`}
                >
                  <span className="alert-icon">
                    {notif.type === "danger"
                      ? "⚠️"
                      : notif.type === "warning"
                        ? "⚡"
                        : notif.type === "info"
                          ? "ℹ️"
                          : "✅"}
                  </span>
                  <span className="alert-text">
                    {notif.message}
                    {notif.link && (
                      <button
                        className="alert-link"
                        onClick={() => setActiveTab("settings")}
                      >
                        {notif.link.label}
                      </button>
                    )}
                  </span>
                  <button
                    className="alert-dismiss"
                    onClick={() => dismissNotification(notif.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>

          {/* Header stat cards */}
          <div className="header-stat-cards">
            <button
              className="header-stat-card"
              onClick={() => setActiveTab("calls")}
            >
              <div className="hsc-inner">
                <div className="hsc-label">Today's Calls</div>
                <div className="hsc-icon">📈</div>
              </div>
              <div className="hsc-values">
                <span className="hsc-big">{todayCalls.outbound}</span>
                <span className="hsc-sub">Outbound</span>
              </div>
              <div className="hsc-values">
                <span className="hsc-big">{todayCalls.inbound}</span>
                <span className="hsc-sub">Inbound</span>
              </div>
            </button>

            <div className="header-stat-card header-stat-card--balance">
              <div className="hsc-inner">
                <div className="hsc-label">Account Balance</div>
                <div className="hsc-icon">💷</div>
              </div>
              <div className="hsc-values">
                <span className="hsc-big">
                  {accountBalance.currency}
                  {accountBalance.amount}
                </span>
              </div>
              {accountBalance.expiresAt && (
                <div className="hsc-sub">
                  expires {accountBalance.expiresAt}
                </div>
              )}
              <div className="hsc-footer">
                <button
                  className="hsc-topup-btn"
                  onClick={() => setActiveTab("billing")}
                >
                  Top Up →
                </button>
              </div>
            </div>

            <button
              className="header-stat-card"
              onClick={() => setActiveTab("voicemails")}
            >
              <div className="hsc-inner">
                <div className="hsc-label">Voicemails</div>
                <div className="hsc-icon">🎙️</div>
              </div>
              <div className="hsc-values">
                <span className="hsc-big">{voicemailCounts.unread}</span>
                <span className="hsc-sub">Unread</span>
              </div>
              <div className="hsc-values">
                <span className="hsc-muted">{voicemailCounts.total}</span>
                <span className="hsc-sub">Total</span>
              </div>
            </button>
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <PageWrap>
              <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p className="page-subtitle">
                  Monitor your AI agent's performance
                </p>
                <div className="header-actions">
                  <button
                    className="quick-action-btn"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                  >
                    ⚡ Quick Actions
                  </button>
                  <label className="auto-refresh-toggle">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh
                  </label>
                </div>
              </div>

              {showQuickActions && (
                <div className="quick-actions-panel">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <button onClick={() => setActiveTab("calls")}>
                      📋 View All Calls
                    </button>
                    <button onClick={() => setActiveTab("settings")}>
                      ⚙️ Configure AI
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("calls");
                        setFilters((f) => ({
                          ...f,
                          answerStatus: "unanswered",
                        }));
                      }}
                    >
                      ⚠️ Missed Calls
                    </button>
                    <button onClick={handleDownloadCallData}>
                      📥 Export Data
                    </button>
                  </div>
                </div>
              )}

              {isProvisioned &&
                agentSettings.vapiAssistantId &&
                userPhoneNumber && (
                  <div className="status-banner success">
                    <span className="status-indicator active" />
                    <div className="status-content">
                      <strong>AI Assistant Active</strong>
                      <p>Your number: {userPhoneNumber}</p>
                    </div>
                  </div>
                )}

              {!isProvisioned && !agentSettings.vapiAssistantId && (
                <div className="status-banner info">
                  <span className="status-indicator" />
                  <div className="status-content">
                    <strong>Get Started</strong>
                    <p>
                      Set up your AI assistant, then assign a phone number to
                      start receiving calls
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="setup-btn"
                    style={{ marginLeft: "auto" }}
                  >
                    Set Up Now
                  </button>
                </div>
              )}

              <div className="stats-grid">
                {[
                  {
                    icon: "📞",
                    label: "Total Calls",
                    value: analytics.totalCalls,
                    sub: "All time",
                    cls: "total",
                  },
                  {
                    icon: "✅",
                    label: "Answered",
                    value: analytics.answeredCalls,
                    sub:
                      analytics.totalCalls > 0
                        ? `${Math.round((analytics.answeredCalls / analytics.totalCalls) * 100)}% rate`
                        : "0% rate",
                    cls: "success",
                  },
                  {
                    icon: "⚠️",
                    label: "Missed",
                    value: analytics.missedCalls,
                    sub:
                      analytics.totalCalls > 0
                        ? `${Math.round((analytics.missedCalls / analytics.totalCalls) * 100)}% rate`
                        : "0% rate",
                    cls: "warning",
                  },
                  {
                    icon: "⏱️",
                    label: "Avg Duration",
                    value: formatDuration(analytics.averageDuration),
                    sub: "Per call",
                    cls: "info",
                  },
                ].map((card) => (
                  <div key={card.label} className="stat-card">
                    <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
                    <div className="stat-content">
                      <h3>{card.label}</h3>
                      <p className="stat-number">{card.value}</p>
                      <span className="stat-label">{card.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {analytics.topCallers.length > 0 && (
                <div className="top-callers-section">
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "10px",
                    }}
                  >
                    Top Callers
                  </h2>
                  <div className="top-callers-list">
                    {analytics.topCallers.map((caller, i) => (
                      <div key={caller.phoneNumber} className="top-caller-item">
                        <span className="caller-rank">#{i + 1}</span>
                        <span className="caller-number">
                          {caller.phoneNumber}
                        </span>
                        <span className="caller-count">
                          {caller.count} calls
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="recent-calls-section">
                <div className="section-header">
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Recent Calls
                  </h2>
                  <button
                    className="view-all-btn"
                    onClick={() => setActiveTab("calls")}
                  >
                    View All →
                  </button>
                </div>
                {callLogs.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📞</span>
                    <p>No calls yet. Your call history will appear here.</p>
                  </div>
                ) : (
                  <div className="call-list-compact">
                    {callLogs.slice(0, 5).map((call) => (
                      <div key={call.id} className="call-item-compact">
                        <div className="call-icon">
                          {getSentimentIcon(call.sentiment)}
                        </div>
                        <div className="call-info-compact">
                          <div className="call-primary">
                            <span className="call-number">
                              {call.phoneNumber}
                            </span>
                            <span className={`call-status ${call.status}`}>
                              {call.status}
                            </span>
                          </div>
                          <div className="call-secondary">
                            <span>{formatDate(call.timestamp)}</span>
                            <span>{formatDuration(call.duration)}</span>
                          </div>
                          {tags[call.id]?.length > 0 && (
                            <div className="call-tags-mini">
                              {tags[call.id].map((tag) => (
                                <span key={tag} className="tag-mini">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PageWrap>
          )}

          {/* ── CALLS ────────────────────────────────────────────────────── */}
          {activeTab === "calls" && (
            <PageWrap>
              <div className="page-header">
                <h1>Call History</h1>
                <div className="header-controls">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search calls…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="view-toggle">
                    <button
                      className={viewMode === "list" ? "active" : ""}
                      onClick={() => setViewMode("list")}
                    >
                      📋 List
                    </button>
                    <button
                      className={viewMode === "grid" ? "active" : ""}
                      onClick={() => setViewMode("grid")}
                    >
                      ⊞ Grid
                    </button>
                  </div>
                </div>
              </div>

              <div className="filter-bar">
                <div className="filter-quick">
                  <label>Quick Filter:</label>
                  <div className="date-range-buttons">
                    {(["today", "week", "month", "custom"] as const).map(
                      (r) => (
                        <button
                          key={r}
                          className={dateRange === r ? "active" : ""}
                          onClick={() => setDateRange(r)}
                        >
                          {r === "today"
                            ? "Today"
                            : r === "week"
                              ? "This Week"
                              : r === "month"
                                ? "This Month"
                                : "Custom"}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div className="sort-controls">
                  <label>Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="date">Date</option>
                    <option value="duration">Duration</option>
                    <option value="sentiment">Sentiment</option>
                  </select>
                  <button
                    className="sort-order-btn"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>

              {dateRange === "custom" && (
                <div className="search-filters">
                  <h3>Advanced Filters</h3>
                  <div className="filter-grid">
                    <div className="filter-row">
                      <div className="filter-group">
                        <label>From Date</label>
                        <input
                          type="date"
                          value={filters.fromDate}
                          max={getTodayDate()}
                          onChange={(e) =>
                            setFilters({ ...filters, fromDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label>To Date</label>
                        <input
                          type="date"
                          value={filters.toDate}
                          max={getTodayDate()}
                          onChange={(e) =>
                            setFilters({ ...filters, toDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label>Call Type</label>
                        <select
                          value={filters.callType}
                          onChange={(e) =>
                            setFilters({ ...filters, callType: e.target.value })
                          }
                        >
                          <option value="all">All</option>
                          <option value="inbound">Inbound</option>
                          <option value="outbound">Outbound</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>Status</label>
                        <select
                          value={filters.answerStatus}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              answerStatus: e.target.value,
                            })
                          }
                        >
                          <option value="all">All</option>
                          <option value="answered">Answered</option>
                          <option value="unanswered">Unanswered</option>
                        </select>
                      </div>
                    </div>
                    <div className="filter-row">
                      <div className="filter-group">
                        <label>Sentiment</label>
                        <select
                          value={filters.sentiment}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              sentiment: e.target.value,
                            })
                          }
                        >
                          <option value="all">All</option>
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>Min Duration (s)</label>
                        <input
                          type="number"
                          value={filters.minDuration}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              minDuration: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="filter-group">
                        <label>Max Duration (s)</label>
                        <input
                          type="number"
                          value={filters.maxDuration}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxDuration: e.target.value,
                            })
                          }
                          placeholder="999"
                        />
                      </div>
                      <div className="filter-group">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          value={filters.callerNumber}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              callerNumber: e.target.value,
                            })
                          }
                          placeholder="Search number…"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="filter-actions">
                    <button onClick={handleResetFilters} className="reset-btn">
                      Reset All
                    </button>
                  </div>
                </div>
              )}

              <div className="call-actions">
                <div className="bulk-actions-left">
                  <button onClick={selectAllCalls} className="select-all-btn">
                    {selectedCalls.size === filteredCalls.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {selectedCalls.size > 0 && (
                    <>
                      <span className="selected-count">
                        {selectedCalls.size} selected
                      </span>
                      <button
                        onClick={handleDeleteSelected}
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>
                      <button onClick={handleBulkExport} className="export-btn">
                        📥 Export
                      </button>
                      <div className="tag-dropdown">
                        <button className="tag-btn">🏷️ Tag</button>
                        <div className="tag-menu">
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleBulkTag(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="export-format">
                  <label>Export as:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  <button
                    onClick={handleDownloadCallData}
                    className="download-btn"
                  >
                    📥 Download All
                  </button>
                </div>
              </div>

              {filteredCalls.length === 0 ? (
                <div className="empty-state large">
                  <span className="empty-icon">📞</span>
                  <h3>No calls found</h3>
                  <p>Try adjusting your filters or wait for new calls</p>
                </div>
              ) : (
                <>
                  <div className="call-list-header">
                    Showing {filteredCalls.length} of {callLogs.length} calls
                  </div>
                  <div className={`call-list ${viewMode}`}>
                    {filteredCalls.map((call) => (
                      <div key={call.id} className="call-card selectable">
                        <div className="call-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCalls.has(call.id)}
                            onChange={() => toggleCallSelection(call.id)}
                          />
                        </div>
                        <div className="call-card-content">
                          <div className="call-card-header">
                            <div className="call-card-left">
                              <span className="call-sentiment-badge">
                                {getSentimentIcon(call.sentiment)}{" "}
                                {call.sentiment}
                              </span>
                              <span className="phone-number">
                                {call.phoneNumber}
                              </span>
                              <span className="call-direction-badge">
                                {call.direction === "inbound"
                                  ? "📥 Inbound"
                                  : "📤 Outbound"}
                              </span>
                            </div>
                            <div className="call-card-right">
                              <span className={`status-badge ${call.status}`}>
                                {call.status}
                              </span>
                              <button
                                className="details-btn"
                                onClick={() => {
                                  setSelectedCall(call);
                                  setShowCallDetails(true);
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {call.summary && (
                            <p className="call-summary">{call.summary}</p>
                          )}

                          {tags[call.id]?.length > 0 && (
                            <div className="call-tags">
                              {tags[call.id].map((tag) => (
                                <span key={tag} className="tag">
                                  {tag}
                                  <button
                                    className="tag-remove"
                                    onClick={() =>
                                      handleRemoveTag(call.id, tag)
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {editingNoteId === call.id ? (
                            <div className="note-editor">
                              <textarea
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Add notes about this call…"
                                rows={3}
                              />
                              <div className="note-actions">
                                <button
                                  onClick={() => handleSaveNote(call.id)}
                                  className="save-note-btn"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setTempNote("");
                                  }}
                                  className="cancel-note-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {callNotes[call.id] && (
                                <div className="call-note">
                                  <span className="note-icon">📝</span>
                                  <span className="note-text">
                                    {callNotes[call.id]}
                                  </span>
                                </div>
                              )}
                              <button
                                className="add-note-btn"
                                onClick={() => {
                                  setEditingNoteId(call.id);
                                  setTempNote(callNotes[call.id] || "");
                                }}
                              >
                                {callNotes[call.id]
                                  ? "✏️ Edit Note"
                                  : "📝 Add Note"}
                              </button>
                            </>
                          )}

                          <div className="call-card-footer">
                            <div className="call-meta">
                              <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                {formatDate(call.timestamp)}
                              </span>
                              <span className="meta-item">
                                <span className="meta-icon">⏱️</span>
                                {formatDuration(call.duration)}
                              </span>
                              {call.recording && (
                                <span className="meta-item">
                                  <span className="meta-icon">🎵</span>Recording
                                  available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </PageWrap>
          )}

          {/* ── ANALYTICS ────────────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <PageWrap>
              <div className="page-header">
                <h1>Analytics</h1>
                <p className="page-subtitle">
                  Deep insights into call patterns and performance
                </p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Calls by Sentiment</h3>
                  {(() => {
                    const s = getCallsBySentiment();
                    const total = s.positive + s.neutral + s.negative;
                    return (
                      <>
                        <div className="sentiment-bar">
                          <div
                            className="sentiment-segment positive"
                            style={{
                              width: `${total ? (s.positive / total) * 100 : 0}%`,
                            }}
                          />
                          <div
                            className="sentiment-segment neutral"
                            style={{
                              width: `${total ? (s.neutral / total) * 100 : 0}%`,
                            }}
                          />
                          <div
                            className="sentiment-segment negative"
                            style={{
                              width: `${total ? (s.negative / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        {[
                          {
                            label: "😊 Positive",
                            value: s.positive,
                            pct: total
                              ? Math.round((s.positive / total) * 100)
                              : 0,
                          },
                          {
                            label: "😐 Neutral",
                            value: s.neutral,
                            pct: total
                              ? Math.round((s.neutral / total) * 100)
                              : 0,
                          },
                          {
                            label: "😞 Negative",
                            value: s.negative,
                            pct: total
                              ? Math.round((s.negative / total) * 100)
                              : 0,
                          },
                        ].map((row) => (
                          <div key={row.label} className="sentiment-stat">
                            <span className="sentiment-label">{row.label}</span>
                            <span className="sentiment-value">
                              {row.value} ({row.pct}%)
                            </span>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>

                <div className="analytics-card">
                  <h3>Call Volume by Hour</h3>
                  <div className="hour-chart">
                    {getCallsByTimeOfDay().map((count, hour) => (
                      <div key={hour} className="hour-bar">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${(count / Math.max(...getCallsByTimeOfDay(), 1)) * 100}%`,
                          }}
                        />
                        <span className="hour-label">{hour}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Performance Metrics</h3>
                  <div className="metrics-list">
                    {[
                      {
                        label: "Answer Rate",
                        value:
                          analytics.totalCalls > 0
                            ? `${Math.round((analytics.answeredCalls / analytics.totalCalls) * 100)}%`
                            : "0%",
                      },
                      {
                        label: "Avg Response Time",
                        value: `${getAverageResponseTime()}s`,
                      },
                      {
                        label: "Total Talk Time",
                        value: formatDuration(
                          callLogs.reduce((s, c) => s + c.duration, 0),
                        ),
                      },
                      {
                        label: "Unique Callers",
                        value: String(
                          new Set(callLogs.map((c) => c.phoneNumber)).size,
                        ),
                      },
                    ].map((m) => (
                      <div key={m.label} className="metric-item">
                        <span className="metric-label">{m.label}</span>
                        <span className="metric-value">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Call Duration Distribution</h3>
                  <div className="duration-chart">
                    {(() => {
                      const ranges = [
                        { label: "0–30s", min: 0, max: 30, count: 0 },
                        { label: "30s–1m", min: 30, max: 60, count: 0 },
                        { label: "1–3m", min: 60, max: 180, count: 0 },
                        { label: "3–5m", min: 180, max: 300, count: 0 },
                        { label: "5m+", min: 300, max: Infinity, count: 0 },
                      ];
                      callLogs.forEach((call) => {
                        const r = ranges.find(
                          (r) =>
                            call.duration >= r.min && call.duration < r.max,
                        );
                        if (r) r.count++;
                      });
                      const maxCount = Math.max(
                        ...ranges.map((r) => r.count),
                        1,
                      );
                      return ranges.map((range) => (
                        <div key={range.label} className="duration-bar">
                          <span className="duration-label">{range.label}</span>
                          <div className="duration-bar-container">
                            <div
                              className="duration-bar-fill"
                              style={{
                                width: `${(range.count / maxCount) * 100}%`,
                              }}
                            />
                            <span className="duration-count">
                              {range.count}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </PageWrap>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="settings">
              <PageWrap>
                <div className="page-header">
                  <h1>AI Agent Settings</h1>
                  <p className="page-subtitle">
                    Configure your AI assistant's behaviour and phone number
                  </p>
                </div>

                <div className="settings-container">
                  {/* Phone Number Configuration */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>📱 Phone Number Configuration</h2>
                    <p className="section-description">
                      View your assigned AI number and set where calls should be
                      forwarded
                    </p>

                    <div className="phone-config-grid">
                      {/* AI Number */}
                      <div className="phone-card">
                        <h3>🔢 Your AI Number</h3>
                        <p className="card-description">
                          Admin-assigned AI number — this is what customers will
                          call
                        </p>
                        {userPhoneNumber ? (
                          <div className="phone-display-card">
                            <div className="phone-status-row">
                              <span className="status-indicator active" />
                              <div className="phone-info">
                                <strong>Active AI Number</strong>
                                <p className="phone-number-large">
                                  {userPhoneNumber}
                                </p>
                              </div>
                            </div>
                            <button
                              className="copy-number-btn"
                              onClick={() =>
                                handleCopyToClipboard(userPhoneNumber, "twilio")
                              }
                            >
                              {copiedField === "twilio"
                                ? "✓ Copied!"
                                : "⎘ Copy Number"}
                            </button>
                            <p className="phone-note">
                              ✓ Customers call this number → AI answers →
                              forwards to your number
                            </p>
                          </div>
                        ) : (
                          <div className="phone-display-card inactive">
                            <div className="phone-status-row">
                              <span className="status-indicator" />
                              <div className="phone-info">
                                <strong>No AI Number Assigned Yet</strong>
                                <p>
                                  Waiting for admin to assign your AI number
                                </p>
                              </div>
                            </div>
                            <p className="phone-note">
                              ℹ️ Contact admin to get your AI number assigned
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Forwarding Number */}
                      <div className="phone-card">
                        <h3>📞 Call Forwarding Number</h3>
                        <p className="card-description">
                          Your personal number where the AI will transfer calls
                        </p>
                        {!isEditingForward ? (
                          <div className="phone-display-card">
                            {forwardToNumber ? (
                              <>
                                <div className="phone-status-row">
                                  <span className="status-indicator active" />
                                  <div className="phone-info">
                                    <strong>Forwarding To</strong>
                                    <p className="phone-number-large">
                                      {forwardToNumber}
                                    </p>
                                  </div>
                                </div>
                                <p className="phone-note">
                                  ✓ After AI handles the call, it will transfer
                                  to this number
                                </p>
                                <div className="phone-actions">
                                  <button
                                    onClick={() => {
                                      setIsEditingForward(true);
                                      setTempForwardNumber(forwardToNumber);
                                    }}
                                    className="edit-phone-btn"
                                  >
                                    ✏️ Change Number
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="phone-status-row">
                                  <span className="status-indicator" />
                                  <div className="phone-info">
                                    <strong>No Forwarding Number Set</strong>
                                    <p>
                                      Set where you want calls transferred after
                                      AI handles them
                                    </p>
                                  </div>
                                </div>
                                <div className="phone-actions">
                                  <button
                                    onClick={() => setIsEditingForward(true)}
                                    className="assign-phone-btn"
                                  >
                                    ➕ Set Forwarding Number
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="phone-edit-card">
                            <div className="form-group">
                              <label htmlFor="forwardNumber">
                                Enter Your Forwarding Number
                                <span className="label-hint">
                                  Include country code (e.g. +27821234567)
                                </span>
                              </label>
                              <input
                                id="forwardNumber"
                                type="tel"
                                placeholder="+27821234567 or +1234567890"
                                value={tempForwardNumber}
                                onChange={(e) =>
                                  setTempForwardNumber(e.target.value)
                                }
                                autoFocus
                              />
                            </div>
                            <div className="phone-actions">
                              <button
                                onClick={handleCancelForwardEdit}
                                className="cancel-btn"
                                disabled={isSaving}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveForwardingNumber}
                                className="save-phone-btn"
                                disabled={isSaving || !tempForwardNumber.trim()}
                              >
                                {isSaving ? (
                                  <>
                                    <span className="spinner-small" />
                                    Saving…
                                  </>
                                ) : (
                                  <>💾 Save Number</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* AI Status */}
                      <div className="phone-card">
                        <h3>🤖 AI Assistant Status</h3>
                        <p className="card-description">
                          Provisioning status for your AI assistant
                        </p>
                        {agentSettings.vapiAssistantId ? (
                          <div className="vapi-status-card">
                            <div className="status-row">
                              <span className="status-indicator active" />
                              <div className="status-info">
                                <strong>Active & Ready</strong>
                                <p>
                                  Your AI assistant is provisioned and ready to
                                  handle calls
                                </p>
                              </div>
                            </div>
                            <div className="status-details">
                              <div className="detail-item">
                                <span className="detail-label">
                                  Assistant ID
                                </span>
                                <span className="detail-value">
                                  {agentSettings.vapiAssistantId.substring(
                                    0,
                                    12,
                                  )}
                                  …
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <span
                                  className="detail-value"
                                  style={{ color: "var(--success)" }}
                                >
                                  ✓ Live
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="vapi-status-card inactive">
                            <div className="status-row">
                              <span className="status-indicator" />
                              <div className="status-info">
                                <strong>Not Provisioned</strong>
                                <p>
                                  Set up your AI assistant to start handling
                                  calls
                                </p>
                              </div>
                            </div>
                            {isProvisioning ? (
                              <div className="provisioning-in-progress">
                                <div className="spinner-large" />
                                <p className="provisioning-message">
                                  Setting up your AI assistant…
                                  <br />
                                  <small>
                                    This usually takes 10–20 seconds.
                                  </small>
                                </p>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={handleManualProvision}
                                  className="provision-btn"
                                  disabled={isProvisioning}
                                >
                                  🚀 Set Up AI Assistant
                                </button>
                                {provisioningError && (
                                  <div
                                    className="error-message"
                                    style={{ marginTop: "10px" }}
                                  >
                                    {provisioningError}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Test Outbound Call */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>📞 Test Outbound Call</h2>
                    <p className="section-description">
                      Test your AI agent by making an outbound call
                    </p>
                    <div className="form-group">
                      <label htmlFor="outboundNumber">
                        Phone Number to Call
                        <span className="label-hint">
                          Enter a number to test your AI agent (include country
                          code)
                        </span>
                      </label>
                      <div className="call-input-group">
                        <input
                          id="outboundNumber"
                          type="tel"
                          placeholder="+27821234567"
                          value={outboundNumber}
                          onChange={(e) => setOutboundNumber(e.target.value)}
                        />
                        <button
                          onClick={() => handleMakeCall(outboundNumber)}
                          className="call-btn"
                          disabled={
                            isCallingInProgress ||
                            !outboundNumber ||
                            !isProvisioned ||
                            !userPhoneNumber
                          }
                        >
                          {isCallingInProgress ? (
                            <>
                              <span className="spinner-small" />
                              Calling…
                            </>
                          ) : (
                            <>📞 Make Call</>
                          )}
                        </button>
                      </div>
                      {callStatus && (
                        <div
                          className={`call-status ${callStatus.includes("Failed") || callStatus.includes("Please") ? "error" : "success"}`}
                        >
                          {callStatus}
                        </div>
                      )}
                      {!userPhoneNumber && (
                        <small className="field-help warning">
                          ⚠️ Please assign a phone number above before making
                          test calls
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Basic Info + Voice in two columns */}
                  <div className="settings-grid">
                    <div className="settings-section">
                      <h2>📋 Basic Information</h2>
                      <p className="section-description">
                        Set your AI's identity and greeting
                      </p>
                      <div className="form-group">
                        <label htmlFor="agentName">
                          Agent Name
                          <span className="label-hint">
                            The name your AI will use when introducing itself
                          </span>
                        </label>
                        <input
                          id="agentName"
                          type="text"
                          value={agentSettings.agentName}
                          onChange={(e) =>
                            setAgentSettings({
                              ...agentSettings,
                              agentName: e.target.value,
                            })
                          }
                          placeholder="e.g. Gerbo Assistant"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="greetingMessage">
                          Greeting Message
                          <span className="label-hint">
                            First thing callers will hear
                          </span>
                        </label>
                        <textarea
                          id="greetingMessage"
                          rows={4}
                          value={agentSettings.greetingMessage}
                          onChange={(e) =>
                            setAgentSettings({
                              ...agentSettings,
                              greetingMessage: e.target.value,
                            })
                          }
                          placeholder="Hello! Thank you for calling. How can I help you today?"
                        />
                      </div>
                    </div>

                    <div className="settings-section">
                      <h2>🎤 Voice & Language</h2>
                      <p className="section-description">
                        Customise how your AI sounds
                      </p>
                      <div className="form-group">
                        <label htmlFor="voiceId">Voice Selection</label>
                        <select
                          id="voiceId"
                          value={agentSettings.voiceId}
                          onChange={(e) =>
                            setAgentSettings({
                              ...agentSettings,
                              voiceId: e.target.value,
                            })
                          }
                        >
                          <option value="default">
                            Friendly Woman (Default)
                          </option>
                          <option value="male-1">British Man</option>
                          <option value="male-2">Helpful Man</option>
                          <option value="female-1">Friendly Woman</option>
                          <option value="female-2">Confident Woman</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="language">Language</label>
                        <select
                          id="language"
                          value={agentSettings.language}
                          onChange={(e) =>
                            setAgentSettings({
                              ...agentSettings,
                              language: e.target.value,
                            })
                          }
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish (Spain)</option>
                          <option value="fr-FR">French</option>
                          <option value="de-DE">German</option>
                          <option value="it-IT">Italian</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AI Behaviour */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🧠 AI Behaviour & Instructions</h2>
                    <p className="section-description">
                      Define how your AI should behave and respond to callers
                    </p>
                    <div className="form-group">
                      <label htmlFor="systemInstructions">
                        System Instructions
                        <span className="label-hint">
                          Detailed instructions about how your AI should act,
                          what it knows, and how to handle different scenarios
                        </span>
                      </label>
                      <textarea
                        id="systemInstructions"
                        rows={10}
                        value={agentSettings.systemInstructions}
                        onChange={(e) =>
                          setAgentSettings({
                            ...agentSettings,
                            systemInstructions: e.target.value,
                          })
                        }
                        placeholder="You are a helpful AI assistant for [Company Name]…"
                      />
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🕐 Business Hours</h2>
                    <p className="section-description">
                      Define when your AI actively answers calls. Outside these
                      hours it will route to voicemail.
                    </p>
                    <div className="settings-grid">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day) => (
                        <div
                          className="form-group"
                          key={day}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <label style={{ minWidth: "100px", marginBottom: 0 }}>
                            <input
                              type="checkbox"
                              defaultChecked={
                                !["Saturday", "Sunday"].includes(day)
                              }
                              style={{ marginRight: "0.5rem" }}
                            />
                            {day}
                          </label>
                          <input
                            type="time"
                            defaultValue="08:00"
                            style={{ flex: 1 }}
                          />
                          <span
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "12px",
                            }}
                          >
                            to
                          </span>
                          <input
                            type="time"
                            defaultValue="17:00"
                            style={{ flex: 1 }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="form-group" style={{ marginTop: "12px" }}>
                      <label htmlFor="timezone">
                        Timezone
                        <span className="label-hint">
                          All hours are applied in this timezone
                        </span>
                      </label>
                      <select id="timezone">
                        <option value="Africa/Johannesburg">
                          Africa/Johannesburg (SAST)
                        </option>
                        <option value="Europe/London">
                          Europe/London (GMT/BST)
                        </option>
                        <option value="America/New_York">
                          America/New_York (EST)
                        </option>
                        <option value="America/Los_Angeles">
                          America/Los_Angeles (PST)
                        </option>
                        <option value="Australia/Sydney">
                          Australia/Sydney (AEST)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Escalation Rules */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🚨 Escalation & Transfer Rules</h2>
                    <p className="section-description">
                      Define trigger phrases that cause your AI to transfer the
                      call to a human agent.
                    </p>
                    <div className="form-group">
                      <label htmlFor="escalationKeywords">
                        Escalation Keywords
                        <span className="label-hint">
                          Comma-separated — e.g. "speak to a person, urgent,
                          cancel, legal"
                        </span>
                      </label>
                      <textarea
                        id="escalationKeywords"
                        rows={3}
                        placeholder="speak to a person, urgent, manager, cancel, refund, legal"
                      />
                    </div>
                    <div className="settings-grid">
                      <div className="form-group">
                        <label htmlFor="maxTransferAttempts">
                          Max Transfer Attempts
                          <span className="label-hint">
                            How many times to retry if transfer fails
                          </span>
                        </label>
                        <select id="maxTransferAttempts">
                          <option value="1">1 attempt</option>
                          <option value="2">2 attempts</option>
                          <option value="3">3 attempts</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="fallbackBehaviour">
                          Fallback if Transfer Fails
                          <span className="label-hint">
                            What the AI should do if it can't reach a human
                          </span>
                        </label>
                        <select id="fallbackBehaviour">
                          <option value="voicemail">Send to Voicemail</option>
                          <option value="sms">Send Callback SMS</option>
                          <option value="message">Play Custom Message</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Call Recording */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🔴 Call Recording & Compliance</h2>
                    <p className="section-description">
                      Manage recording preferences and legal disclosure
                      requirements.
                    </p>
                    <div className="settings-grid">
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            style={{ width: "16px", height: "16px" }}
                          />
                          <span>
                            Enable Call Recording{" "}
                            <span
                              className="label-hint"
                              style={{ display: "block" }}
                            >
                              All calls will be recorded and stored
                            </span>
                          </span>
                        </label>
                      </div>
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            style={{ width: "16px", height: "16px" }}
                          />
                          <span>
                            Play Recording Disclosure{" "}
                            <span
                              className="label-hint"
                              style={{ display: "block" }}
                            >
                              Notify callers they are being recorded
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="disclosureMessage">
                        Recording Disclosure Message
                        <span className="label-hint">
                          Played at the start of every call
                        </span>
                      </label>
                      <textarea
                        id="disclosureMessage"
                        rows={3}
                        placeholder="This call may be recorded for quality and training purposes."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dataRetention">
                        Data Retention Period
                        <span className="label-hint">
                          How long call recordings and transcripts are stored
                        </span>
                      </label>
                      <select id="dataRetention">
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="0">Keep indefinitely</option>
                      </select>
                    </div>
                  </div>

                  {/* Voicemail */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>📬 Voicemail Settings</h2>
                    <p className="section-description">
                      Configure what happens when your AI can't answer or
                      outside business hours.
                    </p>
                    <div className="form-group">
                      <label htmlFor="voicemailGreeting">
                        Voicemail Greeting
                        <span className="label-hint">
                          Played when the AI routes a caller to voicemail
                        </span>
                      </label>
                      <textarea
                        id="voicemailGreeting"
                        rows={4}
                        placeholder="Sorry we missed your call. Please leave your name, number and a brief message and we'll get back to you as soon as possible."
                      />
                    </div>
                    <div className="settings-grid">
                      <div className="form-group">
                        <label htmlFor="voicemailEmail">
                          Voicemail Delivery Email
                          <span className="label-hint">
                            Receive voicemail transcripts here
                          </span>
                        </label>
                        <input
                          id="voicemailEmail"
                          type="email"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="maxVoicemailDuration">
                          Max Voicemail Duration
                          <span className="label-hint">
                            Cut off recording after this time
                          </span>
                        </label>
                        <select id="maxVoicemailDuration">
                          <option value="60">1 minute</option>
                          <option value="120">2 minutes</option>
                          <option value="180">3 minutes</option>
                          <option value="300">5 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SMS Auto-Reply */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>💬 SMS Auto-Reply</h2>
                    <p className="section-description">
                      Automatically send an SMS to callers who are missed or
                      routed to voicemail.
                    </p>
                    <div className="form-group">
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ width: "16px", height: "16px" }}
                        />
                        <span>
                          Enable SMS Auto-Reply for Missed Calls{" "}
                          <span
                            className="label-hint"
                            style={{ display: "block" }}
                          >
                            Sends a text immediately after a missed call
                          </span>
                        </span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="smsTemplate">
                        SMS Message Template
                        <span className="label-hint">
                          Use {"{caller_name}"} and {"{business_name}"} as
                          dynamic placeholders
                        </span>
                      </label>
                      <textarea
                        id="smsTemplate"
                        rows={3}
                        placeholder="Hi! We missed your call at {business_name}. We'll get back to you shortly."
                      />
                    </div>
                  </div>

                  {/* FAQ */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>📚 FAQ Knowledge Base</h2>
                    <p className="section-description">
                      Add question & answer pairs your AI should know when
                      callers ask common questions.
                    </p>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="settings-grid"
                        style={{
                          marginBottom: "12px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div className="form-group">
                          <label>
                            Question {i + 1}{" "}
                            <span className="label-hint">
                              e.g. What are your opening hours?
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder={`FAQ Question ${i + 1}`}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            Answer {i + 1}{" "}
                            <span className="label-hint">
                              The exact response your AI will give
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder={`Answer to FAQ ${i + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      className="assign-phone-btn"
                      style={{ marginTop: "6px" }}
                    >
                      ➕ Add Another FAQ
                    </button>
                  </div>

                  {/* Notifications */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🔔 Notifications & Alerts</h2>
                    <p className="section-description">
                      Choose how and when you receive updates about your AI's
                      activity.
                    </p>
                    <div className="settings-grid">
                      {[
                        {
                          id: "notifyMissedCall",
                          label: "Missed Call Alert",
                          hint: "Email when a call goes unanswered",
                        },
                        {
                          id: "notifyCallSummary",
                          label: "Post-Call Summary Email",
                          hint: "AI-generated summary after every call",
                        },
                        {
                          id: "notifyWeeklyReport",
                          label: "Weekly Performance Report",
                          hint: "Digest of call volume and outcomes",
                        },
                        {
                          id: "notifyEscalation",
                          label: "Escalation Alert",
                          hint: "Notify when AI transfers to a human",
                        },
                      ].map(({ id, label, hint }) => (
                        <div className="form-group" key={id}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              style={{ width: "16px", height: "16px" }}
                            />
                            <span>
                              {label}{" "}
                              <span
                                className="label-hint"
                                style={{ display: "block" }}
                              >
                                {hint}
                              </span>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="form-group" style={{ marginTop: "12px" }}>
                      <label htmlFor="notificationEmail">
                        Notification Email Address
                        <span className="label-hint">
                          All alerts will be sent here
                        </span>
                      </label>
                      <input
                        id="notificationEmail"
                        type="email"
                        placeholder="alerts@yourbusiness.com"
                      />
                    </div>
                  </div>

                  {/* Blocked Numbers */}
                  <div
                    className="settings-section"
                    style={{ marginBottom: "16px" }}
                  >
                    <h2>🚫 Blocked Numbers</h2>
                    <p className="section-description">
                      Prevent specific numbers from reaching your AI. Blocked
                      callers hear a disconnected tone.
                    </p>
                    <div className="form-group">
                      <label htmlFor="blockedNumbers">
                        Blocked Numbers
                        <span className="label-hint">
                          One number per line, include country code
                        </span>
                      </label>
                      <textarea
                        id="blockedNumbers"
                        rows={5}
                        placeholder={"+27000000000\n+27000000001"}
                      />
                    </div>
                  </div>
                </div>
              </PageWrap>

              {/* Sticky save bar */}
              <div className="settings-actions">
                <div>
                  {saveMessage && (
                    <div
                      className={`save-message ${saveMessage.includes("Error") || saveMessage.includes("failed") || saveMessage.includes("❌") ? "error" : "success"}`}
                    >
                      {saveMessage}
                    </div>
                  )}
                  {!isProvisioned && !saveMessage && (
                    <div className="save-message warning">
                      ⚠️ Provision your AI Assistant first to enable settings
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="save-btn"
                  disabled={isSaving || !isProvisioned}
                  title={
                    !isProvisioned
                      ? "Provision AI Assistant first"
                      : "Save all AI settings"
                  }
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-small" />
                      Saving…
                    </>
                  ) : (
                    <>💾 Save Settings</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Placeholder tabs */}
          {activeTab === "billing" && (
            <BillingPage
              userId={user!.uid}
              userEmail={user!.email!}
              getIdToken={() => getIdToken()}
            />
          )}
          {activeTab === "call-flows" && <CallFlowsPage />} 
        {activeTab === "team" && currentUser && <TeamPage user={currentUser} />}
{activeTab === "transcripts" && currentUser && <TranscriptsPage user={currentUser} />}
{activeTab === "voicemails" && currentUser && <VoicemailsPage user={currentUser} />}
          {activeTab === "knowledge" && <KnowledgePage />}
          {(activeTab === "voicemails" ||
            activeTab === "transcripts" ||
            activeTab === "knowledge" ||
            activeTab === "prompts") }
        </main>
      </div>

      {/* Call Details Modal */}
      {showCallDetails && selectedCall && (
        <div
          className="modal-overlay"
          onClick={() => setShowCallDetails(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Call Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowCallDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {[
                { label: "Phone Number", value: selectedCall.phoneNumber },
                {
                  label: "Direction",
                  value:
                    selectedCall.direction === "inbound"
                      ? "📥 Inbound"
                      : "📤 Outbound",
                },
                {
                  label: "Sentiment",
                  value: `${getSentimentIcon(selectedCall.sentiment)} ${selectedCall.sentiment}`,
                },
                {
                  label: "Duration",
                  value: formatDuration(selectedCall.duration),
                },
                {
                  label: "Date & Time",
                  value: formatDate(selectedCall.timestamp),
                },
              ].map(({ label, value }) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value}</span>
                </div>
              ))}
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge ${selectedCall.status}`}>
                  {selectedCall.status}
                </span>
              </div>
              {selectedCall.summary && (
                <div className="detail-row full">
                  <span className="detail-label">Summary</span>
                  <p className="detail-value">{selectedCall.summary}</p>
                </div>
              )}
              {callNotes[selectedCall.id] && (
                <div className="detail-row full">
                  <span className="detail-label">Notes</span>
                  <p className="detail-value">{callNotes[selectedCall.id]}</p>
                </div>
              )}
              {selectedCall.recording && (
                <div className="detail-row full">
                  <span className="detail-label">Recording</span>
                  <audio
                    controls
                    src={selectedCall.recording}
                    className="audio-player"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
