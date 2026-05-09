import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { attendanceApi } from "@/lib/attendanceApi";

interface DashboardStats {
  date: string;
  attended: number;
  exited: number;
  onTime: number;
  late: number;
  shiftSummary: Record<string, Record<string, number>>;
}

export default function TodaysSummaryPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const res = await attendanceApi.getDailySummary(date);
        setStats(res as DashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (date) {
      fetchDashboardStats();
    }
  }, [date]);

  // Get unique shifts for table headers
  const allActualShifts = new Set<string>();
  if (stats?.shiftSummary) {
    Object.values(stats.shiftSummary).forEach((shiftMap) => {
      Object.keys(shiftMap).forEach((shift) => allActualShifts.add(shift));
    });
  }
  const sortedActualShifts = Array.from(allActualShifts).sort();

  // Calculate column totals
  const columnTotals: Record<string, number> = {};
  let grandTotal = 0;
  if (stats?.shiftSummary) {
    sortedActualShifts.forEach((actualShift) => {
      const total = Object.values(stats.shiftSummary).reduce(
        (sum, shiftCounts) => {
          return sum + (shiftCounts[actualShift] || 0);
        },
        0,
      );
      columnTotals[actualShift] = total;
      grandTotal += total;
    });
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ملخص اليوم</h1>
          <p className="text-sm text-muted-foreground">
            ملخص الحضور والإحصائيات اليومية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date" className="text-sm">
            التاريخ
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg text-blue-900">
            ملخص الحضور حسب الشفت
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : (
            <Table dir="rtl">
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="text-right text-blue-900 font-bold">
                    الشفت المخصص للطالب
                  </TableHead>
                  {sortedActualShifts.map((shift) => (
                    <TableHead
                      key={shift}
                      className="text-center text-blue-900 font-bold">
                      الشفت الذي حضر فيه: {shift}
                    </TableHead>
                  ))}
                  <TableHead className="text-center text-blue-900 font-bold">
                    الإجمالي
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats && Object.entries(stats.shiftSummary).length > 0 ? (
                  <>
                    {Object.entries(stats.shiftSummary).map(
                      ([assignedShift, shiftCounts]) => {
                        const total = Object.values(shiftCounts).reduce(
                          (sum, count) => sum + count,
                          0,
                        );

                        return (
                          <TableRow key={assignedShift} className="border-b">
                            <TableCell className="font-medium text-right text-blue-900">
                              {assignedShift}
                            </TableCell>
                            {sortedActualShifts.map((actualShift) => (
                              <TableCell
                                key={actualShift}
                                className="text-center text-blue-800">
                                {shiftCounts[actualShift] || 0}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-bold text-blue-900 bg-blue-50">
                              {total}
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                    <TableRow className="bg-blue-100 border-t-2 border-blue-300">
                      <TableCell className="font-bold text-right text-blue-900">
                        الإجمالي
                      </TableCell>
                      {sortedActualShifts.map((actualShift) => (
                        <TableCell
                          key={actualShift}
                          className="text-center font-bold text-blue-900">
                          {columnTotals[actualShift]}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-blue-900 bg-blue-200">
                        {grandTotal}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={sortedActualShifts.length + 2}
                      className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات حضور
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-lg text-green-900">
            إحصائيات الحضور العامة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-sm text-green-700">إجمالي الحاضرين</p>
              <p className="text-3xl font-bold text-green-900">
                {stats?.attended || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">في الموعد</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats?.onTime || 0}
              </p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-700">متأخرين</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats?.late || 0}
              </p>
            </div>
            <div className="p-4 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-700">خروج</p>
              <p className="text-3xl font-bold text-orange-900">
                {stats?.exited || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
