import { motion } from 'framer-motion'
import type { Character } from '../types/character'

interface Props {
  character: Character
  nombreEvenementsVecus: number
  onNewGame: () => void
}

export default function DeathScreen({ character, nombreEvenementsVecus, onNewGame }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 22 }}
        className="bg-slate-900 border border-slate-600 rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">Fin de vie</p>
          <h2 className="text-3xl font-bold text-white">
            {character.prenom} {character.nom}
          </h2>
        </div>

        <div className="divide-y divide-slate-800 mb-6">
          <Ligne label="Décédé à" valeur={`${character.age} ans`} couleur="text-violet-400" />
          {character.causeDeces && (
            <Ligne label="Cause" valeur={character.causeDeces} couleur="text-rose-400" />
          )}
          <Ligne
            label="Événements vécus"
            valeur={String(nombreEvenementsVecus)}
            couleur="text-sky-400"
          />
          <Ligne
            label="Épargne finale"
            valeur={`${character.finances.argent.toLocaleString('fr-FR')} €`}
            couleur="text-emerald-400"
          />
          {character.careerStatus.jobTitle && (
            <Ligne
              label="Dernier poste"
              valeur={character.careerStatus.jobTitle}
              couleur="text-amber-400"
            />
          )}
        </div>

        <button
          onClick={onNewGame}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95
                     text-white font-semibold transition-all duration-150"
        >
          Nouvelle partie
        </button>
      </motion.div>
    </motion.div>
  )
}

function Ligne({ label, valeur, couleur }: { label: string; valeur: string; couleur: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm text-right max-w-[55%] ${couleur}`}>{valeur}</span>
    </div>
  )
}
