import { useState, useEffect } from 'react';
import { exerciseService } from '@/services/api';
import { defaultExercises } from '@/components/respiration/mockRespirationData';

export function useUserExercises() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les exercices utilisateur depuis l'API
      const userExercises = await exerciseService.getUserExercises();
      
      if (userExercises && Array.isArray(userExercises)) {
        setExercises(userExercises);
      } else {
        console.log("Aucun exercice utilisateur trouvé, initialisation avec tableau vide");
        setExercises([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des exercices utilisateur:', err);
      setError('Impossible de charger vos exercices. Vérifiez votre connexion et que le serveur backend est démarré.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const add = async (exercise: any) => {
    try {
      console.log("Création d'un nouvel exercice:", exercise);
      const newExercise = await exerciseService.create(exercise);
      console.log("Exercice créé avec succès:", newExercise);
      setExercises(prev => [...prev, newExercise]);
      return newExercise;
    } catch (err) {
      console.error('Erreur lors de la création de l\'exercice:', err);
      setError('Erreur lors de la création de l\'exercice. Vérifiez que vous êtes connecté.');
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await exerciseService.delete(id);
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'exercice:', err);
      setError('Erreur lors de la suppression de l\'exercice');
      throw err;
    }
  };

  const update = async (id: number, updated: any) => {
    try {
      const updatedExercise = await exerciseService.update(id, updated);
      setExercises(prev => prev.map(e => (e.id === id ? updatedExercise : e)));
      return updatedExercise;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'exercice:', err);
      setError('Erreur lors de la mise à jour de l\'exercice');
      throw err;
    }
  };

  const get = (id: number) => {
    // Chercher d'abord dans les exercices utilisateur
    const userExercise = exercises.find(e => e.id === id);
    if (userExercise) return userExercise;
    
    // Si pas trouvé, chercher dans les exercices par défaut
    const defaultExercise = defaultExercises.find(e => e.id === id);
    if (defaultExercise) return defaultExercise;
    
    return null;
  };

  const addToUser = async (id: number) => {
    try {
      await exerciseService.addToUser(id);
      await fetchExercises(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'exercice:', err);
      setError('Erreur lors de l\'ajout de l\'exercice');
      throw err;
    }
  };

  const removeFromUser = async (id: number) => {
    try {
      await exerciseService.removeFromUser(id);
      await fetchExercises(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'exercice:', err);
      setError('Erreur lors de la suppression de l\'exercice');
      throw err;
    }
  };

  return { 
    exercises, 
    loading, 
    error, 
    add, 
    remove, 
    update, 
    get, 
    addToUser, 
    removeFromUser,
    refresh: fetchExercises 
  };
} 