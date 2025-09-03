import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { exerciseService } from "@/services/api";
import { canManageProfessionalExercises } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";
import { mapApiPhasesToFrontend } from "@/utils/phaseMapping";

export default function AdminExercicesProfessionnels() {
  const router = useRouter();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !canManageProfessionalExercises(user)) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Charger les exercices professionnels
  useEffect(() => {
    const fetchExercises = async () => {
      if (!user || !canManageProfessionalExercises(user)) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await exerciseService.getDefaults();
        console.log("Exercices professionnels chargés:", data);
        setExercises(data.filter(ex => ex.isProfessional));
      } catch (err) {
        console.error('Erreur lors du chargement des exercices professionnels:', err);
        setError("Impossible de charger les exercices professionnels");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [user]);

  const handleDelete = async (exerciseId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice professionnel ?')) return;
    
    try {
      await exerciseService.deleteExercise(exerciseId);
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression";
      alert(errorMessage);
    }
  };

  // Protection d'accès
  if (user !== null && !canManageProfessionalExercises(user)) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
            <p className="mb-6 text-gray-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
            <Button onClick={() => router.push("/")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              ← Retour à l'accueil
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Chargement des exercices professionnels...</div>
        </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête admin */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-600 to-cesizen-700 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">👨‍💼</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              Gestion des Exercices Professionnels
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Interface d'administration pour créer, modifier et supprimer les exercices professionnels.
            </p>
            
            {/* Badge admin */}
            <div className="mt-6 inline-flex items-center bg-cesizen-100 border border-cesizen-300 rounded-full px-4 py-2">
              <span className="text-cesizen-800 font-medium">🔐 Administration - Accès Administrateur</span>
            </div>
          </div>

          {/* Actions d'administration */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => router.push("/admin/exercices-professionnels/create")}
              size="lg"
              className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">✨</span>
              Créer un exercice professionnel
            </Button>
          </div>

          {/* Liste des exercices */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {exercises.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 text-center">
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucun exercice professionnel</h3>
                <p className="text-gray-600 mb-6">Commencez par créer votre premier exercice professionnel.</p>
                <Button
                  onClick={() => router.push("/admin/exercices-professionnels/create")}
                  className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white"
                >
                  <span className="mr-2">✨</span>
                  Créer le premier exercice
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {/* Badge professionnel */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gradient-to-r from-cesizen-100 to-cesizen-200 border border-cesizen-200 rounded-full px-3 py-1">
                        <span className="text-cesizen-800 font-medium text-sm">👨‍⚕️ Professionnel</span>
                      </div>
                      <div className="text-gray-400 text-sm">#{exercise.id}</div>
                    </div>

                    {/* Titre et description */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {exercise.label}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {exercise.description}
                    </p>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-cesizen-50 rounded-lg p-3 text-center">
                        <div className="text-cesizen-600 font-bold text-lg">{exercise.phases?.length || 0}</div>
                        <div className="text-cesizen-800 text-xs">Phases</div>
                      </div>
                      <div className="bg-cesizen-50 rounded-lg p-3 text-center">
                        <div className="text-cesizen-600 font-bold text-lg">{exercise.estimatedDuration || 0}s</div>
                        <div className="text-cesizen-800 text-xs">Durée</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-cesizen-600 hover:bg-cesizen-700 text-white"
                        onClick={() => router.push(`/exercices/respiration/${exercise.id}`)}
                      >
                        👁️ Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        className="flex-1 border-cesizen-400 text-cesizen-700 hover:bg-cesizen-50"
                        onClick={() => router.push(`/admin/exercices-professionnels/edit/${exercise.id}`)}
                      >
                        ✏️ Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        className="border-red-400 text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(exercise.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-3xl">ℹ️</span>
              À propos des exercices professionnels
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Caractéristiques</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="mr-2">✅</span>Validés par des professionnels</li>
                  <li className="flex items-center"><span className="mr-2">✅</span>Disponibles pour tous les utilisateurs</li>
                  <li className="flex items-center"><span className="mr-2">✅</span>Apparaissent dans la section "Exercices Professionnels"</li>
                  <li className="flex items-center"><span className="mr-2">✅</span>Modifiables uniquement par les administrateurs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Permissions</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="mr-2">🔐</span>Création : Administrateurs seulement</li>
                  <li className="flex items-center"><span className="mr-2">🔐</span>Modification : Administrateurs seulement</li>
                  <li className="flex items-center"><span className="mr-2">🔐</span>Suppression : Administrateurs seulement</li>
                  <li className="flex items-center"><span className="mr-2">👁️</span>Consultation : Tous les utilisateurs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 