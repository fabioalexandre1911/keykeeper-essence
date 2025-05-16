
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("password-manager-auth");
    if (isLoggedIn === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple authentication for demo purposes
    // In a real app, this would validate against a secure backend
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        // Store authentication state
        localStorage.setItem("password-manager-auth", "true");
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao seu gerenciador de senhas!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Falha no login",
          description: "Nome de usuário ou senha incorretos. Tente novamente.",
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto bg-primary w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GESTÃO DE SENHAS</h1>
          <p className="mt-2 text-gray-600">Faça login para acessar suas senhas</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Digite seu nome de usuário"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Use nome de usuário: <strong>admin</strong> e senha: <strong>admin</strong> para entrar</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
