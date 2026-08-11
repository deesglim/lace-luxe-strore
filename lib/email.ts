import { Resend } from "resend";
import { formatOrderDeliveryFee } from "@/lib/delivery";
import { describeAppliedDiscount } from "@/lib/discount";
import { formatNaira } from "@/lib/format";
import type { OrderDeliveryOption, OrderItemDetail } from "@/lib/orders";
import type { NotifiableOrderStatus } from "@/lib/orderStatus";
import type { Order, ShippingAddress } from "@/types";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "orders@deesglim.co";
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function getAdminNotificationEmail() {
  const email = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!email) throw new Error("ADMIN_NOTIFICATION_EMAIL is not set");
  return email;
}

function orderNumber(orderId: string) {
  return orderId.slice(0, 8).toUpperCase();
}

function renderItemRows(items: OrderItemDetail[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e7d3c8; color: #2b2b2b; font-family: Arial, sans-serif; font-size: 14px;">
            ${item.productName ?? "Item"}<br />
            <span style="color: #9c6b3f; font-size: 12px;">
              ${[item.sizeLabel, item.colorName].filter(Boolean).join(" · ")} &times; ${item.quantity}
            </span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e7d3c8; color: #2b2b2b; font-family: Arial, sans-serif; font-size: 14px; text-align: right; white-space: nowrap;">
            ${formatNaira(item.price_at_purchase * item.quantity)}
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderAddress(address: ShippingAddress | null): string {
  if (!address) return "";
  return [address.full_name, address.address_line, `${address.city}, ${address.state}`, address.country, address.phone]
    .filter(Boolean)
    .join("<br />");
}

// order_note is free text the customer typed themselves — unlike the other
// values interpolated in these templates (names/addresses come from account
// data, not raw user input at send time), so it's escaped before going into
// the email HTML.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Shared by the customer confirmation and admin alert emails — renders
// nothing at all when there's no note, so no empty "Order Note" section
// ever shows up.
function renderNoteSection(label: string, note: string | null): string {
  if (!note) return "";
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
      <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
        ${label}
      </p>
      <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0;">
        ${escapeHtml(note).replace(/\n/g, "<br />")}
      </p>
    </div>
  `;
}

function buildOrderConfirmationHtml(
  order: Order,
  items: OrderItemDetail[],
  deliveryOption: OrderDeliveryOption | null,
  freeShippingApplied: boolean,
  bundleName: string | null,
  promotionCode: string | null,
): string {
  return `
  <div style="background-color: #f7f3ee; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7d3c8;">
      <div style="background-color: #3a2f2a; padding: 24px; text-align: center;">
        <span style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 22px; color: #f7f3ee;">
          Lace Luxe <span style="color: #9c6b3f;">by Dee</span>
        </span>
      </div>

      <div style="padding: 32px 24px;">
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #3a2f2a; margin: 0 0 8px;">
          Thank you for your order
        </h1>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          We're so glad you chose Lace Luxe by Dee. Your order is confirmed and
          we're getting it ready — here's a summary for your records.
        </p>

        <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">
          Order Number
        </p>
        <p style="color: #3a2f2a; font-size: 16px; margin: 0 0 24px;">#${orderNumber(order.id)}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
          ${renderItemRows(items)}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding-top: 12px; color: #2b2b2b; font-size: 14px;">Subtotal</td>
            <td style="padding-top: 12px; color: #2b2b2b; font-size: 14px; text-align: right;">${formatNaira(order.subtotal)}</td>
          </tr>
          ${
            order.discount_amount > 0
              ? `<tr>
                  <td style="color: #2b2b2b; font-size: 14px;">${describeAppliedDiscount(bundleName, promotionCode)}</td>
                  <td style="color: #2b2b2b; font-size: 14px; text-align: right;">-${formatNaira(order.discount_amount)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="color: #2b2b2b; font-size: 14px;">
              Delivery${deliveryOption ? ` (${deliveryOption.name})` : ""}
            </td>
            <td style="color: #2b2b2b; font-size: 14px; text-align: right;">
              ${formatOrderDeliveryFee(order.delivery_fee, deliveryOption?.category ?? "", freeShippingApplied)}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 8px; color: #3a2f2a; font-size: 16px; font-weight: bold;">Total</td>
            <td style="padding-top: 8px; color: #3a2f2a; font-size: 16px; font-weight: bold; text-align: right;">${formatNaira(order.total)}</td>
          </tr>
        </table>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
            Shipping To
          </p>
          <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0;">
            ${renderAddress(order.shipping_address)}
          </p>
        </div>

        ${renderNoteSection("Order Note", order.order_note)}

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #2b2b2b; font-size: 13px; line-height: 1.6; margin: 0;">
            We'll be in touch once your order ships. If anything looks off with
            this confirmation, just reply to this email and we'll sort it out.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function sendOrderConfirmationEmail(params: {
  order: Order;
  items: OrderItemDetail[];
  deliveryOption: OrderDeliveryOption | null;
  freeShippingApplied: boolean;
  bundleName: string | null;
  promotionCode: string | null;
  toEmail: string;
}): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: `Lace Luxe by Dee <${getFromEmail()}>`,
    to: params.toEmail,
    subject: `Your Lace Luxe by Dee order is confirmed (#${orderNumber(params.order.id)})`,
    html: buildOrderConfirmationHtml(
      params.order,
      params.items,
      params.deliveryOption,
      params.freeShippingApplied,
      params.bundleName,
      params.promotionCode,
    ),
  });
}

// Internal, not customer-facing — plainer tone and layout than the
// confirmation email above on purpose.
function buildAdminNotificationHtml(
  order: Order,
  items: OrderItemDetail[],
  deliveryOption: OrderDeliveryOption | null,
  freeShippingApplied: boolean,
  customerEmail: string | null,
  bundleName: string | null,
  promotionCode: string | null,
): string {
  const customerName = order.shipping_address?.full_name ?? "Unknown";
  const customerPhone = order.shipping_address?.phone ?? "—";

  return `
  <div style="background-color: #f7f3ee; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7d3c8;">
      <div style="padding: 32px 24px;">
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Hey Dee,
        </p>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          A new order just came in — here are the details.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Order Number</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">#${orderNumber(order.id)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Customer</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">${customerEmail ?? "—"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">${customerPhone}</td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
          ${renderItemRows(items)}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding-top: 12px; color: #2b2b2b; font-size: 14px;">Subtotal</td>
            <td style="padding-top: 12px; color: #2b2b2b; font-size: 14px; text-align: right;">${formatNaira(order.subtotal)}</td>
          </tr>
          ${
            order.discount_amount > 0
              ? `<tr>
                  <td style="color: #2b2b2b; font-size: 14px;">${describeAppliedDiscount(bundleName, promotionCode)}</td>
                  <td style="color: #2b2b2b; font-size: 14px; text-align: right;">-${formatNaira(order.discount_amount)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="color: #2b2b2b; font-size: 14px;">
              Delivery${deliveryOption ? ` (${deliveryOption.name})` : ""}
            </td>
            <td style="color: #2b2b2b; font-size: 14px; text-align: right;">
              ${formatOrderDeliveryFee(order.delivery_fee, deliveryOption?.category ?? "", freeShippingApplied)}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 8px; color: #3a2f2a; font-size: 16px; font-weight: bold;">Total</td>
            <td style="padding-top: 8px; color: #3a2f2a; font-size: 16px; font-weight: bold; text-align: right;">${formatNaira(order.total)}</td>
          </tr>
        </table>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
            Shipping To
          </p>
          <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0;">
            ${renderAddress(order.shipping_address)}
          </p>
        </div>

        ${renderNoteSection("Order Note", order.order_note)}
      </div>
    </div>
  </div>
  `;
}

const STATUS_UPDATE_COPY: Record<
  NotifiableOrderStatus,
  { subject: string; heading: string; body: string }
> = {
  processing: {
    subject: "Your order is being prepared",
    heading: "Your order is being prepared",
    body: "We're getting your order ready. We'll email you again as soon as it ships.",
  },
  shipped: {
    subject: "Your order is on its way!",
    heading: "Your order is on its way!",
    body: "Your order has shipped and is on its way to you.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Your order has been delivered",
    body: "Your order has been delivered — we hope you love it! Thank you for shopping with Lace Luxe by Dee.",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    heading: "Your order has been cancelled",
    body: "Your order has been cancelled. If this wasn't expected, just reply to this email or contact us and we'll sort it out.",
  },
};

function renderItemSummaryList(items: OrderItemDetail[]): string {
  return `
    <ul style="margin: 0; padding-left: 18px; color: #2b2b2b; font-size: 14px; line-height: 1.8;">
      ${items
        .map((item) => {
          const variant = [item.sizeLabel, item.colorName].filter(Boolean).join(" · ");
          return `<li>${item.productName ?? "Item"}${variant ? ` (${variant})` : ""} &times; ${item.quantity}</li>`;
        })
        .join("")}
    </ul>
  `;
}

// Customer-facing, same branded shell as the confirmation email — just a
// shorter, status-specific body instead of the full order summary.
function buildOrderStatusUpdateHtml(
  order: Order,
  items: OrderItemDetail[],
  status: NotifiableOrderStatus,
  trackingNote: string | null,
): string {
  const copy = STATUS_UPDATE_COPY[status];

  return `
  <div style="background-color: #f7f3ee; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7d3c8;">
      <div style="background-color: #3a2f2a; padding: 24px; text-align: center;">
        <span style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 22px; color: #f7f3ee;">
          Lace Luxe <span style="color: #9c6b3f;">by Dee</span>
        </span>
      </div>

      <div style="padding: 32px 24px;">
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #3a2f2a; margin: 0 0 8px;">
          ${copy.heading}
        </h1>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          ${copy.body}
        </p>

        ${
          status === "shipped" && trackingNote
            ? `<p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px; padding: 12px 16px; background-color: #f7f3ee; border: 1px solid #e7d3c8;">
                <strong>Tracking:</strong> ${trackingNote}
              </p>`
            : ""
        }

        <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">
          Order Number
        </p>
        <p style="color: #3a2f2a; font-size: 16px; margin: 0 0 24px;">#${orderNumber(order.id)}</p>

        <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
          Items
        </p>
        ${renderItemSummaryList(items)}

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #2b2b2b; font-size: 13px; line-height: 1.6; margin: 0;">
            Questions about your order? Just reply to this email and we'll help out.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function sendOrderStatusUpdateEmail(params: {
  order: Order;
  items: OrderItemDetail[];
  status: NotifiableOrderStatus;
  trackingNote: string | null;
  toEmail: string;
}): Promise<void> {
  const resend = getResendClient();
  const copy = STATUS_UPDATE_COPY[params.status];

  await resend.emails.send({
    from: `Lace Luxe by Dee <${getFromEmail()}>`,
    to: params.toEmail,
    subject: `${copy.subject} (#${orderNumber(params.order.id)})`,
    html: buildOrderStatusUpdateHtml(
      params.order,
      params.items,
      params.status,
      params.trackingNote,
    ),
  });
}

export async function sendAdminOrderNotificationEmail(params: {
  order: Order;
  items: OrderItemDetail[];
  deliveryOption: OrderDeliveryOption | null;
  freeShippingApplied: boolean;
  customerEmail: string | null;
  bundleName: string | null;
  promotionCode: string | null;
}): Promise<void> {
  const resend = getResendClient();
  const customerName = params.order.shipping_address?.full_name ?? "Unknown customer";

  await resend.emails.send({
    from: `Lace Luxe by Dee <${getFromEmail()}>`,
    to: getAdminNotificationEmail(),
    subject: `New Order — ${customerName}`,
    html: buildAdminNotificationHtml(
      params.order,
      params.items,
      params.deliveryOption,
      params.freeShippingApplied,
      params.customerEmail,
      params.bundleName,
      params.promotionCode,
    ),
  });
}

// Same branded shell as the confirmation/status emails, sent once per
// genuinely new subscriber — never on a duplicate-email signup attempt.
function buildWelcomeEmailHtml(): string {
  const shopUrl = `${getSiteUrl()}/shop`;

  return `
  <div style="background-color: #f7f3ee; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7d3c8;">
      <div style="background-color: #3a2f2a; padding: 24px; text-align: center;">
        <span style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 22px; color: #f7f3ee;">
          Lace Luxe <span style="color: #9c6b3f;">by Dee</span>
        </span>
      </div>

      <div style="padding: 32px 24px;">
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #3a2f2a; margin: 0 0 8px;">
          Welcome to the family
        </h1>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Thank you for joining the Lace Luxe by Dee mailing list — we're so glad
          you're here. Here's what you can look forward to in your inbox:
        </p>

        <ul style="margin: 0 0 28px; padding-left: 18px; color: #2b2b2b; font-size: 14px; line-height: 1.9;">
          <li>Restock alerts for your favorite lace types, before they sell out again</li>
          <li>Early access to sales and new drops</li>
          <li>Styling and install tips straight from Dee</li>
        </ul>

        <div style="text-align: center; margin-bottom: 8px;">
          <a
            href="${shopUrl}"
            style="display: inline-block; background-color: #3a2f2a; color: #f7f3ee; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 32px;"
          >
            Shop Now
          </a>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #2b2b2b; font-size: 13px; line-height: 1.6; margin: 0;">
            Didn't sign up for this? No worries — just ignore this email and
            you won't hear from us again unless you subscribe yourself.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function sendWelcomeEmail(params: { toEmail: string }): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: `Lace Luxe by Dee <${getFromEmail()}>`,
    to: params.toEmail,
    subject: "Welcome to Lace Luxe by Dee",
    html: buildWelcomeEmailHtml(),
  });
}

// Internal, not customer-facing — same plainer shell as the admin order
// notification email.
function buildContactFormNotificationHtml(params: {
  name: string;
  email: string;
  message: string;
}): string {
  return `
  <div style="background-color: #f7f3ee; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7d3c8;">
      <div style="padding: 32px 24px;">
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Hey Dee,
        </p>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Someone just sent a message through the Contact Us page.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">${params.name}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
            <td style="padding: 4px 0; color: #3a2f2a; font-size: 14px; text-align: right;">${params.email}</td>
          </tr>
        </table>

        <p style="color: #9c6b3f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
          Message
        </p>
        <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0 0 24px; white-space: pre-wrap;">${params.message}</p>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e7d3c8;">
          <p style="color: #2b2b2b; font-size: 13px; line-height: 1.6; margin: 0;">
            Just reply to this email to respond directly to them.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function sendContactFormNotificationEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: `Lace Luxe by Dee <${getFromEmail()}>`,
    to: getAdminNotificationEmail(),
    replyTo: params.email,
    subject: `New Contact Form Message from ${params.name}`,
    html: buildContactFormNotificationHtml(params),
  });
}
