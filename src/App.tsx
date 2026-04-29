function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">🌱 Life Simulator</h1>
        <p className="text-xl text-sky-300 mb-8">
          Simulez votre vie, de la naissance à la mort.
        </p>
        <button className="px-8 py-3 bg-sky-500 hover:bg-sky-400 rounded-xl text-lg font-semibold transition-colors">
          Commencer une nouvelle vie
        </button>
      </div>
    </div>
  )
}

export default App
