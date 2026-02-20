import HeroImage from "../../assets/Device/BathroomImage.png";
import HeroImageMob from "../../assets/Device/BathroomImageMob.png";
import LoudAlarm from "../../assets/Device/LoudAlarm.png";
import NoWifi from "../../assets/Device/NoWifi.png";
import Power from "../../assets/Device/Power.png";
import Camera from "../../assets/Device/Camera.png";
import AlarmInside from "../../assets/Device/AlarmInside.png";
import AlarmOutside from "../../assets/Device/AlarmOutside.png";
import BlackCheck from "../../assets/Device/BlackCheck.png";
import Lock from "../../assets/Device/Lock.png";
import Alarm from "../../assets/Device/Alarm.png";
import PanicButton from "../../assets/Device/PanicButton.png";
import Line from "../../assets/NewApp/Line.png";
import StepImage1 from "../../assets/Device/StepImage1.png";
import StepImage2 from "../../assets/Device/StepImage2.png";
import StepImage3 from "../../assets/Device/StepImage3.png";
import StepImage4 from "../../assets/Device/StepImage4.png";

export const heroContent = {
  badge: "Bathroom Safety Alarm Kit",
  title: "One press.<br />The right people know",
  description:
    "A simple, privacy-first bathroom alarm kit built for real Indian bathrooms that makes it easy to ask for help and alert your family, without cameras or complexity.",
  cta: {
    text: "Join the waitlist",
    href: "https://eyeagle.ai/join",
    helper:
      "No payment now. We'll contact you when installs open in your city.",
  },
  images: {
    img1: HeroImage,
    img2: HeroImageMob,
  },
};

export const features = [
  {
    icon: LoudAlarm,
    title: "Loud Alarm",
    description: "Clearly audible, even from the next room.",
  },
  {
    icon: NoWifi,
    title: "No Wi-Fi required",
    description: "Works reliably, even when the Wi-Fi doesn’t.",
  },
  {
    icon: Power,
    title: "No charging required",
    description: "Always on. No charging or backup batteries to manage.",
  },
  {
    icon: Camera,
    title: "No camera",
    description: "Protects privacy and dignity in the bathroom.",
  },
];

export const tabsData = [
  { id: "inside", label: "INSIDE", image: AlarmInside },
  { id: "outside", label: "OUTSIDE", image: AlarmOutside },
];

export const alarmHeader = {
  title: "Meet the EyEagle bathroom alarm",
  description:
    "A simple three-part system: when you press, what makes the sound, and what watches the door.",
};

export const sections = [
  {
    eyebrow: "SmartLock",
    title:
      "A small sensor that sits on the bathroom latch and alerts when the door is locked for a long time",
    bullets: [
      "Detects when the bathroom door stays locked unusually long.",
      "Fits over common bathroom latches",
      "Helps family know to check the bathroom first",
    ],
    image: Lock,
  },
  {
    eyebrow: "SOS button",
    title:
      "A small sensor that sits on the bathroom latch and alerts when the door is locked for a long time",
    bullets: [
      "Detects when the bathroom door stays locked unusually long.",
      "Fits over common bathroom latches",
      "Helps family know to check the bathroom first",
    ],
    image: PanicButton,
    reverse: true,
  },
  {
    eyebrow: "alarm unit",
    title:
      "A small sensor that sits on the bathroom latch and alerts when the door is locked for a long time",
    bullets: [
      "Detects when the bathroom door stays locked unusually long.",
      "Fits over common bathroom latches",
      "Helps family know to check the bathroom first",
    ],
    image: Alarm,
  },
];

export const featureAssets = {
  checkIcon: BlackCheck,
  divider: Line,
};

export const header = {
  title: "How it works",
};

export const steps = [
  {
    text: "Press the SOS button inside the bathroom.",
    image: StepImage1,
  },
  {
    text: "The alarm unit outside sounds immediately.",
    image: StepImage2,
  },
  {
    text: "Family members receive the emergency alert on their phones.",
    image: StepImage3,
  },
  {
    text: "If no one responds, our team can dispatch an ambulance.",
    image: StepImage4,
  },
];


export const faqsData = [
  {
    question: "What is EyEagle and how does it work?",
    answer:
      "EyEagle is a comprehensive bathroom safety system designed to prevent accidents and provide quick emergency response. It includes a patented alarm system, non-slip surfaces, grab bars, and an app that sends instant notifications to caregivers or emergency contacts when an incident is detected.",
  },
  {
    question: "Do I need Wi-Fi for the system to work?",
    answer:
      "No, EyEagle does not rely on Wi-Fi. It operates independently to ensure that safety is never compromised due to internet connectivity issues.",
  },
  {
    question: "How does EyEagle ensure notifications are reliable?",
    answer:
      "Our patent-pending device is designed to function in any corner of the house, even on low-bandwidth 2G networks. This ensures that critical alerts are always delivered, even in areas with poor connectivity.",
  },
  {
    question: "What happens if there’s a power outage?",
    answer:
      "EyEagle comes equipped with a battery that lasts up to 6 hours, ensuring continuous protection even during power outages.",
  },
  {
    question: "Who receives the alerts when the alarm is triggered?",
    answer:
      "Alerts can be sent to multiple people, including caregivers, family members, or emergency services. You can customize who gets notified through the EyEagle app.",
  },
  {
    question: "How is the system installed?",
    answer:
      "Our team of experts will install the system based on your bathroom’s specific floor plan. We ensure everything is placed optimally for maximum safety and effectiveness.",
  },
  {
    question: "What if my device goes offline?",
    answer:
      "If a device disconnects, you’ll receive a “Device Offline” alert, prompting you to check power and connectivity.",
  },
];