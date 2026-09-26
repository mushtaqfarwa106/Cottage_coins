"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Wallet,
  FolderTree,
  FilePieChart,
  Brain,
  Mail,
  History,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Categories", url: "/categories", icon: FolderTree },
  { title: "Transactions", url: "/transactions", icon: Wallet },
  { title: "Reports", url: "/reports", icon: FilePieChart },
  { title: "AI Forecast", url: "/forecast", icon: Brain },
  { title: "Email Reports", url: "/email-reports", icon: Mail },
  { title: "History", url: "/history", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg aspect-square shadow-sm shadow-sidebar-primary/30">
                  <BarChart3 className="size-4" strokeWidth={2.25} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Cottage Coins</span>
                  <span className="text-xs">Finance Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className={`size-4 ${pathname === item.url ? "text-primary" : ""}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
