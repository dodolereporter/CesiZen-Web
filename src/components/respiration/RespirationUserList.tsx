// components/respiration/RespirationUserList.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { exerciseService } from "@/services/api";
import RespirationExerciseItem from "./RespirationExerciseItem";

export default function RespirationUserList() {
  const { user } = useAuth();
  const [userExercises, setUserExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserExercises = async () => {
      // Ne pas faire la requête si l'utilisateur n'est pas connecté
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiExercises = await exerciseService.getUserExercises();
        // Filtrer pour ne garder que les exercices utilisateur (non professionnels)
        const personalExercises = apiExercises.filter((ex: any) => ex.isProfessional === false);
        setUserExercises(personalExercises || []);
      } catch (err) {
        console.error('Erreur lors du chargement des exercices utilisateur:', err);
        setError("Impossible de charger vos exercices personnels. Vérifiez que l'API est bien démarrée.");
        setUserExercises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserExercises();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!user) return;
    
    try {
      await exerciseService.deleteExercise(id);
      setUserExercises(prev => prev.filter(ex => ex.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert("Erreur lors de la suppression de l'exercice");
    }
  };

  const handleEdit = (id: number) => {
    // La navigation sera gérée par le composant RespirationExerciseItem
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Vous devez être connecté pour voir vos exercices personnels.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
        <div className="text-gray-500">Chargement de vos exercices personnels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 font-medium mb-2">Erreur de chargement</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!userExercises.length) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 max-w-lg mx-auto">
          <div className="text-6xl mb-6">🌱</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Aucun exercice personnel
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Vous n'avez pas encore créé d'exercices personnels. Commencez par créer votre premier exercice de respiration personnalisé !
          </p>
          <a 
            href="/exercices/respiration/create" 
            className="inline-flex items-center bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">✨</span>
            Créer votre premier exercice
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {userExercises.map((ex) => (
        <RespirationExerciseItem 
          key={ex.id} 
          exercise={ex} 
          isProfessional={false}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}