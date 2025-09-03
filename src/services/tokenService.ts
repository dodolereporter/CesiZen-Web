// Service de gestion des tokens JWT
class TokenService {
  private readonly TOKEN_KEY = 'cesizen_auth_token';
  private readonly USER_KEY = 'cesizen_user_data';

  // Obtenir le token depuis le localStorage
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Stocker le token dans le localStorage
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Erreur lors du stockage du token:', error);
    }
  }

  // Supprimer le token
  removeToken(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Vérifier si un token existe
  hasToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  // Stocker les données utilisateur
  setUserData(userData: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors du stockage des données utilisateur:', error);
    }
  }

  // Récupérer les données utilisateur
  getUserData(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Vérifier si le token est expiré
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'expiration du token:', error);
      return true;
    }
  }

  // Nettoyer toutes les données d'authentification
  clearAuth(): void {
    this.removeToken();
  }
}

export const tokenService = new TokenService(); 