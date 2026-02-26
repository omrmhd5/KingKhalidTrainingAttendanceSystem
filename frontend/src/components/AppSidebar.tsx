import {
  LayoutDashboard,
  Users,
  ScanBarcode,
  FileText,
  Settings,
  Shield,
  AlertCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "لوحة التحكم",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "operator", "viewer"],
  },
  {
    title: "الكشك",
    url: "/kiosk",
    icon: ScanBarcode,
    roles: ["admin", "operator"],
  },
  {
    title: "المتدربون",
    url: "/trainees",
    icon: Users,
    roles: ["admin", "operator", "viewer"],
  },
  {
    title: "تحرير بيان",
    url: "/bulk-view",
    icon: FileText,
    roles: ["admin", "operator", "viewer"],
  },
  {
    title: "تسجيل المخالفين",
    url: "/violations",
    icon: AlertCircle,
    roles: ["admin", "operator"],
  },
  {
    title: "طلبات الانضباط",
    url: "/disciplinary",
    icon: Shield,
    roles: ["admin", "operator"],
  },
  {
    title: "التقارير",
    url: "/reports",
    icon: FileText,
    roles: ["admin", "operator", "viewer"],
  },
  { title: "الإعدادات", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { role } = useAuth();

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role),
  );

  return (
    <Sidebar side="right">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary" />
          <span className="text-sm font-bold text-sidebar-accent-foreground">
            برنامج الحضور و الانصراف
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                      <item.icon className="mx-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
