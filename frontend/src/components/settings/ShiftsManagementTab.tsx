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
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShiftTimeModal } from "./ShiftTimeModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { shiftApi } from "@/lib/shiftApi";

// Helper function to convert 24-hour format to 12-hour Arabic format
const convertTo12HourArabic = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

export function ShiftsManagementTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Shifts
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftGrace, setShiftGrace] = useState("10");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);

  const [shifts, setShifts] = useState<any[]>([]);

  // Edit Shift
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [editingShiftName, setEditingShiftName] = useState("");
  const [editingShiftStart, setEditingShiftStart] = useState("");
  const [editingShiftEnd, setEditingShiftEnd] = useState("");
  const [editingShiftGrace, setEditingShiftGrace] = useState("10");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Load shifts on component mount
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftApi.getAllShifts();
      setShifts(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الشفتات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async () => {
    if (!shiftName.trim() || !shiftStart || !shiftEnd) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    try {
      const newShift = await shiftApi.createShift({
        name: shiftName,
        start_time: shiftStart,
        end_time: shiftEnd,
        grace_minutes: parseInt(shiftGrace) || 0,
      });
      setShifts([...shifts, newShift]);
      setShiftDialogOpen(false);
      setShiftName("");
      setShiftStart("");
      setShiftEnd("");
      setShiftGrace("10");
      toast({ title: "تم إنشاء الشفت" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء الشفت",
        variant: "destructive",
      });
    }
  };

  const handleDeleteShift = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await shiftApi.deleteShift(deleteTargetId);
        setShifts(shifts.filter((s) => s._id !== deleteTargetId));
        toast({ title: "تم حذف الشفت" });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل حذف الشفت",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditShift = (shift: any) => {
    setEditingShiftId(shift._id);
    setEditingShiftName(shift.name);
    setEditingShiftStart(shift.start_time);
    setEditingShiftEnd(shift.end_time);
    setEditingShiftGrace(String(shift.grace_minutes));
    setEditDialogOpen(true);
  };

  const handleUpdateShift = async () => {
    if (
      !editingShiftName.trim() ||
      !editingShiftStart ||
      !editingShiftEnd ||
      !editingShiftId
    ) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    try {
      const updatedShift = await shiftApi.updateShift(editingShiftId, {
        name: editingShiftName,
        start_time: editingShiftStart,
        end_time: editingShiftEnd,
        grace_minutes: parseInt(editingShiftGrace) || 0,
      });
      setShifts(
        shifts.map((s) => (s._id === editingShiftId ? updatedShift : s)),
      );
      setEditDialogOpen(false);
      setEditingShiftId(null);
      setEditingShiftName("");
      setEditingShiftStart("");
      setEditingShiftEnd("");
      setEditingShiftGrace("10");
      toast({ title: "تم تحديث الشفت" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الشفت",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>ادارة الشفتات ({shifts.length})</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setShiftName("");
            setShiftStart("");
            setShiftEnd("");
            setShiftGrace("10");
            setShiftDialogOpen(true);
          }}>
          <Plus className="ml-2 h-4 w-4" />
          اضافة شفت
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ShiftTimeModal
          open={shiftDialogOpen}
          onOpenChange={setShiftDialogOpen}
          onSubmit={handleAddShift}
          shiftName={shiftName}
          setShiftName={setShiftName}
          shiftStart={shiftStart}
          setShiftStart={setShiftStart}
          shiftEnd={shiftEnd}
          setShiftEnd={setShiftEnd}
          shiftGrace={shiftGrace}
          setShiftGrace={setShiftGrace}
        />
        <ShiftTimeModal
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateShift}
          isEditing={true}
          shiftName={editingShiftName}
          setShiftName={setEditingShiftName}
          shiftStart={editingShiftStart}
          setShiftStart={setEditingShiftStart}
          shiftEnd={editingShiftEnd}
          setShiftEnd={setEditingShiftEnd}
          shiftGrace={editingShiftGrace}
          setShiftGrace={setEditingShiftGrace}
        />
        <ConfirmDeleteModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDelete}
          itemName={deleteTargetName}
          itemType="الشفت"
        />
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table dir="rtl" className="border-collapse">
            <TableHeader className="bg-sky-600">
              <TableRow>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  الاسم
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  البداية
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  النهاية
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  السماح
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  المتدربون
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 px-4 border border-gray-300">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : shifts.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 px-4 border border-gray-300">
                    لا توجد شفتات
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((s: any, index) => {
                  const startTime12 = convertTo12HourArabic(s.start_time);
                  const endTime12 = convertTo12HourArabic(s.end_time);
                  const [startTimeNum, startPeriod] = startTime12.split(" ");
                  const [endTimeNum, endPeriod] = endTime12.split(" ");
                  return (
                    <TableRow
                      key={s._id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                      <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono text-center py-2 px-4 border border-gray-300">
                        {startTimeNum}
                        <span className="text-md font-semibold">
                          {" "}
                          {startPeriod}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-center py-2 px-4 border border-gray-300">
                        {endTimeNum}
                        <span className="text-md font-semibold">
                          {" "}
                          {endPeriod}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {s.grace_minutes} دقائق
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {s.trainees_count || 0}
                      </TableCell>
                      <TableCell className="text-center flex gap-2 justify-center py-2 px-4 border border-gray-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditShift(s)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteShift(s._id, s.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
