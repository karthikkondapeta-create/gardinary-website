const words = ['GROWTH', 'INDIVIDUALITY', 'REBELLION', 'NATURE', 'CREATIVITY']

export default function Marquee() {
  const loopWords = [...words, ...words]

  return (
    <div className="bg-forest-700 border-y border-forest-600 overflow-hidden py-4">
      <div className="flex whitespace-nowrap animate-marquee">
        {loopWords.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="font-display text-2xl md:text-3xl tracking-widest text-ink-900 mx-6 flex items-center gap-6"
          >
            {word}
            <span className="text-bone/60 text-lg">&#10047;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
