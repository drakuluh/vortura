import { LegalPage } from "./LegalPage";
import { Seo } from "@/components/Seo";

const Refund = () => (
  <LegalPage eyebrow="Legal" title="Refund Policy" updated="April 28, 2026">
    <Seo
      title="Refund Policy"
      description="Vortura Agency's refund policy for websites, automation packages, and monthly care plans."
    />
    <h2>Overview</h2>
    <p>
      Because VORTURA.ai delivers custom, done-for-you AI automation services that
      require dedicated team time and third-party tooling, refunds are handled on a
      case-by-case basis according to the policy below.
    </p>

    <h2>One-time build packages</h2>
    <ul>
      <li>
        <strong>Before kickoff:</strong> If you cancel before your kickoff call, you
        are eligible for a full refund of the build fee.
      </li>
      <li>
        <strong>After kickoff, before delivery:</strong> You may cancel and receive a
        partial refund of work not yet performed. Time and third-party costs already
        incurred are non-refundable.
      </li>
      <li>
        <strong>After delivery:</strong> One-time build fees are non-refundable once
        the deliverables have been handed off and accepted.
      </li>
    </ul>

    <h2>Monthly retainers and subscriptions</h2>
    <ul>
      <li>
        Recurring retainers are billed monthly in advance and may be cancelled with
        30 days' written notice.
      </li>
      <li>
        Already-paid retainer fees for the current billing period are generally
        non-refundable, but services continue through the end of the paid period.
      </li>
    </ul>

    <h2>Service issues</h2>
    <p>
      If something we delivered does not match the agreed scope, contact us within
      14 days and we will revise or rebuild the affected work at no additional cost.
      Our priority is to make it right before issuing a refund.
    </p>

    <h2>Non-refundable items</h2>
    <ul>
      <li>Third-party fees (domains, hosting, paid software, ad spend, phone numbers, SMS, AI usage credits).</li>
      <li>Work already performed and approved.</li>
      <li>Setup or onboarding fees once work has begun.</li>
    </ul>

    <h2>How to request a refund</h2>
    <p>
      Email <a href="mailto:support@vortura.ai">support@vortura.ai</a> with your
      account email, invoice number, and reason for the request. We will respond
      within 5 business days. Approved refunds are issued to the original payment
      method within 5–10 business days.
    </p>

    <h2>Chargebacks</h2>
    <p>
      We ask that you contact us first to resolve any billing concerns before
      initiating a chargeback. Disputes filed without prior contact may result in
      account suspension while we respond to the dispute.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about a charge or refund? Email{" "}
      <a href="mailto:support@vortura.ai">support@vortura.ai</a>.
    </p>
  </LegalPage>
);

export default Refund;