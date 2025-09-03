import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { userService } from "@/services/api";

interface CreateUserData {
  username: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: string;
  notificationsEnabled: boolean;
}

export default function CreateUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<CreateUserData>({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'fr',
    notificationsEnabled: true,
  });

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  const handleInputChange = (field: keyof CreateUserData, value: string | boolean) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!userData.username.trim()) return "Le nom d'utilisateur est requis";
    if (!userData.email.trim()) return "L'email est requis";
    if (!userData.name.trim()) return "Le nom complet est requis";
    if (!userData.password) return "Le mot de passe est requis";
    if (userData.password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    if (userData.password !== userData.confirmPassword) return "Les mots de passe ne correspondent pas";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) return "Format d'email invalide";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { confirmPassword, ...createData } = userData;

      // Utiliser le service API pour créer l'utilisateur
      await userService.create(createData);

      router.push("/admin/users");
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Protection d'accès
  if (user !== null && !isAdmin(user)) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
            <p className="mb-6 text-gray-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              ← Retour au dashboard
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent">
                Créer un Utilisateur
              </h1>
              <p className="text-gray-600 mt-2">
                Ajouter un nouveau compte utilisateur à la plateforme
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/users")}
              variant="ghost"
              className="text-gray-600"
            >
              ← Retour à la liste
            </Button>
          </div>

          {/* Formulaire */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Informations de l'utilisateur</h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Affichage des erreurs */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {/* Informations de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom d'utilisateur"
                      placeholder="johndoe"
                      value={userData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      isRequired
                      description="Unique, sans espaces"
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={userData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      isRequired
                    />
                  </div>

                  <Input
                    label="Nom complet"
                    placeholder="John Doe"
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    isRequired
                  />

                  {/* Mots de passe */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Mot de passe"
                      type="password"
                      placeholder="••••••••"
                      value={userData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      isRequired
                      description="Minimum 6 caractères"
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      type="password"
                      placeholder="••••••••"
                      value={userData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      isRequired
                    />
                  </div>

                  {/* Préférences */}
                  <div className="space-y-4">
                    <Select
                      label="Langue préférée"
                      selectedKeys={[userData.preferredLanguage]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        handleInputChange('preferredLanguage', value);
                      }}
                    >
                      <SelectItem key="fr">
                        🇫🇷 Français
                      </SelectItem>
                      <SelectItem key="en">
                        🇬🇧 English
                      </SelectItem>
                      <SelectItem key="es">
                        🇪🇸 Español
                      </SelectItem>
                    </Select>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Autoriser l'envoi de notifications à cet utilisateur
                        </p>
                      </div>
                      <Switch
                        isSelected={userData.notificationsEnabled}
                        onValueChange={(value) => handleInputChange('notificationsEnabled', value)}
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/admin/users")}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      isLoading={loading}
                      className="bg-cesizen-600 hover:bg-cesizen-700 text-white flex-1"
                    >
                      {loading ? "Création..." : "Créer l'utilisateur"}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 