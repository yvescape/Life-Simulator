/**
 * Génère un nombre pseudo-gaussien dans [min, max].
 * Utilise la somme de 6 uniformes (approximation du théorème central limite)
 * pour obtenir une cloche centrée autour de (min + max) / 2.
 */
export function randomGaussian(min: number, max: number): number {
  let somme = 0
  for (let i = 0; i < 6; i++) {
    somme += Math.random()
  }
  // somme ∈ [0, 6], moyenne théorique 3 → ramène dans [0, 1]
  const normalise = somme / 6
  return Math.round(min + normalise * (max - min))
}

/** Entier aléatoire uniforme dans [min, max] inclus */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Sélectionne un élément aléatoire dans un tableau non vide */
export function randomPick<T>(tableau: T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)]
}

/** Génère un UUID v4 simple sans dépendance externe */
export function genererUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
