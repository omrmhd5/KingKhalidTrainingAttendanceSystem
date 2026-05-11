import {
  BarChart3,
  Users,
  ScanBarcode,
  FileText,
  Settings,
  Shield,
  AlertCircle,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { userApi } from "@/lib/userApi";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  {
    title: "ملخص اليوم",
    url: "/",
    icon: BarChart3,
    roles: ["admin", "operator", "viewer"],
  },
  {
    title: "الصفحة الرئيسية",
    url: "/main",
    icon: ScanBarcode,
    roles: ["admin", "operator"],
  },
  {
    title: "فصلي",
    url: "/teacher",
    icon: BookOpen,
    roles: ["teacher"],
  },
  {
    title: "التقارير",
    url: "/reports",
    icon: FileText,
    roles: ["admin", "operator", "viewer"],
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
    title: "الفصول الدراسية",
    url: "/classes",
    icon: BookOpen,
    roles: ["admin", "operator"],
  },
  { title: "الإعدادات", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { role } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role),
  );

  function resetDialog() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError(null);
    setSuccess(null);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await userApi.changePassword(
        currentPassword,
        newPassword,
        confirmNewPassword,
      );
      setSuccess(result.message);
      setTimeout(() => {
        setDialogOpen(false);
        resetDialog();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "حدث خطأ أثناء تغيير كلمة المرور",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Sidebar side="right">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-sm font-bold text-sidebar-accent-foreground">
              برنامج الحضور و الانصراف و الفصول الدراسية
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
        {role === "teacher" && (
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <Button
              size="sm"
              className="w-full gap-2 text-sm bg-blue-200 text-blue-900 hover:bg-blue-300"
              onClick={() => {
                resetDialog();
                setDialogOpen(true);
              }}>
              <KeyRound className="h-4 w-4" />
              تغيير كلمة المرور
            </Button>
          </SidebarFooter>
        )}
      </Sidebar>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialog();
        }}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              تغيير كلمة المرور
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrent((v) => !v)}
                  tabIndex={-1}>
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}>
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">
                تأكيد كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}>
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : null}
                حفظ كلمة المرور
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
