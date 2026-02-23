import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import Templates from "./Templates";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getFunctions, httpsCallable } from "firebase/functions";
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
import StudentModal from "./StudentModal";
import StudentsListModal from "./StudentsListModal";
import SignatureStamp from "../SignatureStamp";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  CreditCard,
  X,
  Edit,
  Sparkles,
  LogOut,
  CheckSquare,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  Upload,
  School,
  UserCheck,
  Eye,
  Star,
  Activity,
} from "lucide-react";

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
const functions = getFunctions();
const EducationDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("ReportCard");
  const [showReportCard, setShowReportCard] = useState(false);
  const { user, authUser } = useAuth();
  const [reportNumber, setReportNumber] = useState("");
  const [reportId, setReportId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [savedStudents, setSavedStudents] = useState([]);
  const [showStudentsListModal, setShowStudentsListModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [showPreview, setShowPreview] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [activeView, setActiveView] = useState("home");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });
  useEffect(() => {
    if (!user?.uid) return;

    const loadReportNumber = async () => {
      const nextReport = await generateReportCardNumber(user.uid);
      setReportNumber(nextReport);
    };

    loadReportNumber();
    loadSavedReports();
  }, [user]);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);
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

  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const loadStudent = (student) => {
    setStudentName(student.name || "");
    setStudentId(student.studentId || "");
    setGradeLevel(student.gradeLevel || "");
    setDateOfBirth(student.dateOfBirth || "");
    setParentName(student.parentName || "");
    setParentEmail(student.parentEmail || "");
    setParentPhone(student.parentPhone || "");
    setParentAddress(student.parentAddress || "");
  };

  const handleStudentSaved = () => {
    loadStudents();
  };

  useEffect(() => {
    loadStudents();
  }, []);

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
  const handleTestEmail = async () => {
    if (!schoolInfo.emailPassword) {
      alert("⚠️ Please enter your email app password first.");
      return;
    }

    const userEmail = user?.email || authUser?.email;

    if (!userEmail) {
      alert("⚠️ Could not find your email address. Please log in again.");
      return;
    }

    try {
      const testEmailData = {
        userId: user.uid,
        to: userEmail, // Send test to self
        subject: "✅ Test Email - Email Configuration Successful",
        message: `
Hello,

This is a test email from your construction quote/invoice system.

✓ Your email configuration is working correctly!

Account Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${schoolInfo.businessName}
Email: ${userEmail}
Provider: ${schoolInfo.emailProvider || "Gmail"}
Date: ${new Date().toLocaleString()}

You can now send quotes and invoices to your clients from this email address.

Best regards,
Your Construction Quote System
      `.trim(),
        documentType: "test",
        documentNumber: "TEST-001",
      };

      const sendEmail = httpsCallable(functions, "sendQuoteEmail");
      await sendEmail(testEmailData);

      alert(
        `✅ Test email sent successfully!\n\nCheck your inbox at: ${userEmail}`,
      );
    } catch (error) {
      console.error("Test email error:", error);

      let errorMsg = "❌ Test email failed!\n\n";
      if (error.message.includes("Invalid login")) {
        errorMsg +=
          "Your app password is incorrect. Please check and try again.\n\nMake sure you're using an APP PASSWORD, not your regular password.";
      } else {
        errorMsg += `Error: ${error.message}\n\nPlease check your app password and try again.`;
      }

      alert(errorMsg);
    }
  };
  const loadSavedStudents = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const studentsRef = collection(db, "users", user.uid, "students");
    const q = query(studentsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedStudents(students.filter((s) => !s._placeholder));
  };

  const handleSaveStudent = async () => {
    if (!user?.uid) return;

    if (!studentName || !gradeLevel) {
      alert("Please enter student name and grade level");
      return;
    }

    try {
      const db = getFirestore();
      const studentData = {
        name: studentName,
        studentId: studentId || `STU-${Date.now()}`,
        gradeLevel: gradeLevel,
        dateOfBirth: dateOfBirth,
        parentName: parentName,
        parentEmail: parentEmail,
        parentPhone: parentPhone,
        parentAddress: parentAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", user.uid, "students"), studentData);
      alert("Student saved successfully!");
      loadSavedStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student");
    }
  };

  const loadReportForExport = async () => {
    if (!user?.uid || !reportId) return null;

    const db = getFirestore();
    const snap = await getDoc(doc(db, "users", user.uid, "reports", reportId));

    return snap.exists() ? snap.data() : null;
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

  const calculateGrade = (mark) => {
    if (mark >= 80) return "A";
    if (mark >= 70) return "B";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";
    return "E";
  };

  const calculateAverage = () => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subject) => sum + subject.mark, 0);
    return (total / subjects.length).toFixed(1);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const [term, setTerm] = useState("Term 1");
  const [academicYear, setAcademicYear] = useState("2026");
  const [teacherComments, setTeacherComments] = useState(
    "John is a hardworking student who shows great enthusiasm for learning.",
  );
  const [attendanceDays, setAttendanceDays] = useState("65");
  const [attendancePresent, setAttendancePresent] = useState("63");

  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "SUNSHINE PRIMARY SCHOOL",
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

  useEffect(() => {
    if (user?.uid) {
      loadSchoolInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "schoolInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSchoolInfo(docSnap.data());
        } else {
          console.log("No school info found");
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolInfo();
  }, [user]);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  const loadSchoolInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "schoolInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSchoolInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading school info:", error);
    }
  };
  const handleProcessPayment = async () => {
    if (!reportId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, reportId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: reportId,
          ...invoiceData,
        });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice for payment");
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !reportId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 as default
        status: "pending",
      });
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, reportId),
      );

      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        setPaymentStatus({
          totalPaid: data.totals?.paid || 0,
          balanceDue: data.totals?.due || data.totals?.total || 0,
          status: data.status || "pending",
        });
      } else {
        setPaymentStatus({
          totalPaid: 0,
          balanceDue: 0, // ✅ Use 0 since no invoice exists
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 on error
        status: "pending",
      });
    }
  };

  const handlePaymentComplete = () => {
    loadSavedReports();
    loadPaymentStatus();
    setShowPaymentModal(false);
  };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !authUser) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setSchoolInfo((prev) => ({ ...prev, uploading: true }));

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setSchoolInfo((prev) => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));

      // Save URL to Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");

      await setDoc(
        docRef,
        {
          logoUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setSchoolInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleSaveSchoolInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "schoolInfo");
      await setDoc(docRef, schoolInfo);
      alert("School information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving school info:", error);
      alert("Failed to save school information");
    }
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

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    mark: "",
    comments: "",
  });

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

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const headerActions = [
    documentType === "quote" &&
      reportId && {
        label: "Convert to Invoice",
        icon: FileText,
        className:
          "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 transition-colors shadow-sm whitespace-nowrap",
      },
    {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      variant: "secondary",
    },
    {
      label: "New",
      icon: Plus,
      onClick: handleNewReport,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-lg hover:from-orange-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveReport,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-lg hover:from-amber-700 transition-colors shadow-sm whitespace-nowrap",
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg hover:from-red-700 transition-colors shadow-sm whitespace-nowrap",
    },
  ].filter(Boolean);

  const mobileDashboardActions = [
    documentType === "quote" &&
      reportId && {
        label: "To Invoice",
        icon: FileText,
        className:
          "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
      },
    {
      label: "Save",
      icon: Save,
      onClick: handleSaveReport,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Send",
      icon: Send,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "PDF",
      icon: Download,
      onClick: handleSavePDF,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 whitespace-nowrap",
    },
    {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap",
    },
  ].filter(Boolean);

  return (
    <div className="flex h-screen bg-gray-300">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar (Icon Only) */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4  rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

          <div className="w-10 border-t border-slate-600"></div>

          {/* Icon Navigation */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")} // ADD THIS
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="School Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Report Cards"
            >
              <ClipboardList className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveView("templates")}
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Templates"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Students"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Attendance"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Curriculum"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Assessments"
            >
              <Award className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Staff"
            >
              <UserCheck className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Icon at Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={schoolInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar (Full Width) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <img
                src={logo}
                alt="School Logo"
                className="w-16 h-12 object-contain rounded-lg"
              />
            </div>
            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>
            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500 rounded-lg cursor-pointer transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">School Overview</span>
              </div>

              {/* Report Cards Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm font-medium">Report Cards</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={() => {
                      setActiveView("reportCard");
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Create Report Card
                  </div>
                  <div
                    onClick={() => {
                      setShowReportsList(!showReportsList);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Reports</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedReports.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveView("templates");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 mt-2"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Templates</span>
              </div>

              {/* Students Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Students</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <div
                    onClick={() => {
                      handleAddNewStudent();
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Add Student
                  </div>
                  <div
                    onClick={() => {
                      setShowStudentsListModal(true);
                      setSidebarOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>All Students</span>
                      <span className=" text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {savedStudents.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Attendance</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Curriculum</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Assessments</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200">
                <UserCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Staff</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300">
              <img
                src={schoolInfo.logoUrl}
                alt="Business Logo"
                className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                {user?.name || "Teacher"}
              </div>
              <div className="text-xs text-slate-400">
                {user?.email || "teacher@school.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0 md:ml-16"}`}
      >
        <div className="flex-1 overflow-auto h-screen border-b-[25px] border-gray-800">
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
          />

          <div className="flex-1 overflow-y-auto">
            {showSettings && (
              <BusinessSettingsModal onClose={() => setShowSettings(false)} />
            )}

            <StudentsListModal
              showModal={showStudentsListModal}
              setShowModal={setShowStudentsListModal}
              students={students}
              onLoadStudent={loadStudent}
              onEditStudent={handleEditStudent}
              onAddNewStudent={handleAddNewStudent}
            />

            <StudentModal
              showModal={showStudentModal}
              setShowModal={setShowStudentModal}
              existingStudent={selectedStudent}
              onStudentSaved={handleStudentSaved}
            />

            {showReportsList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Saved Report Cards
                    </h2>
                    <button
                      onClick={() => setShowReportsList(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="overflow-auto p-4">
                    {savedReports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No saved report cards yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => loadReport(report)}
                            className="border rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">
                                  {report.reportNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Student: {report.student?.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Grade: {report.student?.gradeLevel || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Term: {report.academicInfo?.term || "N/A"}{" "}
                                  {report.academicInfo?.year || ""}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-indigo-600">
                                  Average: {report.performance?.average || "0"}%
                                </div>
                                <div className="text-sm text-gray-500">
                                  {report.academicInfo?.issueDate
                                    ? new Date(
                                        report.academicInfo.issueDate,
                                      ).toLocaleDateString("en-ZA")
                                    : "N/A"}
                                </div>
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded ${
                                    report.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {report.status || "draft"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === "templates" && <Templates user={user} />}
            {activeView === "home" && <HomeView user={user} />}
            {activeView === "reportCard" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <div
                    className={`${
                      showReportCard ? "hidden" : "block"
                    } space-y-6 lg:block print:hidden max-h-[calc(100vh-120px)] ml-12`}
                  >
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm pt-2 sm:pt-6">
                        <div className="flex border-b border-slate-200">
                          <button
                            onClick={() => setInputMode("manual")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "manual" ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                          >
                            <span className="flex items-center justify-center gap-1 sm:gap-2">
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span className="hidden sm:inline">
                                Manual Entry
                              </span>
                              <span className="sm:hidden">Manual</span>
                            </span>
                          </button>
                          <button
                            onClick={() => setInputMode("ai")}
                            className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-200 ${inputMode === "ai" ? "bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                          >
                            <span className="flex items-center justify-center gap-1 sm:gap-2">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">
                                AI Assistant
                              </span>
                              <span className="sm:hidden">AI</span>
                            </span>
                          </button>
                        </div>
                        <div className="p-3 sm:p-6">
                          {inputMode === "ai" && (
                            <AIInvoiceExtractor
                              onDataExtracted={handleAIDataExtracted}
                              documentType={documentType}
                            />
                          )}
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {inputMode === "ai" ? (
                          <AIInvoiceExtractor
                            onDataExtracted={handleAIDataExtracted}
                            documentType={documentType}
                          />
                        ) : null}
                      </div>
                    </div>
                    {inputMode === "manual" && (
                      <>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-indigo-700 text-sm font-medium">
                            {term} - {academicYear}
                          </span>
                          <span className="text-indigo-600">Academic Year</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Average Grade
                            </div>
                            <div className="text-2xl font-semibold text-indigo-600">
                              {calculateAverage()}%
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Subjects
                            </div>
                            <div className="text-2xl font-semibold text-green-600">
                              {subjects.length}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Attendance
                            </div>
                            <div className="text-2xl font-semibold text-blue-600">
                              {attendancePresent}/{attendanceDays}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center space-x-2">
                              <Users className="w-5 h-5" />
                              <span>Student Information</span>
                            </h2>
                            <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">
                                Student Name
                              </div>
                              <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                Student ID
                              </div>
                              <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                Grade Level
                              </div>
                              <input
                                type="text"
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                Date of Birth
                              </div>
                              <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center space-x-2">
                              <Users className="w-5 h-5" />
                              <span>Parent/Guardian Information</span>
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">
                                Parent Name
                              </div>
                              <input
                                type="text"
                                value={parentName}
                                onChange={(e) => setParentName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Email</div>
                              <input
                                type="email"
                                value={parentEmail}
                                onChange={(e) => setParentEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Phone</div>
                              <input
                                type="tel"
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <div className="text-sm text-gray-500">
                                Address
                              </div>
                              <input
                                type="text"
                                value={parentAddress}
                                onChange={(e) =>
                                  setParentAddress(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center space-x-2">
                              <Calendar className="w-5 h-5" />
                              <span>Academic Period</span>
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Term</div>
                              <select
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Term 1">Term 1</option>
                                <option value="Term 2">Term 2</option>
                                <option value="Term 3">Term 3</option>
                                <option value="Term 4">Term 4</option>
                              </select>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                Academic Year
                              </div>
                              <input
                                type="text"
                                value={academicYear}
                                onChange={(e) =>
                                  setAcademicYear(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Add Subject Grade
                          </h2>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <input
                              type="text"
                              placeholder="Subject Name"
                              value={newSubject.name}
                              onChange={(e) =>
                                setNewSubject({
                                  ...newSubject,
                                  name: e.target.value,
                                })
                              }
                              className="px-4 py-2 border rounded"
                            />

                            <input
                              type="number"
                              placeholder="Mark (%)"
                              min="0"
                              max="100"
                              value={newSubject.mark}
                              onChange={(e) =>
                                setNewSubject({
                                  ...newSubject,
                                  mark: e.target.value,
                                })
                              }
                              className="px-4 py-2 border rounded"
                            />

                            <input
                              type="text"
                              placeholder="Comments (optional)"
                              value={newSubject.comments}
                              onChange={(e) =>
                                setNewSubject({
                                  ...newSubject,
                                  comments: e.target.value,
                                })
                              }
                              className="px-4 py-2 border rounded"
                            />

                            <button
                              onClick={handleAddSubject}
                              className="bg-gray-500 text-gray-800 rounded-lg px-4 py-2 hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                              Attendance
                            </h2>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">
                                Total Days
                              </div>
                              <input
                                type="number"
                                value={attendanceDays}
                                onChange={(e) =>
                                  setAttendanceDays(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                Days Present
                              </div>
                              <input
                                type="number"
                                value={attendancePresent}
                                onChange={(e) =>
                                  setAttendancePresent(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                              Teacher Comments
                            </h2>
                          </div>

                          <textarea
                            value={teacherComments}
                            onChange={(e) => setTeacherComments(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter teacher comments about the student's performance..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    id="print-area"
                    className={`${!showReportCard ? "hidden lg:block" : "block"} mx-auto bg-white print:block`}
                    style={{ width: "210mm", minHeight: "297mm" }}
                  >
                    {activeView === "reportCard" && (
                      <>
                        {/* Add Template Selector */}
                        <div className="mb-4 print:hidden">
                          <TemplateSelector
                            user={user}
                            selectedTemplate={selectedTemplate}
                            onTemplateChange={setSelectedTemplate}
                          />
                        </div>

                        {/* Use Template Renderer instead of hardcoded report card */}
                        <TemplateRenderer
                          templateId={selectedTemplate}
                          businessInfo={schoolInfo}
                          loading={loading}
                          jobCardNumber={reportNumber}
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
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationDashboard;
