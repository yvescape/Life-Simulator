import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, CharacterStats, CharacterFinances, LifeEvent, ScheduledEvent } from '../types/character'
import { generateRandomCharacter } from '../engine/characterGenerator'

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
  /**
   * Retire et retourne tous les événements programmés dont l'âge déclencheur
   * correspond à l'âge fourni. Opération atomique : lecture + suppression.
   */
  consumeScheduledEventsAtAge: (age: number) => ScheduledEvent[]
}

// ─── État initial ─────────────────────────────────────────────────────────────

const etatInitial: GameState = {
  character:             null,
  evenementsVecus:       [],
  evenementsProgrammes:  [],
  anneeCourante:         new Date().getFullYear(),
  partieEnCours:         false,
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
        })
      },

      advanceYear() {
        const { character, anneeCourante } = get()
        if (!character) return
        set({
          character:    { ...character, age: character.age + 1 },
          anneeCourante: anneeCourante + 1,
        })
      },

      updateStats(partialStats) {
        const { character } = get()
        if (!character) return
        // Clamp chaque valeur modifiée entre 0 et 100
        const statsAjustees = { ...character.stats }
        for (const cle in partialStats) {
          const k = cle as keyof CharacterStats
          statsAjustees[k] = Math.min(100, Math.max(0, partialStats[k] ?? statsAjustees[k]))
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
      }),
    },
  ),
)
