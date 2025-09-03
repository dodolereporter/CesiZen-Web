import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { userService } from "@/services/api";

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  roles: any[]; // Peut être string[] ou object[] selon l'API
  createdAt: string;
  notificationsEnabled?: boolean;
  preferredLanguage?: string;
}

const languages = [
  { key: "fr", label: "Français" },
  { key: "en", label: "English" },
  { key: "es", label: "Español" },
  { key: "de", label: "Deutsch" }
];

const availableRoles = [
  { key: "USER", label: "Utilisateur" },
  { key: "ADMIN", label: "Administrateur" }
];

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  
  // Champs du formulaire
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState("fr");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  // Charger l'utilisateur
  useEffect(() => {
    if (id && user && isAdmin(user)) {
      loadUser(Number(id));
    }
  }, [id, user]);

  const loadUser = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getById(userId);
      console.log("Données utilisateur récupérées:", userData);
      console.log("Rôles bruts:", userData.roles);
      console.log("Type des rôles:", typeof userData.roles);
      console.log("Structure détaillée des rôles:", JSON.stringify(userData.roles, null, 2));
      
      setEditedUser(userData);
      
      // Traiter les rôles - ils peuvent être des objets ou des strings
      let processedRoles: string[] = [];
      if (Array.isArray(userData.roles)) {
        processedRoles = userData.roles.map((role: any) => {
          console.log("Traitement du rôle:", role, "type:", typeof role);
          if (typeof role === 'string') {
            return role;
          } else if (typeof role === 'object' && role !== null) {
            console.log("Objet rôle - id:", role.id, "name:", role.name);
            return role.name || role.key || role.roleName || String(role);
          }
          return String(role);
        });
      }
      
      console.log("Rôles traités:", processedRoles);
      
      // Remplir le formulaire
      setName(userData.name || "");
      setUsername(userData.username);
      setEmail(userData.email);
      setRoles(processedRoles);
      setNotificationsEnabled(userData.notificationsEnabled ?? true);
      setPreferredLanguage(userData.preferredLanguage || "fr");
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur:", err);
      setError("Utilisateur introuvable");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log("🚀 DÉBUT DE LA FONCTION handleSave");
    console.log("📊 État des variables:");
    console.log("- username:", username);
    console.log("- email:", email);
    console.log("- name:", name);
    console.log("- roles:", roles);
    console.log("- newPassword:", newPassword ? "[PRÉSENT]" : "[VIDE]");
    console.log("- confirmPassword:", confirmPassword ? "[PRÉSENT]" : "[VIDE]");
    console.log("- saving:", saving);
    console.log("- editedUser:", editedUser ? "CHARGÉ" : "NON CHARGÉ");
    
    if (!username.trim()) {
      console.log("❌ Validation échouée: nom d'utilisateur manquant");
      setError("Le nom d'utilisateur est obligatoire");
      return;
    }

    if (!email.trim()) {
      console.log("❌ Validation échouée: email manquant");
      setError("L'email est obligatoire");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Validation échouée: email invalide");
      setError("L'email n'est pas valide");
      return;
    }

    // Validation du mot de passe si fourni
    if (newPassword && newPassword !== confirmPassword) {
      console.log("❌ Validation échouée: mots de passe différents");
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      console.log("❌ Validation échouée: mot de passe trop court");
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    console.log("✅ Toutes les validations passées");

    try {
      console.log("🔄 Début du processus de sauvegarde");
      setSaving(true);
      setError(null);

      console.log("=== DEBUG MODIFICATION UTILISATEUR ===");
      console.log("ID utilisateur:", id);
      console.log("Rôles à envoyer:", roles);
      console.log("Type des rôles:", typeof roles);
      console.log("Rôles en détail:", JSON.stringify(roles, null, 2));
      
      // Construire les rôles au format attendu par le backend (RoleDto[])
      const formattedRoles = roles.map((roleName: string) => {
        // Essayer de retrouver l'ID du rôle depuis les données originales
        const originalRole = editedUser?.roles?.find((r: any) => 
          (typeof r === 'object' && r.name === roleName) || r === roleName
        );
        
        if (originalRole && typeof originalRole === 'object' && originalRole.id) {
          return {
            id: originalRole.id,
            name: roleName
          };
        }
        
        // Si on ne trouve pas l'ID, créer un objet avec juste le nom
        // (le backend devra gérer cela)
        return {
          name: roleName
        };
      });

      const userData: any = {
        name: name.trim() || undefined,
        username: username.trim(),
        email: email.trim(),
        roles: formattedRoles, // Envoyer au format RoleDto
        notificationsEnabled: notificationsEnabled,
        preferredLanguage: preferredLanguage
      };
      
      console.log("Données utilisateur à envoyer:", JSON.stringify(userData, null, 2));

      // Ajouter le mot de passe seulement s'il est fourni
      if (newPassword) {
        userData.password = newPassword;
        console.log("Mot de passe ajouté (longueur):", newPassword.length);
      }

      console.log("Données finales à envoyer:", JSON.stringify(userData, null, 2));
      console.log("=== FIN DEBUG ===");

      console.log("📡 Envoi de la requête au serveur...");
      await userService.update(Number(id), userData);
      
      console.log("✅ Mise à jour réussie! Redirection vers /admin/users");
      router.push("/admin/users");
    } catch (err) {
      console.error("=== ERREUR DÉTAILLÉE ===");
      console.error("Erreur brute:", err);
      console.error("Type d'erreur:", typeof err);
      
      // Extraire le message d'erreur détaillé
      let errorMessage = "Erreur lors de la sauvegarde de l'utilisateur";
      
      if (err instanceof Error) {
        console.error("Message d'erreur:", err.message);
        console.error("Stack trace:", err.stack);
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error("Message final:", errorMessage);
      console.error("=== FIN ERREUR ===");
      
      setError(errorMessage);
    } finally {
      console.log("🏁 Fin de la fonction handleSave");
      setSaving(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
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

  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement de l'utilisateur...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !editedUser) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
            <p className="mb-6 text-gray-500">{error}</p>
            <Button onClick={() => router.push("/admin/users")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              ← Retour aux utilisateurs
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
                Modifier l'Utilisateur
              </h1>
              <p className="text-gray-600 mt-2">
                Modifiez les informations de l'utilisateur
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/admin/users")}
                variant="ghost"
                className="text-gray-600"
              >
                ← Retour
              </Button>
              <Button
                onClick={() => {
                  console.log("🔔 CLIC SUR LE BOUTON SAUVEGARDER");
                  handleSave();
                }}
                disabled={saving}
                className="bg-cesizen-600 hover:bg-cesizen-700 text-white"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <Card className="mb-6 border-l-4 border-l-red-500">
              <CardBody>
                <div className="text-red-700 bg-red-50 p-3 rounded">
                  {error}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Informations de base</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nom complet"
                      placeholder="Nom et prénom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Nom d'utilisateur"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      isRequired
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="utilisateur@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isRequired
                  />
                </CardBody>
              </Card>

              {/* Mot de passe */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
                  <p className="text-sm text-gray-500">Laissez vide pour ne pas modifier</p>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      type="password"
                      placeholder="Confirmez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Configuration */}
            <div className="space-y-6">
              {/* Rôles */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Rôles</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {availableRoles.map((role) => (
                      <div key={role.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-sm text-gray-500">
                            {role.key === 'ADMIN' ? 'Accès à l\'administration' : 'Utilisateur standard'}
                          </p>
                        </div>
                        <Switch
                          isSelected={roles.includes(role.key)}
                          onValueChange={() => handleRoleToggle(role.key)}
                          color="primary"
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Préférences */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Préférences</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Select
                    label="Langue préférée"
                    selectedKeys={new Set([preferredLanguage])}
                    onSelectionChange={(keys) => {
                      const selectedLang = Array.from(keys)[0] as string;
                      setPreferredLanguage(selectedLang);
                    }}
                  >
                    {languages.map((lang) => (
                      <SelectItem key={lang.key}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications par email
                      </p>
                    </div>
                    <Switch
                      isSelected={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      color="success"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Informations du compte */}
              {editedUser && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Informations du compte</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {editedUser.id}
                      </div>
                      <div>
                        <span className="font-medium">Créé le:</span>{" "}
                        {new Date(editedUser.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Rôles actuels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {editedUser.roles.map((role, index) => {
                            let roleName = '';
                            if (typeof role === 'string') {
                              roleName = role;
                            } else if (typeof role === 'object' && role !== null) {
                              roleName = role.name || role.key || role.roleName || String(role);
                            } else {
                              roleName = String(role);
                            }
                            
                            return (
                              <Chip key={index} size="sm" variant="flat" color="primary">
                                {roleName}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 