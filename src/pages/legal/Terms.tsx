import { LegalPage } from "./LegalPage";
import { Seo } from "@/components/Seo";

const Terms = () => (
  <LegalPage eyebrow="Legal" title="Terms of Service" updated="April 28, 2026">
    <Seo
      title="Terms of Service"
      description="The terms that govern your use of Vortura Agency's website and services."
    />
    <h2>Agreement</h2>
    <p>
      These Terms of Service ("Terms") govern your access to and use of VORTURA.ai's
      website, dashboard, and services ("Services"). By using our Services, you agree
      to these Terms.
    </p>

    <h2>Eligibility</h2>
    <p>
      You must be at least 18 years old and authorized to enter into agreements on
      behalf of your business to use the Services.
    </p>

    <h2>Services</h2>
    <p>
      VORTURA.ai provides done-for-you AI automation packages including websites, local
      SEO, lead capture systems, AI voice agents, and CRM setup. Specific deliverables,
      timelines, and pricing are agreed in writing per package.
    </p>

    <h2>Accounts</h2>
    <ul>
      <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
      <li>You agree to provide accurate information and to keep it up to date.</li>
      <li>You are responsible for all activity that occurs under your account.</li>
    </ul>

    <h2>Fees and payment</h2>
    <p>
      Fees for one-time builds and recurring retainers are described in your package
      proposal or invoice. Payments are processed by our payment provider. Recurring
      subscriptions renew automatically until cancelled. Late payments may result in
      service suspension.
    </p>

    <h2>Client responsibilities</h2>
    <ul>
      <li>Provide timely access to required accounts, content, and approvals.</li>
      <li>Ensure you have the rights to any materials you supply to us.</li>
      <li>Comply with all applicable laws when using the Services.</li>
    </ul>

    <h2>Intellectual property</h2>
    <p>
      Upon full payment, you own the final deliverables for your project, excluding
      third-party tools, our proprietary frameworks, and pre-existing materials, which
      remain the property of their respective owners and us.
    </p>

    <h2>Acceptable use</h2>
    <p>
      You agree not to use the Services to transmit unlawful, harmful, or infringing
      content, to interfere with the Services, or to attempt to gain unauthorized
      access to our systems.
    </p>

    <h2>Termination</h2>
    <p>
      Either party may terminate a recurring engagement with 30 days' written notice.
      We may suspend or terminate your access immediately for material breach of these
      Terms or non-payment.
    </p>

    <h2>Disclaimers</h2>
    <p>
      The Services are provided "as is" without warranties of any kind. We do not
      guarantee specific business outcomes, traffic, leads, or revenue.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, our total liability arising out of or
      relating to these Terms will not exceed the amounts paid by you to us in the
      three months preceding the event giving rise to the claim.
    </p>

    <h2>Governing law</h2>
    <p>
      These Terms are governed by the laws of the jurisdiction in which VORTURA.ai is
      established, without regard to its conflict of law provisions.
    </p>

    <h2>Changes</h2>
    <p>
      We may update these Terms from time to time. Continued use of the Services after
      changes become effective constitutes acceptance of the updated Terms.
    </p>

    <h2>Contact</h2>
    <p>
      Questions? Email <a href="mailto:support@vortura.ai">support@vortura.ai</a>.
    </p>
  </LegalPage>
);

export default Terms;