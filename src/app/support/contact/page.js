import { SupportPage } from "@/components/SupportPage";

export default function ContactPage() {
  return (
    <SupportPage
      title="Contact Us"
      intro="We’re always ready to hear from you."
      paragraphs={[
        "Whether you’re a bank or MFI exploring insurance distribution, an insurer seeking integration, or a customer with a question, the TARIA team is here to support you.",
      ]}
      bullets={[
        "Platform demos and partnerships",
        "Technical and integration support",
        "Customer and agent assistance",
        "General enquiries",
      ]}
      contact={[
        "Email: info@tripsecuregh.com",
        "Phone: +233 20 401 4370",
        "Office: Accra, Ghana",
      ]}
    />
  );
}
