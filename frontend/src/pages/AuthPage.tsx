import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitch from "@/components/LanguageSwitch";
import DemoLoginCard from "@/components/DemoLoginCard";

export default function AuthPage() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-scan-pulse text-muted-foreground">
          {t("login.loading")}
        </div>
      </div>
    );
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: t("login.errorTitle"),
          description: error.message || t("login.failed"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("login.errorTitle"),
        description: t("login.unexpected"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-sidebar-border shadow-2xl bg-blue-50">
        <CardHeader className="text-center space-y-3 bg-blue-400 text-white rounded-t-lg relative">
          <div className="absolute top-3 end-3">
            <LanguageSwitch />
          </div>
          <div className="mx-auto flex items-center justify-center">
            <img src="/Logo.png" alt={t("brand.logoAlt")} className="h-20 w-20" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {t("brand.name")}
          </CardTitle>
          <CardDescription className="text-white text-sm">
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
                minLength={6}
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  {t("login.submitting")}
                </>
              ) : (
                <>
                  <LogIn className="ms-2 h-4 w-4" />
                  {t("login.submit")}
                </>
              )}
            </Button>
          </form>
          <DemoLoginCard />
        </CardContent>
      </Card>
    </div>
  );
}
