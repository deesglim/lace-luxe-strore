import { PolicyPage, PolicyParagraph, PolicySection } from "@/components/PolicyPage";

export default function TermsConditionsPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Terms & Conditions">
      <PolicySection heading="Agreement">
        <PolicyParagraph>
          By accessing and using this website, you agree to comply with these Terms
          and Conditions.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Product Information">
        <PolicyParagraph>
          We make every effort to ensure product descriptions, images, and
          specifications are accurate. Minor differences may occur due to
          photography, screen settings, and manufacturing variations.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Pricing">
        <PolicyParagraph>
          All prices displayed on the website are listed in Nigerian Naira (₦) unless
          otherwise stated. Prices may be updated without prior notice.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Orders">
        <PolicyParagraph>
          We reserve the right to refuse, cancel, or limit orders at our discretion.
          This includes situations involving pricing errors, suspected fraud, or
          unusual purchasing activity.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Payments">
        <PolicyParagraph>
          Orders will only be processed after full payment has been successfully
          received and confirmed.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Shipping">
        <PolicyParagraph>
          Delivery estimates are provided for convenience and are not guaranteed. We
          are not responsible for delays caused by couriers, customs authorities,
          weather conditions, or events beyond our control.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Intellectual Property">
        <PolicyParagraph>
          All content on this website, including text, images, graphics, branding,
          logos, and designs, is the property of Lace Luxe by Dee. No content may be
          copied, reproduced, distributed, or used without written permission.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Limitation of Liability">
        <PolicyParagraph>
          Lace Luxe by Dee shall not be liable for any indirect, incidental, or
          consequential damages resulting from the use of our website or products.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Policy Updates">
        <PolicyParagraph>
          We reserve the right to update or modify these terms at any time without
          prior notice. Continued use of the website constitutes acceptance of any
          updates.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection heading="Contact Us">
        <PolicyParagraph>
          For questions regarding these Terms &amp; Conditions, please contact our
          support team through the Contact Us page or WhatsApp support.
        </PolicyParagraph>
      </PolicySection>
    </PolicyPage>
  );
}
