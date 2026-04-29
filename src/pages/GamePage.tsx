import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import StatsPanel from '../components/StatsPanel'

export default function GamePage() {
  const navigate      = useNavigate()
  const character     = useGameStore((s) => s.character)
  const anneeCourante = useGameStore((s) => s.anneeCourante)
  const advanceYear   = useGameStore((s) => s.advanceYear)

  // Redirige vers l'accueil si aucune partie n'est en cours
  useEffect(() => {
    if (!character) navigate('/')
  }, [character, navigate])

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
            onClick={advanceYear}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95
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
    </div>
  )
}
