import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { traineeApi } from "@/lib/traineeApi";
import { Search, ArrowLeftRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TraineeSearchFilters } from "@/components/trainees/TraineeSearchFilters";
import { rankApi } from "@/lib/rankApi";
import { specializationApi } from "@/lib/specializationApi";
import { shiftApi } from "@/lib/shiftApi";
import Barcode from "react-barcode";
import {
  ExportPDF,
  ExportExcel,
  ChangeShiftModal,
} from "@/components/bulkview";

export default function BulkViewPage() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>(() => {
    const saved = localStorage.getItem("bulkViewResults");
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"military" | "civil">(
    "military",
  );
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [ranks, setRanks] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [changeShiftOpen, setChangeShiftOpen] = useState(false);
  const [targetShiftId, setTargetShiftId] = useState("");
  const [isChangingShift, setIsChangingShift] = useState(false);

  // Save results to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("bulkViewResults", JSON.stringify(results));
  }, [results]);

  // Load filter options
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [ranksData, specializationsData, shiftsData] = await Promise.all([
        rankApi.getAllRanks(),
        specializationApi.getAllSpecializations(),
        shiftApi.getAllShifts(),
      ]);
      setRanks(ranksData);
      setSpecializations(specializationsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  const handleSearch = async () => {
    if (!input.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال أرقام عسكرية أو سجلات مدنية",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    try {
      setIsLoading(true);
      // Parse input - split by spaces or newlines (not commas)
      const ids = input
        .split(/[\s\n\r]+/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (ids.length === 0) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على أرقام صالحة",
          variant: "destructive",
          duration: 1500,
        });
        return;
      }

      // Fetch trainees matching the IDs from backend
      const filtered = await traineeApi.searchByIds(ids, searchType);

      if (filtered.length === 0) {
        toast({
          title: "لم يتم العثور على نتائج",
          description: `لم يتم العثور على متدربين بالأرقام المدخلة (${ids.join(", ")})`,
          variant: "destructive",
          duration: 1500,
        });
      } else {
        // Append new results to existing ones
        setResults((prevResults) => [
          ...prevResults,
          ...filtered.filter((f) => !prevResults.find((p) => p._id === f._id)),
        ]);
        toast({
          title: "تم البحث بنجاح",
          description: `تم العثور على ${filtered.length} متدرب إضافي`,
          duration: 1500,
        });
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "فشل البحث عن المتدربين";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    localStorage.removeItem("bulkViewResults");
  };

  // Apply local filters to results
  const filtered = results.filter((t: any) => {
    const matchesSearch = [t.full_name, t.civil_id, t.military_id].some((v) =>
      v?.toString().toLowerCase().includes(search.toLowerCase()),
    );
    const matchesRank =
      !filterRank || filterRank === "all" || t.rank_id?._id === filterRank;
    const matchesSpecialty =
      !filterSpecialty ||
      filterSpecialty === "all" ||
      t.specialty_id?._id === filterSpecialty;
    const matchesShift =
      !filterShift || filterShift === "all" || t.shift_id?._id === filterShift;

    return matchesSearch && matchesRank && matchesSpecialty && matchesShift;
  });

  const shiftBreakdown = filtered.reduce(
    (acc: Record<string, { name: string; count: number }>, t: any) => {
      const id = t.shift_id?._id ?? "unknown";
      const name = t.shift_id?.name ?? "غير محدد";
      if (!acc[id]) acc[id] = { name, count: 0 };
      acc[id].count++;
      return acc;
    },
    {},
  );

  const handleChangeShift = async () => {
    if (!targetShiftId) return;
    try {
      setIsChangingShift(true);
      const ids = filtered.map((t: any) => t._id);
      const result = await traineeApi.bulkUpdateShift(ids, targetShiftId);
      // Update local results to reflect new shift
      const newShift = shifts.find((s) => s._id === targetShiftId);
      setResults((prev) =>
        prev.map((t) =>
          ids.includes(t._id) ? { ...t, shift_id: newShift } : t,
        ),
      );
      setChangeShiftOpen(false);
      setTargetShiftId("");
      toast({
        title: "تم تغيير الشفت",
        description: `تم تحديث ${result.updatedCount} متدرب إلى شفت ${result.shiftName}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: (error as Error)?.message || "فشل تغيير الشفت",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsChangingShift(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">تحرير بيان</h1>
        <p className="text-sm text-muted-foreground">
          ابحث عن متدربين بالأرقام العسكرية أو السجلات المدنية
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إدخال الأرقام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium block">نوع البحث</label>
            <RadioGroup
              value={searchType}
              onValueChange={(value) =>
                setSearchType(value as "military" | "civil")
              }>
              <div className="flex justify-end items-center space-x-2">
                <Label
                  htmlFor="military"
                  className="cursor-pointer font-normal">
                  البحث برقم عسكري
                </Label>
                <RadioGroupItem value="military" id="military" />
              </div>
              <div className="flex justify-end items-center space-x-2">
                <Label htmlFor="civil" className="cursor-pointer font-normal">
                  البحث برقم سجل مدني
                </Label>
                <RadioGroupItem value="civil" id="civil" />
              </div>
            </RadioGroup>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">الأرقام</label>
            <Textarea
              placeholder={`أدخل الأرقام على أسطر منفصلة
مثال:
12345
67890
54321`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32"
              dir="rtl"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            أدخل الأرقام على أسطر جديدة
          </p>
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="ml-2 h-4 w-4" />
              {isLoading ? "جاري البحث..." : "بحث"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}>
              مسح النتائج
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                النتائج ({filtered.length}
                {filtered.length !== results.length && ` من ${results.length}`})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setChangeShiftOpen(true)}
                  disabled={filtered.length === 0}>
                  <ArrowLeftRight className="ml-2 h-4 w-4" />
                  تغيير الشفت
                </Button>
                <ExportExcel data={filtered} />
                <ExportPDF data={filtered} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-medium mb-4">تصفية النتائج</h3>
              <TraineeSearchFilters
                search={search}
                onSearchChange={setSearch}
                filterRank={filterRank}
                onRankChange={setFilterRank}
                filterSpecialty={filterSpecialty}
                onSpecialtyChange={setFilterSpecialty}
                filterShift={filterShift}
                onShiftChange={setFilterShift}
                ranks={ranks}
                specializations={specializations}
                shifts={shifts}
              />
            </div>
            {filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرقم العسكري</TableHead>
                    <TableHead className="text-right">السجل المدني</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الرتبة</TableHead>
                    <TableHead className="text-right">التخصص</TableHead>
                    <TableHead className="text-right">الشفت</TableHead>
                    <TableHead className="text-center">الباركود</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t: any) => (
                    <TableRow key={t._id}>
                      <TableCell className="font-medium text-right">
                        {t.military_id}
                      </TableCell>
                      <TableCell className="text-right">{t.civil_id}</TableCell>
                      <TableCell className="font-medium text-right">
                        {t.full_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {(t as any).rank_id?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(t as any).specialty_id?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(t as any).shift_id?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex justify-center scale-75 origin-center">
                          <Barcode
                            value={t.military_id.toString()}
                            width={1.5}
                            height={40}
                            displayValue={true}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                لا توجد نتائج تطابق معايير البحث الحالية
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ChangeShiftModal
        open={changeShiftOpen}
        onOpenChange={setChangeShiftOpen}
        filteredCount={filtered.length}
        shiftBreakdown={shiftBreakdown}
        shifts={shifts}
        targetShiftId={targetShiftId}
        onTargetShiftChange={setTargetShiftId}
        isLoading={isChangingShift}
        onConfirm={handleChangeShift}
      />
    </div>
  );
}
