import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";

import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";
import DefaultLayout from "@/layouts/default";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!name.trim()) {
      setError("Le nom complet est requis");
      return false;
    }
    if (!username.trim()) {
      setError("Le nom d'utilisateur est requis");
      return false;
    }
    if (!email.trim()) {
      setError("L'adresse e-mail est requise");
      return false;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Tentative d'inscription...");
      
      // Inscription via le service d'authentification
      const registerRes = await authService.register({
        name,
        username,
        email,
        password,
      });

      if (registerRes.success) {
        console.log("✅ Inscription réussie, connexion automatique...");
        
        // Connexion automatique après inscription
        const loginRes = await login(email, password);

        if (loginRes.success) {
          console.log("✅ Connexion automatique réussie");
          router.push("/");
        } else {
          setError("Inscription réussie, mais connexion impossible. Veuillez vous connecter manuellement.");
        }
      } else {
        console.error("❌ Échec de l'inscription:", registerRes.message);
        setError(registerRes.message || "Erreur lors de l'inscription");
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <DefaultLayout title="Inscription">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Inscription</h1>
            <p className="text-sm text-gray-600">Créez votre compte Cesizen</p>
          </CardHeader>
          <CardBody className="px-8 pb-8">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                required
                isInvalid={!!error && !name.trim()}
                label="Nom complet"
                placeholder="Entrez votre nom complet"
                type="text"
                value={name}
                variant="bordered"
                onChange={(e) => setName(e.target.value)}
                description="Votre nom complet tel qu'il apparaîtra sur votre profil"
              />
              <Input
                required
                isInvalid={!!error && !username.trim()}
                label="Nom d'utilisateur"
                placeholder="Choisissez un nom d'utilisateur"
                type="text"
                value={username}
                variant="bordered"
                onChange={(e) => setUsername(e.target.value)}
                description="Nom d'utilisateur unique pour votre compte"
              />
              <Input
                required
                isInvalid={!!error && !email.trim()}
                label="Adresse e-mail"
                placeholder="Entrez votre adresse e-mail"
                type="email"
                value={email}
                variant="bordered"
                onChange={(e) => setEmail(e.target.value)}
                description="Votre adresse e-mail sera utilisée pour la connexion"
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
                isInvalid={!!error && (!password || password.length < 6)}
                label="Mot de passe"
                placeholder="Créez un mot de passe sécurisé"
                type={showPassword ? "text" : "password"}
                value={password}
                variant="bordered"
                onChange={(e) => setPassword(e.target.value)}
                description="Minimum 6 caractères pour la sécurité"
              />
              <Input
                required
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="text-gray-400" size={16} />
                    ) : (
                      <Eye className="text-gray-400" size={16} />
                    )}
                  </button>
                }
                isInvalid={!!error && password !== confirmPassword}
                label="Confirmation du mot de passe"
                placeholder="Confirmez votre mot de passe"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                variant="bordered"
                onChange={(e) => setConfirmPassword(e.target.value)}
                description="Répétez votre mot de passe pour confirmation"
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
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>
          </CardBody>
        </Card>
        <div className="mt-6 text-sm text-center">
          <p className="text-gray-600">
            Déjà un compte ?{" "}
            <a
              className="text-cesizen-600 hover:underline font-medium"
              href="/login"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}