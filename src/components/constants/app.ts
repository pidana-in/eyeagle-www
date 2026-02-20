import HeroImage from "../../assets/NewApp/Hero.png";
import HeroImageMobile from "../../assets/NewApp/HeroImageMobile.png";
import AppInfograph from "../../assets/NewApp/AppInfograph.png";
import FeatureImage1 from "../../assets/NewApp/FeatureImage1.png";
import FeatureImage2 from "../../assets/NewApp/FeatureImage2.png";
import FeatureImage3 from "../../assets/NewApp/FeatureImage3.png";
import BackupImage from "../../assets/NewApp/BackupImage.png";
import FamilyImage1 from "../../assets/NewApp/FamilyImage1.png";
import FamilyImage2 from "../../assets/NewApp/FamilyImage2.png";
import FamilyImage3 from "../../assets/NewApp/FamilyImage3.png";
import FlightImage from "../../assets/NewApp/FlightImage.png";
import Line from "../../assets/NewApp/Line.png";
import Check from "../../assets/NewApp/check.png";
import AppStore from "../../assets/NewApp/AppStore.png";
import PlayStore from "../../assets/NewApp/PlayStore.png";
import CTAImage from "../../assets/NewApp/CTAImage.png";

export const HeroSectionData = {
  images: {
    desktop: HeroImage,
    infograph: AppInfograph,
    mobile: HeroImageMobile,
  },
  ctaHref: "https://shop.eyeagle.ai/products/eyeagle-package-prevention-app",
};

export const heroTitle = "Feel safer.<br />Stay connected.";
export const heroDescription =
  "EyEagle helps families build private “Nests” to check in, share SOS access,and get smart alerts—without overwhelming anyone.";

export const features = [
  {
    eyebrow: "Seamless",
    title: {
      redFirst: "Private",
      black: "Nests & roles",
    },
    description:
      "View NFTs in their ideal intended format. Full rich media support no matter the type, from video and audio, to images and interactive.",
    image: FeatureImage1,
    reverse: false,
  },
  {
    eyebrow: "Seamless",
    title: {
      black: "Raise SOS",
      redLast: "in one tap",
    },
    description:
      "Your loved one taps the big red button to raise an SOS. EyEagle instantly alerts all guardians and the support team, so help starts moving right away.",
    image: FeatureImage2,
    reverse: true,
  },
  {
    eyebrow: "Seamless",
    title: {
      black: "SOS that keeps everyone",
      redLast: "in sync",
    },
    description:
      "When an SOS is raised, everyone in the circle sees who needs help, where they are, and when the alert came in.",
    bullets: [
      "Send and receive SOS alerts within your Nest",
      "Members can mark their status as “On the way” or “Cannot attend”",
      "Get directions to the location in a single tap",
    ],
    image: FeatureImage3,
    reverse: false,
  },
];
export const featureData = {
  img1: Check,
  img2: Line,
};

export const backupSection = {
  eyebrow: "Backup Emergency",
  title: "When your Nest can’t\nrespond, we do",
  description:
    "If your trusted circle misses the alert, Eyegle escalates with trained support and emergency coordination when needed.",
  warning: "Only available for Indian Users currently",
  img: BackupImage,
};

export const sectionContent = {
  title: {
    black: "Made for",
    red: "families",
    rest: "who watch out for each other",
  },
  description:
    "Made for families who watch out for each other. EyEagle is for any home where safety is shared. Everyone in a Nest can raise an SOS and coordinate help quickly — whether for a parent, partner, flatmate, or friend.",
};

export const FamilySection = {
  flightImage: FlightImage,
  dividerLine: Line,
};

export const familyCard = [
  {
    image: FamilyImage1,
    title: "Families living apart",
    description:
      "When family is in different cities, one Nest sends an SOS to everyone and shows who is responding.",
    showDivider: true,
  },
  {
    image: FamilyImage2,
    title: "Partners, flatmates and close friends",
    description:
      "Add the people you trust to a Nest and give each other a quick way to ask for help.",
    showDivider: true,
  },
  {
    image: FamilyImage3,
    title: "Homes with elders, kids or dependents",
    description:
      "A simple SOS button for them, and clear alerts for everyone in the Nest.",
    showDivider: false,
  },
];

export const membershipContent = {
  eyebrow: "Less than an emergency flight ticket",
  title: "EyEagle Membership",
  cta: "Explore Plans",
  cardTitle: "For families who never want an SOS to go unseen.",
  cardDescription:
    "Unlock the full EyEagle experience for your Nest. More members, stronger alerts, and better visibility when something happens.",
  image: Check,
};

export const plans = {
  badges: ["FREE TIER", "FAMILY PLUS"],
  features: [
    "Up to 3 Nests (e.g. parents, your own home, siblings)",
    "Unlimited members in each Nest",
    "Priority SOS alerts so someone always sees it",
    "Early access to new safety features & app improvements",
  ],
};

export const contentData = {
  title: "Ready When You Are",
  description:
    "Start with one step. One log at a time. Bevel meets you where you are and helps you move forward with clarity and confidence.",
  image: CTAImage,
};

export const stores = [
  {
    href: "https://apps.apple.com/in/app/eyeagle/id6740724011",
    image: AppStore,
    alt: "Download on the App Store",
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.app.eyeagle",
    image: PlayStore,
    alt: "Get it on Google Play",
  },
];
