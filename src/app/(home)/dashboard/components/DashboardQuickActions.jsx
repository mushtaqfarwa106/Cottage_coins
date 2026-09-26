import Link from "next/link";
import { Plus, FilePieChart, Mail, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: " Transaction",
    href: "/transactions",
    icon: Plus,
    className: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-800 dark:text-emerald-200",
  },
  {
    label: "View Reports",
    href: "/reports",
    icon: FilePieChart,
    className: "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 text-blue-800 dark:text-blue-200",
  },
  {
    label: "Email Report",
    href: "/email-reports",
    icon: Mail,
    className: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-900 dark:text-amber-200",
  },
  {
    label: "View History",
    href: "/history",
    icon: History,
    className: "bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/20 text-violet-800 dark:text-violet-200",
  },
];

export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map(({ label, href, icon: Icon, className }) => (
        <Button key={href} variant="outline" className={`gap-2 ${className}`} asChild>
          <Link href={href}>
            <Icon className="size-4" />
            {label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
