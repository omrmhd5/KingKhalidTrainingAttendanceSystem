import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TraineeForm {
  civil_id: string;
  military_id: string;
  full_name: string;
  rank: string;
  specialty: string;
  barcode_value: string;
  group_id: string;
  status: string;
}

const emptyForm: TraineeForm = { civil_id: '', military_id: '', full_name: '', rank: '', specialty: '', barcode_value: '', group_id: '', status: 'active' };

export default function TraineesPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TraineeForm>(emptyForm);

  const { data: trainees, isLoading } = useQuery({
    queryKey: ['trainees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trainees').select('*, groups(name)').order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await supabase.from('groups').select('*').order('name');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: TraineeForm) => {
      const payload = { ...form, group_id: form.group_id || null };
      if (editing) {
        const { error } = await supabase.from('trainees').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('trainees').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainees'] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      toast({ title: editing ? 'تم تحديث المتدرب' : 'تم إنشاء المتدرب' });
    },
    onError: (err: any) => toast({ title: 'خطأ', description: err.message, variant: 'destructive' }),
  });

  const filtered = trainees?.filter((t: any) =>
    [t.full_name, t.civil_id, t.military_id, t.barcode_value].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const openEdit = (t: any) => {
    setEditing(t.id);
    setForm({ civil_id: t.civil_id, military_id: t.military_id, full_name: t.full_name, rank: t.rank ?? '', specialty: t.specialty ?? '', barcode_value: t.barcode_value, group_id: t.group_id ?? '', status: t.status });
    setDialogOpen(true);
  };

  const canWrite = role === 'admin';

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المتدربون</h1>
          <p className="text-sm text-muted-foreground">{trainees?.length ?? 0} متدربون مسجلون</p>
        </div>
        {canWrite && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة متدرب</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? 'تعديل المتدرب' : 'متدرب جديد'}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="space-y-1">
                  <Label>الاسم الكامل</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>الرتبة</Label>
                  <Input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>رقم الهوية المدنية</Label>
                  <Input value={form.civil_id} onChange={(e) => setForm({ ...form, civil_id: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>رقم الهوية العسكرية</Label>
                  <Input value={form.military_id} onChange={(e) => setForm({ ...form, military_id: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>الرمز الشريطي</Label>
                  <Input value={form.barcode_value} onChange={(e) => setForm({ ...form, barcode_value: e.target.value })} required className="font-mono" />
                </div>
                <div className="space-y-1">
                  <Label>التخصص</Label>
                  <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>المجموعة</Label>
                  <Select value={form.group_id} onValueChange={(v) => setForm({ ...form, group_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر المجموعة" /></SelectTrigger>
                    <SelectContent>
                      {groups?.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم أو الرقم أو الرمز الشريطي..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الرتبة</TableHead>
                <TableHead>رقم الهوية المدنية</TableHead>
                <TableHead>رقم الهوية العسكرية</TableHead>
                <TableHead>الرمز الشريطي</TableHead>
                <TableHead>المجموعة</TableHead>
                <TableHead>الحالة</TableHead>
                {canWrite && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لم يتم العثور على متدربين</TableCell></TableRow>
              ) : (
                filtered?.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.full_name}</TableCell>
                    <TableCell>{t.rank}</TableCell>
                    <TableCell className="font-mono text-xs">{t.civil_id}</TableCell>
                    <TableCell className="font-mono text-xs">{t.military_id}</TableCell>
                    <TableCell className="font-mono text-xs">{t.barcode_value}</TableCell>
                    <TableCell>{(t as any).groups?.name ?? '—'}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {t.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    {canWrite && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
