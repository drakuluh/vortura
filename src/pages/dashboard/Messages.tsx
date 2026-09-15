import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { ClientConversation } from "@/components/messaging/ClientConversation";

// Same conversation as the one on the contact page (see ClientConversation).
const Messages = () => (
  <DashboardSubPage
    eyebrow="Messages"
    title={<>Talk to Your <span className="text-gradient">Strategist</span></>}
    description="Direct line to the Vortura team. We usually reply within 24 hours."
    centered
  >
    <div className="max-w-3xl mx-auto">
      <ClientConversation />
    </div>
  </DashboardSubPage>
);

export default Messages;
