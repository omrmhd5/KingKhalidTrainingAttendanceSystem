import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";

export default function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const current = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const next = current === "ar" ? "en" : "ar";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void i18n.changeLanguage(next);
      }}
      aria-label={t("language.toggle")}
      title={t("language.toggle")}
      className="gap-2">
      <Globe className="h-4 w-4" />
      <span>{next === "en" ? t("language.en") : t("language.ar")}</span>
    </Button>
  );
}
