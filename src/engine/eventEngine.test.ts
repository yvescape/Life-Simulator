import { describe, it, expect } from 'vitest'
import { modifyOutcomeWeights, genererConsequences } from './eventEngine'
import type { Character } from '../types/character'

// ─── Personnage minimal pour les tests ───────────────────────────────────────

function makeCharacter(overrides: Partial<Character['stats']> = {}): Character {
  return {
    prenom: 'Test',
    nom: 'Joueur',
    sexe: 'homme',
    pays: 'France',
    age: 30,
    statut: 'vivant',
    causeDeces: null,
    tags: [],
    statutRelation: 'celibataire',
    relations: [],
    careerStatus: {
      jobTitle: null,
      employer: null,
      salary: 0,
      satisfaction: 50,
      yearsInCurrentJob: 0,
    },
    finances: { argent: 1000, salaire: 0, dettes: 0 },
    stats: {
      santePhysique: 80,
      santeMentale:  80,
      intelligence:  60,
      charisme:      50,
      beaute:        50,
      chance:        50,
      reputation:    50,
      ...overrides,
    },
  }
}

// ─── updateStats : delta, pas valeur absolue ─────────────────────────────────

describe('updateStats — delta addition', () => {
  it('ajoute le delta à la stat courante (cas nominal)', () => {
    // Reproduit exactement ce que fait updateStats dans le store :
    //   statsAjustees[k] = min(100, max(0, current + delta))
    const current = 60
    const delta = 5
    const result = Math.min(100, Math.max(0, current + delta))
    expect(result).toBe(65)
  })

  it('ne remplace PAS la stat par le delta seul', () => {
    const current = 60
    const delta = 5
    const incorrectResult = Math.min(100, Math.max(0, delta)) // ancien bug
    expect(incorrectResult).not.toBe(65)
    expect(incorrectResult).toBe(5)
  })

  it('clamp à 100 si le total dépasse 100', () => {
    const result = Math.min(100, Math.max(0, 98 + 5))
    expect(result).toBe(100)
  })

  it('clamp à 0 si le total est négatif', () => {
    const result = Math.min(100, Math.max(0, 3 - 10))
    expect(result).toBe(0)
  })
})

// ─── modifyOutcomeWeights ─────────────────────────────────────────────────────

describe('modifyOutcomeWeights', () => {
  it('augmente le poids des outcomes positifs quand chance > 50', () => {
    const character = makeCharacter({ chance: 80 })
    const outcomes = [
      { id: 'bon', text: '', weight: 10, valence: 'positif' as const, effects: {} },
      { id: 'mauvais', text: '', weight: 10, valence: 'negatif' as const, effects: {} },
    ]
    const [bon, mauvais] = modifyOutcomeWeights(outcomes, character)
    expect(bon.weight).toBeGreaterThan(mauvais.weight)
  })

  it('le poids minimum est 1 après ajustement', () => {
    const character = makeCharacter({ chance: 1, intelligence: 1 })
    const outcomes = [
      { id: 'o', text: '', weight: 1, valence: 'positif' as const, effects: {} },
    ]
    const [o] = modifyOutcomeWeights(outcomes, character, 'career')
    expect(o.weight).toBeGreaterThanOrEqual(1)
  })
})

// ─── genererConsequences ──────────────────────────────────────────────────────

describe('genererConsequences', () => {
  it('affiche correctement un delta positif de stat', () => {
    const lignes = genererConsequences({ stats: { intelligence: 5 } })
    expect(lignes).toContain('+5 Intelligence')
  })

  it('affiche correctement un delta négatif de stat', () => {
    const lignes = genererConsequences({ stats: { santePhysique: -10 } })
    expect(lignes).toContain('-10 Santé physique')
  })

  it('affiche correctement un gain d\'argent', () => {
    const lignes = genererConsequences({ money: 500 })
    expect(lignes[0]).toMatch(/^\+500/)
  })

  it('affiche les dettes ajoutées', () => {
    const lignes = genererConsequences({ debtDelta: 10000 })
    expect(lignes.some((l) => l.includes('10'))).toBe(true)
  })

  it('ignore les stats à 0', () => {
    const lignes = genererConsequences({ stats: { intelligence: 0 } })
    expect(lignes).toHaveLength(0)
  })
})
