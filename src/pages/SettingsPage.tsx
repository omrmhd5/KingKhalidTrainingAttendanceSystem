import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const qc = useQueryClient();

  // Groups
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("name");
      return data ?? [];
    },
  });

  const addGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("groups")
        .insert({ name: groupName, description: groupDesc || null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      setGroupDialogOpen(false);
      setGroupName("");
      setGroupDesc("");
      toast({ title: "تم إنشاء المجموعة" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "تم حذف المجموعة" });
    },
  });

  // Shifts
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftGrace, setShiftGrace] = useState("10");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);

  const { data: shifts } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const { data } = await supabase.from("shifts").select("*").order("name");
      return data ?? [];
    },
  });

  const addShift = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("shifts")
        .insert({
          name: shiftName,
          start_time: shiftStart,
          end_time: shiftEnd,
          grace_minutes: parseInt(shiftGrace) || 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shifts"] });
      setShiftDialogOpen(false);
      setShiftName("");
      setShiftStart("");
      setShiftEnd("");
      setShiftGrace("10");
      toast({ title: "تم إنشاء النوبة" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shifts"] });
      toast({ title: "تم حذف النوبة" });
    },
  });

  // Schedule
  const [schedGroupId, setSchedGroupId] = useState("");
  const [schedShiftId, setSchedShiftId] = useState("");
  const [schedDate, setSchedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_schedules")
        .select("*, groups(name), shifts(name)")
        .order("day_date", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const addSchedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("group_schedules")
        .insert({
          group_id: schedGroupId,
          shift_id: schedShiftId,
          day_date: schedDate,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast({ title: "تم تعيين الجدول الزمني" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

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
                      addGroup.mutate();
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
                          onClick={() => deleteGroup.mutate(g.id)}>
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
                      addShift.mutate();
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
                          onClick={() => deleteShift.mutate(s.id)}>
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
                  addSchedule.mutate();
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
