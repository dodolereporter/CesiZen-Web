import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";

import { useAuth } from "@/context/AuthContext";
import DefaultLayout from "@/layouts/default";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Tentative de connexion...");
      const res = await login(usernameOrEmail, password);

      if (res.success) {
        console.log("✅ Connexion réussie, redirection...");
        router.push("/");
      } else {
        console.error("❌ Échec de la connexion:", res.message);
        setError(res.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error("💥 Erreur inattendue:", error);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <DefaultLayout title="Connexion">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
            <p className="text-sm text-gray-600">
              Connectez-vous à votre compte Cesizen
            </p>
          </CardHeader>
          <CardBody className="px-8 pb-8">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                required
                isInvalid={!!error}
                label="Adresse e-mail ou nom d'utilisateur"
                placeholder="Entrez votre email ou nom d'utilisateur"
                type="text"
                value={usernameOrEmail}
                variant="bordered"
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                description="Utilisez l'email ou le nom d'utilisateur de votre compte"
              />
              <Input
                required
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlash className="text-gray-400" size={16} />
                    ) : (
                      <Eye className="text-gray-400" size={16} />
                    )}
                  </button>
                }
                isInvalid={!!error}
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                variant="bordered"
                onChange={(e) => setPassword(e.target.value)}
                description="Votre mot de passe est sécurisé"
              />
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  <strong>Erreur :</strong> {error}
                </div>
              )}
              <Button
                className="w-full"
                color="primary"
                disabled={loading}
                isLoading={loading}
                type="submit"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardBody>
        </Card>
        <div className="mt-6 text-sm text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{" "}
            <a
              className="text-cesizen-600 hover:underline font-medium"
              href="/register"
            >
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}