import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-scan-pulse text-muted-foreground">جاري التحميل...</div></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else if (!isLogin) {
      toast({ title: 'تم إنشاء الحساب', description: 'يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md border-sidebar-border shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Shield className="h-7 w-7 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">مركز التدريب</CardTitle>
          <CardDescription>نظام إدارة الحضور</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              <LogIn className="ml-2 h-4 w-4" />
              {submitting ? 'الرجاء الانتظار...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "ليس لديك حساب؟" : 'هل لديك حساب بالفعل?'}{' '}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-accent underline hover:opacity-80">
                {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
