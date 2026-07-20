import ContactIcon from "../../src/assets/svgs/contact.svg";
import SmileIcon from "../../src/assets/svgs/smile.svg";
import TruckIcon from "../../src/assets/svgs/truck.svg";
import PackageIcon from "../../src/assets/svgs/package.svg";

export const orderDetailsFlow = {
  Icons: [PackageIcon, TruckIcon, ContactIcon, ContactIcon, SmileIcon],
  Context: [
    { title: "Ready to ship", desc: "Packed and scheduled for pickup" },
    { title: "Shipped to your address", desc: "In transit to your location" },
    { title: "Ready for demo", desc: "Technician assigned for walkthrough" },
    { title: "Demo & walkthrough completed", desc: "Setup, testing and training finished" },
    { title: "Product successfully installed", desc: "Safety kit installed and verified" },
  ],
};
