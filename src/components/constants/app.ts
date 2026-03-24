import HeroImage from "../../assets/NewApp/Hero-new.png";
import HeroImageMobile from "../../assets/NewApp/Hero-new-mobile.png";
// import AppInfograph from "../../assets/NewApp/AppInfograph.png";
import ImageCard1 from "../../assets/NewApp/ImageCard-1.png";
import ImageCard2 from "../../assets/NewApp/ImageCard-2.png";
import ImageCard3 from "../../assets/NewApp/ImageCard-3.png";
import ImageCard4 from "../../assets/NewApp/ImageCard-4.png";
import ImageCard5 from "../../assets/NewApp/ImageCard-5.png";
import ImageCard6 from "../../assets/NewApp/ImageCard-6.png";
import Testimonial1 from "../../assets/NewApp/Testimonial1.png";
import Testimonial2 from "../../assets/NewApp/Testimonial2.png";
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

export const stores = [
  {
    type: "ios",
    href: "https://apps.apple.com/in/app/eyeagle/id6740724011",
    image: AppStore,
    alt: "Download on the App Store",
  },
  {
    type: "android",
    href: "https://play.google.com/store/apps/details?id=com.app.eyeagle",
    image: PlayStore,
    alt: "Get it on Google Play",
  },
];

export const HeroSectionData = {
  images: {
    desktop: HeroImage,
    mobile: HeroImageMobile,
    // infograph: AppInfograph,
  },
  ctaHref: {
    ios: stores.find((s) => s.type === "ios")?.href,
    android: stores.find((s) => s.type === "android")?.href,
  },
};

export const heroTitle = "Go anywhere.<br/> Stay connected.<br/> Stay safe.";
export const heroDescription = "Your safety, always one tap away.";

export const nestSection = {
  title: {
    line1: "You already have a",
    red1: "safety net.",
    line2: "You just call them",
    red2: "Nest.",
  },
  description: [
    `Your hostel floor. Your weekend trip crew. Your family back home. The friend who walks you to the gate after late-night chai.`,
    `EyEagle calls them <span class="font-bold">Nests</span> — groups of people who’ve agreed to look out for each other. No setup drama. Just the people you already trust, now connected in a way that actually matters when it counts.`,
  ],
  images: [
    ImageCard1,
    ImageCard2,
    ImageCard3,
    ImageCard4,
    ImageCard5,
    ImageCard6,
  ],
};

export const features = [
  {
    eyebrow: "Connected",
    title: {
      redFirst: "One tap,",
      black: "and they all know",
    },
    description:
      "Something feels off. You don't need to call anyone, text anyone, or explain anything. One tap sends an SOS to every member of your nest. Instantly.",
    image: FeatureImage1,
    reverse: false,
  },
  {
    eyebrow: "Connected",
    title: {
      black: "They see exactly where <br/> you are",
    },
    description: `Not a dropped pin from ten minutes ago. Your live location, moving with you, shared the moment you reach out. No guesswork. No "send me your location." They already have it.`,
    image: FeatureImage2,
    reverse: true,
  },
  {
    eyebrow: "Loud & clear",
    title: {
      black: "Even if their phone is on silent",
    },
    description:
      "EyEagle's alert bypasses silent mode and sounds an alarm on their phone. Because emergencies don't wait for your roommate to check her notifications.",
    // bullets: [
    //   "Send and receive SOS alerts within your Nest",
    //   "Members can mark their status as “On the way” or “Cannot attend”",
    //   "Get directions to the location in a single tap",
    // ],
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
    "If your trusted circle misses the alert, EyEagle escalates with trained support and emergency coordination when needed.",
  warning: "Only available for Indian Users currently",
  img: BackupImage,
};

export const chapterSection = {
  title: {
    line1: "Every new chapter.",
    line2: "A new nest.",
  },
  description: "Your safety grows the way your life does. One nest at a time.",
  buttonText: "Start your nest",
  scenarios: [
    "Heading back from the library at midnight?",
    "Road trip to Rishikesh with your floor?",
    "First internship in a new city?",
    "Concert wrapping up at 1AM?",
    "Dadi's evening walk running late?",
    "Solo cab ride after tuitions?",
    "Night shift ending at 2 AM?",
    "Catching the last metro alone?",
    "Exploring a new city solo?",
  ],
  activeIndex: 4,
};

export const testimonials = [
  {
    name: "Samikcha Kapoor",
    city: "Bengaluru",
    text: "I didn’t realise how much I needed this until I installed it. It just feels... safer.",
    image: Testimonial1,  
  },
  {
    name: "Navya Kumari",
    city: "Delhi",
    text: "Now, when I go out late, I don’t overthink as much. That itself is a relief.",
    image: Testimonial2,
  },
];

export const sectionContent = {
  title: {
    black: "Made for",
    red: "families",
    rest: "who watch out for each other",
  },
  description:
    "EyEagle is for any home where safety is shared. Everyone in a Nest can raise an SOS, see who is responding, and coordinate help quickly, whether it is for a parent, partner, flatmate, or friend.",
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
      "Add the people you trust to a Nest and give each other a quick way to ask for help and reply.",
    showDivider: true,
  },
  {
    image: FamilyImage3,
    title: "Homes with elders, kids or dependents",
    description:
      "A simple SOS button for them, and clear alerts for everyone in the Nest about what is happening.",
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
    "Because safety shouldn’t start after an emergency. Add your trusted circle now, and stay ready with one tap",
  image: CTAImage,
};
