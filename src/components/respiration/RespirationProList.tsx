// components/respiration/RespirationProList.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { exerciseService } from "@/services/api";
import RespirationExerciseItem from "./RespirationExerciseItem";

export default function RespirationProList() {
  const { user } = useAuth();
  const [proExercises, setProExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiExercises = await exerciseService.getDefaults();
        // Filtrer pour ne garder que les exercices professionnels
        const professionalExercises = apiExercises.filter((ex: any) => ex.isProfessional === true);
        setProExercises(professionalExercises || []);
      } catch (err) {
        console.error('Erreur lors du chargement des exercices professionnels:', err);
        setError("Impossible de charger les exercices professionnels. Vérifiez que l'API est bien démarrée.");
        setProExercises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProExercises();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-500">Chargement des exercices professionnels...</div>
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

  if (!proExercises.length) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 max-w-lg mx-auto">
          <div className="text-6xl mb-6">👨‍⚕️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Aucun exercice professionnel
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Les exercices professionnels ne sont pas encore disponibles. Nos experts travaillent à créer des exercices de qualité pour vous.
          </p>
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-medium text-sm">
                💡 En attendant, vous pouvez créer vos propres exercices personnalisés !
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {proExercises.map((ex) => (
        <RespirationExerciseItem key={ex.id} exercise={ex} isProfessional={true} />
      ))}
    </div>
  );
}