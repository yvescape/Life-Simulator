// ─── Item structuré prêt à l'affichage ───────────────────────────────────────

export interface ConsequenceItem {
  /** Texte complet affiché (ex: "+5 Intelligence", "Perte d'emploi") */
  label: string
  /** Polarité déterminant la couleur et l'icône dans l'UI */
  type: 'positive' | 'negative' | 'neutral'
}

/**
 * Construit un ConsequenceItem à partir d'un nom de stat et d'un delta numérique.
 *
 *   formatStatChange('Intelligence', 5)  → { label: '+5 Intelligence', type: 'positive' }
 *   formatStatChange('Santé physique', -10) → { label: '-10 Santé physique', type: 'negative' }
 */
export function formatStatChange(statName: string, delta: number): ConsequenceItem {
  const signe = delta > 0 ? '+' : ''
  return {
    label: `${signe}${delta} ${statName}`,
    type:  delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
  }
}

/**
 * Convertit une ligne de conséquence textuelle en ConsequenceItem.
 * La polarité est déduite du premier caractère ('+' positif, '-' négatif).
 */
export function parseConsequenceLine(ligne: string): ConsequenceItem {
  const type: ConsequenceItem['type'] =
    ligne.startsWith('+') ? 'positive' :
    ligne.startsWith('-') ? 'negative' :
    'neutral'
  return { label: ligne, type }
}
