import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import { profileService } from "@/services/api";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  preferredLanguage: string;
  notificationsEnabled: boolean;
  roles: any[];
  createdAt: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Données du formulaire de profil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("fr");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Données du formulaire de changement de mot de passe
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Modals
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  // Charger le profil utilisateur
  useEffect(() => {
    if (user && !authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      
      // Remplir les champs du formulaire
      setName(profileData.name || "");
      setEmail(profileData.email || "");
      setPreferredLanguage(profileData.preferredLanguage || "fr");
      setNotificationsEnabled(profileData.notificationsEnabled ?? true);
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("L'email est obligatoire");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'email n'est pas valide");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        name: name.trim() || undefined,
        email: email.trim(),
        preferredLanguage,
        notificationsEnabled,
      };

      await profileService.updateProfile(updateData);
      setSuccess("Profil mis à jour avec succès");
      await loadProfile(); // Recharger le profil
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      setError("Le mot de passe actuel est obligatoire");
      return;
    }

    if (!passwordData.newPassword) {
      setError("Le nouveau mot de passe est obligatoire");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await profileService.changePassword(passwordData);
      setSuccess("Mot de passe modifié avec succès");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onPasswordModalClose();
    } catch (err: any) {
      console.error("Erreur lors du changement de mot de passe:", err);
      setError(err?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  const handleAnonymizeAccount = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await profileService.anonymizeAccount();
      setSuccess("Compte anonymisé avec succès. Vous allez être déconnecté.");
      
      // Déconnecter l'utilisateur immédiatement
      await new Promise(resolve => setTimeout(resolve, 1000)); // Petit délai pour afficher le message
      
      // Utiliser le service de déconnexion du contexte d'authentification
      await logout();
      
      // Rediriger vers la page de connexion
      router.push("/login");
      
      onDeleteModalClose();
    } catch (err: any) {
      console.error("Erreur lors de l'anonymisation:", err);
      setError(err?.message || "Erreur lors de l'anonymisation du compte");
    } finally {
      setSaving(false);
    }
  };

  // Protection d'accès
  if (!user && !authLoading) {
    return (
      <DefaultLayout title="Connexion requise">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Connexion requise</h1>
            <p className="mb-6 text-gray-500">Vous devez être connecté pour accéder à votre profil.</p>
            <Button onClick={() => router.push("/login")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              Se connecter
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (loading) {
    return (
      <DefaultLayout title="Chargement...">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement du profil...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout title="Mon Profil">
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent">
              Mon Profil
            </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="text-gray-600"
            >
              ← Retour au dashboard
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <Card className="mb-6 border-l-4 border-l-red-500">
              <CardBody>
                <div className="text-red-700 bg-red-50 p-3 rounded">
                  {error}
                </div>
              </CardBody>
            </Card>
          )}

          {success && (
            <Card className="mb-6 border-l-4 border-l-green-500">
              <CardBody>
                <div className="text-green-700 bg-green-50 p-3 rounded">
                  {success}
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
                  <h2 className="text-xl font-semibold">Informations personnelles</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nom complet"
                        placeholder="Votre nom et prénom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        label="Nom d'utilisateur"
                        value={profile?.username || ""}
                        isDisabled
                        description="Le nom d'utilisateur ne peut pas être modifié"
                      />
                    </div>

                    <Input
                      label="Adresse email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isRequired
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <Select
                        label="Langue préférée"
                        selectedKeys={preferredLanguage ? new Set([preferredLanguage]) : new Set()}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0] as string;
                          setPreferredLanguage(value);
                        }}
                      >
                        <SelectItem key="fr">Français</SelectItem>
                        <SelectItem key="en">English</SelectItem>
                      </Select>

                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium">Notifications</h3>
                          <p className="text-sm text-gray-500">
                            Recevoir les notifications par email
                          </p>
                        </div>
                        <Switch
                          isSelected={notificationsEnabled}
                          onValueChange={setNotificationsEnabled}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        isLoading={saving}
                        className="bg-cesizen-600 hover:bg-cesizen-700 text-white"
                      >
                        {saving ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              {/* Actions du compte */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Sécurité du compte</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">Mot de passe</h3>
                      <p className="text-sm text-gray-500">
                        Modifiez votre mot de passe pour sécuriser votre compte
                      </p>
                    </div>
                    <Button
                      onClick={onPasswordModalOpen}
                      variant="bordered"
                      className="border-cesizen-600 text-cesizen-600"
                    >
                      Modifier
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h3 className="font-medium text-red-800">Zone de danger</h3>
                      <p className="text-sm text-red-600">
                        Anonymiser votre compte (supprime vos données personnelles)
                      </p>
                    </div>
                    <Button
                      onClick={onDeleteModalOpen}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Anonymiser
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Informations du compte */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Informations du compte</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {profile && (
                    <>
                      <div>
                        <span className="font-medium">Statut:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.roles?.map((role: any, index: number) => {
                            const roleName = typeof role === 'string' ? role : (role.name || role.roleName || String(role));
                            return (
                              <span
                                key={index}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  roleName === "ADMIN" 
                                    ? "bg-cesizen-100 text-cesizen-800" 
                                    : "bg-cesizen-50 text-cesizen-700"
                                }`}
                              >
                                {roleName === "ADMIN" ? "Administrateur" : "Utilisateur"}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">Membre depuis:</span>
                        <p className="text-gray-600">
                          {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">ID utilisateur:</span>
                        <p className="text-gray-600 font-mono text-sm">#{profile.id}</p>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal changement de mot de passe */}
        <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
            </ModalHeader>
            <form onSubmit={handleChangePassword}>
              <ModalBody className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  isRequired
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  isRequired
                  description="Au moins 6 caractères"
                />
                <Input
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onPasswordModalClose}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  className="bg-cesizen-600 hover:bg-cesizen-700 text-white"
                >
                  Modifier
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal anonymisation du compte */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold text-red-600">Anonymiser le compte</h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Attention :</strong> Cette action est irréversible !
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Que va-t-il se passer ?</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Vos données personnelles seront anonymisées</li>
                    <li>• Votre nom sera remplacé par "Utilisateur Anonyme"</li>
                    <li>• Votre email sera remplacé par une adresse anonyme</li>
                    <li>• Vous ne pourrez plus vous connecter avec ce compte</li>
                    <li>• Vos contributions (articles, exercices) resteront visibles mais anonymes</li>
                  </ul>
                </div>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir anonymiser votre compte ?
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onDeleteModalClose}>
                Annuler
              </Button>
              <Button
                onClick={handleAnonymizeAccount}
                isLoading={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Anonymiser mon compte
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
} 