import { SupportPage } from "@/components/SupportPage";

export default function HelpCenterPage() {
  return (
    <SupportPage
      title="Help Center"
      intro="Welcome to the TARIA Help Center — your first stop for guidance and support."
      paragraphs={[
        "Whether you are a customer, bank staff, MFI officer, agent, or partner institution, our Help Center is designed to help you navigate the platform with ease.",
        "Here you will find step-by-step guides, frequently asked questions, and simple explanations of how TARIA works across risk assessment, insurance recommendations, policy selection, and claims support.",
        "If you need additional assistance, our support team is available to provide timely, human-backed help.",
      ]}
    />
  );
}
