import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function HomePage() {
  const navigate  = useNavigate()
  const newGame   = useGameStore((s) => s.newGame)
  const partieEnCours = useGameStore((s) => s.partieEnCours)

  function handleNouvelleVie() {
    newGame()
    navigate('/jeu')
  }

  function handleContinuer() {
    navigate('/jeu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">

        {/* Logo / Titre */}
        <div className="mb-2 text-6xl select-none">🌱</div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">
          Life Simulator
        </h1>
        <p className="text-violet-300 text-lg mb-12">
          Chaque vie est une histoire unique.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleNouvelleVie}
            className="w-64 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95
                       text-white text-lg font-semibold shadow-lg shadow-violet-900/50
                       transition-all duration-150"
          >
            Nouvelle Vie
          </button>

          {partieEnCours && (
            <button
              onClick={handleContinuer}
              className="w-64 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95
                         text-slate-200 text-lg font-semibold shadow-lg
                         transition-all duration-150"
            >
              Continuer
            </button>
          )}
        </div>

        {/* Mention sauvegarde */}
        {partieEnCours && (
          <p className="mt-6 text-xs text-slate-500">
            Une partie sauvegardée a été détectée.
          </p>
        )}
      </div>
    </div>
  )
}
