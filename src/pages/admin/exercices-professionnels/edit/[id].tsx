import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { exerciseService } from "@/services/api";
import { canManageProfessionalExercises } from "@/utils/userUtils";
import { mapApiPhasesToFrontend, mapFrontendPhasesToApi } from "@/utils/phaseMapping";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

interface Phase {
  type: 'inspire' | 'expire' | 'pause';
  duration: number;
  instruction?: string;
}

export default function EditProfessionalExercise() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<any>(null);

  // Données du formulaire
  const [exerciseData, setExerciseData] = useState({
    label: '',
    description: '',
  });

  const [phases, setPhases] = useState<Phase[]>([]);

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !canManageProfessionalExercises(user)) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Charger l'exercice à éditer
  useEffect(() => {
    const fetchExercise = async () => {
      if (!id || !user || !canManageProfessionalExercises(user)) return;
      
      try {
        setInitialLoading(true);
        setError(null);
        const exerciseData = await exerciseService.getById(Number(id));
        
        console.log('Exercice chargé pour édition:', exerciseData);
        
        // Vérifier que c'est un exercice professionnel
        if (!exerciseData.isProfessional) {
          setError("Cet exercice n'est pas un exercice professionnel");
          return;
        }
        
        setExercise(exerciseData);
        setExerciseData({
          label: exerciseData.label || '',
          description: exerciseData.description || '',
        });
        
        // Adapter les phases depuis l'API
        const adaptedPhases = exerciseData.phases ? mapApiPhasesToFrontend(exerciseData.phases) : [];
        console.log('Phases adaptées:', adaptedPhases);
        setPhases(adaptedPhases);
        
      } catch (err) {
        console.error('Erreur lors du chargement de l\'exercice:', err);
        setError("Impossible de charger cet exercice");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExercise();
  }, [id, user]);

  const handleExerciseChange = (field: string, value: string) => {
    setExerciseData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (index: number, field: keyof Phase, value: any) => {
    setPhases(prev => prev.map((phase, i) => 
      i === index ? { ...phase, [field]: value } : phase
    ));
  };

  const addPhase = () => {
    setPhases(prev => [...prev, { type: 'inspire', duration: 4, instruction: '' }]);
  };

  const removePhase = (index: number) => {
    if (phases.length > 1) {
      setPhases(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseData.label.trim()) {
      setError("Le nom de l'exercice est requis");
      return;
    }

    if (phases.length === 0) {
      setError("Au moins une phase est requise");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const exerciseToUpdate = {
        ...exerciseData,
        phases: phases.map((phase, index) => ({
          ...phase,
          orderIndex: index + 1
        }))
      };

      console.log("Mise à jour d'exercice professionnel:", exerciseToUpdate);
      await exerciseService.update(Number(id), exerciseToUpdate);
      
      router.push("/admin/exercices-professionnels");
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'exercice";
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  if (initialLoading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
                  <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Chargement de l'exercice...</div>
        </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !exercise) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
            <p className="mb-6 text-gray-500">{error}</p>
            <Button onClick={() => router.push("/admin/exercices-professionnels")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              ← Retour à la gestion
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);

  const phaseTypeOptions = [
    { value: 'inspire', label: '🫁 Inspiration', description: 'Phase d\'inspiration' },
    { value: 'expire', label: '💨 Expiration', description: 'Phase d\'expiration' },
    { value: 'pause', label: '🧘 Pause', description: 'Phase de pause/rétention' }
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-600 to-cesizen-700 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">✏️</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              Modifier l'Exercice Professionnel
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Modifiez cet exercice de respiration professionnel.
            </p>

            {/* Badge admin */}
            <div className="mt-6 inline-flex items-center bg-cesizen-100 border border-cesizen-300 rounded-full px-4 py-2">
              <span className="text-cesizen-800 font-medium">🔐 Administration - Exercice #{id}</span>
            </div>
          </div>

          {/* Formulaire */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de base */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">📝</span>
                  Informations de base
                </h2>

                <div className="space-y-6">
                  <Input
                    label="Nom de l'exercice"
                    placeholder="ex: Respiration 4-7-8 pour la relaxation"
                    value={exerciseData.label}
                    onChange={(e) => handleExerciseChange('label', e.target.value)}
                    isRequired
                    classNames={{
                      input: "text-lg",
                      label: "text-gray-700 font-medium"
                    }}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Décrivez les bienfaits et l'utilisation de cet exercice..."
                    value={exerciseData.description}
                    onChange={(e) => handleExerciseChange('description', e.target.value)}
                    minRows={4}
                    classNames={{
                      input: "text-base",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                </div>
              </div>

              {/* Configuration des phases */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3 text-3xl">🔄</span>
                    Séquence de respiration
                  </h2>
                  <div className="bg-cesizen-50 border border-cesizen-200 rounded-lg px-4 py-2">
                    <span className="text-cesizen-800 font-medium">Durée totale: {totalDuration}s</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Phase {index + 1}</h3>
                        {phases.length > 1 && (
                          <Button
                            size="sm"
                            variant="bordered"
                            className="border-red-400 text-red-700 hover:bg-red-50"
                            onClick={() => removePhase(index)}
                          >
                            🗑️ Supprimer
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <Select
                          label="Type de phase"
                          selectedKeys={[phase.type]}
                          onSelectionChange={(keys) => {
                            const selectedType = Array.from(keys)[0] as 'inspire' | 'expire' | 'pause';
                            handlePhaseChange(index, 'type', selectedType);
                          }}
                        >
                          {phaseTypeOptions.map((option) => (
                            <SelectItem key={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>

                        <Input
                          type="number"
                          label="Durée (secondes)"
                          value={phase.duration.toString()}
                          onChange={(e) => handlePhaseChange(index, 'duration', parseInt(e.target.value) || 0)}
                          min="1"
                          max="60"
                        />

                        <Input
                          label="Instruction (optionnel)"
                          placeholder="ex: Inspirez profondément..."
                          value={phase.instruction || ''}
                          onChange={(e) => handlePhaseChange(index, 'instruction', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    variant="bordered"
                    onClick={addPhase}
                    className="border-cesizen-400 text-cesizen-700 hover:bg-cesizen-50"
                  >
                    <span className="mr-2">➕</span>
                    Ajouter une phase
                  </Button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="bordered"
                  onClick={() => router.push("/admin/exercices-professionnels")}
                  disabled={loading}
                  className="border-gray-400 text-gray-700 hover:bg-gray-50 px-8 py-3"
                >
                  ❌ Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white px-8 py-3 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 