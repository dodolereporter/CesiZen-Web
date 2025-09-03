// Utilitaires pour la gestion des utilisateurs et des rôles

/**
 * Obtient le nom d'un rôle (gère les chaînes et les objets)
 * @param role Le rôle (string ou objet avec propriété name)
 * @returns Le nom du rôle en tant que chaîne
 */
function getRoleName(role: any): string {
  if (typeof role === 'string') {
    return role;
  }
  if (role && typeof role === 'object' && role.name) {
    return role.name;
  }
  return '';
}

/**
 * Vérifie si un utilisateur a le rôle administrateur
 * @param user L'objet utilisateur avec ses rôles
 * @returns true si l'utilisateur est admin, false sinon
 */
export function isAdmin(user: any): boolean {
  if (!user || !user.roles) {
    return false;
  }
  
  console.log('🔍 Vérification admin pour:', user);
  console.log('📋 Rôles reçus:', user.roles);
  
  return user.roles.some((role: any) => {
    const roleName = getRoleName(role);
    console.log('🎯 Vérification du rôle:', roleName);
    return roleName === 'ROLE_ADMIN' || roleName === 'ADMIN' || roleName.toLowerCase() === 'admin';
  });
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 * @param user L'objet utilisateur avec ses rôles
 * @param roleName Le nom du rôle à vérifier
 * @returns true si l'utilisateur a le rôle, false sinon
 */
export function hasRole(user: any, roleName: string): boolean {
  if (!user || !user.roles) {
    return false;
  }
  
  return user.roles.some((role: any) => {
    const currentRoleName = getRoleName(role);
    return currentRoleName === roleName || 
           currentRoleName === `ROLE_${roleName.toUpperCase()}` ||
           currentRoleName.toLowerCase() === roleName.toLowerCase();
  });
}

/**
 * Obtient la liste des rôles formatés d'un utilisateur
 * @param user L'objet utilisateur avec ses rôles
 * @returns Tableau des noms de rôles formatés
 */
export function getUserRoles(user: any): string[] {
  if (!user || !user.roles) {
    return [];
  }
  
  return user.roles.map((role: any) => {
    const roleName = getRoleName(role);
    return roleName.replace('ROLE_', '').toLowerCase();
  });
}

/**
 * Vérifie si un utilisateur peut gérer les exercices professionnels
 * @param user L'objet utilisateur
 * @returns true si l'utilisateur peut gérer les exercices pro, false sinon
 */
export function canManageProfessionalExercises(user: any): boolean {
  return isAdmin(user);
} 