import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function SettingsPage() {
  const { toast } = useToast();

  // Groups
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  // Mock data
  const [groups, setGroups] = useState([
    { id: "1", name: "المجموعة الأولى", description: "المجموعة الأولى" },
  ]);

  const handleAddGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المجموعة",
        variant: "destructive",
      });
      return;
    }
    const newGroup = {
      id: String(groups.length + 1),
      name: groupName,
      description: groupDesc || "",
    };
    setGroups([...groups, newGroup]);
    setGroupDialogOpen(false);
    setGroupName("");
    setGroupDesc("");
    toast({ title: "تم إنشاء المجموعة" });
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
    toast({ title: "تم حذف المجموعة" });
  };

  // Shifts
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftGrace, setShiftGrace] = useState("10");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);

  const [shifts, setShifts] = useState([
    {
      id: "1",
      name: "الصباح",
      start_time: "08:00",
      end_time: "16:00",
      grace_minutes: 10,
    },
    {
      id: "2",
      name: "المساء",
      start_time: "16:00",
      end_time: "00:00",
      grace_minutes: 15,
    },
  ]);

  const handleAddShift = () => {
    if (!shiftName.trim() || !shiftStart || !shiftEnd) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    const newShift = {
      id: String(shifts.length + 1),
      name: shiftName,
      start_time: shiftStart,
      end_time: shiftEnd,
      grace_minutes: parseInt(shiftGrace) || 0,
    };
    setShifts([...shifts, newShift]);
    setShiftDialogOpen(false);
    setShiftName("");
    setShiftStart("");
    setShiftEnd("");
    setShiftGrace("10");
    toast({ title: "تم إنشاء النوبة" });
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter((s) => s.id !== id));
    toast({ title: "تم حذف النوبة" });
  };

  // Schedule
  const [schedGroupId, setSchedGroupId] = useState("");
  const [schedShiftId, setSchedShiftId] = useState("");
  const [schedDate, setSchedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [schedules, setSchedules] = useState([
    {
      id: "1",
      group_id: "1",
      shift_id: "1",
      day_date: format(new Date(), "yyyy-MM-dd"),
      groups: { name: "المجموعة الأولى" },
      shifts: { name: "الصباح" },
    },
  ]);

  const handleAddSchedule = () => {
    if (!schedGroupId || !schedShiftId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار المجموعة والنوبة",
        variant: "destructive",
      });
      return;
    }
    const selectedGroup = groups.find((g) => g.id === schedGroupId);
    const selectedShift = shifts.find((s) => s.id === schedShiftId);

    if (!selectedGroup || !selectedShift) return;

    const newSchedule = {
      id: String(schedules.length + 1),
      group_id: schedGroupId,
      shift_id: schedShiftId,
      day_date: schedDate,
      groups: { name: selectedGroup.name },
      shifts: { name: selectedShift.name },
    };
    setSchedules([newSchedule, ...schedules]);
    toast({ title: "تم تعيين الجدول الزمني" });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">المجموعات</TabsTrigger>
          <TabsTrigger value="shifts">النوبات</TabsTrigger>
          <TabsTrigger value="schedule">الجدول الزمني</TabsTrigger>
        </TabsList>

        {/* Groups */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المجموعات</CardTitle>
              <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>مجموعة جديدة</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddGroup();
                    }}
                    className="space-y-4">
                    <div>
                      <Label>الاسم</Label>
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>الوصف</Label>
                      <Input
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups?.map((g: any) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {g.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGroup(g.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shifts */}
        <TabsContent value="shifts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>النوبات</CardTitle>
              <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>نوبة جديدة</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddShift();
                    }}
                    className="space-y-4">
                    <div>
                      <Label>الاسم</Label>
                      <Input
                        value={shiftName}
                        onChange={(e) => setShiftName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>وقت البداية</Label>
                        <Input
                          type="time"
                          value={shiftStart}
                          onChange={(e) => setShiftStart(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>وقت النهاية</Label>
                        <Input
                          type="time"
                          value={shiftEnd}
                          onChange={(e) => setShiftEnd(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>دقائق السماح</Label>
                      <Input
                        type="number"
                        value={shiftGrace}
                        onChange={(e) => setShiftGrace(e.target.value)}
                        min={0}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      إنشاء
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البداية</TableHead>
                    <TableHead>النهاية</TableHead>
                    <TableHead>السماح</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts?.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.start_time}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.end_time}
                      </TableCell>
                      <TableCell>{s.grace_minutes} دقيقة</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteShift(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>تعيين الجدول الزمني</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSchedule();
                }}
                className="grid gap-4 sm:grid-cols-4 mb-6">
                <div>
                  <Label>المجموعة</Label>
                  <Select value={schedGroupId} onValueChange={setSchedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="المجموعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((g: any) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>النوبة</Label>
                  <Select value={schedShiftId} onValueChange={setSchedShiftId}>
                    <SelectTrigger>
                      <SelectValue placeholder="النوبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!schedGroupId || !schedShiftId}>
                    تعيين
                  </Button>
                </div>
              </form>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المجموعة</TableHead>
                    <TableHead>النوبة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules?.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>{(s as any).groups?.name}</TableCell>
                      <TableCell>{(s as any).shifts?.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.day_date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
