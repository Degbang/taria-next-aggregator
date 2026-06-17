import { SupportPage } from "@/components/SupportPage";

export default function AboutPage() {
  return (
    <SupportPage
      title="About Us"
      intro="TARIA — TripSecure AI Risk & Insurance Advisory — is an intelligent insurance advisory and risk assessment platform developed by TripSecure Ghana Limited."
      paragraphs={[
        "We exist to transform how insurance is understood, distributed, and experienced across Ghana and Africa.",
        "By combining artificial intelligence, data-driven insights, and deep insurance expertise, TARIA acts as the intelligence layer that helps individuals, banks, MFIs, and businesses make informed insurance decisions.",
        "TARIA does not replace insurers. It empowers them by connecting customers and financial institutions to approved insurance products with explainable recommendations.",
      ]}
      bullets={[
        "Smarter risk assessment",
        "Simplified insurance advisory",
        "Ethical, explainable AI recommendations",
        "Scalable insurance distribution through banks and MFIs",
      ]}
    />
  );
}
