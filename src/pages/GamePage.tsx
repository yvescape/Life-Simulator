import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import StatsPanel from '../components/StatsPanel'
import EventModal from '../components/EventModal'
import { pickNextEvent, applyChoice } from '../engine/eventEngine'
import { tousLesEvenements } from '../data/events'
import type { GameEvent, Choice } from '../types/event'

export default function GamePage() {
  const navigate      = useNavigate()
  const character     = useGameStore((s) => s.character)
  const anneeCourante = useGameStore((s) => s.anneeCourante)
  const advanceYear   = useGameStore((s) => s.advanceYear)
  const updateStats   = useGameStore((s) => s.updateStats)
  const updateFinances = useGameStore((s) => s.updateFinances)
  const addTag        = useGameStore((s) => s.addTag)
  const removeTag     = useGameStore((s) => s.removeTag)
  const addLifeEvent  = useGameStore((s) => s.addLifeEvent)
  const scheduleEvent = useGameStore((s) => s.scheduleEvent)
  const consumeScheduledEventsAtAge = useGameStore((s) => s.consumeScheduledEventsAtAge)

  // Événement affiché dans la modal
  const [evenementActuel, setEvenementActuel] = useState<GameEvent | null>(null)
  // File d'attente : événements à afficher après la modal courante
  const [fileAttente, setFileAttente] = useState<GameEvent[]>([])

  useEffect(() => {
    if (!character) navigate('/')
  }, [character, navigate])

  const storeActions = { updateStats, updateFinances, addTag, removeTag, addLifeEvent, scheduleEvent }

  function handleAnnéeSuivante() {
    advanceYear()

    // Zustand est synchrone : état déjà mis à jour
    const { character: perso } = useGameStore.getState()
    if (!perso) return

    const queue: GameEvent[] = []

    // 1. Événements programmés en priorité (déclenchés à cet âge exact)
    const dus = consumeScheduledEventsAtAge(perso.age)
    for (const scheduled of dus) {
      const evt = tousLesEvenements.find((e) => e.id === scheduled.eventId)
      if (evt) queue.push(evt)
    }

    // 2. Compléter avec un événement aléatoire si la file est vide
    if (queue.length === 0) {
      const aléatoire = pickNextEvent(perso, tousLesEvenements)
      if (aléatoire) queue.push(aléatoire)
    }

    if (queue.length > 0) {
      setEvenementActuel(queue[0])
      setFileAttente(queue.slice(1))
    }
  }

  const handleChoiceSelected = useCallback((choice: Choice): string[] => {
    const { character: perso } = useGameStore.getState()
    if (!perso || !evenementActuel) return []
    return applyChoice(choice, evenementActuel, perso, storeActions)
  // storeActions est stable (actions Zustand ne changent pas entre les renders)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evenementActuel])

  const handleFermerModal = useCallback(() => {
    setEvenementActuel(null)
    // Passer à l'événement suivant dans la file d'attente si elle n'est pas vide
    if (fileAttente.length > 0) {
      setTimeout(() => {
        setEvenementActuel(fileAttente[0])
        setFileAttente((f) => f.slice(1))
      }, 300) // petit délai pour laisser l'animation de fermeture se terminer
    }
  }, [fileAttente])

  if (!character) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8">
      <div className="max-w-xl mx-auto flex flex-col gap-6">

        {/* En-tête personnage */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {character.prenom} {character.nom}
              </h1>
              <p className="text-slate-400 text-sm capitalize">{character.sexe} · {character.pays}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-violet-400">
                {character.age} <span className="text-lg font-normal text-slate-400">ans</span>
              </div>
              <div className="text-slate-500 text-sm">Année {anneeCourante}</div>
            </div>
          </div>
        </div>

        {/* Panneau des stats */}
        <StatsPanel stats={character.stats} />

        {/* Finances */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Finances</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-emerald-400 font-bold text-xl">
                {character.finances.argent.toLocaleString('fr-FR')} €
              </div>
              <div className="text-slate-500 text-xs mt-1">Épargne</div>
            </div>
            <div>
              <div className="text-sky-400 font-bold text-xl">
                {character.finances.salaire.toLocaleString('fr-FR')} €
              </div>
              <div className="text-slate-500 text-xs mt-1">Salaire / mois</div>
            </div>
            <div>
              <div className="text-rose-400 font-bold text-xl">
                {character.finances.dettes.toLocaleString('fr-FR')} €
              </div>
              <div className="text-slate-500 text-xs mt-1">Dettes</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAnnéeSuivante}
            disabled={evenementActuel !== null}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white text-lg font-semibold shadow-lg shadow-violet-900/50
                       transition-all duration-150"
          >
            Année suivante →
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-300 text-sm
                       transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

      </div>

      {/* Modal événement */}
      <AnimatePresence>
        {evenementActuel && (
          <EventModal
            key={evenementActuel.id + character.age}
            event={evenementActuel}
            character={character}
            onChoiceSelected={handleChoiceSelected}
            onClose={handleFermerModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
