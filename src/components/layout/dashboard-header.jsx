"use client";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { LogOut as LogOutIcon } from "lucide-react";
import { authAPI } from "@/lib/api/auth";

const titles = new Map([
  ["/dashboard", "Dashboard"],
  ["/transactions", "Transactions"],
  ["/categories", "Categories"],
  ["/reports", "Reports"],
  ["/forecast", "AI Forecast"],
  ["/inventory-insights", "AI Inventory Insights"],
  ["/email-reports", "Email Reports"],
  ["/history", "History"],
]);

export function DashboardHeader() {
  const pathname = usePathname();
  const title = titles.get(pathname) || "Dashboard";
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/85 px-4 shadow-sm shadow-primary/5 backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mr-2" />
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <LogoutButton />
    </header>
  );
}

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authAPI.logout();
    router.push("/login");
  };

  return (
    <div className="ml-auto">
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        <LogOutIcon className="mr-2 size-4" />
        Log out
      </Button>
    </div>
  );
}

export default DashboardHeader;
