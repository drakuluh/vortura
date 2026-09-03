import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <AdminPage eyebrow="404" title="Page not found" description="That admin route doesn't exist.">
      <div className="glass rounded-2xl p-10 text-center">
        <Button asChild variant="hero" size="sm">
          <Link to="/admin"><ArrowLeft className="w-3.5 h-3.5" />Back to overview</Link>
        </Button>
      </div>
    </AdminPage>
  );
}
