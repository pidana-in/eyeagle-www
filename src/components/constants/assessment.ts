/*
 * Option data for the EyEagle Home Safety Assessment form.
 * Kept separate from the page so the markup in assessment-form.astro
 * stays focused on structure, and these lists can be reused or edited
 * without touching the component.
 */

export const consideringForOptions = [
  "Senior parent / grandparent living in the same home",
  "Senior parent / grandparent living away",
  "Someone recovering from illness or surgery",
  "Pregnant family member",
  "Person living alone",
  "Myself",
  "General home safety",
  "Other",
];

export const safetyConcernOptions = [
  "Bathroom slips or falls",
  "No one nearby during emergency",
  "Elderly person alone at home",
  "Night-time bathroom use",
  "Need bathroom grab bars / support",
  "Need emergency alert system",
  "Not sure, just exploring",
];

export const immediateSafetyConcernOptions = [
  { value: "Yes", required: true },
  { value: "No" },
];

export const whatNextOptions = [
  { value: "Book a bathroom safety assessment", required: true },
  { value: "Understand the EyeEagle safety kit" },
  { value: "Get pricing details" },
  { value: "Just share information for now" },
];

export const preferredContactDayOptions = [
  "Tomorrow",
  "Day After Tomorrow",
  "This weekend",
];

export const preferredContactTimeOptions = ["Morning", "Afternoon", "Evening"];

export const checkboxRadioClass =
  "h-5 w-5 md:h-4 md:w-4 border-gray-400 mt-0.5 shrink-0";