import { City, State } from "country-state-city";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

const PREFERRED_CITIES: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Wardha", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Amravati", "Akola", "Thane", "Navi Mumbai", "Solapur"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Hubballi", "Belagavi", "Davangere", "Ballari"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Vellore"],
  "Delhi": ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Connaught Place", "Janakpuri"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida", "Bareilly", "Gorakhpur"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
};

function uniqueSorted(preferred: string[], discovered: string[]) {
  const seen = new Set<string>();
  const normalized = [...preferred, ...discovered.sort((a, b) => a.localeCompare(b))]
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return normalized;
}

const INDIA_STATES = State.getStatesOfCountry("IN");

export const STATE_CITIES: Record<string, string[]> = Object.fromEntries(
  INDIA_STATES.map((state) => [
    state.name,
    uniqueSorted(
      PREFERRED_CITIES[state.name] ?? [],
      City.getCitiesOfState("IN", state.isoCode).map((city) => city.name),
    ),
  ]),
);

export const STATES = INDIA_STATES.map((state) => state.name).sort((a, b) => a.localeCompare(b));
export const ALL_CITIES: string[] = Array.from(new Set(Object.values(STATE_CITIES).flat())).sort((a, b) => a.localeCompare(b));

// Backwards-compat export
export const CITIES = ALL_CITIES;

export const COMPATIBILITY: Record<BloodGroup, { canDonateTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  "O-":  { canDonateTo: ["O-","O+","A-","A+","B-","B+","AB-","AB+"], canReceiveFrom: ["O-"] },
  "O+":  { canDonateTo: ["O+","A+","B+","AB+"], canReceiveFrom: ["O-","O+"] },
  "A-":  { canDonateTo: ["A-","A+","AB-","AB+"], canReceiveFrom: ["O-","A-"] },
  "A+":  { canDonateTo: ["A+","AB+"], canReceiveFrom: ["O-","O+","A-","A+"] },
  "B-":  { canDonateTo: ["B-","B+","AB-","AB+"], canReceiveFrom: ["O-","B-"] },
  "B+":  { canDonateTo: ["B+","AB+"], canReceiveFrom: ["O-","O+","B-","B+"] },
  "AB-": { canDonateTo: ["AB-","AB+"], canReceiveFrom: ["O-","A-","B-","AB-"] },
  "AB+": { canDonateTo: ["AB+"], canReceiveFrom: ["O-","O+","A-","A+","B-","B+","AB-","AB+"] },
};

const NAMES = [
  "Rahul Sharma","Priya Patel","Arjun Mehta","Sneha Iyer","Vikram Singh",
  "Ananya Reddy","Rohan Gupta","Kavya Nair","Aditya Joshi","Meera Krishnan",
  "Sanjay Kumar","Divya Menon","Karthik Raj","Pooja Verma","Nikhil Desai",
  "Ishita Bose","Aryan Khanna","Riya Malhotra","Suresh Pillai","Neha Agarwal",
];

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export interface DemoDonor {
  id: string;
  full_name: string;
  blood_group: BloodGroup;
  phone: string;
  city: string;
  area: string;
  is_available: boolean;
  reliability_score: number;
  donations_count: number;
  last_donation_date: string;
  isDemo: true;
}

export interface DemoBloodBank {
  id: string;
  name: string;
  phone: string;
  city: string;
  area: string;
  address: string;
  inventory: Record<BloodGroup, number>;
  isDemo: true;
}

const GENERIC_AREAS = ["Central","North","South","East","West","Sector 5","Civil Lines","Old Town"];

export function generateDemoDonors(blood_group: BloodGroup, city: string, count: number): DemoDonor[] {
  const seed = blood_group.charCodeAt(0) * 31 + city.length * 17 + (city.charCodeAt(0) || 1) * 7;
  const rand = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[Math.floor(rand() * NAMES.length)];
    const days = Math.floor(rand() * 200) + 30;
    const date = new Date(); date.setDate(date.getDate() - days);
    return {
      id: `demo-${blood_group}-${city}-${i}`,
      full_name: name,
      blood_group,
      phone: `+91 9${Math.floor(rand() * 900000000 + 100000000)}`,
      city,
      area: GENERIC_AREAS[Math.floor(rand() * GENERIC_AREAS.length)],
      is_available: rand() > 0.15,
      reliability_score: 75 + Math.floor(rand() * 25),
      donations_count: 1 + Math.floor(rand() * 15),
      last_donation_date: date.toISOString().slice(0, 10),
      isDemo: true,
    };
  });
}

export function generateDemoBloodBanks(city: string, count = 3): DemoBloodBank[] {
  const rand = rng(city.length * 41 + (city.charCodeAt(0) || 3));
  const names = ["LifeLine Blood Centre", "CityCare Blood Bank", "Red Shield Blood Centre", "Sanjeevani Blood Bank", "Hope Medical Blood Bank"];
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-bank-${city}-${i}`,
    name: `${city} ${names[i % names.length]}`,
    phone: `+91 8${Math.floor(rand() * 900000000 + 100000000)}`,
    city,
    area: GENERIC_AREAS[Math.floor(rand() * GENERIC_AREAS.length)],
    address: `${GENERIC_AREAS[Math.floor(rand() * GENERIC_AREAS.length)]} Medical Road, ${city}`,
    inventory: Object.fromEntries(BLOOD_GROUPS.map((g) => [g, 2 + Math.floor(rand() * 16)])) as Record<BloodGroup, number>,
    isDemo: true,
  }));
}
