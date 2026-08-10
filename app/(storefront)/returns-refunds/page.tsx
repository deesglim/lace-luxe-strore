import { PolicyList, PolicyPage, PolicyParagraph, PolicySection } from "@/components/PolicyPage";

export default function ReturnsRefundsPage() {
  return (
    <PolicyPage eyebrow="Support" title="Returns & Refunds">
      <PolicySection heading="Our Commitment">
        <PolicyParagraph>
          Every product is thoroughly inspected before shipping to ensure it meets our
          quality standards.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Eligible Returns">
        <PolicyParagraph>Returns may be approved if:</PolicyParagraph>
        <PolicyList
          items={[
            "You received the wrong item.",
            "Your item arrived damaged.",
            "The product delivered differs significantly from your order.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Return Request Window">
        <PolicyParagraph>
          All return requests must be submitted within 48 hours of receiving your
          order.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Return Conditions">
        <PolicyParagraph>To qualify for a return, products must:</PolicyParagraph>
        <PolicyList
          items={[
            "Be unused.",
            "Be in original condition.",
            "Include original packaging.",
            "Show no signs of alteration or damage after delivery.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Non-Returnable Items">
        <PolicyParagraph>We do not accept returns for:</PolicyParagraph>
        <PolicyList
          items={[
            "Change of mind.",
            "Incorrect selections made by customers.",
            "Used, cut, altered, or damaged products.",
            "Orders placed with incorrect specifications.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Refund Processing">
        <PolicyParagraph>
          Once a return is approved and inspected, refunds are processed within 5–10
          business days. Refunds will be issued through the original payment method
          whenever possible.
        </PolicyParagraph>
      </PolicySection>
    </PolicyPage>
  );
}
