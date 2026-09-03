import { LegalPage } from "./LegalPage";
import { Seo } from "@/components/Seo";

const Privacy = () => (
  <LegalPage eyebrow="Legal" title="Privacy Policy" updated="April 28, 2026">
    <Seo
      title="Privacy Policy"
      description="How Vortura Agency collects, uses, and protects your information when you visit our site or use our services."
    />
    <h2>Overview</h2>
    <p>
      VORTURA.ai ("we", "us", or "our") respects your privacy. This Privacy Policy explains
      what information we collect, how we use it, and the choices you have when you visit
      our website or use our services.
    </p>

    <h2>Information we collect</h2>
    <ul>
      <li><strong>Account information</strong> — name, email, business name, and phone number you provide when signing up or contacting us.</li>
      <li><strong>Project information</strong> — details you share so we can deliver automation packages, including business goals, integrations, and content.</li>
      <li><strong>Billing information</strong> — processed by our payment provider; we do not store full card numbers on our servers.</li>
      <li><strong>Usage data</strong> — log data, device, browser, and basic analytics about how you use our dashboard and site.</li>
    </ul>

    <h2>How we use information</h2>
    <ul>
      <li>Provide, maintain, and improve our services and dashboard.</li>
      <li>Communicate with you about projects, invoices, support, and product updates.</li>
      <li>Process payments and prevent fraud.</li>
      <li>Comply with legal obligations.</li>
    </ul>

    <h2>Sharing</h2>
    <p>
      We do not sell your personal information. We share data only with vetted service
      providers (hosting, payment processing, analytics, email delivery) under contracts
      that require them to protect it, or when required by law.
    </p>

    <h2>Data retention</h2>
    <p>
      We retain account and project data for as long as your account is active or as
      needed to provide services, comply with legal obligations, resolve disputes, and
      enforce agreements.
    </p>

    <h2>Your rights</h2>
    <p>
      Depending on your jurisdiction, you may have the right to access, correct, export,
      or delete your personal information. To make a request, email us at the address
      below.
    </p>

    <h2>Cookies</h2>
    <p>
      We use essential cookies to keep you signed in and analytics cookies to understand
      site usage. You can control cookies through your browser settings.
    </p>

    <h2>Security</h2>
    <p>
      We use industry-standard safeguards including encryption in transit, access
      controls, and regular reviews. No method of transmission over the internet is
      100% secure, but we work hard to protect your information.
    </p>

    <h2>Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Material changes will be
      posted on this page with a new "Last updated" date.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about privacy? Email <a href="mailto:support@vortura.ai">support@vortura.ai</a>.
    </p>
  </LegalPage>
);

export default Privacy;