// pages/exercises/respiration.tsx
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import RespirationProList from "@/components/respiration/RespirationProList";
import RespirationUserList from "@/components/respiration/RespirationUserList";
import { Button } from "@heroui/button";
import DefaultLayout from "@/layouts/default";

export default function RespirationExercisesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pro' | 'user'>('pro');

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête avec titre et description */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🫁</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              Exercices de Respiration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos exercices professionnels créés par des experts ou créez vos propres exercices personnalisés selon vos besoins.
            </p>
            {!user && (
              <div className="mt-6 bg-cesizen-50 border border-cesizen-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-cesizen-800 text-sm mb-3">
                  💡 Connectez-vous pour créer vos propres exercices personnalisés !
                </p>
                <Button
                  as="a"
                  href="/login"
                  color="primary"
                  size="sm"
                  className="bg-cesizen-600 hover:bg-cesizen-700"
                >
                  Se connecter
                </Button>
              </div>
            )}
          </div>
          
          {/* Onglets avec style moderne */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('pro')}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === 'pro'
                      ? 'bg-gradient-to-r from-cesizen-600 to-cesizen-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span className="mr-2">👨‍⚕️</span>
                  Exercices Professionnels
                </button>
                {user && (
                  <button
                    onClick={() => setActiveTab('user')}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === 'user'
                        ? 'bg-gradient-to-r from-cesizen-600 to-cesizen-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="mr-2">👤</span>
                    Mes Exercices
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'pro' && (
              <div>
                {/* En-tête section pro */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Exercices Professionnels
                    </h2>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Ces exercices ont été créés par nos professionnels de la santé et sont basés sur des techniques 
                    de respiration scientifiquement prouvées. Ils sont disponibles pour tous les utilisateurs.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">✅</span>
                        <div>
                          <div className="font-semibold text-green-800">Validés scientifiquement</div>
                          <div className="text-sm text-green-600">Techniques éprouvées</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🎯</span>
                        <div>
                          <div className="font-semibold text-blue-800">Objectifs spécifiques</div>
                          <div className="text-sm text-blue-600">Stress, sommeil, concentration</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">👥</span>
                        <div>
                          <div className="font-semibold text-purple-800">Pour tous niveaux</div>
                          <div className="text-sm text-purple-600">Débutant à expert</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RespirationProList />
              </div>
            )}

            {activeTab === 'user' && user && (
              <div>
                {/* En-tête section utilisateur avec bouton de création */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-2xl">👤</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          Mes Exercices Personnels
                        </h2>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                        Créez et personnalisez vos propres exercices de respiration selon vos besoins spécifiques. 
                        Vous pouvez les modifier ou les supprimer à tout moment.
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        as="a"
                        href="/exercices/respiration/create"
                        size="lg"
                        className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        <span className="mr-2">✨</span>
                        Créer un exercice
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🎨</span>
                        <div>
                          <div className="font-semibold text-orange-800">Personnalisables</div>
                          <div className="text-sm text-orange-600">Créez selon vos besoins</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">✏️</span>
                        <div>
                          <div className="font-semibold text-green-800">Modifiables</div>
                          <div className="text-sm text-green-600">Ajustez quand vous voulez</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🔒</span>
                        <div>
                          <div className="font-semibold text-blue-800">Privés</div>
                          <div className="text-sm text-blue-600">Visible uniquement par vous</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RespirationUserList />
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}