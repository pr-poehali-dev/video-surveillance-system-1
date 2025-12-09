import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { toast } from "sonner";
import Icon from "@/components/ui/icon";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supportEmail = "support@esvs-perm.rusdsad";

  // Проверка на имперсонацию при загрузке страницы
  useEffect(() => {
    const impersonateKey = searchParams.get('impersonate');
    if (impersonateKey) {
      const impersonateDataStr = sessionStorage.getItem(impersonateKey);
      if (impersonateDataStr) {
        try {
          const impersonateData = JSON.parse(impersonateDataStr);
          // Проверяем, что данные не устарели (не старше 30 секунд)
          if (Date.now() - impersonateData.timestamp < 30000) {
            // Сохраняем информацию о входе в localStorage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userLogin", impersonateData.login);
            localStorage.setItem("userFullName", impersonateData.fullName);
            localStorage.setItem("userId", impersonateData.userId.toString());
            
            // Удаляем данные из sessionStorage
            sessionStorage.removeItem(impersonateKey);
            
            // Показываем уведомление и перенаправляем
            toast.success(`Вход выполнен как ${impersonateData.fullName}`);
            navigate("/dashboard");
          } else {
            sessionStorage.removeItem(impersonateKey);
            toast.error('Ссылка для входа устарела');
          }
        } catch (e) {
          console.error('Ошибка при чтении данных имперсонации:', e);
          toast.error('Ошибка при автоматическом входе');
        }
      }
    }
  }, [searchParams, navigate]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    toast.success("Email скопирован в буфер обмена");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login || !password) {
      toast.error("Введите логин и пароль");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/781fed05-96cd-43c7-88cc-c4b72549f79f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Сохраняем данные пользователя
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userLogin", data.user.login);
        localStorage.setItem("userFullName", data.user.full_name || login);
        localStorage.setItem("userId", data.user.id.toString());
        
        if (data.user.role_id) {
          localStorage.setItem("userRoleId", data.user.role_id.toString());
        }
        if (data.user.user_group_id) {
          localStorage.setItem("userGroupId", data.user.user_group_id.toString());
        }
        if (data.user.camera_group_id) {
          localStorage.setItem("cameraGroupId", data.user.camera_group_id.toString());
        }

        toast.success(`Вход выполнен как ${data.user.full_name || login}`);
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Некорректный логин и/или пароль");
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      toast.error("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Icon name="Video" className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Единая система видеонаблюдения
          </h1>
          <p className="text-muted-foreground">Пермский край</p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Введите логин и пароль для доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon
                      name="Loader2"
                      className="mr-2 animate-spin"
                      size={16}
                    />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2" size={16} />
                    Войти
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Техническая поддержка:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="gap-2"
                >
                  <Icon name="Mail" size={16} />
                  {supportEmail}
                  <Icon name="Copy" size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default Login;