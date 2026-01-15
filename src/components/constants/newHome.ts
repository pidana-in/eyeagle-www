import HeroImage from "../../assets/NewHome/HomeImage.png";
import Check from "../../assets/NewApp/check.png";
import Moment1 from "../../assets/NewHome/Moment1.png";
import Moment2 from "../../assets/NewHome/Moment2.png";
import Moment3 from "../../assets/NewHome/Moment3.png";
import AppImage from "../../assets/NewHome/AppImage.png";
import AlarmInside from "../../assets/Device/AlarmInside.png";
import BathroomKitImage from "../../assets/NewHome/BathroomKitImage.png";

export const heroContent = {
  heading: ["Everyday safety", "for the people", "you love."],
  description:
    "EyEagle is a family safety system built for real life — from parents living alone, to families spread across cities, to loved ones travelling. We design calm, privacy-respecting ways to prevent accidents, call for help, and keep everyone in sync.",
};

export const ctaButtons = [
  {
    label: "Get the app",
    href: "https://shop.eyeagle.ai/products/eyeagle-package-prevention-app",
  },
  {
    label: "How it works",
    href: "https://eyeagle.ai/solution",
  },
];

export const featureTicks = ["No cameras", "No complex setup"];

export const heroData = {
  img1: HeroImage,
  img2: Check,
};

export const principles = [
  {
    number: "01",
    title: "Dignity first",
    description:
      "We design for independence and confidence, not fear. Safety should feel like freedom, not restriction.",
  },
  {
    number: "02",
    title: "Privacy by default",
    description:
      "No cameras in private spaces. Minimal data. Clear control over who sees what. We protect people without watching them all the time.",
  },
  {
    number: "03",
    title: "Families over features",
    description:
      "Everything we build assumes real families — siblings, neighbours, helpers, friends — not a single “primary user” who has to manage it all.",
  },
];

export const momentData = {
  title: "We don’t start with products. We start with moments.",
  desc: "Before we designed anything, we mapped the moments that actually worry families — when someone is vulnerable, alone, or out of reach. EyEagle is our way of designing for those moments first, then choosing the right mix of hardware and software.",
};

export const momentFeatures = [
  {
    image: Moment1,
    title: "Critical moments",
    description:
      "Short windows when small mistakes become big — a wet floor, a sudden dizzy spell, a late-night bathroom trip.",
  },
  {
    image: Moment2,
    title: "Critical places",
    description:
      "Spaces where a slip is serious — bathrooms, bedroom paths, stairs, hotel rooms, airplane aisles.",
  },
  {
    image: Moment3,
    title: "Critical relationships",
    description:
      "The person at risk, the one nearby, and the people who worry from far away.",
  },
];

export const appSection = {
  step: "01",
  title: "EyEagle App",
  subtitle:
    "Keep families coordinated when something happens — whether you’re in the next room or another country.",
  features: [
    "Create private family circles and roles",
    "Choose who gets alerts and how",
    "Keeps a calm, shared view of what’s happening",
  ],
};

export const appData = {
  img: AppImage,
};

export const kitFeatures = [
  {
    title: "Loud Alarm",
    description: "High-decibel alarm alerts instantly.",
  },
  {
    title: "Offline",
    description: "No WiFi needed for operation.",
  },
  {
    title: "Backup",
    description: "Runs during power outages.",
  },
];

export const guardianData = {
  title:
    "Patent-pending technology, seamlessly integrated safety system that alerts and responds instantly.",
  desc: "Equipped with a smart alarm, control unit, response switch, and automated door mechanism, it ensures unmatched security and peace of mind — whether you’re near or far. Stay connected, stay protected.🚀",
  img: AlarmInside,
};

export const bathroomKit = {
  step: "03",
  title: "Bathroom Protection Kit",
  subtitle:
    "Thoughtfully placed support and anti-skid elements that make everyday movement safer.",
  features: [
    "Grab bars and rails planned around real routines",
    "Anti-skid mat and strips in wet, high-risk zones",
    "Designed to feel at home, not like a hospital",
  ],
  img: BathroomKitImage,
};

export const processData = {
  title: "Everything is designed to work together.",
  description:
    "You can start with any one product. But when you connect them, EyEagle becomes a calm, always-there support system for your family.",

  items: [
    {
      title: "If something happens in the bathroom…",
      description:
        "The Bathroom Alarm is pressed → the alarm sounds outside → the App notifies chosen family members → you decide what to do next together.",
    },
    {
      title: "If an older parent is living alone…",
      description:
        "The Protection Kit reduces the chance of a fall. The Alarm is there if something still goes wrong → The App keeps distant family members in the loop.",
    },
    {
      title: "If someone is travelling or away from home…",
      description:
        "The App keeps check-ins, alerts, and updates in one place → everyone knows where things stand without constant calls or polling.",
    },
  ],
};