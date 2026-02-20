import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function ReportsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Mock data
  const attendanceData = [
    {
      id: "1",
      trainees: { full_name: "أحمد محمد", rank: "جندي", civil_id: "123456789" },
      shifts: { name: "النوبة الأولى" },
      check_in_at: new Date().toISOString(),
      check_out_at: new Date().toISOString(),
      late_minutes: 5,
      actual_minutes: 480,
      lost_minutes: 0,
      status: "late",
    },
  ];

  const absences: Array<{ id: string }> = [];

  const escapes: Array<{ id: string }> = [];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-sm text-muted-foreground">
            تقارير الحضور والبيانات اليومية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">التاريخ</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">
            الحضور ({attendanceData?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="absences">
            الغيابات ({absences?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="escapes">
            الهروب ({escapes?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المتدرب</TableHead>
                    <TableHead>النوبة</TableHead>
                    <TableHead>الدخول</TableHead>
                    <TableHead>الخروج</TableHead>
                    <TableHead>متأخر (دقيقة)</TableHead>
                    <TableHead>الفعلي (دقيقة)</TableHead>
                    <TableHead>المفقود (دقيقة)</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceData?.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.trainees?.full_name}
                        </TableCell>
                        <TableCell>{a.shifts?.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.check_in_at
                            ? format(new Date(a.check_in_at), "HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.check_out_at
                            ? format(new Date(a.check_out_at), "HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell>{a.late_minutes}</TableCell>
                        <TableCell>{a.actual_minutes}</TableCell>
                        <TableCell>{a.lost_minutes}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              a.status === "present"
                                ? "bg-success/15 text-success"
                                : a.status === "late"
                                  ? "bg-warning/15 text-warning"
                                  : a.status === "escaped"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-muted text-muted-foreground"
                            }`}>
                            {a.status === "present"
                              ? "حاضر"
                              : a.status === "late"
                                ? "متأخر"
                                : a.status === "escaped"
                                  ? "هارب"
                                  : "غائب"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absences">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المتدرب</TableHead>
                    <TableHead>رقم الهوية المدنية</TableHead>
                    <TableHead>الرتبة</TableHead>
                    <TableHead>النوبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absences?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground">
                        لا توجد غيابات
                      </TableCell>
                    </TableRow>
                  ) : (
                    absences?.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.trainees?.full_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.trainees?.civil_id}
                        </TableCell>
                        <TableCell>{a.trainees?.rank}</TableCell>
                        <TableCell>{a.shifts?.name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escapes">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المتدرب</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>وقت الكشف</TableHead>
                    <TableHead>الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escapes?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground">
                        لا توجد حالات هروب
                      </TableCell>
                    </TableRow>
                  ) : (
                    escapes?.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {e.trainees?.full_name}
                        </TableCell>
                        <TableCell>{e.type ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(e.detected_at), "HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {e.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
