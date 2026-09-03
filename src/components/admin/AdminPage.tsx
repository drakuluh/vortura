import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AdminPage = ({ eyebrow, title, description, actions, children, className }: Props) => {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10">
      <div className={cn("max-w-7xl mx-auto", className)}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};
