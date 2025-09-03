// Utilitaires pour le mapping des phases entre API et Frontend

export interface ApiPhase {
  id?: number;
  name: string;
  durationSeconds: number;
  orderIndex?: number;
  instruction?: string;
}

export interface FrontendPhase {
  type: 'inspire' | 'expire' | 'pause';
  duration: number;
  instruction: string;
}

/**
 * Convertit un nom de phase de l'API vers le type frontend
 */
export function mapApiPhaseTypeToFrontend(phaseName: string): 'inspire' | 'expire' | 'pause' {
  const name = (phaseName || '').toLowerCase().trim();
  
  console.log(`🔄 Mapping phase API -> Frontend: "${phaseName}" -> "${name}"`);
  
  // Variantes pour inspiration
  if (name.includes('inspir') || name === 'inspire') {
    console.log(`✅ Mappé vers: inspire`);
    return 'inspire';
  }
  
  // Variantes pour expiration
  if (name.includes('expir') || name === 'expire') {
    console.log(`✅ Mappé vers: expire`);
    return 'expire';
  }
  
  // Variantes pour pause/rétention
  if (name.includes('pause') || name.includes('rétention') || name.includes('retention') || name === 'pause') {
    console.log(`✅ Mappé vers: pause`);
    return 'pause';
  }
  
  // Fallback par défaut
  console.warn(`⚠️ Type de phase non reconnu: "${phaseName}", utilisation de "pause" par défaut`);
  return 'pause';
}

/**
 * Convertit un type de phase frontend vers le nom API
 */
export function mapFrontendPhaseTypeToApi(phaseType: string): string {
  console.log(`🔄 Mapping phase Frontend -> API: "${phaseType}"`);
  
  switch (phaseType.toLowerCase()) {
    case 'inspire':
      console.log(`✅ Mappé vers: inspire`);
      return 'inspire';
    case 'expire':
      console.log(`✅ Mappé vers: expire`);
      return 'expire';
    case 'pause':
      console.log(`✅ Mappé vers: pause`);
      return 'pause';
    default:
      console.warn(`⚠️ Type frontend non reconnu: "${phaseType}", utilisation de "pause" par défaut`);
      return 'pause';
  }
}

/**
 * Convertit une phase de l'API vers le format frontend
 */
export function mapApiPhaseToFrontend(apiPhase: ApiPhase, index?: number): FrontendPhase {
  const logPrefix = index !== undefined ? `Phase ${index + 1}` : 'Phase';
  console.log(`🔄 ${logPrefix} API -> Frontend:`, apiPhase);
  
  const frontendPhase: FrontendPhase = {
    type: mapApiPhaseTypeToFrontend(apiPhase.name),
    duration: apiPhase.durationSeconds,
    instruction: apiPhase.instruction || ""
  };
  
  console.log(`✅ ${logPrefix} mappée:`, frontendPhase);
  return frontendPhase;
}

/**
 * Convertit une phase frontend vers le format API
 */
export function mapFrontendPhaseToApi(frontendPhase: FrontendPhase, index: number): Omit<ApiPhase, 'id'> {
  console.log(`🔄 Phase ${index + 1} Frontend -> API:`, frontendPhase);
  
  const apiPhase = {
    name: mapFrontendPhaseTypeToApi(frontendPhase.type),
    durationSeconds: frontendPhase.duration,
    orderIndex: index + 1,
    instruction: frontendPhase.instruction || ""
  };
  
  console.log(`✅ Phase ${index + 1} pour API:`, apiPhase);
  return apiPhase;
}

/**
 * Convertit un tableau de phases API vers frontend
 */
export function mapApiPhasesToFrontend(apiPhases: ApiPhase[]): FrontendPhase[] {
  console.log(`🔄 Mapping ${apiPhases.length} phases API -> Frontend`);
  
  const frontendPhases = apiPhases.map((phase, index) => 
    mapApiPhaseToFrontend(phase, index)
  );
  
  console.log(`✅ ${frontendPhases.length} phases mappées:`, frontendPhases);
  return frontendPhases;
}

/**
 * Convertit un tableau de phases frontend vers API
 */
export function mapFrontendPhasesToApi(frontendPhases: FrontendPhase[]): Omit<ApiPhase, 'id'>[] {
  console.log(`🔄 Mapping ${frontendPhases.length} phases Frontend -> API`);
  
  const apiPhases = frontendPhases.map((phase, index) => 
    mapFrontendPhaseToApi(phase, index)
  );
  
  console.log(`✅ ${apiPhases.length} phases pour API:`, apiPhases);
  return apiPhases;
} 