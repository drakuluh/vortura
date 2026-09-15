import type React from "react";
import { NfcTapAnimation } from "@/components/landing/NfcTapAnimation";
import { WebsiteAnimation } from "@/components/landing/WebsiteAnimation";
import { AiCallAnimation } from "@/components/landing/AiCallAnimation";
import { DatabaseReactivationAnimation } from "@/components/landing/DatabaseReactivationAnimation";
import { QrMenuAnimation } from "@/components/landing/QrMenuAnimation";
import { EmailNewsletterAnimation } from "@/components/landing/EmailNewsletterAnimation";
import { BusinessMediaAnimation } from "@/components/landing/BusinessMediaAnimation";
import { EmailSignatureAnimation } from "@/components/landing/EmailSignatureAnimation";

/**
 * Service slug → its bespoke looping demo.
 *
 * Shared so the home page deck and the service detail pages stay in sync;
 * adding a service's animation in one place lights it up in both.
 */
export const SERVICE_ANIMATIONS: Record<string, React.FC<{ className?: string }>> = {
  "nfc-review-cards": NfcTapAnimation,
  "websites-local-business": WebsiteAnimation,
  "ai-call-answering": AiCallAnimation,
  "database-reactivation": DatabaseReactivationAnimation,
  "qr-code-menus": QrMenuAnimation,
  "email-newsletters": EmailNewsletterAnimation,
  "print-digital-design": BusinessMediaAnimation,
  "email-signatures": EmailSignatureAnimation,
};
