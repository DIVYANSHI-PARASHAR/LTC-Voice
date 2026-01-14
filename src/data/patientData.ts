export const patientData = {
  name: "Robert Jenkins",
  age: 72,
  caseId: "NY-MC-2024-1234",
  insurance: "NY Medicaid Managed LTC (MLTC)",
  diagnosis: "COPD",
  facilityType: "Skilled Nursing Facility",
  preferredLanguage: "English",
  status: "in-progress" as const,
  timeSinceReferral: "2 days",
  targetCompletion: "10/29/25",
  // Use VITE_TEST_PHONE_NUMBER from .env if set, otherwise use demo number
  phone: import.meta.env.VITE_TEST_PHONE_NUMBER || "+12014231932",
};
