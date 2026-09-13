import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("trainees.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={filterRank} onValueChange={onRankChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("trainees.allRanks")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("trainees.allRanks")}</SelectItem>
            {ranks?.map((rank) => (
              <SelectItem key={rank._id} value={rank._id}>
                {rank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("trainees.allSpecialties")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("trainees.allSpecialties")}</SelectItem>
            {specializations?.map((spec) => (
              <SelectItem key={spec._id} value={spec._id}>
                {spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterShift} onValueChange={onShiftChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("trainees.allShifts")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("trainees.allShifts")}</SelectItem>
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
