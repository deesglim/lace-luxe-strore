import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";
import { PolicyPage } from "@/components/PolicyPage";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What products do you sell?",
    answer:
      "We offer premium lace products including HD Lace, Swiss Lace, and specialty lace collections designed for natural-looking installations.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We ship to customers worldwide.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Nigeria: 2–7 business days. International: 5–21 business days depending on destination.",
  },
  {
    question: "How do I choose the right lace?",
    answer:
      "Our team can help you select the most suitable lace based on your desired finish, installation style, and budget.",
  },
  {
    question: "How can I contact support?",
    answer: "You can contact us through WhatsApp, Instagram, or our Contact page.",
  },
  {
    question: "Can I return my order?",
    answer:
      "Returns are only accepted for approved cases such as damaged items or incorrect orders.",
  },
];

export default function FaqPage() {
  return (
    <PolicyPage eyebrow="Help Center" title="Frequently Asked Questions">
      <FaqAccordion items={FAQ_ITEMS} />
    </PolicyPage>
  );
}
