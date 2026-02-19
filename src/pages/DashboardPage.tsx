import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: traineesCount } = useQuery({
    queryKey: ["trainees-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("trainees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count ?? 0;
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance-summary", date],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance_sessions")
        .select("status")
        .eq("day_date", date);
      const sessions = data ?? [];
      return {
        present: sessions.filter((s) => s.status === "present").length,
        late: sessions.filter((s) => s.status === "late").length,
        absent: sessions.filter((s) => s.status === "absent").length,
        escaped: sessions.filter((s) => s.status === "escaped").length,
        total: sessions.length,
      };
    },
  });

  const { data: recentEscapes } = useQuery({
    queryKey: ["recent-escapes", date],
    queryFn: async () => {
      const { data } = await supabase
        .from("escape_events")
        .select("*, trainees(full_name, rank)")
        .gte("detected_at", `${date}T00:00:00`)
        .lte("detected_at", `${date}T23:59:59`)
        .order("detected_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const stats = [
    {
      title: "إجمالي المتدربين",
      value: traineesCount ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "حاضرون",
      value: (attendance?.present ?? 0) + (attendance?.late ?? 0),
      icon: UserCheck,
      color: "text-success",
    },
    {
      title: "غائبون",
      value: attendance?.absent ?? 0,
      icon: UserX,
      color: "text-destructive",
    },
    {
      title: "هاربون",
      value: attendance?.escaped ?? 0,
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
              {recentEscapes.map((e: any) => (
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
