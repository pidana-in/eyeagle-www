import type { ImageMetadata } from "astro";

import contactLogo1 from "../../assets/Common/contactLogo1.png";
import contactLogo2 from "../../assets/Common/contactLogo2.png";
import contactImage1 from "../../assets/Contactus/contact1.png";
import contactImage2 from "../../assets/Contactus/contact2.png";
import contactImage3 from "../../assets/Contactus/contact3.png";
import contactImage4 from "../../assets/Contactus/contact4.png";

export interface ActionCard {
  image: ImageMetadata;
  alt: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}
export interface InfoCardLine {
  href: string;
  text: string;
}
export interface InfoCard {
  logo: ImageMetadata;
  alt: string;
  title: string;
  lines?: InfoCardLine[];
  text?: string;
}

export const PHONE_DISPLAY = "+91 94296 94911";
export const PHONE_TEL_LINK = "tel:+919429694911";

export const SUPPORT_EMAIL = "support@eyeagle.ai";
export const SUPPORT_EMAIL_LINK = `mailto:${SUPPORT_EMAIL}`;

export const CONTACT_EMAIL = SUPPORT_EMAIL;
export const CONTACT_EMAIL_LINK = SUPPORT_EMAIL_LINK;

export const REGISTERED_ADDRESS =
  "BHIVE Workspace - No.112, AKR Tech Park, 7th Mile Hosur Rd, Krishna Reddy Industrial Area, Madivala, Bangalore, Bangalore South, Karnataka, India, 560068";

export const HERO = {
  heading: "Need help protecting someone at home?",
  description:
    "Whether you're planning ahead or concerned about a recent fall, our team is here to help. We'll understand your home, answer your questions, and recommend the safest next steps, without any pressure.",
  image: contactImage1,
  imageAlt: "Need help protecting someone at home",
};

export const ACTION_CARDS: ActionCard[] = [
  {
    image: contactImage2,
    alt: "Talk to a Safety Expert",
    title: "Talk to a Safety Expert",
    description:
      "Speak directly with an EyEagle specialist to discuss your concerns and understand the safest options for your home.",
    ctaLabel: "Book a Call",
    ctaHref: PHONE_TEL_LINK,
  },
  {
    image: contactImage3,
    alt: "Get a Home Assessment",
    title: "Get a Home Assessment",
    description:
      "Schedule a home visit and let our experts assess potential risks and recommend practical safety improvements.",
    ctaLabel: "Schedule a Visit",
    ctaHref: "/assessment-form",
  },
];

export const PARTNER_CARD: ActionCard = {
  image: contactImage4,
  alt: "Partner with Us",
  title: "Partner with Us",
  description:
    "Bring safer homes to your community. We work with hospitals, senior living communities, housing societies and healthcare partners to prevent falls before they happen.",
  ctaLabel: "Become a Partner",
  ctaHref: SUPPORT_EMAIL_LINK,
};

export const INFO_CARDS: InfoCard[] = [
  {
    logo: contactLogo1,
    alt: "Contact",
    title: "Contacts",
    lines: [
      {
        href: CONTACT_EMAIL_LINK,
        text: CONTACT_EMAIL,
      },
      {
        href: PHONE_TEL_LINK,
        text: PHONE_DISPLAY,
      },
    ],
  },
  {
    logo: contactLogo2,
    alt: "Address",
    title: "Registered Address",
    text: REGISTERED_ADDRESS,
  },
];
