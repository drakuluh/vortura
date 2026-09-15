/**
 * Public contact details, in one place so the footer, contact page and schema
 * can't drift apart.
 *
 * `phone` is null until a real number exists. Components hide their phone
 * links while it's null, which is better than shipping a dead placeholder.
 * Set it as e.g. { display: "(905) 555-0100", href: "tel:+19055550100" }.
 */
export const CONTACT: {
  email: string;
  phone: { display: string; href: string } | null;
} = {
  email: "support@vortura.ai",
  phone: null,
};
