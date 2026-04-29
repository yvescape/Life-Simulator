import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameEvent, Choice } from '../types/event'
import type { Character } from '../types/character'
import type { ChoiceResult } from '../engine/eventEngine'
import { interpolerTexte } from '../engine/eventEngine'
import { parseConsequenceLine } from '../utils/format'

interface EventModalProps {
  event: GameEvent
  character: Character
  onChoiceSelected: (choice: Choice) => ChoiceResult
  onClose: () => void
}

// ─── Constantes de style ──────────────────────────────────────────────────────

const ICONES: Record<string, string> = {
  career:  '💼',
  family:  '👨‍👩‍👧',
  health:  '🏥',
  finance: '💰',
  random:  '🎲',
  world:   '🌍',
}

const TYPE_STYLE = {
  positive: { icon: '↑', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/40' },
  negative: { icon: '↓', color: 'text-rose-400',    bg: 'bg-rose-900/20 border-rose-800/40'       },
  neutral:  { icon: '·', color: 'text-slate-300',   bg: 'bg-slate-800/60 border-slate-700/40'     },
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function EventModal({ event, character, onChoiceSelected, onClose }: EventModalProps) {
  const [phase, setPhase]           = useState<'choix' | 'consequences'>('choix')
  const [result, setResult]         = useState<ChoiceResult | null>(null)
  const [selectedLabel, setSelectedLabel] = useState('')

  const handleChoix = useCallback((choice: Choice) => {
    const r = onChoiceSelected(choice)
    setResult(r)
    setSelectedLabel(choice.label)
    setPhase('consequences')
  }, [onChoiceSelected])

  const texte = interpolerTexte(event.text, character)
  const icone = ICONES[event.category] ?? '📖'

  return (
    <>
      {/* Fond sombre */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Conteneur centré */}
      <motion.div
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
          {/* En-tête — commun aux deux phases */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{icone}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {character.age} ans · {character.prenom}
              </span>
            </div>
            <p className="text-white text-base leading-relaxed">{texte}</p>
          </div>

          {/* Corps — phase 1 : choix, phase 2 : conséquences */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">

              {/* ── Phase 1 : boutons de choix ── */}
              {phase === 'choix' && (
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
              )}

              {/* ── Phase 2 : conséquences ── */}
              {phase === 'consequences' && result && (
                <motion.div
                  key="consequences"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                  className="flex flex-col gap-3"
                >
                  {/* Phrase narrative */}
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Vous avez choisi :{' '}
                    <span className="text-violet-300 font-medium">{selectedLabel}</span>
                  </p>

                  {/* Liste des conséquences chiffrées */}
                  {result.consequences.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {result.consequences.map((ligne, i) => {
                        const item  = parseConsequenceLine(ligne)
                        const style = TYPE_STYLE[item.type]
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              transition: { delay: i * 0.15, duration: 0.25 },
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${style.bg}`}
                          >
                            <span className={`text-base font-bold w-4 shrink-0 text-center ${style.color}`}>
                              {style.icon}
                            </span>
                            <span className={`text-sm font-medium ${style.color}`}>{item.label}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* Tags ajoutés */}
                  {result.addedTags.map((tag, i) => (
                    <motion.div
                      key={`add-${tag}`}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: (result.consequences.length + i) * 0.15, duration: 0.25 },
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border
                                 bg-violet-900/20 border-violet-800/40"
                    >
                      <span className="text-base w-4 shrink-0 text-center text-violet-400">★</span>
                      <span className="text-sm font-medium text-violet-300">
                        Nouveau trait : {tag}
                      </span>
                    </motion.div>
                  ))}

                  {/* Tags retirés */}
                  {result.removedTags.map((tag, i) => (
                    <motion.div
                      key={`rm-${tag}`}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: (result.consequences.length + result.addedTags.length + i) * 0.15,
                          duration: 0.25,
                        },
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border
                                 bg-slate-800/40 border-slate-700/40"
                    >
                      <span className="text-base w-4 shrink-0 text-center text-slate-500">✕</span>
                      <span className="text-sm font-medium text-slate-400">
                        Trait perdu : {tag}
                      </span>
                    </motion.div>
                  ))}

                  {/* Événement futur programmé */}
                  {result.hasScheduledEvent && (
                    <motion.div
                      initial={{ opacity: 0, x: -14 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                          delay: (result.consequences.length + result.addedTags.length + result.removedTags.length) * 0.15 + 0.1,
                          duration: 0.25,
                        },
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border
                                 bg-amber-900/20 border-amber-800/40"
                    >
                      <span className="text-base w-4 shrink-0 text-center text-amber-400">⏳</span>
                      <span className="text-sm font-medium text-amber-300">
                        Cela aura des conséquences plus tard…
                      </span>
                    </motion.div>
                  )}

                  {/* Cas sans aucun changement */}
                  {result.consequences.length === 0 &&
                   result.addedTags.length === 0 &&
                   result.removedTags.length === 0 &&
                   !result.hasScheduledEvent && (
                    <p className="text-slate-500 text-sm italic text-center py-2">
                      Aucun changement notable.
                    </p>
                  )}

                  {/* Bouton Continuer */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5 } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="w-full mt-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500
                               text-white text-sm font-semibold shadow-lg shadow-violet-900/40
                               transition-colors"
                  >
                    Continuer →
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
