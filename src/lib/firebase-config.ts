import { Analytics, getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { fetchAndActivate, getAll, getRemoteConfig, getValue, RemoteConfig } from "firebase/remote-config";
import { Config } from "./utils/Config";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

const firebaseApp = initializeApp(firebaseConfig);

let firebaseAnalytics: Analytics | undefined;
let remoteConfig: RemoteConfig | undefined;

if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  firebaseAnalytics = getAnalytics(firebaseApp);
  remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings = {
    minimumFetchIntervalMillis: Config.isProd
      ? 1000 * 60 * 60 * 4
      : 1000 * 60 * 60 * 1,
  };
}

const defaultConfig: Record<string, any> = {
  bulk_request_languages: ["ENGLISH", "HINDI"],
  bulk_request_languages_default_index: 1,
  rating_count_threshold: 1,
  good_feedback_rating_threshold: 3,
  support_number: 1323,
  support_email: "support@eyeagle.ai",
  payment_mode_mappings: {
    default: "unknown method",
    CC: "credit card",
    DC: "debit card",
    NB: "net banking",
    netbanking: "net banking",
    UPI: "UPI",
    upi: "UPI",
    PPI: "Paytm wallet",
    PHONEPE: "PhonePe app",
  },
};

const isNumeric = (n: string) => +n === +n;
const isBoolean = (n: string) => n === "false" || n === "true";

const fetchRemoteConfig = async () => {
  if (!remoteConfig) return;

  try {
    await fetchAndActivate(remoteConfig);
    console.log("Remote config fetched successfully");

    Object.keys(getAll(remoteConfig)).forEach((key) => {
      const val = getValue(remoteConfig, key);
      const value = val.asString();
      const source = val.getSource();

      if (source === "remote") {
        if (value.startsWith("{") || value.startsWith("[")) {
          defaultConfig[key] = JSON.parse(value);
        } else if (isNumeric(value)) {
          defaultConfig[key] = +value;
        } else if (isBoolean(value)) {
          defaultConfig[key] = value === "true";
        } else {
          defaultConfig[key] = value;
        }
      }
    });
  } catch (e) {
    console.error("Error fetching remote config:", e);
  }
};

export { firebaseAnalytics, remoteConfig, firebaseApp, fetchRemoteConfig, defaultConfig };
