import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, CharacterStats, CharacterFinances, CareerStatus, LifeEvent, ScheduledEvent, Character, FluxFinancier, WorldTag } from '../types/character'
import { generateRandomCharacter } from '../engine/characterGenerator'

// ─── Calcul des dépenses fixes annuelles ──────────────────────────────────────

function calculerDepensesFixes(c: Character): number {
  if (c.age < 18) return 0

  // Logement mensuel
  const loyer = c.tags.includes('proprietaire') ? 200 : c.age < 26 ? 600 : 800

  // Vie courante mensuelle (nourriture, transport, loisirs)
  const vie = c.age < 26 ? 500 : c.age < 45 ? 650 : 700

  // Charges familiales mensuelles
  const enfants = c.tags.includes('a_enfant') ? 400 : 0
  const couple  = (c.statutRelation === 'marie' || c.statutRelation === 'en_couple') ? 200 : 0

  return (loyer + vie + enfants + couple) * 12
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface GameActions {
  /** Crée un nouveau personnage et réinitialise entièrement la partie */
  newGame: () => void
  /** Avance d'un an : incrémente l'âge et l'année civile */
  advanceYear: () => void
  /** Fusionne des stats partielles sur celles du personnage actuel */
  updateStats: (partialStats: Partial<CharacterStats>) => void
  /** Ajoute un tag anti-répétition (ignoré s'il est déjà présent) */
  addTag: (tag: string) => void
  /** Enregistre un événement vécu dans l'historique */
  addLifeEvent: (event: LifeEvent) => void
  /** Met en file un événement à déclencher à un âge futur */
  scheduleEvent: (scheduledEvent: ScheduledEvent) => void
  /** Retire un tag du personnage (no-op s'il est absent) */
  removeTag: (tag: string) => void
  /** Met à jour les finances du personnage (merge partiel) */
  updateFinances: (partialFinances: Partial<CharacterFinances>) => void
  /** Met à jour la situation professionnelle du personnage (merge partiel) */
  updateCareer: (partial: Partial<CareerStatus>) => void
  /**
   * Retire et retourne tous les événements programmés dont l'âge déclencheur
   * correspond à l'âge fourni. Opération atomique : lecture + suppression.
   */
  consumeScheduledEventsAtAge: (age: number) => ScheduledEvent[]
  /** Ajoute un tag mondial actif pendant N années (expiry calculé depuis anneeCourante) */
  addWorldTag: (w: { tag: string; label: string; durationYears: number }) => void
  /** Retire immédiatement un tag mondial */
  removeWorldTag: (tag: string) => void
}

// ─── État initial ─────────────────────────────────────────────────────────────

const etatInitial: GameState = {
  character:             null,
  evenementsVecus:       [],
  evenementsProgrammes:  [],
  anneeCourante:         new Date().getFullYear(),
  partieEnCours:         false,
  anneesStressEleve:     0,
  dernierBilan:          null,
  currentWorldTags:      [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...etatInitial,

      newGame() {
        const personnage = generateRandomCharacter()
        set({
          character:            personnage,
          evenementsVecus:      [],
          evenementsProgrammes: [],
          anneeCourante:        new Date().getFullYear(),
          partieEnCours:        true,
          anneesStressEleve:    0,
          dernierBilan:         null,
          currentWorldTags:     [],
        })
      },

      advanceYear() {
        const state = get()
        const { character, anneeCourante, anneesStressEleve } = state
        if (!character) return

        const newAge   = character.age + 1
        const stats    = { ...character.stats }
        let newTags    = [...character.tags]
        let newStatut  = character.statut
        let causeDeces = character.causeDeces
        let stress     = anneesStressEleve
        let programmed = [...state.evenementsProgrammes]

        // ── Bilan financier annuel ──────────────────────────────────────────
        let newArgent  = character.finances.argent
        let newDettes  = character.finances.dettes
        let bilan: FluxFinancier | null = null

        if (character.age >= 18) {
          const revenuAnnuel   = character.careerStatus.salary * 12
          const depensesFixes  = calculerDepensesFixes(character)
          const interetsDettes = Math.round(character.finances.dettes * 0.05)
          const solde          = revenuAnnuel - depensesFixes - interetsDettes

          bilan      = { revenuAnnuel, depensesFixes, interetsDettes, solde }
          newArgent  = Math.round(character.finances.argent + solde)
          if (newArgent < 0) {
            newDettes  = character.finances.dettes + (-newArgent)
            newArgent  = 0
          }
        }

        // Vieillissement physique après 50 ans : perte de 0, 1 ou 2 points par an
        if (newAge > 50) {
          stats.santePhysique = Math.max(0, stats.santePhysique - Math.floor(Math.random() * 3))
        }

        // Stress chronique (santeMentale < 30 ≈ stress > 70)
        if (stats.santeMentale < 30) {
          stress += 1
        } else {
          stress = Math.max(0, stress - 1)
        }
        if (stress >= 3) {
          stats.santeMentale = Math.max(0, stats.santeMentale - 5)
        }

        // Décès si santé physique atteint 0
        if (stats.santePhysique <= 0) {
          stats.santePhysique = 0
          newStatut  = 'mort'
          causeDeces = 'vieillesse et complications de santé'
        } else if (stats.santePhysique < 10 && !newTags.includes('sante_critique_active')) {
          // Déclenche l'événement de crise sanitaire à cet âge exact
          newTags  = [...newTags, 'sante_critique_active']
          programmed = [...programmed, {
            eventId:        'sante_critique',
            ageDeclencheur: newAge,
            type:           'health',
            donnees:        {},
          }]
        }

        const career = character.careerStatus.jobTitle
          ? { ...character.careerStatus, yearsInCurrentJob: character.careerStatus.yearsInCurrentJob + 1 }
          : character.careerStatus

        // Expiration des tags mondiaux arrivés à échéance
        const newYear         = anneeCourante + 1
        const currentWorldTags = state.currentWorldTags.filter(
          (wt) => wt.expireAtYear > newYear,
        )

        set({
          character: {
            ...character,
            age:        newAge,
            stats,
            statut:     newStatut,
            causeDeces,
            tags:       newTags,
            careerStatus: career,
            finances: {
              argent:  newArgent,
              salaire: character.careerStatus.salary,
              dettes:  newDettes,
            },
          },
          anneeCourante:        newYear,
          anneesStressEleve:    stress,
          evenementsProgrammes: programmed,
          dernierBilan:         bilan,
          currentWorldTags,
        })
      },

      updateStats(partialStats) {
        const { character } = get()
        if (!character) return
        const statsAjustees = { ...character.stats }
        for (const cle in partialStats) {
          const k = cle as keyof CharacterStats
          statsAjustees[k] = Math.min(100, Math.max(0, statsAjustees[k] + (partialStats[k] ?? 0)))
        }
        set({ character: { ...character, stats: statsAjustees } })
      },

      addTag(tag) {
        const { character } = get()
        if (!character) return
        if (character.tags.includes(tag)) return
        set({ character: { ...character, tags: [...character.tags, tag] } })
      },

      addLifeEvent(event) {
        set((etat) => ({
          evenementsVecus: [...etat.evenementsVecus, event],
        }))
      },

      scheduleEvent(scheduledEvent) {
        set((etat) => ({
          evenementsProgrammes: [...etat.evenementsProgrammes, scheduledEvent],
        }))
      },

      removeTag(tag) {
        const { character } = get()
        if (!character) return
        set({ character: { ...character, tags: character.tags.filter((t) => t !== tag) } })
      },

      updateFinances(partialFinances) {
        const { character } = get()
        if (!character) return
        set({ character: { ...character, finances: { ...character.finances, ...partialFinances } } })
      },

      updateCareer(partial) {
        const { character } = get()
        if (!character) return
        set({ character: { ...character, careerStatus: { ...character.careerStatus, ...partial } } })
      },

      addWorldTag({ tag, label, durationYears }) {
        const { anneeCourante, currentWorldTags } = get()
        if (currentWorldTags.some((wt) => wt.tag === tag)) return
        const newTag: WorldTag = { tag, label, expireAtYear: anneeCourante + durationYears }
        set({ currentWorldTags: [...currentWorldTags, newTag] })
      },

      removeWorldTag(tag) {
        const { currentWorldTags } = get()
        set({ currentWorldTags: currentWorldTags.filter((wt) => wt.tag !== tag) })
      },

      consumeScheduledEventsAtAge(age) {
        const { evenementsProgrammes } = get()
        const dus = evenementsProgrammes.filter((e) => e.ageDeclencheur === age)
        if (dus.length > 0) {
          set({ evenementsProgrammes: evenementsProgrammes.filter((e) => e.ageDeclencheur !== age) })
        }
        return dus
      },
    }),
    {
      name: 'life-simulator-save',
      // Ne persiste pas les événements programmés : le moteur les recrée au chargement
      partialize: (etat) => ({
        character:             etat.character,
        evenementsVecus:       etat.evenementsVecus,
        evenementsProgrammes:  etat.evenementsProgrammes,
        anneeCourante:         etat.anneeCourante,
        partieEnCours:         etat.partieEnCours,
        anneesStressEleve:     etat.anneesStressEleve,
        dernierBilan:          etat.dernierBilan,
        currentWorldTags:      etat.currentWorldTags,
      }),
    },
  ),
)
