import React from "react";
import { useAuth } from "@/context/AuthContext";
import DefaultLayout from "@/layouts/default";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { getUserRoles, isAdmin } from "@/utils/userUtils";
import NextLink from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement du tableau de bord...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
            <p className="mb-6 text-gray-500">Vous devez être connecté pour accéder au tableau de bord.</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const userRoles = getUserRoles(user);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-600 to-cesizen-700 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              Tableau de Bord
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bienvenue sur votre espace personnel, {user.name || user.username || "utilisateur"} !
            </p>
          </div>

          {/* Informations utilisateur */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-white/50">
              <CardHeader className="flex gap-3">
                <Avatar
                  className="border border-gray-200"
                  name={user.name || user.username || user.email || "User"}
                  size="lg"
                  src={user.avatarUrl}
                />
                <div className="flex flex-col">
                  <p className="text-xl font-semibold text-gray-800">
                    {user.name || user.username || "Utilisateur"}
                  </p>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Informations du compte</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Nom d'utilisateur</span>
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      {user.name && (
                        <div>
                          <span className="text-sm text-gray-500">Nom complet</span>
                          <p className="font-medium">{user.name}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Rôles</span>
                        <div className="flex gap-2 mt-1">
                          {userRoles.map((role, index) => (
                            <Chip
                              key={index}
                              className={
                                role === "ADMIN"
                                  ? "bg-cesizen-100 text-cesizen-800"
                                  : "bg-cesizen-50 text-cesizen-700"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {role === "ADMIN" ? "👨‍💼 Administrateur" : "👤 Utilisateur"}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Accès rapide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <NextLink href="/exercices/respiration">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardBody className="text-center p-6">
                            <div className="text-3xl mb-2">🫁</div>
                            <h4 className="font-medium mb-2">Exercices de Respiration</h4>
                            <p className="text-sm text-gray-500">Découvrez nos exercices</p>
                          </CardBody>
                        </Card>
                      </NextLink>
                      <NextLink href="/articles">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardBody className="text-center p-6">
                            <div className="text-3xl mb-2">📚</div>
                            <h4 className="font-medium mb-2">Articles</h4>
                            <p className="text-sm text-gray-500">Lisez nos contenus</p>
                          </CardBody>
                        </Card>
                      </NextLink>
                      <NextLink href="/">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardBody className="text-center p-6">
                            <div className="text-3xl mb-2">🏠</div>
                            <h4 className="font-medium mb-2">Accueil</h4>
                            <p className="text-sm text-gray-500">Retour à l'accueil</p>
                          </CardBody>
                        </Card>
                      </NextLink>
                    </div>
                  </div>

                  {/* Section Administration pour les admins */}
                  {isAdmin(user) && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">👨‍💼</span>
                        Administration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <NextLink href="/admin/users">
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-cesizen-500">
                            <CardBody className="text-center p-6">
                              <div className="text-3xl mb-2">👥</div>
                              <h4 className="font-medium mb-2 text-cesizen-700">Gestion des Utilisateurs</h4>
                              <p className="text-sm text-gray-500">Gérer les comptes utilisateurs</p>
                            </CardBody>
                          </Card>
                        </NextLink>
                        <NextLink href="/admin/articles">
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-cesizen-600">
                            <CardBody className="text-center p-6">
                              <div className="text-3xl mb-2">📝</div>
                              <h4 className="font-medium mb-2 text-cesizen-700">Gestion des Articles</h4>
                              <p className="text-sm text-gray-500">Créer et modifier les articles</p>
                            </CardBody>
                          </Card>
                        </NextLink>
                        <NextLink href="/admin/exercices-professionnels">
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-cesizen-700">
                            <CardBody className="text-center p-6">
                              <div className="text-3xl mb-2">🫁</div>
                              <h4 className="font-medium mb-2 text-cesizen-700">Gestion des Exercices</h4>
                              <p className="text-sm text-gray-500">Gérer les exercices professionnels</p>
                            </CardBody>
                          </Card>
                        </NextLink>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 