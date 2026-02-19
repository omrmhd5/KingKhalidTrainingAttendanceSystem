import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Mock data (previously from Supabase)
  const traineesCount = 20;
  const attendance = {
    present: 15,
    late: 2,
    absent: 3,
    escaped: 0,
    total: 20,
  };
  const recentEscapes: Array<{
    id: string;
    trainees?: { full_name: string; rank?: string };
    type?: string;
    detected_at?: string;
  }> = [];

  const stats = [
    {
      title: "إجمالي المتدربين",
      value: traineesCount,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "حاضرون",
      value: attendance.present + attendance.late,
      icon: UserCheck,
      color: "text-success",
    },
    {
      title: "غائبون",
      value: attendance.absent,
      icon: UserX,
      color: "text-destructive",
    },
    {
      title: "هاربون",
      value: attendance.escaped,
      icon: AlertTriangle,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            نظرة عامة على الحضور والإحصائيات
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحداث الهروب الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEscapes && recentEscapes.length > 0 ? (
            <div className="space-y-3">
              {recentEscapes.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{e.trainees?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.trainees?.rank} • {e.type}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {format(new Date(e.detected_at), "HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد أحداث هروب في هذا التاريخ.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
