import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { exerciseService } from "@/services/api";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import React, { useState, useRef, useEffect } from "react";
import { mapApiPhasesToFrontend } from "@/utils/phaseMapping";
import NoSSR from "@/components/NoSSR";

export default function RespirationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCircleSize, setCurrentCircleSize] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger l'exercice depuis l'API
  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const exerciseData = await exerciseService.getById(Number(id));
        
        console.log('Données brutes reçues de l\'API:', exerciseData);
        
        // Adapter les données de l'API au format attendu par le composant
        const adaptedExercise = {
          ...exerciseData,
          phases: exerciseData.phases ? mapApiPhasesToFrontend(exerciseData.phases) : [],
          totalDuration: exerciseData.phases ? 
            exerciseData.phases.reduce((sum: number, phase: any) => sum + (phase.durationSeconds || phase.duration || 0), 0) :
            exerciseData.estimatedDuration || 0
        };
        
        console.log('Exercice adapté final:', adaptedExercise);
        setExercise(adaptedExercise);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'exercice:', err);
        setError("Impossible de charger cet exercice. Il n'existe peut-être pas ou vous n'y avez pas accès.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);



  // Positions fixes pour les particules (évite l'erreur d'hydratation)
  const particlePositions = [
    { left: '10%', top: '20%', delay: '0s' },
    { left: '85%', top: '15%', delay: '0.5s' },
    { left: '20%', top: '80%', delay: '1s' },
    { left: '90%', top: '70%', delay: '1.5s' },
    { left: '50%', top: '10%', delay: '2s' },
    { left: '15%', top: '60%', delay: '0.3s' },
    { left: '75%', top: '85%', delay: '0.8s' },
    { left: '40%', top: '40%', delay: '1.2s' },
  ];

  const handleDelete = async () => {
    if (!exercise || !window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) return;
    
    try {
      await exerciseService.deleteExercise(exercise.id);
      router.push("/exercices/respiration");
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      
      // Gestion spécifique des erreurs
      let errorMessage = "Erreur lors de la suppression de l'exercice";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = err.message as string;
      }
      
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (!isPlaying || !exercise || !exercise.phases) return;
    
    const currentPhaseData = exercise.phases[currentPhase];
    if (currentPhase === 0) {
      setCurrentCircleSize(currentPhaseData.type === 'inspire' ? 1 : 1.3);
    } else {
      const prevPhase = exercise.phases[currentPhase - 1];
      if (prevPhase.type === 'inspire') {
        setCurrentCircleSize(1.3);
      } else if (prevPhase.type === 'expire') {
        setCurrentCircleSize(1);
      }
    }
    
    setTimeLeft(currentPhaseData.duration);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (currentPhase < exercise.phases.length - 1) {
            setCurrentPhase((p) => p + 1);
            setTimeLeft(exercise.phases[currentPhase + 1].duration);
          } else {
            setIsPlaying(false);
            setIsFinished(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isPlaying, currentPhase, exercise]);

  if (loading) {
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

  if (error || !exercise) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Exercice introuvable</h1>
            <p className="mb-6 text-gray-500">
              {error || "L'exercice demandé n'existe pas ou a été supprimé."}
            </p>
            <div className="space-y-4">
                          <Button 
              onClick={() => router.push("/exercices/respiration")}
              className="bg-cesizen-600 hover:bg-cesizen-700 text-white"
            >
              ← Retour à la liste
            </Button>
              <div className="text-sm text-gray-400">
                ID recherché : {id}
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (isPlaying && exercise && exercise.phases) {
    const phase = exercise.phases[currentPhase];
    const progress = ((phase.duration - timeLeft) / phase.duration) * 100;
    const isInspiring = phase.type === 'inspire';
    const isExpiring = phase.type === 'expire';
    const isPausing = phase.type === 'pause';
    
    let circleScale = currentCircleSize;
    if (isInspiring) {
      const startSize = currentCircleSize;
      const endSize = 1.3;
      circleScale = startSize + (progress / 100) * (endSize - startSize);
    } else if (isExpiring) {
      const startSize = currentCircleSize;
      const endSize = 1;
      circleScale = startSize - (progress / 100) * (startSize - endSize);
    } else if (isPausing) {
      circleScale = currentCircleSize;
    }
    
    return (
      <DefaultLayout>
        <div className={`
          flex flex-col items-center justify-center min-h-screen py-16 relative overflow-hidden
          ${isInspiring ? 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100' : ''}
          ${isExpiring ? 'bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-100' : ''}
          ${isPausing ? 'bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100' : ''}
          transition-all duration-1000 ease-in-out
        `}>
          {/* Particules flottantes animées */}
          <NoSSR>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particlePositions.map((position, index) => (
                <div
                  key={index}
                  className={`
                    absolute w-2 h-2 rounded-full opacity-20 animate-pulse
                    ${isInspiring ? 'bg-green-400' : ''}
                    ${isExpiring ? 'bg-blue-400' : ''}
                    ${isPausing ? 'bg-purple-400' : ''}
                  `}
                  style={{
                    left: position.left,
                    top: position.top,
                    animationDelay: position.delay,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>
          </NoSSR>

          {/* Onde de respiration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className={`
                w-96 h-96 rounded-full border-4 border-opacity-20 animate-ping
                ${isInspiring ? 'border-green-400' : ''}
                ${isExpiring ? 'border-blue-400' : ''}
                ${isPausing ? 'border-purple-400' : ''}
              `}
              style={{ animationDuration: `${phase.duration}s` }}
            />
          </div>

          <h2 className="text-3xl font-bold mb-12 text-gray-800 relative z-10">
            Phase {currentPhase + 1} / {exercise.phases.length}
          </h2>
          
          {/* Cercle principal avec orbe de lumière */}
          <div className="relative mb-16 z-10">
            <div 
              className={`
                w-80 h-80 rounded-full flex items-center justify-center text-6xl font-mono font-bold
                transition-all duration-1000 ease-in-out relative
                ${isInspiring ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 shadow-2xl shadow-green-300' : ''}
                ${isExpiring ? 'bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500 shadow-2xl shadow-blue-300' : ''}
                ${isPausing ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 shadow-2xl shadow-purple-300' : ''}
              `}
              style={{
                transform: `scale(${circleScale})`,
                boxShadow: isInspiring ? '0 0 80px rgba(34, 197, 94, 0.6), inset 0 0 40px rgba(255,255,255,0.3)' :
                           isExpiring ? '0 0 80px rgba(59, 130, 246, 0.6), inset 0 0 40px rgba(255,255,255,0.3)' :
                           '0 0 80px rgba(147, 51, 234, 0.6), inset 0 0 40px rgba(255,255,255,0.3)'
              }}
            >
              <div className="text-white drop-shadow-2xl text-center">
                <div className="text-8xl mb-4">
                  {isInspiring ? '🫁' : isExpiring ? '💨' : '🧘'}
                </div>
                <div className="text-5xl font-bold">{timeLeft}s</div>
              </div>
            </div>
            
            {/* Effet de particules/éclat autour du cercle */}
            <div className="absolute inset-0 rounded-full animate-spin">
              <div className="w-full h-full rounded-full border-4 border-white/30"></div>
            </div>
            <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
              <div className="w-full h-full rounded-full border-2 border-white/20"></div>
            </div>
          </div>
          
          {/* Type de phase avec style immersif */}
          <div className={`
            text-5xl font-extrabold mb-12 px-8 py-4 rounded-full relative z-10
            ${isInspiring ? 'text-green-800 bg-green-200/80 backdrop-blur-sm shadow-lg' : ''}
            ${isExpiring ? 'text-blue-800 bg-blue-200/80 backdrop-blur-sm shadow-lg' : ''}
            ${isPausing ? 'text-purple-800 bg-purple-200/80 backdrop-blur-sm shadow-lg' : ''}
          `}>
            {isInspiring ? '🌬️ Inspiration' : 
             isExpiring ? '💨 Expiration' : '🧘 Pause'}
          </div>
          
          {/* Instruction avec style immersif */}
          <p className="mb-16 text-xl text-gray-800 text-center max-w-lg px-6 relative z-10 bg-white/60 backdrop-blur-sm py-4 rounded-2xl shadow-lg">
            {phase.instruction || (
              isInspiring ? '🌱 Inspirez profondément par le nez, sentez votre poitrine se gonfler' : 
              isExpiring ? '🍃 Expirez lentement par la bouche, relâchez toute tension' : 
              '✨ Pause, restez calme et détendu, observez votre respiration'
            )}
          </p>
          
          {/* Bouton arrêter avec style immersif */}
          <Button 
            variant="bordered" 
            className="border-red-400 text-red-700 hover:bg-red-50 relative z-10 text-lg px-8 py-3" 
            onClick={() => { setIsPlaying(false); setCurrentPhase(0); setIsFinished(false); }}
          >
            ⏹️ Arrêter
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  // Écran de fin séparé
  if (isFinished && exercise) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200 relative overflow-hidden">
          {/* Particules de célébration */}
          <NoSSR>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particlePositions.map((position, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 rounded-full opacity-40 bg-cesizen-400 animate-bounce"
                  style={{
                    left: position.left,
                    top: position.top,
                    animationDelay: position.delay,
                    animationDuration: '2s'
                  }}
                />
              ))}
              {/* Particules supplémentaires pour effet de célébration */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`extra-${index}`}
                  className="absolute w-2 h-2 rounded-full opacity-30 bg-yellow-400 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${index * 0.3}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </NoSSR>

          <div className="flex flex-col items-center justify-center min-h-screen py-16 relative z-10">
            {/* En-tête de célébration */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-8 shadow-2xl animate-pulse">
                <span className="text-6xl">🎉</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-6">
                Bravo ! Exercice terminé !
              </h1>
              <p className="text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Félicitations, vous avez terminé votre séance de respiration <strong>{exercise.label}</strong>
              </p>
            </div>

            {/* Statistiques de la séance */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 text-center transform hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cesizen-400 to-cesizen-500 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl">⏱️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Temps total</h3>
                <p className="text-4xl font-bold text-cesizen-600">{exercise.totalDuration}s</p>
                <p className="text-sm text-gray-500 mt-2">de respiration consciente</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 text-center transform hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl">🫁</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Phases complétées</h3>
                <p className="text-4xl font-bold text-emerald-600">{exercise.phases.length}</p>
                <p className="text-sm text-gray-500 mt-2">cycles de respiration</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 text-center transform hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Bien-être</h3>
                <p className="text-4xl font-bold text-orange-600">+100%</p>
                <p className="text-sm text-gray-500 mt-2">ressenti intérieur</p>
              </div>
            </div>

            {/* Message encourageant */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/60 mb-12 max-w-2xl mx-4 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Votre pratique s'épanouit</h3>
              <p className="text-gray-600 leading-relaxed">
                Chaque séance de respiration consciente contribue à votre bien-être mental et physique. 
                Continuez sur cette voie et observez les bienfaits dans votre quotidien.
              </p>
            </div>
            
            {/* Boutons d'action stylisés */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                variant="solid" 
                size="lg"
                className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white text-lg px-10 py-4 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300" 
                onClick={() => { 
                  setIsPlaying(true); 
                  setCurrentPhase(0); 
                  setIsFinished(false);
                  setCurrentCircleSize(exercise.phases[0].type === 'inspire' ? 1 : 1.3);
                }}
              >
                <span className="mr-3 text-xl">🔄</span>
                Recommencer cet exercice
              </Button>
              <Button 
                variant="bordered" 
                size="lg"
                className="border-2 border-cesizen-400 text-cesizen-700 hover:bg-cesizen-50 hover:border-cesizen-500 text-lg px-10 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300" 
                onClick={() => { 
                  router.push("/exercices/respiration");
                }}
              >
                <span className="mr-3 text-xl">📋</span>
                Explorer d'autres exercices
              </Button>
            </div>

            {/* Citation inspirante */}
            <div className="mt-12 text-center">
              <blockquote className="text-lg italic text-gray-600 max-w-lg mx-auto">
                "La respiration est le pont qui relie la vie à la conscience, qui unit votre corps à vos pensées."
              </blockquote>
              <cite className="block mt-3 text-sm text-cesizen-600 font-medium">- Thich Nhat Hanh</cite>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200 relative overflow-hidden">
        {/* Particules de fond */}
        <NoSSR>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particlePositions.slice(0, 6).map((position, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full opacity-10 bg-cesizen-400 animate-pulse"
                style={{
                  left: position.left,
                  top: position.top,
                  animationDelay: position.delay,
                  animationDuration: '4s'
                }}
              />
            ))}
          </div>
        </NoSSR>

        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
          {/* En-tête avec titre et description */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🫁</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              {exercise.label}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Statistiques de l'exercice */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Durée totale</h3>
              <p className="text-3xl font-bold text-blue-600">{exercise.totalDuration}s</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Phases</h3>
              <p className="text-3xl font-bold text-purple-600">{exercise.phases.length}</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Niveau</h3>
              <p className="text-3xl font-bold text-cesizen-600">
                {exercise.phases.length <= 3 ? 'Débutant' : exercise.phases.length <= 5 ? 'Intermédiaire' : 'Avancé'}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="solid" 
              className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white text-lg px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300" 
              onClick={() => { setIsPlaying(true); setCurrentPhase(0); }}
            >
              <span className="mr-2">🚀</span>
              Commencer l'exercice
            </Button>
            
            <div className="flex gap-3">
              {/* Boutons d'action pour l'utilisateur propriétaire */}
              {user && exercise.userId === user.id && (
                <>
                  <Button 
                    variant="bordered" 
                    className="border-cesizen-400 text-cesizen-700 hover:bg-cesizen-50 px-6 py-4 rounded-2xl" 
                    onClick={() => router.push(`/exercices/respiration/edit/${exercise.id}`)}
                  >
                    <span className="mr-2">✏️</span>
                    Modifier
                  </Button>
                  <Button 
                    variant="bordered" 
                    className="border-red-400 text-red-700 hover:bg-red-50 px-6 py-4 rounded-2xl" 
                    onClick={handleDelete}
                  >
                    <span className="mr-2">🗑️</span>
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Séquence des phases avec design moderne */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="mr-3 text-3xl">🎯</span>
              Séquence de respiration
            </h2>
            
            <div className="grid gap-6">
              {exercise.phases.map((phase: any, idx: number) => {
                const phaseConfig = {
                  inspire: {
                    emoji: '🫁',
                    title: 'Inspiration',
                    gradient: 'from-emerald-400 to-green-500',
                    bgGradient: 'from-emerald-50 to-green-100',
                    borderColor: 'border-emerald-200',
                    textColor: 'text-emerald-700',
                    iconBg: 'bg-emerald-500',
                    description: 'Inspirez profondément par le nez, sentez votre poitrine se gonfler'
                  },
                  expire: {
                    emoji: '💨',
                    title: 'Expiration',
                    gradient: 'from-cyan-400 to-blue-500',
                    bgGradient: 'from-cyan-50 to-blue-100',
                    borderColor: 'border-cyan-200',
                    textColor: 'text-blue-700',
                    iconBg: 'bg-blue-500',
                    description: 'Expirez lentement par la bouche, relâchez toute tension'
                  },
                  pause: {
                    emoji: '🧘',
                    title: 'Pause',
                    gradient: 'from-purple-400 to-pink-500',
                    bgGradient: 'from-purple-50 to-pink-100',
                    borderColor: 'border-purple-200',
                    textColor: 'text-purple-700',
                    iconBg: 'bg-purple-500',
                    description: 'Restez calme et détendu, observez votre respiration'
                  }
                };
                
                const config = phaseConfig[phase.type as keyof typeof phaseConfig] || phaseConfig.pause;
                
                return (
                  <div 
                    key={idx} 
                    className={`
                      relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl
                      bg-gradient-to-br ${config.bgGradient} ${config.borderColor} border-2
                    `}
                  >
                    {/* Effet de brillance */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    
                    {/* Numéro de phase */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">{idx + 1}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {/* Icône principale */}
                      <div className={`
                        relative w-20 h-20 rounded-2xl ${config.iconBg} flex items-center justify-center
                        shadow-lg transform hover:rotate-12 transition-transform duration-300
                      `}>
                        <span className="text-4xl">{config.emoji}</span>
                        
                        {/* Effet de particules autour de l'icône */}
                        <div className="absolute inset-0 rounded-2xl opacity-20 bg-white"></div>
                      </div>
                      
                      {/* Contenu principal */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-2xl font-bold ${config.textColor}`}>
                            {config.title}
                          </h3>
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-semibold text-white
                            bg-gradient-to-r ${config.gradient}
                          `}>
                            {phase.duration}s
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {phase.instruction || config.description}
                        </p>
                        
                        {/* Barre de progression visuelle */}
                        <div className="w-full bg-white/50 rounded-full h-2 mb-3">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-1000`}
                            style={{ width: `${(phase.duration / Math.max(...exercise.phases.map((p: any) => p.duration))) * 100}%` }}
                          ></div>
                        </div>
                        
                        {/* Indicateurs visuels */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${config.iconBg} animate-pulse`}></div>
                            <span className="text-xs text-gray-500">Phase active</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">⏱️ {phase.duration} secondes</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicateur de type avec emoji */}
                      <div className="text-center">
                        <div className={`
                          w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-2
                          shadow-lg transform hover:scale-110 transition-transform duration-300
                        `}>
                          <span className="text-2xl">{config.emoji}</span>
                        </div>
                        <span className={`text-xs font-semibold ${config.textColor}`}>
                          {config.title}
                        </span>
                      </div>
                    </div>
                    
                    {/* Effet de bordure animée */}
                    <div className={`
                      absolute inset-0 rounded-3xl border-2 border-transparent
                      bg-gradient-to-r ${config.gradient} bg-clip-border
                      opacity-20 hover:opacity-40 transition-opacity duration-300
                    `}></div>
                  </div>
                );
              })}
            </div>
            
            {/* Résumé de la séquence */}
            <div className="mt-8 p-6 bg-gradient-to-r from-cesizen-50 to-cesizen-100 rounded-2xl border border-cesizen-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Résumé de la séquence</h3>
                    <p className="text-sm text-gray-600">
                      {exercise.phases.length} phases • {exercise.totalDuration} secondes total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cesizen-600">{exercise.totalDuration}s</div>
                  <div className="text-xs text-gray-500">Durée totale</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 