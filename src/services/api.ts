// Services API pour le frontend
import { tokenService } from './tokenService';
import { mapFrontendPhasesToApi } from '@/utils/phaseMapping';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types pour l'authentification
interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour les requêtes avec authentification
async function fetchWithAuth<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = tokenService.getToken();
  
  // Vérifier si le token est expiré
  if (token && tokenService.isTokenExpired()) {
    tokenService.clearAuth();
    throw new ApiError(401, 'Token expiré');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
        errorData = errorResponse;
      } catch {
        // Si on ne peut pas parser la réponse d'erreur, on utilise le message par défaut
      }

      // Si c'est une erreur d'authentification, nettoyer les données
      if (response.status === 401 || response.status === 403) {
        tokenService.clearAuth();
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    // Gérer les réponses sans contenu (204 No Content, 205 Reset Content)
    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    // Vérifier si la réponse a un contenu à parser
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    // Si pas de contenu ou contenu vide, retourner undefined
    if (contentLength === '0' || (!contentType || !contentType.includes('application/json'))) {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch (jsonError) {
      // Si on ne peut pas parser le JSON, retourner undefined pour les codes de succès
      if (response.status >= 200 && response.status < 300) {
        console.warn('Réponse de succès sans JSON valide, retour undefined');
        return undefined as T;
      }
      throw new ApiError(response.status, 'Réponse JSON invalide');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Erreur réseau');
  }
}

// Fonction pour les requêtes sans authentification
async function fetchWithoutAuth<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
        errorData = errorResponse;
      } catch {
        // Si on ne peut pas parser la réponse d'erreur, on utilise le message par défaut
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Erreur réseau');
  }
}

// Services d'authentification
export const authService = {
  // Connexion utilisateur
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      console.log('🔐 Tentative de connexion pour:', credentials.usernameOrEmail);
      
      const response: LoginResponse = await fetchWithoutAuth('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('📡 Réponse login status: 200');
      console.log('📦 Données reçues:', response);

      if (response.token && response.user) {
        // Stocker le token et les données utilisateur
        tokenService.setToken(response.token);
        tokenService.setUserData(response.user);
        
        console.log('✅ Utilisateur défini:', response.user);
        
        return {
          success: true,
          data: response.user,
          message: 'Connexion réussie'
        };
      } else {
        return {
          success: false,
          message: 'Données de réponse invalides'
        };
      }
    } catch (error) {
      console.error('💥 Erreur lors de la connexion:', error);
      
      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
          error: error.message
        };
      }
      
      return {
        success: false,
        message: 'Erreur de connexion inattendue'
      };
    }
  },

  // Inscription utilisateur
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      const response = await fetchWithoutAuth('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return {
        success: true,
        message: 'Inscription réussie',
        data: response
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
          error: error.message
        };
      }
      
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      const userData = tokenService.getUserData();
      if (userData) {
        return userData;
      }
      
      return await fetchWithAuth('/api/v1/auth/me');
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      tokenService.clearAuth();
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      // Appeler l'endpoint de déconnexion si disponible
      await fetchWithAuth('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      tokenService.clearAuth();
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return tokenService.hasToken() && !tokenService.isTokenExpired();
  }
};

// Services pour les exercices de respiration
export const exerciseService = {
  async getAll(): Promise<any[]> {
    try {
      const data = await fetchWithAuth('/api/v1/exercices');
      return data.map((exercise: any) => ({
        ...exercise,
        isProfessional: exercise.isProfessional || false,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des exercices:', error);
      throw error;
    }
  },

  async getById(id: number) {
    try {
      const token = tokenService.getToken();
      const headers: any = {};
      
      // Ajouter le token seulement s'il existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return fetchWithoutAuth(`/api/v1/exercices/${id}`, {
        headers
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'exercice:', error);
      throw error;
    }
  },

  async create(exercise: any) {
    // Utiliser la fonction utilitaire pour adapter les phases
    const adaptedExercise = {
      label: exercise.label,
      description: exercise.description,
      phases: mapFrontendPhasesToApi(exercise.phases)
    };

    console.log("Données adaptées pour l'API:", adaptedExercise);
    return fetchWithAuth('/api/v1/exercices', {
      method: 'POST',
      body: JSON.stringify(adaptedExercise),
    });
  },

  async update(id: number, exercise: any) {
    try {
      // Utiliser la fonction utilitaire pour adapter les phases
      const adaptedExercise = {
        label: exercise.label,
        description: exercise.description,
        phases: mapFrontendPhasesToApi(exercise.phases)
      };

      console.log("Données de mise à jour envoyées à l'API:", adaptedExercise);
      
      return await fetchWithAuth(`/api/v1/exercices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(adaptedExercise),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'exercice:', error);
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error('Vous n\'êtes pas autorisé à modifier cet exercice');
        } else if (error.status === 404) {
          throw new Error('Exercice introuvable');
        } else if (error.status === 400) {
          throw new Error('Données invalides pour la mise à jour');
        }
      }
      throw error;
    }
  },

  async delete(id: number) {
    try {
      return await fetchWithAuth(`/api/v1/exercices/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exercice:', error);
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error('Vous n\'êtes pas autorisé à supprimer cet exercice');
        } else if (error.status === 404) {
          throw new Error('Exercice introuvable');
        }
      }
      throw error;
    }
  },

  async getDefaults(): Promise<any[]> {
    try {
      const token = tokenService.getToken();
      const headers: any = {};
      
      // Ajouter le token seulement s'il existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const data = await fetchWithoutAuth('/api/v1/exercices/defaults', {
        headers
      });
      return data.map((exercise: any) => ({
        ...exercise,
        isProfessional: exercise.isProfessional || false,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des exercices par défaut:', error);
      throw error;
    }
  },

  async getUserExercises(): Promise<any[]> {
    try {
      const data = await fetchWithAuth('/api/v1/exercices/user');
      return data.map((exercise: any) => ({
        ...exercise,
        isProfessional: exercise.isProfessional || false,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des exercices utilisateur:', error);
      throw error;
    }
  },

  async addToUser(id: number) {
    return fetchWithAuth(`/api/v1/exercices/${id}/add`, {
      method: 'POST',
    });
  },

  async removeFromUser(id: number) {
    return fetchWithAuth(`/api/v1/exercices/${id}/remove`, {
      method: 'DELETE',
    });
  },

  async deleteExercise(id: number): Promise<void> {
    try {
      await fetchWithAuth(`/api/v1/exercices/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exercice:', error);
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error('Vous n\'êtes pas autorisé à supprimer cet exercice');
        } else if (error.status === 404) {
          throw new Error('Exercice introuvable');
        }
      }
      throw error;
    }
  },

  // Méthodes spécifiques pour les exercices professionnels (admin seulement)
  async createProfessional(exercise: any) {
    try {
      // Utiliser la fonction utilitaire pour adapter les phases
      const adaptedExercise = {
        label: exercise.label,
        description: exercise.description,
        phases: mapFrontendPhasesToApi(exercise.phases)
      };

      console.log("Création d'exercice professionnel:", adaptedExercise);
      return await fetchWithAuth('/api/v1/exercices/professional', {
        method: 'POST',
        body: JSON.stringify(adaptedExercise),
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'exercice professionnel:', error);
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error('Seuls les administrateurs peuvent créer des exercices professionnels');
        } else if (error.status === 400) {
          throw new Error('Données invalides pour la création de l\'exercice');
        }
      }
      throw error;
    }
  },
};

// Services pour les articles
export const articleService = {
  async getAll() {
    try {
      // Utiliser fetchWithoutAuth car les articles sont publics en lecture
      return await fetchWithoutAuth('/api/v1/articles');
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      throw error;
    }
  },

  async getById(id: number) {
    try {
      // Utiliser fetchWithoutAuth car les articles sont publics en lecture
      return await fetchWithoutAuth(`/api/v1/articles/${id}`);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error);
      throw error;
    }
  },

  async create(article: any) {
    try {
      // Utiliser fetchWithAuth car la création nécessite des droits admin
      return await fetchWithAuth('/api/v1/articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      throw error;
    }
  },

  async update(id: number, article: any) {
    try {
      // Utiliser fetchWithAuth car la mise à jour nécessite des droits admin
      return await fetchWithAuth(`/api/v1/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      // Utiliser fetchWithAuth car la suppression nécessite des droits admin
      return await fetchWithAuth(`/api/v1/articles/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      throw error;
    }
  }
};

// Services pour l'historique
export const historyService = {
  async getHistory() {
    return fetchWithAuth('/api/v1/historique');
  },

  async addHistory(historyData: any) {
    return fetchWithAuth('/api/v1/historique', {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  },

  async getStats() {
    return fetchWithAuth('/api/v1/historique/stats');
  }
};

// Services pour les utilisateurs (admin seulement)
export const userService = {
  async getAll(page: number = 0, size: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search })
    });
    
    return fetchWithAuth(`/api/v1/users?${params}`);
  },

  async getById(id: number) {
    return fetchWithAuth(`/api/v1/users/${id}`);
  },

  async create(userData: any) {
    return fetchWithAuth('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async update(id: number, userData: any) {
    return fetchWithAuth(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async delete(id: number) {
    return fetchWithAuth(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }
};

// Services pour le profil utilisateur
export const profileService = {
  async getProfile() {
    return fetchWithAuth('/api/v1/profile');
  },

  async updateProfile(profileData: any) {
    return fetchWithAuth('/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(passwordData: any) {
    return fetchWithAuth('/api/v1/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  async anonymizeAccount() {
    return fetchWithAuth('/api/v1/profile/anonymize', {
      method: 'POST',
    });
  }
};

// Export des types et classes
export { ApiError };
export type { ApiResponse, LoginCredentials, RegisterData, LoginResponse }; 