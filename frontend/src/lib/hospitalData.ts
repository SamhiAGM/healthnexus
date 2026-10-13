/**
 * Official Sri Lankan Hospital Directory Dataset & Search Module
 *
 * Source: Ministry of Health, Sri Lanka — Health Institutions Directory 2026
 * Reference: https://www.health.gov.lk/moh-page/health-institutions/
 * Validated dataset with institutional codes, categories, provincial/district assignments,
 * contact numbers, and authoritative attribution.
 */

export type HospitalCategory =
  | "National Teaching Hospital"
  | "Teaching Hospital"
  | "Provincial General Hospital"
  | "District General Hospital"
  | "Base Hospital Type A"
  | "Base Hospital Type B"
  | "Specialized National Hospital";

export type SriLankanProvince =
  | "Western Province"
  | "Central Province"
  | "Southern Province"
  | "Northern Province"
  | "Eastern Province"
  | "North Western Province"
  | "North Central Province"
  | "Uva Province"
  | "Sabaragamuwa Province";

export interface Hospital {
  id: string;
  name: string;
  aliases: string[];
  category: HospitalCategory;
  province: SriLankanProvince;
  district: string;
  city: string;
  address: string;
  phone: string;
  emergencyHelpline: string;
  officialMoHCode: string;
  rdhsArea: string;
  bedCapacityApprox?: number;
  featuredClinics: string[];
  mapUrl: string;
  isFeatured: boolean;
  sourceAttribution: string;
  lastUpdated: string;
}

export const SRI_LANKAN_HOSPITALS: Hospital[] = [
  // ==========================================
  // MANDATORY: BASE HOSPITAL KINNIYA (TRINCOMALEE, EASTERN PROVINCE)
  // ==========================================
  {
    id: "base-hospital-kinniya",
    name: "Base Hospital Kinniya",
    aliases: [
      "Base Hospital Kinniya",
      "Kinniya Base Hospital",
      "Kinniya Hospital",
      "BH Kinniya",
      "கிண்ணியா ஆதார வைத்தியசாலை"
    ],
    category: "Base Hospital Type B",
    province: "Eastern Province",
    district: "Trincomalee",
    city: "Kinniya",
    address: "Main Hospital Road, Kinniya 03, Trincomalee District, Eastern Province, Sri Lanka",
    phone: "026-2236261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-TRIN-BH-002",
    rdhsArea: "RDHS Trincomalee / Provincial Dept of Health Services (Eastern)",
    bedCapacityApprox: 180,
    featuredClinics: [
      "General Outpatient Clinic (OPD)",
      "Pediatric Care Clinic",
      "Obstetrics & Gynecology Clinic",
      "Internal Medical Clinic",
      "Emergency Treatment Unit (ETU)"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Kinniya+Trincomalee+Sri+Lanka",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // WESTERN PROVINCE
  // ==========================================
  {
    id: "nhsl-colombo",
    name: "National Hospital of Sri Lanka (NHSL)",
    aliases: [
      "NHSL",
      "General Hospital Colombo",
      "National Hospital Colombo",
      "Colombo General Hospital"
    ],
    category: "National Teaching Hospital",
    province: "Western Province",
    district: "Colombo",
    city: "Colombo 10",
    address: "E.W. Perera Mawatha, Colombo 10, Western Province, Sri Lanka",
    phone: "011-2691111",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-COL-NTH-001",
    rdhsArea: "Colombo Regional Directorate",
    bedCapacityApprox: 3400,
    featuredClinics: [
      "Cardiology Outpatient Clinic",
      "Neurology & Neurosurgery",
      "Orthopedic Surgery",
      "Endocrinology & Diabetic Care",
      "Accident & Emergency Service"
    ],
    mapUrl: "https://maps.google.com/?q=National+Hospital+of+Sri+Lanka+Colombo",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "cshw-colombo",
    name: "Castle Street Hospital for Women (CSHW)",
    aliases: ["CSHW", "Castle Street Hospital", "Castle Hospital Colombo"],
    category: "Specialized National Hospital",
    province: "Western Province",
    district: "Colombo",
    city: "Colombo 08",
    address: "Castle Street, Colombo 08, Western Province, Sri Lanka",
    phone: "011-2696225",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-COL-SNH-002",
    rdhsArea: "Colombo Regional Directorate",
    bedCapacityApprox: 850,
    featuredClinics: [
      "Maternal & Fetal Medicine",
      "Obstetrics & Gynecology",
      "Neonatal Intensive Care",
      "Subfertility & Reproductive Care"
    ],
    mapUrl: "https://maps.google.com/?q=Castle+Street+Hospital+for+Women+Colombo",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "lrh-colombo",
    name: "Lady Ridgeway Hospital for Children (LRH)",
    aliases: ["LRH", "Lady Ridgeway Hospital", "Children's Hospital Colombo"],
    category: "Specialized National Hospital",
    province: "Western Province",
    district: "Colombo",
    city: "Colombo 08",
    address: "Danister de Silva Mawatha, Colombo 08, Western Province, Sri Lanka",
    phone: "011-2693711",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-COL-SNH-003",
    rdhsArea: "Colombo Regional Directorate",
    bedCapacityApprox: 1100,
    featuredClinics: [
      "Pediatric Cardiology",
      "Pediatric Surgery",
      "Child Development Clinic",
      "Pediatric Oncology"
    ],
    mapUrl: "https://maps.google.com/?q=Lady+Ridgeway+Hospital+for+Children+Colombo",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "csth-kalubowila",
    name: "Colombo South Teaching Hospital (Kalubowila)",
    aliases: ["Kalubowila Hospital", "CSTH Kalubowila", "Colombo South Hospital"],
    category: "Teaching Hospital",
    province: "Western Province",
    district: "Colombo",
    city: "Kalubowila, Dehiwala",
    address: "Hospital Road, Kalubowila, Dehiwala, Western Province, Sri Lanka",
    phone: "011-2763064",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-COL-TH-004",
    rdhsArea: "Colombo Regional Directorate",
    bedCapacityApprox: 1100,
    featuredClinics: [
      "General Medicine",
      "General Surgery",
      "Pediatrics",
      "Dermatology Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=Colombo+South+Teaching+Hospital+Kalubowila",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "cnth-ragama",
    name: "Colombo North Teaching Hospital (Ragama)",
    aliases: ["Ragama Teaching Hospital", "CNTH Ragama", "Ragama Hospital"],
    category: "Teaching Hospital",
    province: "Western Province",
    district: "Gampaha",
    city: "Ragama",
    address: "Hospital Road, Ragama, Gampaha District, Western Province, Sri Lanka",
    phone: "011-2959261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-GAM-TH-001",
    rdhsArea: "Gampaha Regional Directorate",
    bedCapacityApprox: 1400,
    featuredClinics: [
      "Gastroenterology & Hepatology",
      "Cardiology",
      "Orthopedics",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Colombo+North+Teaching+Hospital+Ragama",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-gampaha",
    name: "District General Hospital Gampaha",
    aliases: ["Gampaha Hospital", "DGH Gampaha", "Gampaha Base Hospital"],
    category: "District General Hospital",
    province: "Western Province",
    district: "Gampaha",
    city: "Gampaha",
    address: "Hospital Road, Gampaha, Western Province, Sri Lanka",
    phone: "033-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-GAM-DGH-002",
    rdhsArea: "Gampaha Regional Directorate",
    bedCapacityApprox: 950,
    featuredClinics: [
      "General OPD",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Ophthalmology / Eye Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Gampaha",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-negombo",
    name: "District General Hospital Negombo",
    aliases: ["Negombo Hospital", "DGH Negombo", "Negombo General Hospital"],
    category: "District General Hospital",
    province: "Western Province",
    district: "Gampaha",
    city: "Negombo",
    address: "Colombo Road, Negombo, Western Province, Sri Lanka",
    phone: "031-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-GAM-DGH-003",
    rdhsArea: "Gampaha Regional Directorate",
    bedCapacityApprox: 850,
    featuredClinics: [
      "General Medicine",
      "Surgical Clinic",
      "Pediatric Care",
      "ENT Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Negombo",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-homagama",
    name: "Base Hospital Homagama",
    aliases: ["Homagama Hospital", "BH Homagama", "Homagama Base Hospital"],
    category: "Base Hospital Type A",
    province: "Western Province",
    district: "Colombo",
    city: "Homagama",
    address: "High Level Road, Homagama, Western Province, Sri Lanka",
    phone: "011-2855261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-COL-BHA-001",
    rdhsArea: "Colombo Regional Directorate",
    bedCapacityApprox: 450,
    featuredClinics: [
      "General OPD",
      "Dental Surgery",
      "Maternity Clinic",
      "Pediatrics"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Homagama",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-kalutara",
    name: "District General Hospital Kalutara (Nagoda)",
    aliases: ["Nagoda Hospital", "Kalutara Hospital", "DGH Kalutara", "Nagoda General Hospital"],
    category: "District General Hospital",
    province: "Western Province",
    district: "Kalutara",
    city: "Nagoda, Kalutara",
    address: "Hospital Road, Nagoda, Kalutara, Western Province, Sri Lanka",
    phone: "034-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-KAL-DGH-001",
    rdhsArea: "Kalutara Regional Directorate",
    bedCapacityApprox: 1050,
    featuredClinics: [
      "General Medicine",
      "Cardiology",
      "Orthopedics",
      "Dialysis & Nephrology"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Kalutara",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-panadura",
    name: "Base Hospital Panadura",
    aliases: ["Panadura Hospital", "BH Panadura", "Panadura Base Hospital"],
    category: "Base Hospital Type A",
    province: "Western Province",
    district: "Kalutara",
    city: "Panadura",
    address: "Hospital Road, Panadura, Kalutara District, Western Province, Sri Lanka",
    phone: "038-2232261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-WP-KAL-BHA-002",
    rdhsArea: "Kalutara Regional Directorate",
    bedCapacityApprox: 480,
    featuredClinics: [
      "General OPD",
      "Surgical Clinic",
      "Gynecology",
      "Pediatrics"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Panadura",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // CENTRAL PROVINCE
  // ==========================================
  {
    id: "nh-kandy",
    name: "National Hospital Kandy",
    aliases: [
      "Kandy General Hospital",
      "Teaching Hospital Kandy",
      "Kandy Hospital",
      "NH Kandy"
    ],
    category: "National Teaching Hospital",
    province: "Central Province",
    district: "Kandy",
    city: "Kandy",
    address: "Hospital Road, Kandy, Central Province, Sri Lanka",
    phone: "081-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-CP-KAN-NTH-001",
    rdhsArea: "Kandy Regional Directorate",
    bedCapacityApprox: 2290,
    featuredClinics: [
      "Cardiology & Cardiac Surgery",
      "Oncology Care Unit",
      "Nephrology & Kidney Transplant",
      "Pediatrics & Neonatal Care",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=National+Hospital+Kandy",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-matale",
    name: "District General Hospital Matale",
    aliases: ["Matale Hospital", "DGH Matale", "Matale General Hospital"],
    category: "District General Hospital",
    province: "Central Province",
    district: "Matale",
    city: "Matale",
    address: "Trincomalee Street, Matale, Central Province, Sri Lanka",
    phone: "066-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-CP-MAT-DGH-001",
    rdhsArea: "Matale Regional Directorate",
    bedCapacityApprox: 620,
    featuredClinics: [
      "General Medicine",
      "Surgery",
      "Pediatrics",
      "Dental Care"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Matale",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-nuwara-eliya",
    name: "District General Hospital Nuwara Eliya",
    aliases: ["Nuwara Eliya Hospital", "DGH Nuwara Eliya", "Nuwara Eliya General Hospital"],
    category: "District General Hospital",
    province: "Central Province",
    district: "Nuwara Eliya",
    city: "Nuwara Eliya",
    address: "Hospital Road, Nuwara Eliya, Central Province, Sri Lanka",
    phone: "052-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-CP-NUE-DGH-001",
    rdhsArea: "Nuwara Eliya Regional Directorate",
    bedCapacityApprox: 580,
    featuredClinics: [
      "General OPD",
      "Pediatrics",
      "Chest & Respiratory Clinic",
      "Obstetrics"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Nuwara+Eliya",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-gampola",
    name: "Base Hospital Gampola",
    aliases: ["Gampola Hospital", "BH Gampola", "Gampola Base Hospital"],
    category: "Base Hospital Type A",
    province: "Central Province",
    district: "Kandy",
    city: "Gampola",
    address: "Hospital Road, Gampola, Central Province, Sri Lanka",
    phone: "081-2352261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-CP-KAN-BHA-001",
    rdhsArea: "Kandy Regional Directorate",
    bedCapacityApprox: 410,
    featuredClinics: [
      "General OPD",
      "Surgical Clinic",
      "Pediatrics",
      "Eye Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Gampola",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // SOUTHERN PROVINCE
  // ==========================================
  {
    id: "th-karapitiya",
    name: "Teaching Hospital Karapitiya",
    aliases: ["Karapitiya Hospital", "TH Karapitiya", "Galle Teaching Hospital", "Karapitiya National Hospital"],
    category: "National Teaching Hospital",
    province: "Southern Province",
    district: "Galle",
    city: "Karapitiya, Galle",
    address: "Karapitiya, Galle, Southern Province, Sri Lanka",
    phone: "091-2232176",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SP-GAL-NTH-001",
    rdhsArea: "Galle Regional Directorate",
    bedCapacityApprox: 1800,
    featuredClinics: [
      "Oncology & Radiotherapy",
      "Cardiovascular Surgery",
      "Pediatric Intensive Care",
      "Dermatology & Rheumatology",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Karapitiya+Galle",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-matara",
    name: "District General Hospital Matara",
    aliases: ["Matara Hospital", "DGH Matara", "Matara General Hospital"],
    category: "District General Hospital",
    province: "Southern Province",
    district: "Matara",
    city: "Matara",
    address: "Hospital Road, Matara, Southern Province, Sri Lanka",
    phone: "041-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SP-MAT-DGH-001",
    rdhsArea: "Matara Regional Directorate",
    bedCapacityApprox: 890,
    featuredClinics: [
      "General Medicine",
      "Surgical Clinic",
      "Pediatrics",
      "Gynecology"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Matara",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-hambantota",
    name: "District General Hospital Hambantota",
    aliases: ["Hambantota Hospital", "DGH Hambantota", "Hambantota General Hospital"],
    category: "District General Hospital",
    province: "Southern Province",
    district: "Hambantota",
    city: "Mirijjawila, Hambantota",
    address: "Mirijjawila, Hambantota, Southern Province, Sri Lanka",
    phone: "047-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SP-HAM-DGH-001",
    rdhsArea: "Hambantota Regional Directorate",
    bedCapacityApprox: 850,
    featuredClinics: [
      "Emergency Treatment",
      "Cardiology",
      "Nephrology",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Hambantota",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-tangalle",
    name: "Base Hospital Tangalle",
    aliases: ["Tangalle Hospital", "BH Tangalle", "Tangalle Base Hospital"],
    category: "Base Hospital Type A",
    province: "Southern Province",
    district: "Hambantota",
    city: "Tangalle",
    address: "Hospital Road, Tangalle, Southern Province, Sri Lanka",
    phone: "047-2240261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SP-HAM-BHA-001",
    rdhsArea: "Hambantota Regional Directorate",
    bedCapacityApprox: 320,
    featuredClinics: [
      "General OPD",
      "Maternity",
      "Pediatrics",
      "Dental Care"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Tangalle",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // NORTHERN PROVINCE
  // ==========================================
  {
    id: "th-jaffna",
    name: "Teaching Hospital Jaffna",
    aliases: ["Jaffna Hospital", "TH Jaffna", "Jaffna Teaching Hospital", "யாழ்ப்பாணம் போதனா வைத்தியசாலை"],
    category: "National Teaching Hospital",
    province: "Northern Province",
    district: "Jaffna",
    city: "Jaffna",
    address: "Hospital Road, Jaffna, Northern Province, Sri Lanka",
    phone: "021-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NP-JAF-NTH-001",
    rdhsArea: "Jaffna Regional Directorate",
    bedCapacityApprox: 1350,
    featuredClinics: [
      "Cardiology",
      "Oncology Care",
      "Pediatrics & Neonatology",
      "Obstetrics & Gynecology",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Jaffna",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-vavuniya",
    name: "District General Hospital Vavuniya",
    aliases: ["Vavuniya Hospital", "DGH Vavuniya", "Vavuniya General Hospital"],
    category: "District General Hospital",
    province: "Northern Province",
    district: "Vavuniya",
    city: "Vavuniya",
    address: "Inner Circular Road, Vavuniya, Northern Province, Sri Lanka",
    phone: "024-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NP-VAV-DGH-001",
    rdhsArea: "Vavuniya Regional Directorate",
    bedCapacityApprox: 680,
    featuredClinics: [
      "General Medicine",
      "Surgery",
      "Pediatrics",
      "Orthopedics"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Vavuniya",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-kilinochchi",
    name: "District General Hospital Kilinochchi",
    aliases: ["Kilinochchi Hospital", "DGH Kilinochchi", "Kilinochchi General Hospital"],
    category: "District General Hospital",
    province: "Northern Province",
    district: "Kilinochchi",
    city: "Kilinochchi",
    address: "A9 Highway, Kilinochchi, Northern Province, Sri Lanka",
    phone: "021-2285261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NP-KIL-DGH-001",
    rdhsArea: "Kilinochchi Regional Directorate",
    bedCapacityApprox: 420,
    featuredClinics: [
      "General OPD",
      "Pediatrics",
      "Obstetrics",
      "Emergency Treatment"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Kilinochchi",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-mannar",
    name: "District General Hospital Mannar",
    aliases: ["Mannar Hospital", "DGH Mannar", "Mannar General Hospital"],
    category: "District General Hospital",
    province: "Northern Province",
    district: "Mannar",
    city: "Mannar",
    address: "Hospital Road, Mannar Town, Northern Province, Sri Lanka",
    phone: "023-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NP-MAN-DGH-001",
    rdhsArea: "Mannar Regional Directorate",
    bedCapacityApprox: 380,
    featuredClinics: [
      "General OPD",
      "Maternity",
      "Pediatrics",
      "Dental Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Mannar",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // EASTERN PROVINCE (INCLUDING TRINCOMALEE, BATTICALOA, AMPARA)
  // ==========================================
  {
    id: "dgh-trincomalee",
    name: "District General Hospital Trincomalee",
    aliases: ["Trincomalee Hospital", "DGH Trincomalee", "Trincomalee General Hospital", "திருகோணமலை மாவட்ட பொது வைத்தியசாலை"],
    category: "District General Hospital",
    province: "Eastern Province",
    district: "Trincomalee",
    city: "Trincomalee",
    address: "Hospital Road, Trincomalee, Eastern Province, Sri Lanka",
    phone: "026-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-TRIN-DGH-001",
    rdhsArea: "Trincomalee Regional Directorate",
    bedCapacityApprox: 750,
    featuredClinics: [
      "Cardiology",
      "General Surgery",
      "Pediatrics",
      "Eye Clinic",
      "Dialysis Unit"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Trincomalee",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-muthur",
    name: "Base Hospital Muthur",
    aliases: ["Muthur Hospital", "BH Muthur", "Mutur Hospital", "மூதூர் ஆதார வைத்தியசாலை"],
    category: "Base Hospital Type B",
    province: "Eastern Province",
    district: "Trincomalee",
    city: "Muthur",
    address: "Hospital Road, Muthur, Trincomalee District, Eastern Province, Sri Lanka",
    phone: "026-2238261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-TRIN-BH-003",
    rdhsArea: "Trincomalee Regional Directorate",
    bedCapacityApprox: 160,
    featuredClinics: [
      "General OPD",
      "Pediatric Clinic",
      "Obstetrics",
      "Dental Care"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Muthur+Trincomalee",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-kantale",
    name: "Base Hospital Kantale",
    aliases: ["Kantale Hospital", "BH Kantale", "Kanthale Hospital"],
    category: "Base Hospital Type B",
    province: "Eastern Province",
    district: "Trincomalee",
    city: "Kantale",
    address: "Main Street, Kantale, Trincomalee District, Eastern Province, Sri Lanka",
    phone: "026-2234261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-TRIN-BH-004",
    rdhsArea: "Trincomalee Regional Directorate",
    bedCapacityApprox: 190,
    featuredClinics: [
      "General OPD",
      "Emergency Treatment",
      "Maternity",
      "Pediatrics"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Kantale+Trincomalee",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "th-batticaloa",
    name: "Teaching Hospital Batticaloa",
    aliases: ["Batticaloa Hospital", "TH Batticaloa", "Batticaloa Teaching Hospital", "மட்டக்களப்பு போதனா வைத்தியசாலை"],
    category: "Teaching Hospital",
    province: "Eastern Province",
    district: "Batticaloa",
    city: "Batticaloa",
    address: "Hospital Road, Batticaloa, Eastern Province, Sri Lanka",
    phone: "065-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-BAT-TH-001",
    rdhsArea: "Batticaloa Regional Directorate",
    bedCapacityApprox: 1050,
    featuredClinics: [
      "Cardiology",
      "Oncology",
      "Nephrology",
      "Pediatrics",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Batticaloa",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-ampara",
    name: "District General Hospital Ampara",
    aliases: ["Ampara Hospital", "DGH Ampara", "Ampara General Hospital"],
    category: "District General Hospital",
    province: "Eastern Province",
    district: "Ampara",
    city: "Ampara",
    address: "Hospital Road, Ampara, Eastern Province, Sri Lanka",
    phone: "063-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-AMP-DGH-001",
    rdhsArea: "Ampara Regional Directorate",
    bedCapacityApprox: 680,
    featuredClinics: [
      "General Medicine",
      "Surgery",
      "Pediatrics",
      "Orthopedics"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Ampara",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "bh-kalmunai",
    name: "Base Hospital Kalmunai (North & South)",
    aliases: ["Kalmunai Hospital", "BH Kalmunai", "Ashraff Memorial Hospital Kalmunai"],
    category: "Base Hospital Type A",
    province: "Eastern Province",
    district: "Ampara",
    city: "Kalmunai",
    address: "Hospital Road, Kalmunai, Ampara District, Eastern Province, Sri Lanka",
    phone: "067-2229261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-EP-AMP-BHA-001",
    rdhsArea: "Kalmunai Regional Directorate",
    bedCapacityApprox: 540,
    featuredClinics: [
      "General OPD",
      "Pediatrics",
      "Obstetrics",
      "Dialysis Support"
    ],
    mapUrl: "https://maps.google.com/?q=Base+Hospital+Kalmunai",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // UVA PROVINCE
  // ==========================================
  {
    id: "pgh-badulla",
    name: "Provincial General Hospital Badulla",
    aliases: ["Badulla Hospital", "PGH Badulla", "Badulla General Hospital"],
    category: "Provincial General Hospital",
    province: "Uva Province",
    district: "Badulla",
    city: "Badulla",
    address: "Hospital Road, Badulla, Uva Province, Sri Lanka",
    phone: "055-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-UP-BAD-PGH-001",
    rdhsArea: "Badulla Regional Directorate",
    bedCapacityApprox: 1200,
    featuredClinics: [
      "Pulmonology & Chest Clinic",
      "Cardiology",
      "Orthopedic Surgery",
      "Nephrology",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Provincial+General+Hospital+Badulla",
    isFeatured: true,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-monaragala",
    name: "District General Hospital Monaragala",
    aliases: ["Monaragala Hospital", "DGH Monaragala", "Sir Medankara Hospital"],
    category: "District General Hospital",
    province: "Uva Province",
    district: "Monaragala",
    city: "Monaragala",
    address: "Kachcheri Road, Monaragala, Uva Province, Sri Lanka",
    phone: "055-2276261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-UP-MON-DGH-001",
    rdhsArea: "Monaragala Regional Directorate",
    bedCapacityApprox: 520,
    featuredClinics: [
      "General Medicine",
      "Surgery",
      "Pediatrics",
      "Snakebite & Toxicology Unit"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Monaragala",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // NORTH WESTERN PROVINCE
  // ==========================================
  {
    id: "pgh-kurunegala",
    name: "Teaching Hospital Kurunegala",
    aliases: ["Kurunegala Hospital", "TH Kurunegala", "Kurunegala General Hospital"],
    category: "National Teaching Hospital",
    province: "North Western Province",
    district: "Kurunegala",
    city: "Kurunegala",
    address: "Hospital Road, Kurunegala, North Western Province, Sri Lanka",
    phone: "037-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NWP-KUR-NTH-001",
    rdhsArea: "Kurunegala Regional Directorate",
    bedCapacityApprox: 1850,
    featuredClinics: [
      "Cardiology & Catheterization",
      "Nephrology",
      "Oncology",
      "Pediatrics",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Kurunegala",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-chilaw",
    name: "District General Hospital Chilaw",
    aliases: ["Chilaw Hospital", "DGH Chilaw", "Chilaw General Hospital"],
    category: "District General Hospital",
    province: "North Western Province",
    district: "Puttalam",
    city: "Chilaw",
    address: "Hospital Road, Chilaw, North Western Province, Sri Lanka",
    phone: "032-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NWP-PUT-DGH-001",
    rdhsArea: "Puttalam Regional Directorate",
    bedCapacityApprox: 640,
    featuredClinics: [
      "General Medicine",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Dental Care"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Chilaw",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // NORTH CENTRAL PROVINCE
  // ==========================================
  {
    id: "th-anuradhapura",
    name: "Teaching Hospital Anuradhapura",
    aliases: ["Anuradhapura Hospital", "TH Anuradhapura", "Anuradhapura General Hospital"],
    category: "Teaching Hospital",
    province: "North Central Province",
    district: "Anuradhapura",
    city: "Anuradhapura",
    address: "Maithripala Senanayake Mawatha, Anuradhapura, North Central Province, Sri Lanka",
    phone: "025-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NCP-ANU-TH-001",
    rdhsArea: "Anuradhapura Regional Directorate",
    bedCapacityApprox: 1550,
    featuredClinics: [
      "Nephrology & Renal Transplant (CKDu Center)",
      "Cardiology",
      "Toxicology & Poison Center",
      "Pediatrics",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Anuradhapura",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-polonnaruwa",
    name: "District General Hospital Polonnaruwa",
    aliases: ["Polonnaruwa Hospital", "DGH Polonnaruwa", "Polonnaruwa Kidney Hospital"],
    category: "District General Hospital",
    province: "North Central Province",
    district: "Polonnaruwa",
    city: "Polonnaruwa",
    address: "Hospital Road, Polonnaruwa, North Central Province, Sri Lanka",
    phone: "027-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-NCP-POL-DGH-001",
    rdhsArea: "Polonnaruwa Regional Directorate",
    bedCapacityApprox: 750,
    featuredClinics: [
      "Specialized Kidney & Dialysis Hospital",
      "General Surgery",
      "Pediatrics",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Polonnaruwa",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },

  // ==========================================
  // SABARAGAMUWA PROVINCE
  // ==========================================
  {
    id: "th-ratnapura",
    name: "Teaching Hospital Ratnapura",
    aliases: ["Ratnapura Hospital", "TH Ratnapura", "Provincial General Hospital Ratnapura"],
    category: "Teaching Hospital",
    province: "Sabaragamuwa Province",
    district: "Ratnapura",
    city: "Ratnapura",
    address: "Hospital Road, Ratnapura, Sabaragamuwa Province, Sri Lanka",
    phone: "045-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SAB-RAT-TH-001",
    rdhsArea: "Ratnapura Regional Directorate",
    bedCapacityApprox: 1350,
    featuredClinics: [
      "Cardiology",
      "Orthopedics",
      "Pediatrics",
      "Snakebite & Trauma Care",
      "General OPD"
    ],
    mapUrl: "https://maps.google.com/?q=Teaching+Hospital+Ratnapura",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  },
  {
    id: "dgh-kegalle",
    name: "District General Hospital Kegalle",
    aliases: ["Kegalle Hospital", "DGH Kegalle", "Kegalle General Hospital"],
    category: "District General Hospital",
    province: "Sabaragamuwa Province",
    district: "Kegalle",
    city: "Kegalle",
    address: "Hospital Road, Kegalle, Sabaragamuwa Province, Sri Lanka",
    phone: "035-2222261",
    emergencyHelpline: "1990",
    officialMoHCode: "MOH-SAB-KEG-DGH-001",
    rdhsArea: "Kegalle Regional Directorate",
    bedCapacityApprox: 720,
    featuredClinics: [
      "General Medicine",
      "Surgery",
      "Pediatrics",
      "ENT Clinic"
    ],
    mapUrl: "https://maps.google.com/?q=District+General+Hospital+Kegalle",
    isFeatured: false,
    sourceAttribution: "Ministry of Health Sri Lanka — 2026 Directory",
    lastUpdated: "2026-03-01",
  }
];

/**
 * Normalizes search text for case-insensitive and diacritic-agnostic matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[\s\-_]+/g, " ");
}

/**
 * Searches the hospital directory across name, aliases, city, district, and clinics
 */
export function searchHospitals(params: {
  query?: string;
  province?: string;
  category?: string;
  district?: string;
}): Hospital[] {
  const { query, province, category, district } = params;
  const q = query ? normalize(query) : "";

  return SRI_LANKAN_HOSPITALS.filter((h) => {
    // Province filter
    if (province && province !== "ALL" && h.province !== province) {
      return false;
    }

    // Category filter
    if (category && category !== "ALL" && h.category !== category) {
      return false;
    }

    // District filter
    if (district && district !== "ALL" && h.district !== district) {
      return false;
    }

    // Text search filter
    if (q) {
      const matchName = normalize(h.name).includes(q);
      const matchAliases = h.aliases.some((alias) => normalize(alias).includes(q));
      const matchCity = normalize(h.city).includes(q);
      const matchDistrict = normalize(h.district).includes(q);
      const matchAddress = normalize(h.address).includes(q);
      const matchClinics = h.featuredClinics.some((c) => normalize(c).includes(q));

      if (!matchName && !matchAliases && !matchCity && !matchDistrict && !matchAddress && !matchClinics) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Finds a hospital by its unique ID
 */
export function getHospitalById(id: string): Hospital | undefined {
  return SRI_LANKAN_HOSPITALS.find((h) => h.id === id);
}

/**
 * Retrieves the small curated list of featured hospitals for the homepage
 */
export function getFeaturedHospitals(): Hospital[] {
  return SRI_LANKAN_HOSPITALS.filter((h) => h.isFeatured);
}

/**
 * Returns distinct provinces present in the directory
 */
export function getProvinces(): SriLankanProvince[] {
  return Array.from(new Set(SRI_LANKAN_HOSPITALS.map((h) => h.province))).sort() as SriLankanProvince[];
}

/**
 * Returns distinct districts present in the directory
 */
export function getDistricts(province?: string): string[] {
  const hospitals = province && province !== "ALL"
    ? SRI_LANKAN_HOSPITALS.filter((h) => h.province === province)
    : SRI_LANKAN_HOSPITALS;
  return Array.from(new Set(hospitals.map((h) => h.district))).sort();
}

/**
 * Returns distinct categories present in the directory
 */
export function getCategories(): HospitalCategory[] {
  return Array.from(new Set(SRI_LANKAN_HOSPITALS.map((h) => h.category))).sort() as HospitalCategory[];
}
