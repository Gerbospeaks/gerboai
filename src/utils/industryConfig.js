// src/utils/industryConfig.js

export const INDUSTRY_CONFIG = {
  accounting: {
    extraFields: {},
    itemCategories: ["Service", "Consulting", "Other"],
    promptHint: "Focus on hours, retainers, tax services and financial consulting.",
    jsonExtra: "",
  },
  mechanics: {
    extraFields: {
      vehicle: { make: "", model: "", year: "", plate: "", vin: "" },
    },
    itemCategories: ["Labour", "Parts", "Service", "Other"],
    promptHint: "Extract vehicle details (make, model, year, plate, VIN) from the prompt.",
    jsonExtra: `"vehicle": {"make": "Toyota", "model": "Hilux", "year": "2019", "plate": "ABC 123 GP", "vin": null},`,
  },
  healthcare: {
    extraFields: {
      patient: { name: "", dob: "", medicalAid: "", memberNumber: "" },
    },
    itemCategories: ["Consultation", "Procedure", "Medication", "Service", "Other"],
    promptHint: "Extract patient details, medical aid info, procedure codes and consultation fees.",
    jsonExtra: `"patient": {"name": null, "dob": null, "medicalAid": null, "memberNumber": null},`,
  },
  construction: {
    extraFields: {
      site: { address: "", projectName: "", startDate: "", endDate: "" },
    },
    itemCategories: ["Labour", "Material", "Equipment", "Service", "Other"],
    promptHint: "Extract site address, project name, materials and labour details.",
    jsonExtra: `"site": {"address": null, "projectName": null, "startDate": null, "endDate": null},`,
  },
  electrical: {
    extraFields: {
      site: { address: "", jobType: "" },
    },
    itemCategories: ["Labour", "Material", "Parts", "Service", "Other"],
    promptHint: "Extract job site address, electrical work type, parts and labour.",
    jsonExtra: `"site": {"address": null, "jobType": null},`,
  },
  plumbing: {
    extraFields: {
      site: { address: "", jobType: "" },
    },
    itemCategories: ["Labour", "Material", "Parts", "Service", "Other"],
    promptHint: "Extract job site, plumbing work type, parts and labour hours.",
    jsonExtra: `"site": {"address": null, "jobType": null},`,
  },
  legal: {
    extraFields: {
      matter: { caseNumber: "", matterDescription: "", court: "" },
    },
    itemCategories: ["Consultation", "Appearance", "Research", "Disbursement", "Other"],
    promptHint: "Extract matter/case details, appearance fees, consultation hours and disbursements.",
    jsonExtra: `"matter": {"caseNumber": null, "matterDescription": null, "court": null},`,
  },
  hotel: {
    extraFields: {
      booking: { roomNumber: "", checkIn: "", checkOut: "", guests: "" },
    },
    itemCategories: ["Accommodation", "Food", "Service", "Other"],
    promptHint: "Extract room number, check-in/out dates, number of guests and services used.",
    jsonExtra: `"booking": {"roomNumber": null, "checkIn": null, "checkOut": null, "guests": null},`,
  },
  restaurant: {
    extraFields: {
      order: { tableNumber: "", covers: "" },
    },
    itemCategories: ["Food", "Beverage", "Service", "Other"],
    promptHint: "Extract table number, number of covers, food and beverage items.",
    jsonExtra: `"order": {"tableNumber": null, "covers": null},`,
  },
  photography: {
    extraFields: {
      shoot: { eventType: "", date: "", location: "", hours: "" },
    },
    itemCategories: ["Shoot", "Editing", "Prints", "Travel", "Other"],
    promptHint: "Extract event type, shoot date, location, hours and deliverables.",
    jsonExtra: `"shoot": {"eventType": null, "date": null, "location": null, "hours": null},`,
  },
  logistics: {
    extraFields: {
      shipment: { from: "", to: "", weight: "", trackingNumber: "" },
    },
    itemCategories: ["Transport", "Handling", "Storage", "Service", "Other"],
    promptHint: "Extract pickup/delivery addresses, weight, distance and handling fees.",
    jsonExtra: `"shipment": {"from": null, "to": null, "weight": null, "trackingNumber": null},`,
  },
  towing: {
    extraFields: {
      vehicle: { make: "", model: "", plate: "", fromLocation: "", toLocation: "" },
    },
    itemCategories: ["Towing", "Labour", "Storage", "Other"],
    promptHint: "Extract vehicle details, pickup and drop-off locations and towing fees.",
    jsonExtra: `"vehicle": {"make": null, "model": null, "plate": null, "fromLocation": null, "toLocation": null},`,
  },
  solar: {
    extraFields: {
      installation: { address: "", systemSize: "", panelCount: "", inverterType: "" },
    },
    itemCategories: ["Equipment", "Labour", "Material", "Service", "Other"],
    promptHint: "Extract installation address, system size in kW, panel count and inverter type.",
    jsonExtra: `"installation": {"address": null, "systemSize": null, "panelCount": null, "inverterType": null},`,
  },
  cleaning: {
    extraFields: {
      job: { address: "", jobType: "", frequency: "" },
    },
    itemCategories: ["Labour", "Supplies", "Service", "Other"],
    promptHint: "Extract cleaning address, job type (residential/commercial) and frequency.",
    jsonExtra: `"job": {"address": null, "jobType": null, "frequency": null},`,
  },
  landscaping: {
    extraFields: {
      job: { address: "", jobType: "" },
    },
    itemCategories: ["Labour", "Plants", "Material", "Equipment", "Other"],
    promptHint: "Extract property address, landscaping type, plants and equipment used.",
    jsonExtra: `"job": {"address": null, "jobType": null},`,
  },
  security: {
    extraFields: {
      job: { siteAddress: "", guardCount: "", shiftHours: "" },
    },
    itemCategories: ["Labour", "Equipment", "Service", "Other"],
    promptHint: "Extract site address, number of guards, shift hours and equipment.",
    jsonExtra: `"job": {"siteAddress": null, "guardCount": null, "shiftHours": null},`,
  },
  realestate: {
    extraFields: {
      property: { address: "", propertyType: "", transactionType: "" },
    },
    itemCategories: ["Commission", "Service", "Disbursement", "Other"],
    promptHint: "Extract property address, type, transaction type and commission details.",
    jsonExtra: `"property": {"address": null, "propertyType": null, "transactionType": null},`,
  },
  // default fallback for any industry not listed
  default: {
    extraFields: {},
    itemCategories: ["Service", "Product", "Labour", "Material", "Other"],
    promptHint: "",
    jsonExtra: "",
  },
};

export const getIndustryConfig = (industry) =>
  INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.default;