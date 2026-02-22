import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface TraineeSearchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterRank: string;
  onRankChange: (value: string) => void;
  filterSpecialty: string;
  onSpecialtyChange: (value: string) => void;
  filterShift: string;
  onShiftChange: (value: string) => void;
  ranks: any[];
  specializations: any[];
  shifts: any[];
}

export function TraineeSearchFilters({
  search,
  onSearchChange,
  filterRank,
  onRankChange,
  filterSpecialty,
  onSpecialtyChange,
  filterShift,
  onShiftChange,
  ranks,
  specializations,
  shifts,
}: TraineeSearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث حسب: الرقم العسكري أو السجل المدني أو الاسم"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={filterRank} onValueChange={onRankChange}>
          <SelectTrigger dir="rtl">
            <SelectValue placeholder="جميع الرتب" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع الرتب</SelectItem>
            {ranks?.map((rank) => (
              <SelectItem key={rank._id} value={rank._id}>
                {rank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger dir="rtl">
            <SelectValue placeholder="جميع التخصصات" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع التخصصات</SelectItem>
            {specializations?.map((spec) => (
              <SelectItem key={spec._id} value={spec._id}>
                {spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterShift} onValueChange={onShiftChange}>
          <SelectTrigger dir="rtl">
            <SelectValue placeholder="جميع الشفتات" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع الشفتات</SelectItem>
            {shifts?.map((shift) => (
              <SelectItem key={shift._id} value={shift._id}>
                {shift.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
