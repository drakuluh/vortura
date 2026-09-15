import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

/**
 * Sits next to a mailto link. Many people have no desktop mail app set up, so
 * clicking mailto does nothing for them; copying the address always works.
 */
export const CopyEmailButton = ({ email }: { email: string }) => {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      type="button"
      onClick={() => void copy(email)}
      aria-label={copied ? "Email address copied" : `Copy ${email}`}
      title={copied ? "Copied" : "Copy email address"}
      className="print:hidden inline-flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-full border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
};
