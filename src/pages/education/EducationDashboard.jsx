import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getFunctions, httpsCallable } from "firebase/functions";
import EducationSidebar from "./EducationSidebar";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import StudentsListModal from "./StudentsListModal";
import SignatureStamp from "../SignatureStamp";
import SchoolOverview from "./SchoolOverview";
import {
  useNotices,
  useHomework,
  useAttendance,
  useEvents,
  useStaff,
  useFees,
  useTimetable,
  seedMockData,
} from "./firebaseEducation";
import {
  NoticeModal,
  HomeworkModal,
  AttendanceModal,
  EventModal,
  StaffModal,
  StudentModal,
  TimetableModal,
} from "./Educationmodals";
import {
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Award,
  BarChart3,
  Menu,
  Plus,
  Send,
  Save,
  X,
  Edit,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  UserCheck,
  Eye,
  GraduationCap,
  Bell,
  DollarSign,
  Clock,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  Star,
  Activity,
  Coffee,
  Sun,
  Sunset,
  BookMarked,
  Megaphone,
  CreditCard,
  School,
  Baby,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Hash,
  Smile,
  ChevronUp,
  ArrowRight,
  Check,
  Trash2,
  PenLine,
  Image,
  Paperclip,
  RefreshCw,
  Target,
  Zap,
  Heart,
  Shield,
  Music,
  Palette,
  Calculator,
  Globe,
  FlaskConical,
  Dumbbell,
  TreePine,
  Blocks,
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Amara Dlamini",
    grade: "Grade 2",
    age: 7,
    parent: "Nomvula Dlamini",
    phone: "071 234 5678",
    email: "nomvula@email.com",
    fees: { paid: 1200, total: 1500, status: "partial" },
    photo: null,
  },
  {
    id: 2,
    name: "Liam van der Berg",
    grade: "Pre-School A",
    age: 4,
    parent: "Johan van der Berg",
    phone: "082 345 6789",
    email: "johan@email.com",
    fees: { paid: 1500, total: 1500, status: "paid" },
    photo: null,
  },
  {
    id: 3,
    name: "Zoe Mokoena",
    grade: "Grade 1",
    age: 6,
    parent: "Thabo Mokoena",
    phone: "073 456 7890",
    email: "thabo@email.com",
    fees: { paid: 0, total: 1500, status: "unpaid" },
    photo: null,
  },
  {
    id: 4,
    name: "Ethan Patel",
    grade: "Grade 3",
    age: 8,
    parent: "Priya Patel",
    phone: "084 567 8901",
    email: "priya@email.com",
    fees: { paid: 1500, total: 1500, status: "paid" },
    photo: null,
  },
  {
    id: 5,
    name: "Aisha Hendricks",
    grade: "Pre-School B",
    age: 3,
    parent: "Fatima Hendricks",
    phone: "061 678 9012",
    email: "fatima@email.com",
    fees: { paid: 800, total: 1200, status: "partial" },
    photo: null,
  },
  {
    id: 6,
    name: "Noah Sithole",
    grade: "Grade 2",
    age: 7,
    parent: "Bongani Sithole",
    phone: "079 789 0123",
    email: "bongani@email.com",
    fees: { paid: 1500, total: 1500, status: "paid" },
    photo: null,
  },
  {
    id: 7,
    name: "Mia Botha",
    grade: "Grade 1",
    age: 6,
    parent: "Anri Botha",
    phone: "082 890 1234",
    email: "anri@email.com",
    fees: { paid: 0, total: 1500, status: "unpaid" },
    photo: null,
  },
  {
    id: 8,
    name: "Jayden Nkosi",
    grade: "Grade 3",
    age: 9,
    parent: "Zanele Nkosi",
    phone: "071 901 2345",
    email: "zanele@email.com",
    fees: { paid: 1500, total: 1500, status: "paid" },
    photo: null,
  },
];

const MOCK_STAFF = [
  {
    id: 1,
    name: "Mrs. Sarah Johnson",
    role: "Grade 1 Teacher",
    subject: "Foundation Phase",
    phone: "082 111 2222",
    email: "sarah@school.com",
    status: "present",
    classes: ["Grade 1A", "Grade 1B"],
  },
  {
    id: 2,
    name: "Mr. David Nkosi",
    role: "Grade 2 Teacher",
    subject: "Foundation Phase",
    phone: "073 222 3333",
    email: "david@school.com",
    status: "present",
    classes: ["Grade 2A"],
  },
  {
    id: 3,
    name: "Ms. Thandi Mthembu",
    role: "Pre-School Teacher",
    subject: "ECD",
    phone: "061 333 4444",
    email: "thandi@school.com",
    status: "present",
    classes: ["Pre-School A", "Pre-School B"],
  },
  {
    id: 4,
    name: "Mrs. Karen Olivier",
    role: "Grade 3 Teacher",
    subject: "Intermediate Phase",
    phone: "084 444 5555",
    email: "karen@school.com",
    status: "present",
    classes: ["Grade 3A"],
  },
  {
    id: 5,
    name: "Mr. James Petersen",
    role: "Sports & PE",
    subject: "Physical Education",
    phone: "071 555 6666",
    email: "james@school.com",
    status: "present",
    classes: ["All Grades"],
  },
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Sports Day",
    date: "2026-03-15",
    time: "08:00",
    type: "event",
    color: "emerald",
    description: "Annual inter-house sports competition",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    date: "2026-03-20",
    time: "14:00",
    type: "meeting",
    color: "blue",
    description: "Term 1 progress discussion",
  },
  {
    id: 3,
    title: "Easter Concert",
    date: "2026-03-27",
    time: "10:00",
    type: "concert",
    color: "purple",
    description: "Pre-school and Grade 1 performance",
  },
  {
    id: 4,
    title: "Fee Payment Deadline",
    date: "2026-03-07",
    time: "17:00",
    type: "deadline",
    color: "red",
    description: "Term 1 fee payment due",
  },
  {
    id: 5,
    title: "Science Fair",
    date: "2026-03-25",
    time: "09:00",
    type: "event",
    color: "amber",
    description: "Grade 2-3 science project exhibition",
  },
  {
    id: 6,
    title: "Staff Meeting",
    date: "2026-03-10",
    time: "13:30",
    type: "meeting",
    color: "slate",
    description: "Monthly staff briefing",
  },
];

const MOCK_TIMETABLE = {
  "Pre-School A": {
    Monday: [
      "Circle Time",
      "Phonics",
      "Snack",
      "Art & Craft",
      "Free Play",
      "Story Time",
    ],
    Tuesday: [
      "Circle Time",
      "Numbers",
      "Snack",
      "Music",
      "Free Play",
      "Story Time",
    ],
    Wednesday: [
      "Circle Time",
      "Phonics",
      "Snack",
      "PE/Movement",
      "Free Play",
      "Story Time",
    ],
    Thursday: [
      "Circle Time",
      "Numbers",
      "Snack",
      "Art & Craft",
      "Free Play",
      "Story Time",
    ],
    Friday: [
      "Circle Time",
      "Show & Tell",
      "Snack",
      "Music",
      "Free Play",
      "Goodbye Circle",
    ],
  },
  "Grade 1": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: ["Maths", "English", "Break", "Natural Science", "Art", "Phonics"],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Life Skills",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: ["English", "Maths", "Break", "Music", "Show & Tell", "Pack Up"],
  },
  "Grade 2": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: [
      "Maths",
      "English",
      "Break",
      "Natural Science",
      "Art",
      "Social Studies",
    ],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Social Studies",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: [
      "English",
      "Maths",
      "Break",
      "Music",
      "Creative Writing",
      "Pack Up",
    ],
  },
  "Grade 3": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: [
      "Maths",
      "English",
      "Break",
      "Natural Science",
      "Technology",
      "Social Studies",
    ],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Social Studies",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: [
      "English",
      "Maths",
      "Break",
      "Music",
      "Creative Project",
      "Pack Up",
    ],
  },
};

const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CLASSES = ["Pre-School A", "Grade 1", "Grade 2", "Grade 3"];

const MOCK_HOMEWORK = [
  {
    id: 1,
    subject: "Maths",
    grade: "Grade 2",
    title: "Addition worksheet pg 14",
    dueDate: "2026-03-07",
    assignedBy: "Mr. Nkosi",
    priority: "medium",
  },
  {
    id: 2,
    subject: "English",
    grade: "Grade 1",
    title: "Read pages 10-12 of reader",
    dueDate: "2026-03-07",
    assignedBy: "Mrs. Johnson",
    priority: "low",
  },
  {
    id: 3,
    subject: "Natural Science",
    grade: "Grade 3",
    title: "Draw the life cycle of a frog",
    dueDate: "2026-03-10",
    assignedBy: "Mrs. Olivier",
    priority: "high",
  },
  {
    id: 4,
    subject: "Afrikaans",
    grade: "Grade 2",
    title: "Learn 10 vocabulary words",
    dueDate: "2026-03-08",
    assignedBy: "Mr. Nkosi",
    priority: "medium",
  },
  {
    id: 5,
    subject: "Art",
    grade: "Pre-School A",
    title: "Bring a photo of your family",
    dueDate: "2026-03-09",
    assignedBy: "Ms. Mthembu",
    priority: "low",
  },
];

const MOCK_NOTICES = [
  {
    id: 1,
    title: "School closed on Friday 21 March",
    type: "important",
    date: "2026-03-06",
    recipient: "All Parents",
    message:
      "Please note that school will be closed on Human Rights Day, Friday 21 March 2026.",
    read: false,
  },
  {
    id: 2,
    title: "Sports Day permission slip",
    type: "action",
    date: "2026-03-05",
    recipient: "All Parents",
    message:
      "Please return the attached permission slip and R50 participation fee by Wednesday 12 March.",
    read: false,
  },
  {
    id: 3,
    title: "Reminder: Fee payment due",
    type: "fee",
    date: "2026-03-04",
    recipient: "Selected Parents",
    message:
      "This is a friendly reminder that Term 1 school fees are due by 7 March 2026.",
    read: true,
  },
  {
    id: 4,
    title: "New aftercare schedule",
    type: "info",
    date: "2026-03-03",
    recipient: "Aftercare Families",
    message:
      "Aftercare will now run until 17:30 from next Monday. Please update your collection times accordingly.",
    read: true,
  },
];

const SUBJECT_ICONS = {
  Maths: Calculator,
  English: BookOpen,
  Afrikaans: Globe,
  Art: Palette,
  Music: Music,
  PE: Dumbbell,
  "Natural Science": FlaskConical,
  "PE/Movement": Dumbbell,
  Phonics: BookMarked,
  Numbers: Calculator,
  "Circle Time": Smile,
  "Story Time": BookOpen,
  "Life Skills": Heart,
  "Social Studies": Globe,
  Technology: Zap,
  "Free Play": Blocks,
  Library: BookMarked,
  "Show & Tell": Megaphone,
  Reading: BookOpen,
  Snack: Coffee,
  "Art & Craft": Palette,
  "Creative Writing": PenLine,
  "Creative Project": Star,
  Break: Coffee,
  "Pack Up": CheckSquare,
  "Goodbye Circle": Heart,
  "Foundation Phase": School,
};

const gradeColor = (grade) => {
  const map = {
    "Pre-School A": "rose",
    "Pre-School B": "pink",
    "Grade 1": "violet",
    "Grade 2": "blue",
    "Grade 3": "emerald",
  };
  return map[grade] || "slate";
};
const generateReportCardNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const term = Math.ceil((new Date().getMonth() + 1) / 3);

  const reportsRef = collection(db, "users", userId, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 0;

  if (!snapshot.empty) {
    const lastReport = snapshot.docs[0].data();
    const match = lastReport.reportNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `RC-${year}-T${term}-${String(nextNumber).padStart(4, "0")}`;
};
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EducationDashboard = () => {
  const { user, authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [documentType, setDocumentType] = useState("reports");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Grade 1");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const todayISO = new Date().toISOString().split("T")[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    recipient: "All Parents",
    type: "info",
  });
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const { notices, setNotices, saveNotice, markNoticeRead, deleteNotice } =
    useNotices(user?.uid);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const { homework, setHomework, saveHomework, deleteHomework } = useHomework(
    user?.uid,
  );
  const [newHomework, setNewHomework] = useState({
    subject: "",
    grade: "Grade 1",
    title: "",
    dueDate: "",
    priority: "medium",
  });
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const { attendance, setAttendance, saveAttendance, saveAllAttendance } =
    useAttendance(user?.uid, todayISO);
  const [feeFilter, setFeeFilter] = useState("all");
  const today = new Date();
  const dayName = today.toLocaleDateString("en-ZA", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const { updateFees } = useFees(user?.uid);
  const { timetable, saveTimetable } = useTimetable(user?.uid);
  const { events, saveEvent, deleteEvent } = useEvents(user?.uid);
  const { staff, updateStaff, saveStaff, deleteStaff } = useStaff(user?.uid);
  const handleSendNotice = () => saveNotice(noticeForm);
  const handleMarkRead = (id) => markNoticeRead(id);
  const handleDeleteNotice = (id) => deleteNotice(id);
  const [showReportCard, setShowReportCard] = useState(false);
  const [students, setStudents] = useState([]);
  const [reportId, setReportId] = useState(null);
  const [reportNumber, setReportNumber] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [studentName, setStudentName] = useState("John Smith");
  const [studentId, setStudentId] = useState("STU-2026-001");
  const [gradeLevel, setGradeLevel] = useState("Grade 3");
  const [dateOfBirth, setDateOfBirth] = useState("2015-03-15");
  const [parentName, setParentName] = useState("Mary Smith");
  const [parentEmail, setParentEmail] = useState("mary.smith@email.com");
  const [parentPhone, setParentPhone] = useState("082 123 4567");
  const [parentAddress, setParentAddress] = useState(
    "123 Main Street, Johannesburg, 2001",
  );
  const handleAddHomework = () => saveHomework(newHomework);
  const handleDeleteHomework = (id) => deleteHomework(id);
  const [term, setTerm] = useState("Term 1");
  const [academicYear, setAcademicYear] = useState("2026");
  const [teacherComments, setTeacherComments] = useState(
    "John is a hardworking student.",
  );
  const [attendanceDays, setAttendanceDays] = useState("65");
  const [attendancePresent, setAttendancePresent] = useState("63");
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    mark: "",
    comments: "",
  });
  const [inputMode, setInputMode] = useState("manual");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentsListModal, setShowStudentsListModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [savedStudents, setSavedStudents] = useState([]);
  useEffect(() => {
    const seedIfNew = async () => {
      if (!user?.uid) return;

      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      const data = snap.data();

      // Only seed if this is an education user who hasn't been seeded yet
      if (data?.dashboardType === "education" && !data?.seeded) {
        await seedMockData(
          user.uid,
          MOCK_STUDENTS,
          MOCK_STAFF,
          MOCK_EVENTS,
          MOCK_HOMEWORK,
          MOCK_NOTICES,
          MOCK_TIMETABLE,
        );

        // Mark as seeded so it never runs again
        await setDoc(userDocRef, { seeded: true }, { merge: true });
      }
    };

    seedIfNew();
  }, [user?.uid]);
  useEffect(() => {
    const init = {};
    MOCK_STUDENTS.forEach((s) => {
      init[s.id] = "present";
    });
    setAttendance(init);
  }, []);
  useEffect(() => {
    const loadSchoolInfo = async () => {
      if (!user?.uid) return;

      // Load businessInfo (name, phone, address, logo etc.)
      const bizSnap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );

      // Load portalSlug from the user doc root
      const userSnap = await getDoc(doc(db, "users", user.uid));

      setBusinessInfo({
        // from businessInfo
        ...bizSnap.data(),

        // readable name fields
        name: bizSnap.data()?.businessName || "",
        tagline: bizSnap.data()?.tagline || "Learning Centre",
        logoUrl: bizSnap.data()?.logoUrl || "",

        // portalSlug lives on the user doc root, not businessInfo
        portalSlug: userSnap.data()?.portalSlug || null,
      });
    };

    loadSchoolInfo();
  }, [user?.uid]);
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);
  useEffect(() => {
    const seedIfNew = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists() || !snap.data()?.seeded) {
        await seedMockData(
          user.uid,
          MOCK_STUDENTS,
          MOCK_STAFF,
          MOCK_EVENTS,
          MOCK_HOMEWORK,
          MOCK_NOTICES,
          MOCK_TIMETABLE,
        );
        await setDoc(userDocRef, { seeded: true }, { merge: true });
      }
    };
    seedIfNew();
  }, [user?.uid]);
  const presentCount = Object.values(attendance).filter(
    (v) => v === "present",
  ).length;
  const absentCount = Object.values(attendance).filter(
    (v) => v === "absent",
  ).length;
  const lateCount = Object.values(attendance).filter(
    (v) => v === "late",
  ).length;
  const totalFees = MOCK_STUDENTS.reduce((s, st) => s + st.fees.total, 0);
  const collectedFees = MOCK_STUDENTS.reduce((s, st) => s + st.fees.paid, 0);
  const unreadNotices = notices.filter((n) => !n.read).length;
  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setShowStudentModal(true);
  };
  const loadSavedReports = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const reportsRef = collection(db, "users", user.uid, "reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedReports(reports);
  };
  const handleAttendanceToggle = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    saveAttendance(studentId, status);
  };
  const Z = {
  pageBg:      "#F5F6FA",
  surface:     "#FFFFFF",
  surfaceAlt:  "#F0F3F9",
  hover:       "#EBF0FB",
  blue:        "#0D6EFD",
  blueLight:   "#E8F0FE",
  orange:      "#E8601C",
  orangeL:     "#FEF0EA",
  ink:         "#1A2133",
  textMid:     "#4A5568",
  textSoft:    "#8A97A8",
  label:       "#6B7A8D",
  border:      "#DDE3ED",
  divider:     "#E8ECF4",
  green:       "#0F7B3F",
  greenL:      "#EBF8F1",
  red:         "#C0392B",
  redL:        "#FDEEEC",
  amber:       "#975A00",
  amberL:      "#FEF6E4",
  radius:      4,
  radiusMd:    6,
  inputH:      32,
};
 
// ── Shared style objects ──────────────────────────────────────────────────────
const inputCls =
  "w-full h-8 px-2.5 text-[13px] text-[#1A2133] bg-white border border-[#DDE3ED] rounded focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] focus:border-[#0D6EFD]";
 
const labelCls =
  "block text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wide mb-1";
 
const sectionCls =
  "bg-white border border-[#DDE3ED] rounded-md overflow-hidden mb-2";
 
const sectionHeaderCls =
  "flex items-center justify-between px-3.5 py-2 bg-[#F0F3F9] border-b border-[#DDE3ED]";
 
const sectionTitleCls =
  "flex items-center gap-1.5 text-[11px] font-bold text-[#1A2133] uppercase tracking-wide";
 
const sectionBodyCls = "px-3.5 py-3";
 
// ── Tiny shared primitives ────────────────────────────────────────────────────
function SectionIcon({ d, color = Z.blue }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] flex-shrink-0"
      style={{ background: color + "22", color }}
    >
      <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      </svg>
    </span>
  );
}
 
function ZField({ label, children, span2 }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
  const handleAddEvent = (eventData) => saveEvent(eventData);
  const handleDeleteEvent = (id) => deleteEvent(id);
  const handleStaffStatusToggle = (id, status) => updateStaff(id, { status });
  const handleFeeUpdate = (studentId, feesData) =>
    updateFees(studentId, feesData);
  const handleSaveRegister = () => saveAllAttendance(attendance);
  const handleSaveReport = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = reportNumber;

    if (!reportId) {
      numberToUse = await generateReportCardNumber(user.uid);
      setReportNumber(numberToUse);
    }

    const reportData = buildReportPayload(numberToUse);

    if (reportId) {
      await updateDoc(doc(db, "users", user.uid, "reports", reportId), {
        ...reportData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "reports"),
        reportData,
      );
      setReportId(ref.id);
    }

    alert("Report card saved successfully");
    loadSavedReports();
  };

  const handleNewReport = () => {
    setReportId(null);
    setReportNumber("");
    setStudentName("John Smith");
    setStudentId("STU-2026-001");
    setGradeLevel("Grade 3");
    setDateOfBirth("2015-03-15");
    setParentName("Mary Smith");
    setParentEmail("mary.smith@email.com");
    setParentPhone("082 123 4567");
    setParentAddress("123 Main Street, Johannesburg, 2001");
    setTerm("Term 1");
    setAcademicYear("2026");
    setSubjects([]);
    setTeacherComments("Student shows great enthusiasm for learning.");
    setAttendanceDays("65");
    setAttendancePresent("63");

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextReport = await generateReportCardNumber(user.uid);
        setReportNumber(nextReport);
      }
    };
    loadNewNumber();
  };
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SUNSHINE PRIMARY SCHOOL",
    addressLine1: "45 EDUCATION AVENUE",
    addressLine2: "SANDTON",
    city: "JOHANNESBURG",
    postalCode: "2196",
    primaryPhone: "011 234 5678",
    secondaryPhone: "082 345 6789",
    logoUrl: "",
    principalName: "Mrs. Zoey Mor",
  });
  const [loading, setLoading] = useState(true);
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };
  const buildReportPayload = (numberToUse) => ({
    reportNumber: numberToUse,
    locked: true,
    status: "completed",

    academicInfo: {
      term: term,
      year: academicYear,
      issueDate: new Date().toISOString(),
    },

    student: {
      name: studentName,
      studentId: studentId,
      gradeLevel: gradeLevel,
      dateOfBirth: dateOfBirth,
    },

    parent: {
      name: parentName,
      email: parentEmail,
      phone: parentPhone,
      address: parentAddress,
    },

    subjects,

    performance: {
      average: calculateAverage(),
      totalSubjects: subjects.length,
    },

    attendance: {
      days: Number(attendanceDays),
      present: Number(attendancePresent),
      percentage: (
        (Number(attendancePresent) / Number(attendanceDays)) *
        100
      ).toFixed(1),
    },

    teacherComments,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const handleStudentSaved = () => {
    loadStudents();
  };
  const handleSavePDF = async () => {
    const savedReport = await loadReportForExport();

    if (!savedReport) {
      alert("Please save the report card before exporting PDF");
      return;
    }

    setReportNumber(savedReport.reportNumber);
    setSubjects(savedReport.subjects);
    setStudentName(savedReport.student.name);
    setGradeLevel(savedReport.student.gradeLevel);

    setTimeout(() => {
      window.print();
    }, 300);
  };
  const handlePrint = () => {
    // Add print styles to document
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);

    // Trigger print
    window.print();

    // Clean up (remove after print dialog closes)
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 1000);
  };
  const printStyles = `
  @media print {
    /* Hide everything except the print area */
    body * {
      visibility: hidden !important;
    }
    
    #print-area,
    #print-area * {
      visibility: visible !important;
    }
    
    /* Force print area to display even if hidden */
    #print-area {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 10mm !important;
      box-sizing: border-box !important;
      background: white !important;
      box-shadow: none !important;
    }
    
    /* Reset page margins and size */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      background: white !important;
    }
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Logo sizing */
    .logo img {
      height: 60px;
      width: auto;
    }
    
    /* Remove any borders or shadows */
    .shadow-lg, .rounded-lg, .shadow-xl, .shadow-2xl {
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Prevent page breaks inside elements */
    table, tr, td, th, div {
      page-break-inside: avoid !important;
    }
    
    /* Ensure tables print correctly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
  }
`;
  const handleAddSubject = () => {
    if (!newSubject.name) return;

    const subject = {
      name: newSubject.name,
      mark: Number(newSubject.mark) || 0,
      grade: calculateGrade(Number(newSubject.mark) || 0),
      comments: newSubject.comments || "",
    };

    setSubjects((prev) => [...prev, subject]);
    setNewSubject({ name: "", mark: "", comments: "" });
  };
  const saveStudent = async (studentData) => {
    if (!user?.uid) return;

    if (selectedStudent?.id) {
      // Editing existing student
      await updateDoc(
        doc(db, "users", user.uid, "students", selectedStudent.id),
        { ...studentData, updatedAt: serverTimestamp() },
      );
    } else {
      // Creating new student
      await addDoc(collection(db, "users", user.uid, "students"), {
        ...studentData,
        createdAt: serverTimestamp(),
      });
    }

    loadStudents();
  };
  const calculateGrade = (mark) => {
    if (mark >= 80) return "A";
    if (mark >= 70) return "B";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";
    return "E";
  };
  const loadReport = (report) => {
    setReportId(report.id);
    setReportNumber(report.reportNumber || "");
    setStudentName(report.student?.name || "");
    setStudentId(report.student?.studentId || "");
    setGradeLevel(report.student?.gradeLevel || "");
    setDateOfBirth(report.student?.dateOfBirth || "");
    setParentName(report.parent?.name || "");
    setParentEmail(report.parent?.email || "");
    setParentPhone(report.parent?.phone || "");
    setParentAddress(report.parent?.address || "");
    setTerm(report.academicInfo?.term || "");
    setAcademicYear(report.academicInfo?.year || "");
    setSubjects(report.subjects || []);
    setTeacherComments(report.teacherComments || "");
    setAttendanceDays(report.attendance?.days || "");
    setAttendancePresent(report.attendance?.present || "");
    setShowReportsList(false);
  };
  const handleAIDataExtracted = (extractedData) => {
    // Student info
    if (extractedData.student.name) setStudentName(extractedData.student.name);
    if (extractedData.student.studentId)
      setStudentId(extractedData.student.studentId);
    if (extractedData.student.gradeLevel)
      setGradeLevel(extractedData.student.gradeLevel);
    if (extractedData.student.dateOfBirth)
      setDateOfBirth(extractedData.student.dateOfBirth);

    // Parent/Guardian info
    if (extractedData.parent) {
      if (extractedData.parent.name) setParentName(extractedData.parent.name);
      if (extractedData.parent.email)
        setParentEmail(extractedData.parent.email);
      if (extractedData.parent.phone)
        setParentPhone(extractedData.parent.phone);
      if (extractedData.parent.address)
        setParentAddress(extractedData.parent.address);
    }

    // Academic period info
    if (extractedData.academicInfo) {
      if (extractedData.academicInfo.term)
        setTerm(extractedData.academicInfo.term);
      if (extractedData.academicInfo.year)
        setAcademicYear(extractedData.academicInfo.year);
    }

    // Attendance info
    if (extractedData.attendance) {
      if (extractedData.attendance.days)
        setAttendanceDays(extractedData.attendance.days);
      if (extractedData.attendance.present)
        setAttendancePresent(extractedData.attendance.present);
    }

    // Subjects/grades
    if (extractedData.subjects && extractedData.subjects.length > 0) {
      setSubjects(extractedData.subjects);
    }

    // Teacher comments
    if (extractedData.teacherComments) {
      setTeacherComments(extractedData.teacherComments);
    }

    alert("✅ Data extracted and populated successfully!");
  };
  const loadReportForExport = async () => {
    if (!user?.uid || !reportId) return null;

    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "reports", reportId));

    return snap.exists() ? snap.data() : null;
  };

  const calculateAverage = () => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subject) => sum + subject.mark, 0);
    return (total / subjects.length).toFixed(1);
  };
  const navItems = [
    { id: "home", label: "Today's Overview", icon: Home },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      badge: `${presentCount}/${MOCK_STUDENTS.length}`,
    },
    { id: "timetable", label: "Timetable", icon: Clock },
    {
      id: "homework",
      label: "Homework & Tasks",
      icon: BookMarked,
      badge: homework.filter((h) => h.priority === "high").length || null,
    },
    {
      id: "notices",
      label: "Parent Notices",
      icon: Megaphone,
      badge: unreadNotices || null,
    },
    { id: "fees", label: "Fee Tracking", icon: CreditCard },
    { id: "staff", label: "Staff", icon: Users },
    { id: "events", label: "Events & Calendar", icon: Calendar },
    { id: "reports", label: "Report Cards", icon: ClipboardList },
  ];
  const loadStudents = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "students"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const studentsData = [];

      querySnapshot.forEach((doc) => {
        studentsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };
  const sendNoticeViaWhatsApp = (notice, phoneNumber) => {
    const cleaned = phoneNumber
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/^\+/, "")
      .replace(/^0/, "27");

    const message = encodeURIComponent(
      `📚 *${notice.title}*\n\n` +
        `${notice.message}\n\n` +
        `_Sent by ${businessInfo?.name || "the school"}_`,
    );

    window.open(`https://wa.me/${cleaned}?text=${message}`, "_blank");
  };

  const sendNoticeToAllParents = (notice) => {
    const parentsWithPhone = students.filter((s) => s.phone);

    parentsWithPhone.forEach((student, index) => {
      setTimeout(() => {
        sendNoticeViaWhatsApp(notice, student.phone);
      }, index * 500);
    });
  };
  const navigate = (id) => {
    setActiveView(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
      className="flex h-screen bg-slate-100 overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        :root {
          --brand: #4f46e5;
          --brand-light: #eef2ff;
          --brand-mid: #818cf8;
          --accent: #f59e0b;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --sidebar-w: 260px;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .pill { display:inline-flex; align-items:center; gap:4px; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; }
        .card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.04); }
        .btn-primary { background:var(--brand); color:#fff; border:none; border-radius:10px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:opacity .15s; }
        .btn-primary:hover { opacity:.88; }
        .btn-ghost { background:transparent; border:1.5px solid #e2e8f0; border-radius:10px; padding:8px 14px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:6px; color:#475569; transition:background .15s; }
        .btn-ghost:hover { background:#f8fafc; }
        .status-present { background:#dcfce7; color:#16a34a; }
        .status-absent  { background:#fee2e2; color:#dc2626; }
        .status-late    { background:#fef9c3; color:#ca8a04; }
        .status-paid    { background:#dcfce7; color:#16a34a; }
        .status-partial { background:#fef9c3; color:#ca8a04; }
        .status-unpaid  { background:#fee2e2; color:#dc2626; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:12px; cursor:pointer; transition:all .15s; color:#64748b; font-size:13.5px; font-weight:500; position:relative; }
        .nav-item:hover { background:#f1f5f9; color:#1e293b; }
        .nav-item.active { background:var(--brand-light); color:var(--brand); font-weight:700; }
        .input { width:100%; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; transition:border .15s; font-family:inherit; }
        .input:focus { border-color:var(--brand); }
        select.input { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px; }
        .timetable-cell { padding:6px 8px; border-radius:8px; font-size:11.5px; font-weight:500; text-align:center; min-height:44px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
        .priority-high   { background:#fee2e2; color:#dc2626; }
        .priority-medium { background:#fef9c3; color:#b45309; }
        .priority-low    { background:#dcfce7; color:#16a34a; }
        @media print {
          .no-print { display:none !important; }
          .card { box-shadow:none; border:1px solid #e2e8f0; }
        }
      `}</style>

      <EducationSidebar
        // navigation
        navigate={navigate}
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowSettings={setShowSettings}
        handleLogout={handleLogout}
        // firebase data
        businessInfo={businessInfo}
        savedReports={savedReports}
        savedStudents={savedStudents}
        showReportsList={showReportsList}
        setShowReportsList={setShowReportsList}
        // modal openers — each one just sets the matching state to true
        onOpenStudentModal={() => {
          setSelectedStudent(null);
          setShowStudentModal(true);
        }}
        onOpenStudentsListModal={() => setShowStudentsListModal(true)}
        onOpenNoticeModal={() => setShowNoticeModal(true)}
        onOpenHomeworkModal={() => setShowHomeworkModal(true)}
        onOpenAttendanceModal={() => setShowAttendanceModal(true)}
        onOpenEventModal={() => setShowEventModal(true)}
        onOpenStaffModal={() => setShowStaffModal(true)}
        onOpenTimetableModal={() => setShowTimetableModal(true)}
      />

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-h-0 transition-all duration-300">
        {/* Top bar */}
        <header className="no-print bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {navItems.find((n) => n.id === activeView)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell className="w-5 h-5" />
              {unreadNotices > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    background: "#ef4444",
                    borderRadius: "50%",
                    display: "block",
                  }}
                />
              )}
            </button>
          </div>
          {activeView === "reports" && (
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="btn-ghost" onClick={handleSavePDF}>
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button className="btn-primary" onClick={handleSaveReport}>
                <Save className="w-4 h-4" />
                Save
              </button>
              <button className="btn-primary" onClick={handleNewReport}>
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          )}
        </header>
        {showSettings && (
          <BusinessSettingsModal onClose={() => setShowSettings(false)} />
        )}
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
          {/* ── HOME ── */}
          {activeView === "home" && (
            <HomeView
              dayName={dayName}
              presentCount={presentCount}
              absentCount={absentCount}
              lateCount={lateCount}
              totalStudents={MOCK_STUDENTS.length}
              collectedFees={collectedFees}
              totalFees={totalFees}
              unreadNotices={unreadNotices}
              notices={notices}
              events={MOCK_EVENTS}
              homework={homework}
              staff={MOCK_STAFF}
              navigate={navigate}
              businessInfo={businessInfo}
              students={students}
            />
          )}
          {activeView === "overview" && (
            <SchoolOverview
              students={savedStudents}
              staff={staff}
              attendance={attendance}
              events={events}
              homework={homework}
              notices={notices}
              businessInfo={businessInfo}
            />
          )}
          {/* ── ATTENDANCE ── */}
          {activeView === "attendance" && (
            <AttendanceView
              students={MOCK_STUDENTS}
              attendance={attendance}
              setAttendance={setAttendance}
              presentCount={presentCount}
              absentCount={absentCount}
              lateCount={lateCount}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              dateStr={dateStr}
            />
          )}
           {activeView === "templates" &&(
            <div className="h-full overflow-y-auto p-6">
            <Templates user={user} />
            </div>
            )}
          {/* ── TIMETABLE ── */}
          {activeView === "timetable" && (
            <TimetableView
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          )}

          {/* ── HOMEWORK ── */}
          {activeView === "homework" && (
            <HomeworkView
              homework={homework}
              setHomework={setHomework}
              newHomework={newHomework}
              setNewHomework={setNewHomework}
              showForm={showHomeworkForm}
              setShowForm={setShowHomeworkForm}
            />
          )}

          {/* ── NOTICES ── */}
          {activeView === "notices" && (
            <NoticesView
              notices={notices}
              setNotices={setNotices}
              showForm={showNoticeForm}
              setShowForm={setShowNoticeForm}
              noticeForm={noticeForm}
              setNoticeForm={setNoticeForm}
              students={students}
              businessInfo={businessInfo}
            />
          )}

          {/* ── FEES ── */}
          {activeView === "fees" && (
            <FeesView
              students={MOCK_STUDENTS}
              feeFilter={feeFilter}
              setFeeFilter={setFeeFilter}
              collectedFees={collectedFees}
              totalFees={totalFees}
            />
          )}

          {/* ── STAFF ── */}
          {activeView === "staff" && <StaffView staff={MOCK_STAFF} />}

          {/* ── EVENTS ── */}
          {activeView === "events" && <EventsView events={MOCK_EVENTS} />}

         {activeView === "reports" && (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
 
      {/* ════════════════════════════════════════════════════════════════
          LEFT — Input panel
          Hidden on mobile when showReportCard is true
      ════════════════════════════════════════════════════════════════ */}
      <div
        className={`${
          showReportCard ? "hidden lg:block" : "block"
        } print:hidden overflow-y-auto`}
        style={{ maxHeight: "calc(100vh - 64px)" }}
      >
 
        {/* ── Tab bar ─────────────────────────────────────────────────── */}
        <div className="flex bg-white border border-[#DDE3ED] rounded-md overflow-hidden mb-2">
          <button
            onClick={() => setInputMode("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all duration-150 border-b-2 ${
              inputMode === "manual"
                ? "bg-white text-[#0D6EFD] border-[#0D6EFD]"
                : "bg-[#F0F3F9] text-[#4A5568] border-transparent hover:bg-[#EBF0FB]"
            }`}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </button>
 
          <button
            onClick={() => setInputMode("ai")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all duration-150 border-b-2 border-l border-l-[#DDE3ED] ${
              inputMode === "ai"
                ? "bg-white text-[#7B2FBE] border-[#7B2FBE]"
                : "bg-[#F0F3F9] text-[#4A5568] border-transparent hover:bg-[#EBF0FB]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
 
        {/* ── AI mode ─────────────────────────────────────────────────── */}
        {inputMode === "ai" && (
          <div className="bg-white border border-[#DDE3ED] rounded-md p-3.5 mb-2">
            <AIInvoiceExtractor
              onDataExtracted={handleAIDataExtracted}
              documentType={documentType}
            />
          </div>
        )}
 
        {/* ── Manual mode ──────────────────────────────────────────────── */}
        {inputMode === "manual" && (
          <>
            {/* Term banner — wraps gracefully on narrow screens */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 mb-2 bg-[#E8F0FE] border border-[#0D6EFD]/20 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0D6EFD] flex-shrink-0" />
              <span className="text-[12px] font-bold text-[#0D6EFD]">{term} · {academicYear}</span>
              <span className="text-[12px] text-[#4A5568]">Academic Period</span>
            </div>
 
            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: "Avg Grade",  value: `${calculateAverage()}%`, color: "#0D6EFD" },
                { label: "Subjects",   value: subjects.length,           color: "#0F7B3F" },
                { label: "Attendance", value: `${attendancePresent}/${attendanceDays}`, color: "#E8601C" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#DDE3ED] rounded-md px-2.5 py-2.5">
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#8A97A8] uppercase tracking-wide mb-1 truncate">
                    {s.label}
                  </div>
                  <div
                    className="text-[16px] sm:text-[20px] font-bold leading-none truncate"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
 
            {/* ── Student Information ─────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  Student Information
                </h2>
                <button className="flex items-center gap-1 text-[11px] font-bold text-[#0D6EFD] hover:text-[#0b5ed7]">
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
              {/* 1-col on mobile, 2-col on sm+ */}
              <div className={`${sectionBodyCls} grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5`}>
                <ZField label="Student Name">
                  <input type="text" value={studentName}
                    onChange={(e) => setStudentName(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Student ID">
                  <input type="text" value={studentId}
                    onChange={(e) => setStudentId(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Grade Level">
                  <input type="text" value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Date of Birth">
                  <input type="date" value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)} className={inputCls} />
                </ZField>
              </div>
            </div>
 
            {/* ── Parent / Guardian ───────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                  Parent / Guardian
                </h2>
              </div>
              <div className={`${sectionBodyCls} grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5`}>
                <ZField label="Parent Name">
                  <input type="text" value={parentName}
                    onChange={(e) => setParentName(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Email">
                  <input type="email" value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Phone">
                  <input type="tel" value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)} className={inputCls} />
                </ZField>
                {/* Address always spans full width */}
                <ZField label="Address" span2>
                  <input type="text" value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)} className={inputCls} />
                </ZField>
              </div>
            </div>
 
            {/* ── Academic Period ─────────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  Academic Period
                </h2>
              </div>
              <div className={`${sectionBodyCls} grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5`}>
                <ZField label="Term">
                  <div className="relative">
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className={`${inputCls} appearance-none pr-7`}
                    >
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                      <option>Term 4</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8A97A8]"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </ZField>
                <ZField label="Academic Year">
                  <input type="text" value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)} className={inputCls} />
                </ZField>
              </div>
            </div>
 
            {/* ── Subject Grades ──────────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  Subject Grades
                </h2>
              </div>
              <div className={sectionBodyCls}>
 
                {/* Add row — 2-col on mobile, 4-col on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-[1fr_80px_1fr_auto] gap-1.5 mb-3">
                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    placeholder="Mark %"
                    min="0"
                    max="100"
                    value={newSubject.mark}
                    onChange={(e) => setNewSubject({ ...newSubject, mark: e.target.value })}
                    className={inputCls}
                  />
                  {/* Comments field: hidden on mobile, visible on sm+ */}
                  <input
                    type="text"
                    placeholder="Comments (optional)"
                    value={newSubject.comments}
                    onChange={(e) => setNewSubject({ ...newSubject, comments: e.target.value })}
                    className={`${inputCls} hidden sm:block`}
                  />
                  <button
                    onClick={handleAddSubject}
                    className="col-span-2 sm:col-span-1 h-8 px-3.5 bg-[#E8601C] hover:bg-[#c9511a] text-white text-[12px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subject
                  </button>
                </div>
 
                {/* Comments shown below add row on mobile only */}
                <div className="sm:hidden mb-3">
                  <input
                    type="text"
                    placeholder="Comments (optional)"
                    value={newSubject.comments}
                    onChange={(e) => setNewSubject({ ...newSubject, comments: e.target.value })}
                    className={inputCls}
                  />
                </div>
 
                {/* Subjects table */}
                {subjects.length > 0 && (
                  <div className="border border-[#E8ECF4] rounded overflow-hidden">
                    <table className="w-full text-[12px] border-collapse">
                      <thead>
                        <tr className="bg-[#F0F3F9]">
                          <th className="px-2.5 py-1.5 text-left text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wide border-b border-[#E8ECF4]">
                            Subject
                          </th>
                          <th className="px-2.5 py-1.5 text-left text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wide border-b border-[#E8ECF4]">
                            Mark
                          </th>
                          <th className="px-2.5 py-1.5 text-left text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wide border-b border-[#E8ECF4]">
                            Sym
                          </th>
                          {/* Comments column hidden on mobile */}
                          <th className="hidden sm:table-cell px-2.5 py-1.5 text-left text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wide border-b border-[#E8ECF4]">
                            Comments
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((s, i) => {
                          const m    = Number(s.mark);
                          const sym  = m >= 80 ? "A" : m >= 70 ? "B" : m >= 60 ? "C" : m >= 50 ? "D" : "F";
                          const scol = m >= 80 ? "#0F7B3F" : m >= 60 ? "#0D6EFD" : m >= 50 ? "#975A00" : "#C0392B";
                          return (
                            <tr
                              key={i}
                              className={`border-b border-[#E8ECF4] last:border-b-0 ${
                                i % 2 !== 0 ? "bg-[#F5F6FA]" : "bg-white"
                              }`}
                            >
                              <td className="px-2.5 py-1.5 font-semibold text-[#1A2133] max-w-[100px] truncate">
                                {s.name}
                              </td>
                              <td className="px-2.5 py-1.5 text-[#4A5568] whitespace-nowrap">
                                {s.mark}%
                              </td>
                              <td className="px-2.5 py-1.5">
                                <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] text-[11px] font-bold"
                                  style={{ background: scol + "1A", color: scol }}
                                >
                                  {sym}
                                </span>
                              </td>
                              {/* Comments cell hidden on mobile */}
                              <td className="hidden sm:table-cell px-2.5 py-1.5 text-[#8A97A8] max-w-[120px] truncate">
                                {s.comments || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
 
            {/* ── Attendance ──────────────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  Attendance
                </h2>
                {Number(attendanceDays) > 0 && (
                  <span className="text-[11px] font-bold text-[#0D6EFD] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
                    {Math.round((Number(attendancePresent) / Number(attendanceDays)) * 100)}%
                  </span>
                )}
              </div>
              {/* Always 2-col — values are short numbers */}
              <div className={`${sectionBodyCls} grid grid-cols-2 gap-x-3 gap-y-2.5`}>
                <ZField label="Total Days">
                  <input type="number" value={attendanceDays}
                    onChange={(e) => setAttendanceDays(e.target.value)} className={inputCls} />
                </ZField>
                <ZField label="Days Present">
                  <input type="number" value={attendancePresent}
                    onChange={(e) => setAttendancePresent(e.target.value)} className={inputCls} />
                </ZField>
              </div>
              {Number(attendanceDays) > 0 && (
                <div className="px-3.5 pb-3">
                  <div className="h-1.5 rounded-full bg-[#E8ECF4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0D6EFD] transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((Number(attendancePresent) / Number(attendanceDays)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
 
            {/* ── Teacher Comments ─────────────────────────────────────── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <h2 className={sectionTitleCls}>
                  <SectionIcon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  Teacher Comments
                </h2>
              </div>
              <div className={sectionBodyCls}>
                <textarea
                  value={teacherComments}
                  onChange={(e) => setTeacherComments(e.target.value)}
                  rows={4}
                  placeholder="Enter teacher comments about the student's performance..."
                  className="w-full px-2.5 py-2 text-[13px] text-[#1A2133] bg-white border border-[#DDE3ED] rounded resize-y leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] focus:border-[#0D6EFD]"
                />
              </div>
            </div>
 
            {/* ── Mobile preview toggle (lg and above uses the side panel) ── */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowReportCard(true)}
                className="w-full flex items-center justify-center gap-2 h-10 bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-[13px] font-bold rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Report Card
              </button>
            </div>
          </>
        )}
      </div>
 
      {/* ════════════════════════════════════════════════════════════════
          RIGHT — Preview panel
          Mobile: full-screen when showReportCard === true
          Desktop: always-visible sticky side panel
      ════════════════════════════════════════════════════════════════ */}
      <div
        className={`${
          showReportCard ? "flex" : "hidden lg:flex"
        } flex-col lg:sticky lg:top-4 print:hidden`}
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Preview toolbar */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-white border border-[#DDE3ED] rounded-md flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Back button — mobile only */}
            <button
              onClick={() => setShowReportCard(false)}
              className="lg:hidden flex items-center gap-1 text-[11px] font-bold text-[#4A5568] hover:text-[#1A2133] mr-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-2 h-2 rounded-full bg-[#E8601C] flex-shrink-0" />
            <span className="text-[10px] font-bold text-[#6B7A8D] uppercase tracking-widest">
              Preview
            </span>
          </div>
          <TemplateSelector
            user={user}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>
 
        {/* Scaled preview container */}
        <div className="flex-1 overflow-hidden bg-[#F0F3F9] rounded-md border border-[#DDE3ED]">
          <div className="overflow-y-auto overflow-x-hidden h-full">
            <div
              style={{
                transform: "scale(0.55)",
                transformOrigin: "top left",
                width: "calc(100% / 0.55)",
                pointerEvents: "none",
              }}
            >
              <TemplateRenderer
                templateId={selectedTemplate}
                businessInfo={businessInfo}
                loading={loading}
                reportCardNumber={reportNumber}
                term={term}
                academicYear={academicYear}
                studentName={studentName}
                studentId={studentId}
                gradeLevel={gradeLevel}
                dateOfBirth={dateOfBirth}
                parentName={parentName}
                parentPhone={parentPhone}
                parentEmail={parentEmail}
                subjects={subjects}
                attendanceDays={attendanceDays}
                attendancePresent={attendancePresent}
                teacherComments={teacherComments}
                calculateAverage={calculateAverage}
                documentType="reportCard"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
 
    {/* ── PRINT AREA (hidden on screen, used only for printing) ────────── */}
    <div id="print-area" className="hidden print:block">
      <TemplateRenderer
        templateId={selectedTemplate}
        businessInfo={businessInfo}
        loading={loading}
        reportCardNumber={reportNumber}
        term={term}
        academicYear={academicYear}
        studentName={studentName}
        studentId={studentId}
        gradeLevel={gradeLevel}
        dateOfBirth={dateOfBirth}
        parentName={parentName}
        parentPhone={parentPhone}
        parentEmail={parentEmail}
        subjects={subjects}
        attendanceDays={attendanceDays}
        attendancePresent={attendancePresent}
        teacherComments={teacherComments}
        calculateAverage={calculateAverage}
        documentType="reportCard"
      />
    </div>
  </>
)}
        </main>
      </div>
      <NoticeModal
        open={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        onSave={saveNotice}
      />
      <HomeworkModal
        open={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        onSave={saveHomework}
      />
      <AttendanceModal
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        students={students}
        attendance={attendance}
        onToggle={(id, status) => {
          setAttendance((p) => ({ ...p, [id]: status }));
          saveAttendance(id, status);
        }}
        onSaveAll={saveAllAttendance}
        dateStr={todayISO}
      />
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={saveEvent}
      />
      <StaffModal
        open={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSave={saveStaff}
      />
      <StudentModal
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSave={saveStudent}
        initial={selectedStudent}
      />
      <TimetableModal
        open={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        onSave={saveTimetable}
        timetable={timetable}
      />
    </div>
  );
};

// ─── HOME VIEW ────────────────────────────────────────────────────────────────
const HomeView = ({
  dayName,
  presentCount,
  absentCount,
  lateCount,
  totalStudents,
  collectedFees,
  totalFees,
  unreadNotices,
  notices,
  events,
  homework,
  staff,
  navigate,
  businessInfo,
  students,
}) => {
  const feePercent = Math.round((collectedFees / totalFees) * 100);
  const attendPercent = Math.round((presentCount / totalStudents) * 100);
  const upcomingEvents = events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const urgentHomework = homework.filter((h) => h.priority === "high");
  const absentStaff = staff.filter((s) => s.status === "absent");

  const StatCard = ({ label, value, sub, color, icon: Icon, onClick }) => (
    <div
      className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {sub}
            </div>
          )}
        </div>
        <div
          style={{ background: color + "18", borderRadius: 12, padding: 10 }}
        >
          <Icon style={{ color }} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div
        style={{
          background: "#7ca6ab",
          borderRadius: 2,
          padding: "24px 28px",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 13,
            opacity: 0.75,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Good morning 👋
        </div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24 }}>
          Happy {dayName}!
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
          Here's what's happening at school today.
        </div>
        {absentStaff.length > 0 && (
          <div
            style={{
              marginTop: 12,
              background: "rgba(255,255,255,.15)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            ⚠️ {absentStaff.map((s) => s.name).join(", ")}{" "}
            {absentStaff.length === 1 ? "is" : "are"} absent today
          </div>
        )}

        {businessInfo?.portalSlug && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* ── Parent Portal ───────────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                border: "1.5px solid #c7d2fe",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap
                    style={{ width: 16, height: 16, color: "#fff" }}
                  />
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#3730a3" }}
                  >
                    Parent Portal
                  </div>
                  <div style={{ fontSize: 11, color: "#6366f1" }}>
                    Share with parents
                  </div>
                </div>
              </div>

              {/* Link */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #c7d2fe",
                  borderRadius: 9,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4338ca",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {window.location.origin}/parents/{businessInfo.portalSlug}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/parents/${businessInfo.portalSlug}`,
                    );
                    alert("Parent portal link copied!");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy Link
                </button>

                <button
                  onClick={() => {
                    const portalUrl = `${window.location.origin}/parents/${businessInfo.portalSlug}`;
                    const msg = encodeURIComponent(
                      `👋 Hello! Here is the link to ${businessInfo?.name || "our school"}'s Parent Portal.\n\n` +
                        `📚 Check homework, notices and upcoming events anytime:\n${portalUrl}`,
                    );
                    const targets = students?.filter((s) => s.phone) || [];
                    if (targets.length === 0) {
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                      return;
                    }
                    targets.forEach((student, index) => {
                      setTimeout(() => {
                        const cleaned = student.phone
                          .replace(/\s+/g, "")
                          .replace(/-/g, "")
                          .replace(/^\+/, "")
                          .replace(/^0/, "27");
                        window.open(
                          `https://wa.me/${cleaned}?text=${msg}`,
                          "_blank",
                        );
                      }, index * 600);
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    style={{ width: 14, height: 14 }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() =>
                    window.open(`/parents/${businessInfo.portalSlug}`, "_blank")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#4f46e5",
                    border: "1.5px solid #c7d2fe",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* ── Staff Portal ────────────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                border: "1.5px solid #86efac",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}
                  >
                    Staff Portal
                  </div>
                  <div style={{ fontSize: 11, color: "#16a34a" }}>
                    Share with teachers
                  </div>
                </div>
              </div>

              {/* Link */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #86efac",
                  borderRadius: 9,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#15803d",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {window.location.origin}/staff/{businessInfo.portalSlug}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/staff/${businessInfo.portalSlug}`,
                    );
                    alert("Staff portal link copied!");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy Link
                </button>

                <button
                  onClick={() => {
                    const staffUrl = `${window.location.origin}/staff/${businessInfo.portalSlug}`;
                    const msg = encodeURIComponent(
                      `👋 Hi! Here is the link to ${businessInfo?.name || "our school"}'s Staff Portal.\n\n` +
                        `📋 Mark attendance, set homework & manage your timetable:\n${staffUrl}\n\n` +
                        `🔐 Use your assigned PIN to log in.`,
                    );
                    const targets = staff?.filter((s) => s.phone) || [];
                    if (targets.length === 0) {
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                      return;
                    }
                    targets.forEach((member, index) => {
                      setTimeout(() => {
                        const cleaned = member.phone
                          .replace(/\s+/g, "")
                          .replace(/-/g, "")
                          .replace(/^\+/, "")
                          .replace(/^0/, "27");
                        window.open(
                          `https://wa.me/${cleaned}?text=${msg}`,
                          "_blank",
                        );
                      }, index * 600);
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#15803d",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    style={{ width: 14, height: 14 }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() =>
                    window.open(`/staff/${businessInfo.portalSlug}`, "_blank")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#16a34a",
                    border: "1.5px solid #86efac",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Present Today"
          value={`${presentCount}/${totalStudents}`}
          sub={`${attendPercent}% attendance`}
          color="#10b981"
          icon={UserCheck}
          onClick={() => navigate("attendance")}
        />
        <StatCard
          label="Absent"
          value={absentCount}
          sub={lateCount > 0 ? `${lateCount} late` : "All others on time"}
          color="#ef4444"
          icon={AlertCircle}
          onClick={() => navigate("attendance")}
        />
        <StatCard
          label="Fees Collected"
          value={`${feePercent}%`}
          sub={`R${collectedFees.toLocaleString()} / R${totalFees.toLocaleString()}`}
          color="#f59e0b"
          icon={CreditCard}
          onClick={() => navigate("fees")}
        />
        <StatCard
          label="New Notices"
          value={unreadNotices}
          sub="unread by parents"
          color="#6366f1"
          icon={Megaphone}
          onClick={() => navigate("notices")}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's timetable preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              Today's Schedule
            </div>
            <button
              style={{
                fontSize: 12,
                color: "var(--brand)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate("timetable")}
            >
              View full →
            </button>
          </div>
          <div className="space-y-2">
            {TIME_SLOTS.slice(0, 4).map((time, i) => {
              const subject = MOCK_TIMETABLE["Grade 2"][dayName]
                ? MOCK_TIMETABLE["Grade 2"][dayName][i]
                : "—";
              const Icon = SUBJECT_ICONS[subject] || BookOpen;
              return (
                <div
                  key={time}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: "#f8fafc" }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      width: 38,
                      flexShrink: 0,
                    }}
                  >
                    {time}
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: "#eef2ff",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--brand)" }}
                    />
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}
                  >
                    {subject}
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    Grade 2
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              Upcoming Events
            </div>
            <button
              style={{
                fontSize: 12,
                color: "var(--brand)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate("events")}
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map((ev) => {
              const d = new Date(ev.date);
              const daysAway = Math.round((d - new Date()) / 86400000);
              const colorMap = {
                emerald: "#10b981",
                blue: "#3b82f6",
                purple: "#8b5cf6",
                red: "#ef4444",
                amber: "#f59e0b",
                slate: "#64748b",
              };
              const c = colorMap[ev.color] || "#6366f1";
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: "#f8fafc" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: c + "15",
                      borderRadius: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: c,
                        lineHeight: 1,
                      }}
                    >
                      {d.getDate()}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: c,
                        letterSpacing: ".06em",
                      }}
                    >
                      {d
                        .toLocaleDateString("en", { month: "short" })
                        .toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                      className="truncate"
                    >
                      {ev.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {ev.time}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: daysAway <= 2 ? "#ef4444" : "#64748b",
                      background: daysAway <= 2 ? "#fee2e2" : "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {daysAway === 0
                      ? "Today"
                      : daysAway === 1
                        ? "Tomorrow"
                        : `${daysAway}d`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent homework */}
        <div className="card p-5">
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            🚨 Urgent Homework Due
          </div>
          {urgentHomework.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              No urgent tasks — all good!
            </div>
          ) : (
            urgentHomework.map((hw) => (
              <div key={hw.id} className="flex items-start gap-3 mb-3">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: "#ef4444",
                    borderRadius: "50%",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                  >
                    {hw.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {hw.grade} · Due {hw.dueDate}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Latest notice */}
        <div className="card p-5">
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            📢 Latest Notice
          </div>
          {notices.slice(0, 2).map((n) => (
            <div
              key={n.id}
              style={{
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                >
                  {n.title}
                </div>
                {!n.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: "#6366f1",
                      borderRadius: "50%",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
              <div
                style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}
                className="line-clamp-2"
              >
                {n.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ATTENDANCE VIEW ──────────────────────────────────────────────────────────
const AttendanceView = ({
  students,
  attendance,
  setAttendance,
  presentCount,
  absentCount,
  lateCount,
  selectedClass,
  setSelectedClass,
  dateStr,
}) => {
  const classOptions = [
    "All Classes",
    "Pre-School A",
    "Pre-School B",
    "Grade 1",
    "Grade 2",
    "Grade 3",
  ];
  const filtered =
    selectedClass === "All Classes"
      ? students
      : students.filter((s) => s.grade === selectedClass);

  const toggle = (id, status) =>
    setAttendance((prev) => ({ ...prev, [id]: status }));

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Present",
            count: presentCount,
            color: "#10b981",
            bg: "#dcfce7",
          },
          {
            label: "Absent",
            count: absentCount,
            color: "#ef4444",
            bg: "#fee2e2",
          },
          { label: "Late", count: lateCount, color: "#f59e0b", bg: "#fef9c3" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters + date */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          {dateStr}
        </div>
        <div className="flex gap-2 flex-wrap ml-auto">
          {classOptions.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: selectedClass === c ? "var(--brand)" : "#f1f5f9",
                color: selectedClass === c ? "#fff" : "#475569",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="card overflow-hidden">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["Student", "Grade", "Parent", "Status", "Mark"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const status = attendance[s.id] || "present";
              return (
                <tr
                  key={s.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: `hsl(${s.id * 47},70%,88%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: `hsl(${s.id * 47},50%,35%)`,
                        }}
                      >
                        {s.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          Age {s.age}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    {s.grade}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {s.parent}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`pill status-${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div className="flex gap-1.5">
                      {["present", "absent", "late"].map((st) => (
                        <button
                          key={st}
                          onClick={() => toggle(s.id, st)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            background:
                              status === st
                                ? st === "present"
                                  ? "#10b981"
                                  : st === "absent"
                                    ? "#ef4444"
                                    : "#f59e0b"
                                : "#f1f5f9",
                            color: status === st ? "#fff" : "#64748b",
                          }}
                        >
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          <Save className="w-4 h-4" />
          Save Attendance Register
        </button>
      </div>
    </div>
  );
};

// ─── TIMETABLE VIEW ───────────────────────────────────────────────────────────
const TimetableView = ({
  selectedClass,
  setSelectedClass,
  selectedDay,
  setSelectedDay,
}) => {
  const subjectColors = {
    Maths: "#eef2ff",
    English: "#f0fdf4",
    Afrikaans: "#fff7ed",
    Art: "#fdf4ff",
    Music: "#fff1f2",
    PE: "#ecfdf5",
    "PE/Movement": "#ecfdf5",
    "Natural Science": "#f0f9ff",
    Phonics: "#fefce8",
    Numbers: "#eef2ff",
    "Circle Time": "#fdf4ff",
    "Story Time": "#f0fdf4",
    "Life Skills": "#fff1f2",
    "Social Studies": "#fff7ed",
    Technology: "#eef2ff",
    "Free Play": "#f0fdf4",
    Library: "#f0f9ff",
    "Show & Tell": "#fdf4ff",
    Reading: "#f0fdf4",
    Snack: "#fff7ed",
    "Art & Craft": "#fdf4ff",
    Break: "#f8fafc",
    "Pack Up": "#f8fafc",
    "Goodbye Circle": "#fdf4ff",
    "Creative Writing": "#fefce8",
    "Creative Project": "#fdf4ff",
    "Foundation Phase": "#eef2ff",
  };

  const timetable = MOCK_TIMETABLE[selectedClass] || {};

  return (
    <div className="space-y-5">
      {/* Class selector */}
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          Class:
        </div>
        {CLASSES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedClass(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: selectedClass === c ? "var(--brand)" : "#f1f5f9",
              color: selectedClass === c ? "#fff" : "#475569",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Week view */}
      <div className="card overflow-x-auto">
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: ".06em",
                  borderBottom: "1px solid #e2e8f0",
                  width: 60,
                }}
              >
                TIME
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    borderBottom: "1px solid #e2e8f0",
                    cursor: "pointer",
                    color: selectedDay === d ? "var(--brand)" : "#475569",
                    background:
                      selectedDay === d ? "var(--brand-light)" : "transparent",
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, ti) => (
              <tr key={time} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td
                  style={{
                    padding: "8px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                  }}
                >
                  {time}
                </td>
                {DAYS.map((day) => {
                  const subject = timetable[day]?.[ti] || "—";
                  const bg = subjectColors[subject] || "#f8fafc";
                  const Icon = SUBJECT_ICONS[subject];
                  return (
                    <td
                      key={day}
                      style={{ padding: "6px 8px", textAlign: "center" }}
                    >
                      <div
                        className="timetable-cell"
                        style={{
                          background: selectedDay === day ? bg : "#fafafa",
                          border:
                            selectedDay === day
                              ? `1px solid ${bg}`
                              : "1px solid transparent",
                        }}
                      >
                        {Icon && (
                          <Icon
                            className="w-3 h-3"
                            style={{ color: "#6366f1", opacity: 0.7 }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          {subject}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Day detail cards */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          {selectedDay} — {selectedClass}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {TIME_SLOTS.map((time, ti) => {
            const subject = timetable[selectedDay]?.[ti] || "Free";
            const Icon = SUBJECT_ICONS[subject] || BookOpen;
            return (
              <div key={time} className="card p-3 text-center">
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: 6,
                  }}
                >
                  {time}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#eef2ff",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 6px",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} />
                </div>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
                >
                  {subject}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── HOMEWORK VIEW ────────────────────────────────────────────────────────────
const HomeworkView = ({
  homework,
  setHomework,
  newHomework,
  setNewHomework,
  showForm,
  setShowForm,
}) => {
  const handleAdd = () => {
    if (!newHomework.title || !newHomework.subject) return;
    setHomework((prev) => [{ id: Date.now(), ...newHomework }, ...prev]);
    setNewHomework({
      subject: "",
      grade: "Grade 1",
      title: "",
      dueDate: "",
      priority: "medium",
    });
    setShowForm(false);
  };

  const handleDelete = (id) =>
    setHomework((prev) => prev.filter((h) => h.id !== id));

  const subjectColors = {
    Maths: "#eef2ff",
    English: "#f0fdf4",
    Afrikaans: "#fff7ed",
    Art: "#fdf4ff",
    Science: "#f0f9ff",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Homework & Assignments
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {homework.length} tasks across all grades
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {showForm && (
        <div
          className="card p-5 border-2"
          style={{ borderColor: "var(--brand)", borderStyle: "dashed" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            New Homework Task
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Subject *
              </label>
              <input
                className="input"
                placeholder="e.g. Maths"
                value={newHomework.subject}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Grade *
              </label>
              <select
                className="input"
                value={newHomework.grade}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, grade: e.target.value }))
                }
              >
                {[
                  "Pre-School A",
                  "Pre-School B",
                  "Grade 1",
                  "Grade 2",
                  "Grade 3",
                ].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Task Description *
              </label>
              <input
                className="input"
                placeholder="e.g. Complete worksheet pages 14-15"
                value={newHomework.title}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Due Date
              </label>
              <input
                className="input"
                type="date"
                value={newHomework.dueDate}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Priority
              </label>
              <select
                className="input"
                value={newHomework.priority}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, priority: e.target.value }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High / Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={handleAdd}>
              <Check className="w-4 h-4" />
              Save Task
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {["high", "medium", "low"].map((priority) => {
          const items = homework.filter((h) => h.priority === priority);
          if (items.length === 0) return null;
          const labels = {
            high: "🚨 Urgent",
            medium: "📋 Medium Priority",
            low: "✅ Low Priority",
          };
          return (
            <div key={priority}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                {labels[priority]}
              </div>
              <div className="space-y-2">
                {items.map((hw) => (
                  <div key={hw.id} className="card p-4 flex items-start gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: subjectColors[hw.subject] || "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: "var(--brand)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {hw.title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}
                      >
                        {hw.subject} · {hw.grade} ·{" "}
                        {hw.assignedBy || "Unassigned"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hw.dueDate && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#64748b",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 99,
                          }}
                        >
                          Due {hw.dueDate}
                        </span>
                      )}
                      <span className={`pill priority-${priority}`}>
                        {priority}
                      </span>
                      <button
                        onClick={() => handleDelete(hw.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── NOTICES VIEW ─────────────────────────────────────────────────────────────
const NoticesView = ({
  notices,
  setNotices,
  showForm,
  setShowForm,
  noticeForm,
  setNoticeForm,
  students,
  businessInfo,
}) => {
  const handleSend = () => {
    if (!noticeForm.title || !noticeForm.message) return;
    setNotices((prev) => [
      {
        id: Date.now(),
        ...noticeForm,
        date: new Date().toISOString().split("T")[0],
        read: false,
      },
      ...prev,
    ]);
    setNoticeForm({
      title: "",
      message: "",
      recipient: "All Parents",
      type: "info",
    });
    setShowForm(false);
  };

  const markRead = (id) =>
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const deleteNotice = (id) =>
    setNotices((prev) => prev.filter((n) => n.id !== id));

  const typeConfig = {
    important: { label: "Important", bg: "#fee2e2", color: "#dc2626" },
    action: { label: "Action Required", bg: "#fef9c3", color: "#ca8a04" },
    fee: { label: "Fee Notice", bg: "#ede9fe", color: "#7c3aed" },
    info: { label: "Info", bg: "#dbeafe", color: "#2563eb" },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Parent Notices
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {notices.filter((n) => !n.read).length} unread notices
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Megaphone className="w-4 h-4" />
          New Notice
        </button>
      </div>

      {showForm && (
        <div
          className="card p-5 border-2"
          style={{ borderColor: "#6366f1", borderStyle: "dashed" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            Compose Notice
          </div>

          <div className="space-y-3">
            {/* Type + Recipient row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Notice Type
                </label>
                <select
                  className="input"
                  value={noticeForm.type}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, type: e.target.value }))
                  }
                >
                  <option value="info">Info</option>
                  <option value="important">Important</option>
                  <option value="action">Action Required</option>
                  <option value="fee">Fee Notice</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Send To
                </label>
                <select
                  className="input"
                  value={noticeForm.recipient}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, recipient: e.target.value }))
                  }
                >
                  {[
                    "All Parents",
                    "Pre-School Parents",
                    "Grade 1 Parents",
                    "Grade 2 Parents",
                    "Grade 3 Parents",
                    "Selected Parents",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Subject / Title *
              </label>
              <input
                className="input"
                placeholder="Notice subject"
                value={noticeForm.title}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            {/* Message */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Message *
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Type your message to parents..."
                value={noticeForm.message}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, message: e.target.value }))
                }
                style={{ resize: "vertical" }}
              />
            </div>

            {/* ── WhatsApp delivery section ───────────────────────────────────── */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {/* WhatsApp icon */}
                <svg
                  className="w-4 h-4"
                  style={{ color: "#16a34a", flexShrink: 0 }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}
                >
                  WhatsApp Delivery
                </span>
                <span
                  style={{ fontSize: 11, color: "#86efac", marginLeft: "auto" }}
                >
                  Optional
                </span>
              </div>

              {/* Preview of the message that will be sent */}
              {noticeForm.title && noticeForm.message && (
                <div
                  style={{
                    background: "#dcfce7",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: "#166534",
                    marginBottom: 10,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 3,
                      fontSize: 10,
                      color: "#15803d",
                      letterSpacing: ".05em",
                    }}
                  >
                    MESSAGE PREVIEW
                  </div>
                  {`📚 *${noticeForm.title}*\n\n${noticeForm.message}\n\n_Sent by ${businessInfo?.name || "the school"}_`}
                </div>
              )}

              {/* Send buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Send to ALL parents whose phone is saved */}
                <button
                  className="flex items-center gap-2"
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: !noticeForm.title || !noticeForm.message ? 0.5 : 1,
                  }}
                  disabled={!noticeForm.title || !noticeForm.message}
                  onClick={() => {
                    // Filter students based on recipient selection
                    let targets = students.filter((s) => s.phone);

                    if (noticeForm.recipient === "Pre-School Parents")
                      targets = targets.filter((s) =>
                        s.grade?.includes("Pre-School"),
                      );
                    else if (noticeForm.recipient === "Grade 1 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 1");
                    else if (noticeForm.recipient === "Grade 2 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 2");
                    else if (noticeForm.recipient === "Grade 3 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 3");

                    if (targets.length === 0) {
                      alert(
                        "No parents with saved phone numbers found for this group.",
                      );
                      return;
                    }

                    const msg = encodeURIComponent(
                      `📚 *${noticeForm.title}*\n\n${noticeForm.message}\n\n_Sent by ${businessInfo?.name || "the school"}_`,
                    );

                    // Open a WhatsApp chat for each parent (staggered to avoid popup blocking)
                    targets.forEach((student, index) => {
                      setTimeout(() => {
                        const cleaned = student.phone
                          .replace(/\s+/g, "")
                          .replace(/-/g, "")
                          .replace(/^\+/, "")
                          .replace(/^0/, "27");
                        window.open(
                          `https://wa.me/${cleaned}?text=${msg}`,
                          "_blank",
                        );
                      }, index * 600);
                    });
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  Send to {noticeForm.recipient} via WhatsApp
                </button>

                {/* Send to a single custom number */}
                <button
                  className="flex items-center gap-2"
                  style={{
                    background: "#fff",
                    color: "#16a34a",
                    border: "1.5px solid #86efac",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: !noticeForm.title || !noticeForm.message ? 0.5 : 1,
                  }}
                  disabled={!noticeForm.title || !noticeForm.message}
                  onClick={() => {
                    const raw = window.prompt(
                      "Enter parent WhatsApp number (e.g. 071 234 5678):",
                    );
                    if (!raw) return;

                    const cleaned = raw
                      .replace(/\s+/g, "")
                      .replace(/-/g, "")
                      .replace(/^\+/, "")
                      .replace(/^0/, "27");

                    const msg = encodeURIComponent(
                      `📚 *${noticeForm.title}*\n\n${noticeForm.message}\n\n_Sent by ${businessInfo?.name || "the school"}_`,
                    );

                    window.open(
                      `https://wa.me/${cleaned}?text=${msg}`,
                      "_blank",
                    );
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  Send to One Number
                </button>
              </div>

              {/* Info note */}
              <div
                style={{
                  fontSize: 10,
                  color: "#86efac",
                  marginTop: 8,
                  lineHeight: 1.4,
                }}
              >
                ℹ️ Opens WhatsApp for each parent. Allow popups in your browser
                for bulk sending. Phone numbers are pulled from saved student
                records.
              </div>
            </div>
            {/* ── end WhatsApp section ─────────────────────────────────────────── */}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={handleSend}>
              <Send className="w-4 h-4" />
              Save Notice
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => {
          const tc = typeConfig[n.type] || typeConfig.info;
          return (
            <div
              key={n.id}
              className="card p-4"
              style={{
                borderLeft: `4px solid ${tc.color}`,
                opacity: n.read ? 0.65 : 1,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="pill"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {tc.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {n.recipient}
                    </span>
                    {!n.read && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          background: "var(--brand)",
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#475569",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                    Sent: {n.date}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {!n.read && (
                    <button
                      className="btn-ghost"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      onClick={() => markRead(n.id)}
                    >
                      <Check className="w-3 h-3" />
                      Mark read
                    </button>
                  )}
                  <button
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                    onClick={() => deleteNotice(n.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── FEES VIEW ────────────────────────────────────────────────────────────────
const FeesView = ({
  students,
  feeFilter,
  setFeeFilter,
  collectedFees,
  totalFees,
}) => {
  const filters = ["all", "paid", "partial", "unpaid"];
  const filtered =
    feeFilter === "all"
      ? students
      : students.filter((s) => s.fees.status === feeFilter);
  const outstanding = totalFees - collectedFees;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Total Collected
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#10b981" }}>
            R{collectedFees.toLocaleString()}
          </div>
          <div
            style={{
              marginTop: 8,
              height: 6,
              background: "#e2e8f0",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.round((collectedFees / totalFees) * 100)}%`,
                height: "100%",
                background: "#10b981",
                borderRadius: 99,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {Math.round((collectedFees / totalFees) * 100)}% of total
          </div>
        </div>
        <div className="card p-5">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Outstanding
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ef4444" }}>
            R{outstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            {students.filter((s) => s.fees.status !== "paid").length} students
            with balance
          </div>
        </div>
        <div className="card p-5">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Fully Paid
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--brand)" }}>
            {students.filter((s) => s.fees.status === "paid").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            out of {students.length} students
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFeeFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: feeFilter === f ? "var(--brand)" : "#f1f5f9",
              color: feeFilter === f ? "#fff" : "#475569",
            }}
          >
            {f === "all"
              ? "All Students"
              : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: 6, opacity: 0.7 }}>
              (
              {f === "all"
                ? students.length
                : students.filter((s) => s.fees.status === f).length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {[
                "Student",
                "Grade",
                "Parent",
                "Fees Due",
                "Paid",
                "Balance",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const balance = s.fees.total - s.fees.paid;
              return (
                <tr
                  key={s.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: `hsl(${s.id * 47},70%,88%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: `hsl(${s.id * 47},50%,35%)`,
                          flexShrink: 0,
                        }}
                      >
                        {s.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {s.name}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "#475569",
                    }}
                  >
                    {s.grade}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {s.parent}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    R{s.fees.total.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13,
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    R{s.fees.paid.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13,
                      color: balance > 0 ? "#ef4444" : "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    R{balance.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className={`pill status-${s.fees.status}`}>
                      {s.fees.status.charAt(0).toUpperCase() +
                        s.fees.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {s.fees.status !== "paid" && (
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                      >
                        <Send className="w-3 h-3" />
                        Remind
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── STAFF VIEW ───────────────────────────────────────────────────────────────
const StaffView = ({ staff }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Staff", count: staff.length, color: "var(--brand)" },
        {
          label: "Present",
          count: staff.filter((s) => s.status === "present").length,
          color: "#10b981",
        },
        {
          label: "Absent",
          count: staff.filter((s) => s.status === "absent").length,
          color: "#ef4444",
        },
        {
          label: "Classes Today",
          count: staff.reduce((s, t) => s + t.classes.length, 0),
          color: "#f59e0b",
        },
      ].map((s) => (
        <div key={s.label} className="card p-4">
          <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
            {s.count}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {staff.map((s) => (
        <div key={s.id} className="card p-5 flex items-start gap-4">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: s.status === "present" ? "#dcfce7" : "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: s.status === "present" ? "#16a34a" : "#dc2626",
              }}
            >
              {s.name.split(" ").slice(-1)[0][0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {s.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
              {s.role} · {s.subject}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {s.classes.map((c) => (
                <span
                  key={c}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: "#eef2ff",
                    color: "var(--brand)",
                    padding: "2px 8px",
                    borderRadius: 99,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              <a
                href={`tel:${s.phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <Phone className="w-3 h-3" />
                {s.phone}
              </a>
            </div>
          </div>
          <span className={`pill status-${s.status}`}>
            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── EVENTS VIEW ──────────────────────────────────────────────────────────────
const EventsView = ({ events }) => {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const colorMap = {
    emerald: { bg: "#dcfce7", color: "#16a34a" },
    blue: { bg: "#dbeafe", color: "#2563eb" },
    purple: { bg: "#ede9fe", color: "#7c3aed" },
    red: { bg: "#fee2e2", color: "#dc2626" },
    amber: { bg: "#fef9c3", color: "#b45309" },
    slate: { bg: "#f1f5f9", color: "#475569" },
  };
  const typeIcons = {
    event: Star,
    meeting: Users,
    concert: Music,
    deadline: AlertCircle,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          School Calendar & Events
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((ev) => {
          const d = new Date(ev.date);
          const daysAway = Math.round((d - new Date()) / 86400000);
          const c = colorMap[ev.color] || colorMap.slate;
          const Icon = typeIcons[ev.type] || Calendar;
          return (
            <div key={ev.id} className="card p-4 flex items-center gap-4">
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: c.bg,
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: c.color,
                    lineHeight: 1,
                  }}
                >
                  {d.getDate()}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: c.color,
                    letterSpacing: ".06em",
                  }}
                >
                  {d.toLocaleDateString("en", { month: "short" }).toUpperCase()}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: c.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                >
                  {ev.title}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {ev.time} · {ev.description}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 99,
                  background:
                    daysAway < 0 ? "#f1f5f9" : daysAway <= 2 ? "#fee2e2" : c.bg,
                  color:
                    daysAway < 0
                      ? "#94a3b8"
                      : daysAway <= 2
                        ? "#dc2626"
                        : c.color,
                  flexShrink: 0,
                }}
              >
                {daysAway < 0
                  ? "Past"
                  : daysAway === 0
                    ? "Today"
                    : daysAway === 1
                      ? "Tomorrow"
                      : `In ${daysAway} days`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EducationDashboard;
