export type RelationshipType = 'parent' | 'sibling' | 'partner' | 'child' | 'friend'

export interface Relationship {
  id: string
  name: string
  type: RelationshipType
  /** Âge de la personne liée (approximatif) */
  age: number
  /** Qualité de la relation (0 = rompue/hostile, 100 = excellente) */
  relationshipLevel: number
  alive: boolean
}
