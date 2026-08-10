import { PolicyList, PolicyPage, PolicyParagraph, PolicySection } from "@/components/PolicyPage";

export default function ShippingInfoPage() {
  return (
    <PolicyPage eyebrow="Delivery" title="Shipping Information">
      <PolicyParagraph>We are located in Borokiri, Port Harcourt.</PolicyParagraph>

      <PolicySection heading="Order Processing">
        <PolicyParagraph>
          All orders made before 2pm Monday to Friday are processed and sent out same
          day. Orders placed on weekends or public holidays will be processed on the
          next business day (Monday).
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Nigeria Delivery">
        <PolicyParagraph>Estimated delivery times:</PolicyParagraph>
        <PolicyList
          items={[
            "Within Port Harcourt: same day or next day",
            "Major Cities: 2–5 business days",
            "Other Locations: 3–7 business days",
          ]}
        />
        <PolicyParagraph>
          Delivery timelines may vary based on location and courier operations.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="International Shipping">
        <PolicyParagraph>We proudly ship worldwide. Estimated delivery times:</PolicyParagraph>
        <PolicyList
          items={[
            "Africa: 5–10 business days",
            "Europe & North America: 7–14 business days",
            "Other Regions: 7–21 business days",
          ]}
        />
        <PolicyParagraph>
          Customs clearance may affect delivery timelines in some countries.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Order Tracking">
        <PolicyParagraph>
          Once your order has been dispatched, you will receive tracking information
          via email or WhatsApp.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Need Assistance?">
        <PolicyParagraph>
          If you have any questions before placing an order, our team is available to
          help.
        </PolicyParagraph>
      </PolicySection>
    </PolicyPage>
  );
}
