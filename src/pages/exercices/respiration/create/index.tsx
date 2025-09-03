// pages/exercises/respiration/create.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import DefaultLayout from "@/layouts/default";
import { exerciseService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import NoSSR from "@/components/NoSSR";

export default function CreateRespiration() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [phases, setPhases] = useState<
    { type: string; duration: number; instruction: string }[]
  >([{ type: "inspire", duration: 4, instruction: "" }]);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Rediriger si pas connecté (mais attendre la fin du loading)
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const addPhase = () =>
    setPhases([...phases, { type: "inspire", duration: 4, instruction: "" }]);
    
  const removePhase = (i: number) =>
    setPhases(phases.filter((_, idx) => idx !== i));
    
  const updatePhase = (
    i: number,
    field: "type" | "duration" | "instruction",
    val: any,
  ) => {
    const copy = [...phases];
    copy[i] = { ...copy[i], [field]: val };
    setPhases(copy);
  };

  const handleSave = async () => {
    setError("");
    
    if (!user) {
      setError("Vous devez être connecté pour créer un exercice");
      router.push("/login");
      return;
    }

    if (
      !label.trim() ||
      !description.trim() ||
      phases.some((p) => !p.type.trim() || p.duration <= 0)
    ) {
      setError("Veuillez remplir tous les champs correctement.");
      return;
    }
    
    setSaveLoading(true);
    
    try {
      const exerciseData = {
        label: label.trim(),
        description: description.trim(),
        phases: phases.map((p) => ({ 
          type: p.type, 
          duration: p.duration,
          instruction: p.instruction || ""
        }))
      };
      
      const newExercise = await exerciseService.create(exerciseData);
      router.push(`/exercices/respiration/${newExercise.id}`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setError("Erreur lors de la création de l'exercice. Vérifiez que vous êtes connecté et réessayez.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Pendant le chargement de l'authentification
  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Vérification de l'authentification...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Si pas d'utilisateur après le chargement
  if (!user) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
            <p className="mb-6 text-gray-500">
              Vous devez être connecté pour créer un exercice.
            </p>
            <Button 
              onClick={() => router.push("/login")}
              className="bg-cesizen-600 hover:bg-cesizen-700 text-white"
            >
              ← Se connecter
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <NoSSR fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
      }>
        <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              {/* En-tête */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl">✨</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
                  Créer un exercice de respiration
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Personnalisez votre propre exercice selon vos besoins et préférences
                </p>
              </div>

              {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <div className="font-medium text-red-800">Erreur</div>
                      <div className="text-red-600">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations générales */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">📝</span>
                  Informations générales
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Input
                      id="label"
                      label="Nom de l'exercice *"
                      placeholder="Ex: Ma routine matinale"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      description="Donnez un nom clair et descriptif à votre exercice"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée *
                    </label>
                    <textarea
                      id="description"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[100px] resize-y focus:ring-2 focus:ring-cesizen-500 focus:border-transparent transition-all duration-200"
                      placeholder="Décrivez les bienfaits et le contexte d'utilisation de cet exercice..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Expliquez les bénéfices et quand utiliser cet exercice
                    </p>
                  </div>
                </div>
              </div>

              {/* Phases de respiration */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3 text-3xl">🫁</span>
                    Phases de respiration *
                  </h2>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                    onClick={addPhase}
                  >
                    <span className="mr-2">+</span>
                    Ajouter une phase
                  </Button>
                </div>

                <div className="space-y-6">
                  {phases.map((phase, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {idx + 1}
                          </div>
                          <span className="font-semibold text-gray-800">Phase {idx + 1}</span>
                        </div>
                        {phases.length > 1 && (
                          <Button
                            color="danger"
                            size="sm"
                            variant="bordered"
                            onClick={() => removePhase(idx)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <span className="mr-1">🗑️</span>
                            Supprimer
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor={`phase-type-${idx}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Type de phase
                          </label>
                          <select
                            id={`phase-type-${idx}`}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cesizen-500 focus:border-transparent transition-all duration-200"
                            value={phase.type}
                            onChange={(e) => updatePhase(idx, "type", e.target.value)}
                          >
                            <option value="inspire">🫁 Inspiration</option>
                            <option value="expire">💨 Expiration</option>
                            <option value="pause">🧘 Pause</option>
                          </select>
                        </div>
                        
                        <div>
                          <Input
                            id={`phase-duration-${idx}`}
                            label="Durée (secondes)"
                            placeholder="Durée en secondes"
                            type="number"
                            min="1"
                            max="60"
                            value={String(phase.duration)}
                            onChange={(e) =>
                              updatePhase(idx, "duration", Number(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor={`phase-instruction-${idx}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Instruction personnalisée (optionnel)
                        </label>
                        <textarea
                          id={`phase-instruction-${idx}`}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-y focus:ring-2 focus:ring-cesizen-500 focus:border-transparent transition-all duration-200"
                          placeholder="Ex: Inspirez lentement par le nez en gonflant le ventre..."
                          rows={2}
                          value={phase.instruction}
                          onChange={(e) => updatePhase(idx, "instruction", e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Instruction spécifique pour cette phase (laissez vide pour utiliser l'instruction par défaut)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Résumé */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cesizen-50 to-cesizen-100 rounded-lg border border-cesizen-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <div className="font-semibold text-gray-800">Résumé de l'exercice</div>
                        <div className="text-sm text-gray-600">
                          {phases.length} phase{phases.length > 1 ? 's' : ''} • {phases.reduce((sum, p) => sum + p.duration, 0)} secondes au total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cesizen-600">
                        {phases.reduce((sum, p) => sum + p.duration, 0)}s
                      </div>
                      <div className="text-xs text-gray-500">Durée totale</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="bordered"
                  size="lg"
                  onClick={() => router.push("/exercices/respiration")}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3"
                >
                  <span className="mr-2">←</span>
                  Annuler
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300 px-8 py-3"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Créer l'exercice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </NoSSR>
    </DefaultLayout>
  );
}