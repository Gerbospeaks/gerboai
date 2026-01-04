
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
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
import { db } from "../firebase";
import PatientModal from './PatientModal';
import PatientsListModal from './PatientsListModal';
import {
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  Activity,
  FileBarChart,
  BarChart3,
  Menu,
  Plus,
  Send,
  Edit,
  LogOut,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Receipt,
  Wallet,
  PieChart,
  Heart,
  ClipboardList,
  Package,
  Stethoscope,
  Upload,
  Pill,
  UserCheck,
} from "lucide-react";

const generateInvoiceNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();

  const invoicesRef = collection(db, "users", userId, "invoices");
  const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let lastNumber = 1000;

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    const match = lastInvoice.invoiceNumber?.match(/(\d+)$/);

    if (match) {
      lastNumber = Number(match[1]);
    }
  }

  const nextNumber = lastNumber + 1;
  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const HealthcareDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [showInvoice, setShowInvoice] = useState(false);
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [savedPatients, setSavedPatients] = useState([]);
  const [showPatientsListModal, setShowPatientsListModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const loadInvoiceNumber = async () => {
      const nextInvoice = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(nextInvoice);
    };

    loadInvoiceNumber();
    loadSavedInvoices();
  }, [user]);

  const loadPatients = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "patients"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const patientsData = [];
      
      querySnapshot.forEach((doc) => {
        patientsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadSavedInvoices = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedInvoices(invoices);
  };

  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const loadPatient = (patient) => {
    setPatientName(patient.name || "");
    setPatientEmail(patient.email || "");
    setPatientPhone(patient.phone || "");
    setPatientAddress(patient.address || "");
    setPatientId(patient.patientId || "");
    setPatientDOB(patient.dateOfBirth || "");
    setPatientGender(patient.gender || "");
    setInsuranceProvider(patient.insuranceProvider || "");
    setInsuranceNumber(patient.insuranceNumber || "");
  };

  const handlePatientSaved = () => {
    loadPatients();
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadInvoice = (invoice) => {
    setInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber || "");
    setPatientName(invoice.patient?.name || "");
    setPatientEmail(invoice.patient?.email || "");
    setPatientPhone(invoice.patient?.phone || "");
    setPatientAddress(invoice.patient?.address || "");
    setPatientId(invoice.patient?.patientId || "");
    setPatientDOB(invoice.patient?.dateOfBirth || "");
    setPatientGender(invoice.patient?.gender || "");
    setInsuranceProvider(invoice.patient?.insuranceProvider || "");
    setInsuranceNumber(invoice.patient?.insuranceNumber || "");
    setDiagnosis(invoice.medical?.diagnosis || "");
    setTreatmentPlan(invoice.medical?.treatmentPlan || "");
    setPrescription(invoice.medical?.prescription || "");
    setItems(invoice.items || []);
    setShowInvoicesList(false);
  };

  const loadSavedPatients = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    const patientsRef = collection(db, "users", user.uid, "patients");
    const q = query(patientsRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    const patients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedPatients(patients.filter(p => !p._placeholder));
  };

  const handleSavePatient = async () => {
    if (!user?.uid) return;
    
    if (!patientName || !patientPhone) {
      alert("Please enter patient name and phone number");
      return;
    }

    try {
      const db = getFirestore();
      const patientData = {
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        address: patientAddress,
        patientId: patientId || `PAT-${Date.now()}`,
        dateOfBirth: patientDOB,
        gender: patientGender,
        insuranceProvider,
        insuranceNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "users", user.uid, "patients"), patientData);
      alert("Patient saved successfully!");
      loadSavedPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Failed to save patient");
    }
  };

  const loadInvoiceForExport = async () => {
    if (!user?.uid || !invoiceId) return null;

    const db = getFirestore();
    const snap = await getDoc(
      doc(db, "users", user.uid, "invoices", invoiceId)
    );

    return snap.exists() ? snap.data() : null;
  };

  const handleSavePDF = async () => {
    const savedInvoice = await loadInvoiceForExport();

    if (!savedInvoice) {
      alert("Please save the invoice before exporting PDF");
      return;
    }

    setInvoiceNumber(savedInvoice.invoiceNumber);
    setItems(savedInvoice.items);
    setPatientName(savedInvoice.patient.name);
    setPatientEmail(savedInvoice.patient.email);
    setPatientPhone(savedInvoice.patient.phone);
    setPatientAddress(savedInvoice.patient.address);
    setDiagnosis(savedInvoice.medical.diagnosis);
    setTreatmentPlan(savedInvoice.medical.treatmentPlan);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;

    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);

    const item = {
      description: newItem.description,
      type: newItem.type || "Service",
      rate,
      qty,
      amount: rate * qty,
    };

    setItems((prev) => [...prev, item]);
    setNewItem({ description: "", rate: "", qty: "", type: "Service" });
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

  const [patientName, setPatientName] = useState("Sarah Johnson");
  const [patientId, setPatientId] = useState("PAT-2024-1234");
  const [patientEmail, setPatientEmail] = useState("sarah.johnson@example.com");
  const [patientPhone, setPatientPhone] = useState("082 123 4567");
  const [patientAddress, setPatientAddress] = useState("123 Main Street, Pretoria, 0001");
  const [patientDOB, setPatientDOB] = useState("1985-05-15");
  const [patientGender, setPatientGender] = useState("Female");
  const [insuranceProvider, setInsuranceProvider] = useState("Discovery Health");
  const [insuranceNumber, setInsuranceNumber] = useState("DH123456789");
  const [diagnosis, setDiagnosis] = useState("Annual Health Checkup");
  const [treatmentPlan, setTreatmentPlan] = useState("Routine examination and blood work");
  const [prescription, setPrescription] = useState("");

  const [facilityInfo, setFacilityInfo] = useState({
    facilityName: "WELLNESS MEDICAL CENTER",
    addressLine1: "9-10 CNR THIRD & MAIN AVENUE",
    addressLine2: "MEDICAL PARK",
    city: "PRETORIA",
    postalCode: "0001",
    primaryPhone: "012 345 6789",
    secondaryPhone: "082 123 4567",
    practiceName: "Dr. John Smith & Associates",
    practiceNumber: "MP123456",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadFacilityInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchFacilityInfo = async () => {
      if (!user?.uid) return;

      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFacilityInfo(docSnap.data());
        } else {
          console.log("No facility info found");
        }
      } catch (error) {
        console.error("Error fetching facility info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityInfo();
  }, [user]);

  const loadFacilityInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFacilityInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading facility info:", error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/logo/${file.name}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setFacilityInfo({ ...facilityInfo, logoUrl: downloadURL });
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    }
  };

  const handleSaveFacilityInfo = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "facilityInfo");
      await setDoc(docRef, facilityInfo);
      alert("Facility information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving facility info:", error);
      alert("Failed to save facility information");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    window.print();
  };

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Service",
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const buildInvoicePayload = (numberToUse) => ({
    invoiceNumber: numberToUse,
    locked: true,
    status: "pending",

    dates: {
      serviceDate: new Date().toISOString(),
      completedDate: null,
    },

    patient: {
      name: patientName,
      email: patientEmail,
      phone: patientPhone,
      address: patientAddress,
      patientId,
      dateOfBirth: patientDOB,
      gender: patientGender,
      insuranceProvider,
      insuranceNumber,
    },

    medical: {
      diagnosis,
      treatmentPlan,
      prescription,
    },

    items,

    totals: {
      subtotal,
      vat,
      total,
      paid: 0,
      due: total,
    },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveInvoice = async () => {
    if (!user?.uid) return;

    const db = getFirestore();
    let numberToUse = invoiceNumber;

    if (!invoiceId) {
      numberToUse = await generateInvoiceNumber(user.uid);
      setInvoiceNumber(numberToUse);
    }

    const invoiceData = buildInvoicePayload(numberToUse);

    if (invoiceId) {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData
      );
      setInvoiceId(ref.id);
    }

    alert("Invoice saved and locked");
    loadSavedInvoices();
  };

  const handleNewInvoice = () => {
    setInvoiceId(null);
    setInvoiceNumber("");
    setPatientName("Sarah Johnson");
    setPatientId("PAT-2024-1234");
    setPatientEmail("sarah.johnson@example.com");
    setPatientPhone("082 123 4567");
    setPatientAddress("123 Main Street, Pretoria, 0001");
    setPatientDOB("1985-05-15");
    setPatientGender("Female");
    setInsuranceProvider("Discovery Health");
    setInsuranceNumber("DH123456789");
    setDiagnosis("Annual Health Checkup");
    setTreatmentPlan("Routine examination and blood work");
    setPrescription("");
    setItems([]);

    const loadNewNumber = async () => {
      if (user?.uid) {
        const nextInvoice = await generateInvoiceNumber(user.uid);
        setInvoiceNumber(nextInvoice);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-slate-900 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">
              Healthcare Pro
            </span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          <nav className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <TrendingUp className="w-5 h-5" />
                <span>Practice Overview</span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5" />
                    <span>Invoices</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="ml-8 mt-1 space-y-1">
                  <div
                    onClick={handleNewInvoice}
                    className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Create Invoice
                  </div>
                  <div
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    All Invoices ({savedInvoices.length})
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer">
                    Pending Payment
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer mt-2">
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </div>
              <div className="ml-8 mt-1 space-y-1">
                <div 
                  onClick={handleAddNewPatient}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer mt-2"
                >
                  <span>Add Patient</span>
                </div>
                <div
                  onClick={() => setShowPatientsListModal(true)}
                  className="px-3 py-2 text-sm text-gray-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  All Patients ({savedPatients.length})
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Stethoscope className="w-5 h-5" />
                <span>Medical Records</span>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <Pill className="w-5 h-5" />
                <span>Prescriptions</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileBarChart className="w-5 h-5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </nav>
        </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.name || "Dr. User"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "doctor@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ChevronLeft className="hidden lg:block w-5 h-5 text-gray-400" />
              <h1 className="text-base lg:text-xl font-semibold">
                Invoice #{invoiceNumber || "— not saved yet —"}
              </h1>
            </div>

            <div className="hidden lg:flex items-center space-x-3 print:hidden">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <CheckSquare className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Invoice
              </button>

              <button
                onClick={handleNewInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save as PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border-b border-gray-200 px-4 lg:px-6 overflow-x-auto print:hidden">
          <div className="flex space-x-4 lg:space-x-8 min-w-max">
            {["Invoice", "Medical", "History", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 ${
                  activeTab === tab
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Facility Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Facility Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Facility Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {facilityInfo.logoUrl ? (
                          <img
                            src={facilityInfo.logoUrl}
                            alt="Facility Logo"
                            className="w-24 h-24 object-contain border rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                          >
                            {facilityInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended: Square image, max 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Facility Name
                      </label>
                      <input
                        type="text"
                        value={facilityInfo.facilityName}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            facilityName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Practice Name
                      </label>
                      <input
                        type="text"
                        value={facilityInfo.practiceName}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            practiceName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Practice Number
                      </label>
                      <input
                        type="text"
                        value={facilityInfo.practiceNumber}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            practiceNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={facilityInfo.addressLine1}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={facilityInfo.addressLine2}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={facilityInfo.city}
                          onChange={(e) =>
                            setFacilityInfo({
                              ...facilityInfo,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={facilityInfo.postalCode}
                          onChange={(e) =>
                            setFacilityInfo({
                              ...facilityInfo,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={facilityInfo.primaryPhone}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            primaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Secondary Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={facilityInfo.secondaryPhone}
                        onChange={(e) =>
                          setFacilityInfo({
                            ...facilityInfo,
                            secondaryPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <button
                      onClick={handleSaveFacilityInfo}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Save Facility Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <PatientsListModal
            showModal={showPatientsListModal}
            setShowModal={setShowPatientsListModal}
            patients={patients}
            onLoadPatient={loadPatient}
            onEditPatient={handleEditPatient}
            onAddNewPatient={handleAddNewPatient}
          />

          <PatientModal
            showModal={showPatientModal}
            setShowModal={setShowPatientModal}
            existingPatient={selectedPatient}
            onPatientSaved={handlePatientSaved}
          />

          {/* Saved Invoices List Modal */}
          {showInvoicesList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Invoices</h2>
                  <button
                    onClick={() => setShowInvoicesList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-auto p-4">
                  {savedInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No saved invoices yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => loadInvoice(invoice)}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {invoice.invoiceNumber || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Patient: {invoice.patient?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Diagnosis: {invoice.medical?.diagnosis || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Insurance: {invoice.patient?.insuranceProvider || "N/A"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">
                                R{invoice.totals?.total?.toFixed(2) || "0.00"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.dates?.serviceDate
                                  ? new Date(invoice.dates.serviceDate).toLocaleDateString("en-ZA")
                                  : "N/A"}
                              </div>
                              <div
                                className={`text-xs mt-1 px-2 py-1 rounded ${
                                  invoice.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : invoice.status === "pending"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {invoice.status || "unknown"}
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

          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                showInvoice ? "hidden" : "block"
              } space-y-6 lg:block print:hidden`}
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">Pending Payment</span>
                <span className="text-blue-600">Created Today</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Paid</div>
                  <div className="text-2xl font-semibold text-green-600">
                    R0.00
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Balance Due</div>
                  <div className="text-2xl font-semibold text-red-600">
                    R{total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Patient Information</span>
                  </h2>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Patient Name</div>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Patient ID</div>
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <input
                      type="text"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <input
                      type="date"
                      value={patientDOB}
                      onChange={(e) => setPatientDOB(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Gender</div>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <input
                      type="text"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Insurance Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Insurance Provider</div>
                    <input
                      type="text"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Insurance Number</div>
                    <input
                      type="text"
                      value={insuranceNumber}
                      onChange={(e) => setInsuranceNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5" />
                    <span>Medical Information</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Diagnosis</div>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                      rows="2"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Treatment Plan</div>
                    <textarea
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                      rows="3"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Prescription</div>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                      rows="3"
                      placeholder="Medication details..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Service/Procedure</h2>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  >
                    <option value="Service">Service</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Medication">Medication</option>
                    <option value="Test">Test</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Rate"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, rate: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: e.target.value })
                    }
                    className="px-4 py-2 border rounded"
                  />

                  <button
                    onClick={handleAddItem}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Payment Terms</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Cash/Card/Medical Aid</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">Due on Service</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Refund Policy:</span>
                    <span className="font-medium">30 Days</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                !showInvoice ? "hidden" : "block"
              } lg:block mx-auto bg-white shadow-lg overflow-hidden`}
              style={{
                width: "100%",
                maxWidth: "210mm",
                minHeight: "297mm",
              }}
            >
              <div className="bg-white" style={{ padding: "15mm 20mm" }}>
                <div className="border-b-2 border-black pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {loading ? (
                          <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : facilityInfo.logoUrl ? (
                          <img
                            src={facilityInfo.logoUrl}
                            alt="Facility Logo"
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
                        )}
                        <div>
                          <div className="text-xl font-bold">
                            {facilityInfo.facilityName}
                          </div>
                          <div className="text-sm font-semibold">
                            {facilityInfo.practiceName}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <div>{facilityInfo.addressLine1}</div>
                        <div>{facilityInfo.addressLine2}</div>
                        <div>
                          {facilityInfo.city} {facilityInfo.postalCode}
                        </div>
                        <div className="mt-1">
                          T: {facilityInfo.primaryPhone}
                          {facilityInfo.secondaryPhone &&
                            `, ${facilityInfo.secondaryPhone}`}
                        </div>
                        <div>Practice No: {facilityInfo.practiceNumber}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold mb-4">INVOICE</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">INVOICE NO.</span>
                          <span>{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DATE</span>
                          <span>{new Date().toLocaleDateString("en-ZA")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">PATIENT ID</span>
                          <span>{patientId}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">SERVICE TYPE</span>
                          <span>MEDICAL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      PATIENT DETAILS
                    </div>
                    <div className="text-xs space-y-1">
                      <div><strong>Name:</strong> {patientName}</div>
                      <div><strong>DOB:</strong> {patientDOB}</div>
                      <div><strong>Gender:</strong> {patientGender}</div>
                      <div><strong>Phone:</strong> {patientPhone}</div>
                      <div><strong>Email:</strong> {patientEmail}</div>
                      <div className="text-xs leading-tight mt-2">
                        <strong>Address:</strong> {patientAddress}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-200 p-3">
                    <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
                      INSURANCE DETAILS
                    </div>
                    <div className="text-xs space-y-1">
                      <div><strong>Provider:</strong> {insuranceProvider}</div>
                      <div><strong>Policy No:</strong> {insuranceNumber}</div>
                      <div className="mt-4">
                        <strong>Diagnosis:</strong>
                        <div className="mt-1 text-xs">{diagnosis}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-300">
                        <th className="text-left px-2 py-1 font-bold">SERVICE DESCRIPTION</th>
                        <th className="text-center px-2 py-1 font-bold">QTY</th>
                        <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
                        <th className="text-right px-2 py-1 font-bold">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">{item.description}</td>
                          <td className="text-center px-2 py-2">{item.qty}</td>
                          <td className="text-right px-2 py-2">R {item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mb-6">
                  <div className="w-64 text-xs">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>VAT (15%):</span>
                      <span>R {vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold bg-blue-800 text-white px-2">
                      <span>TOTAL:</span>
                      <span>R {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <div className="font-semibold mb-1">HEALTHCARE PROVIDER SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                    <div className="text-xs text-gray-600 mt-1">Print Name: _________________</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">PATIENT SIGNATURE</div>
                    <div className="border-b border-black h-8"></div>
                    <div className="text-xs text-gray-600 mt-1">Date: {new Date().toLocaleDateString("en-ZA")}</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
                  <div className="text-blue-600 font-bold text-xs mb-2">
                    PAYMENT INFORMATION
                  </div>
                  <div className="text-xs space-y-1">
                    <div><span className="font-semibold">Bank Name:</span> First National Bank</div>
                    <div><span className="font-semibold">Account Holder:</span> Wellness Medical Center</div>
                    <div><span className="font-semibold">Account Number:</span> 62146991441</div>
                    <div><span className="font-semibold">Branch Code:</span> 250655</div>
                  </div>
                </div>

                {prescription && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 mb-4">
                    <div className="text-yellow-800 font-bold text-xs mb-2">
                      PRESCRIPTION
                    </div>
                    <div className="text-xs whitespace-pre-line">{prescription}</div>
                  </div>
                )}

                <div className="text-center text-xs text-blue-600 italic">
                  Please retain this invoice for your medical records and insurance claims
                </div>
              </div>
            </div>

            <style>{`
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  width: 100% !important;
                  height: 100% !important;
                }
                
                @page {
                  size: A4;
                  margin: 0;
                }
                
                .print\\:hidden {
                  display: none !important;
                }
                
                div[class*="border-b"][class*="border-gray"] {
                  display: none !important;
                }
                
                nav,
                [class*="sidebar"],
                [class*="bg-slate-900"],
                button:not([style]) {
                  display: none !important;
                }
                
                .space-y-6 {
                  display: none !important;
                }
                
                .flex.h-screen {
                  display: block !important;
                  height: auto !important;
                }
                
                .flex-1 {
                  display: block !important;
                  overflow: visible !important;
                }
                
                .grid.grid-cols-1 {
                  display: block !important;
                  grid-template-columns: none !important;
                }
                
                div[style*="210mm"] {
                  display: block !important;
                  width: 210mm !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  page-break-after: avoid !important;
                }
                
                .bg-white {
                  background: white !important;
                  box-shadow: none !important;
                }
                
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                }
                
                tr, td, th {
                  page-break-inside: avoid !important;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;