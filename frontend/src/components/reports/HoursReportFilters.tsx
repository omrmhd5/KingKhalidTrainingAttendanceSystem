import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface HoursReportFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterShift: string;
  onShiftChange: (value: string) => void;
  shifts: Shift[];
}

export function HoursReportFilters({
  search,
  onSearchChange,
  filterShift,
  onShiftChange,
  shifts,
}: HoursReportFiltersProps) {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث حسب: الرقم العسكري أو الاسم"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 text-base"
        />
      </div>
      <div className="w-48">
        <Select value={filterShift} onValueChange={onShiftChange}>
          <SelectTrigger dir="rtl" className="h-10">
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
