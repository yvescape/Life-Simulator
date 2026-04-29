import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameEvent, Choice } from '../types/event'
import type { Character } from '../types/character'
import { interpolerTexte } from '../engine/eventEngine'

interface EventModalProps {
  event: GameEvent
  character: Character
  /** Appelé quand le joueur fait un choix — doit retourner les conséquences */
  onChoiceSelected: (choice: Choice) => string[]
  onClose: () => void
}

// ─── Couleur d'une ligne de conséquence selon le signe ───────────────────────

function couleurConsequence(ligne: string): string {
  if (ligne.startsWith('+')) return 'text-emerald-400'
  if (ligne.startsWith('-')) return 'text-rose-400'
  return 'text-slate-300'
}

// ─── Icône de catégorie ───────────────────────────────────────────────────────

const ICONES: Record<string, string> = {
  career:  '💼',
  family:  '👨‍👩‍👧',
  health:  '🏥',
  finance: '💰',
  random:  '🎲',
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function EventModal({ event, character, onChoiceSelected, onClose }: EventModalProps) {
  const [phase, setPhase]             = useState<'choix' | 'consequences'>('choix')
  const [consequences, setConsequences] = useState<string[]>([])

  // Fermeture automatique après affichage des conséquences
  useEffect(() => {
    if (phase !== 'consequences') return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [phase, onClose])

  function handleChoix(choice: Choice) {
    const result = onChoiceSelected(choice)
    setConsequences(result)
    setPhase('consequences')
  }

  const texte = interpolerTexte(event.text, character)
  const icone = ICONES[event.category] ?? '📖'

  return (
    <AnimatePresence>
      {/* Fond sombre */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Carte modale */}
      <motion.div
        key="modal"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } }}
          exit={{ y: 60, opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* En-tête */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{icone}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {character.age} ans · {character.prenom}
              </span>
            </div>
            <p className="text-white text-base leading-relaxed">{texte}</p>
          </div>

          {/* Corps : choix ou conséquences */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              {phase === 'choix' ? (
                <motion.div
                  key="choix"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col gap-3"
                >
                  {event.choices.map((choice) => (
                    <motion.button
                      key={choice.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoix(choice)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-violet-800/60
                                 border border-slate-700 hover:border-violet-500
                                 text-slate-200 text-sm font-medium transition-colors"
                    >
                      {choice.label}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="consequences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <p className="text-slate-400 text-sm mb-1">Conséquences</p>

                  {consequences.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">Aucun changement notable.</p>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2">
                      {consequences.map((ligne, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.08 } }}
                          className={`px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 ${couleurConsequence(ligne)}`}
                        >
                          {ligne}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Barre de progression fermeture auto */}
                  <motion.div
                    className="w-full h-1 bg-slate-700 rounded-full mt-3 overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-violet-500 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 2.5, ease: 'linear' }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
