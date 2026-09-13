import { useTranslation } from "react-i18next";

export default function DemoLoginCard({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={`p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-start ${className}`}>
      <p className="font-semibold mb-2 text-center">{t("demoLogin.title")}</p>
      <div className="space-y-3 select-text">
        <div>
          <p>
            <span className="font-medium">{t("demoLogin.role")}:</span>{" "}
            {t("roles.admin")}
          </p>
          <p>
            <span className="font-medium">{t("demoLogin.emailLabel")}:</span>{" "}
            admin@admin.com
          </p>
          <p>
            <span className="font-medium">{t("demoLogin.passwordLabel")}:</span>{" "}
            admin123
          </p>
        </div>
        <div>
          <p>
            <span className="font-medium">{t("demoLogin.role")}:</span>{" "}
            {t("roles.teacher")}
          </p>
          <p>
            <span className="font-medium">{t("demoLogin.emailLabel")}:</span>{" "}
            teacher@teacher.com
          </p>
          <p>
            <span className="font-medium">{t("demoLogin.passwordLabel")}:</span>{" "}
            teacher123
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        {t("demoLogin.hint")}
      </p>
    </div>
  );
}
