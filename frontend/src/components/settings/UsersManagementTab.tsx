import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { userApi, User, UserCreateInput, UserUpdateInput } from "@/lib/userApi";

const ROLES = [
  { value: "admin", label: "مسؤول" },
  { value: "operator", label: "مشغل" },
  { value: "teacher", label: "معلم" },
];

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800" },
  operator: { bg: "bg-yellow-100", text: "text-yellow-800" },
  teacher: { bg: "bg-green-100", text: "text-green-800" },
};

const getRoleColor = (role: string) => {
  return ROLE_COLORS[role] || { bg: "bg-blue-100", text: "text-blue-800" };
};

export function UsersManagementTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "operator" as "admin" | "operator" | "teacher",
    class: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      // Sort by creation date - oldest first
      const sortedData = data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setUsers(sortedData);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "operator",
      class: "",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      class: user.class || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteTargetName(user.username);
    setIsDeleteOpen(true);
  };

  const handleAddUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "teacher" && !formData.class) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الفصل للمعلمين",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const createData: UserCreateInput = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        class: formData.role === "teacher" ? formData.class : undefined,
      };

      const response = await userApi.createUser(createData);
      setUsers([...users, response.user]);
      setIsAddOpen(false);
      toast({
        title: "نجاح",
        description: "تم إضافة المستخدم بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة المستخدم",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.username || !formData.email) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "teacher" && !formData.class) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الفصل للمعلمين",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UserUpdateInput = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        class: formData.role === "teacher" ? formData.class : undefined,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const response = await userApi.updateUser(selectedUser!._id, updateData);
      setUsers(
        users.map((u) => (u._id === selectedUser?._id ? response.user : u)),
      );
      setIsEditOpen(false);
      toast({
        title: "نجاح",
        description: "تم تحديث المستخدم بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث المستخدم",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await userApi.deleteUser(selectedUser._id);
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      setIsDeleteOpen(false);
      toast({
        title: "نجاح",
        description: "تم حذف المستخدم بنجاح",
      });
      setSelectedUser(null);
      setDeleteTargetName("");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف المستخدم",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>المستخدمون ({users.length})</CardTitle>
        <Button size="sm" onClick={handleOpenAdd} disabled={loading}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المستخدم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">الفصل</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    لا توجد مستخدمون
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          getRoleColor(user.role).bg
                        } ${getRoleColor(user.role).text}`}>
                        {ROLES.find((r) => r.value === user.role)?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.role === "teacher" ? user.class || "-" : "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(user)}
                        disabled={submitting}>
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(user)}
                        disabled={submitting}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-username" className="text-right block mb-2">
                اسم المستخدم
              </Label>
              <Input
                id="add-username"
                placeholder="أدخل اسم المستخدم"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="add-email" className="text-right block mb-2">
                البريد الإلكتروني
              </Label>
              <Input
                id="add-email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="add-password" className="text-right block mb-2">
                كلمة المرور
              </Label>
              <Input
                id="add-password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label
                htmlFor="add-confirm-password"
                className="text-right block mb-2">
                تأكيد كلمة المرور
              </Label>
              <Input
                id="add-confirm-password"
                type="password"
                placeholder="أكد كلمة المرور"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="add-role" className="text-right block mb-2">
                الدور
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "operator" | "teacher") =>
                  setFormData({ ...formData, role: value })
                }>
                <SelectTrigger id="add-role" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === "teacher" && (
              <div>
                <Label htmlFor="add-class" className="text-right block mb-2">
                  الفصل
                </Label>
                <Input
                  id="add-class"
                  placeholder="أدخل اسم الفصل"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  dir="rtl"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={submitting}>
              إلغاء
            </Button>
            <Button onClick={handleAddUser} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المستخدم</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username" className="text-right block mb-2">
                اسم المستخدم
              </Label>
              <Input
                id="edit-username"
                placeholder="أدخل اسم المستخدم"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-right block mb-2">
                البريد الإلكتروني
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="edit-password" className="text-right block mb-2">
                كلمة المرور (اتركها فارغة إذا لم تريد تغييرها)
              </Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label
                htmlFor="edit-confirm-password"
                className="text-right block mb-2">
                تأكيد كلمة المرور
              </Label>
              <Input
                id="edit-confirm-password"
                type="password"
                placeholder="أكد كلمة المرور"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="edit-role" className="text-right block mb-2">
                الدور
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "operator" | "teacher") =>
                  setFormData({ ...formData, role: value })
                }>
                <SelectTrigger id="edit-role" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === "teacher" && (
              <div>
                <Label htmlFor="edit-class" className="text-right block mb-2">
                  الفصل
                </Label>
                <Input
                  id="edit-class"
                  placeholder="أدخل اسم الفصل"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  dir="rtl"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateUser} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                "تحديث"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteUser}
        itemName={deleteTargetName}
        itemType="المستخدم"
      />
    </Card>
  );
}
