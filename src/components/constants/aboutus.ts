export { aboutUsFoundersData } from "../../data/about";
export { aboutHeader as AboutUsHeaderData } from "../../data/about";
export { whyEyEagle as EyeagleDiff } from "../../data/about";
import { coreValuesIntro, coreValues } from "../../data/about";


// Compose the legacy Values shape from shared data without duplicating strings
export const Values = [
  { title: coreValuesIntro.title, description: coreValuesIntro.description },
  ...coreValues.map((v) => ({ title: v.title, description: v.description })),
];

export const CoreValuesData = {
  title: `At <span class="text-[#CC0000]">EyEagle</span>, we’re redefining elder safety.`,
  desc:
    "We strive to provide unmatched protection and peace of mind—ensuring safety doesn’t come at an overwhelming cost.",
  coreTitle: `Guided by Our <span class=\"text-[#CC0000]\">Core Values</span>`,
  values: coreValues.map((v) => ({ title: v.title, desc: v.description })),
};
