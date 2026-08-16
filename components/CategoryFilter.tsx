"use client";

const CATEGORIES = [
  { name: "All", dot: "bg-muted" },
  { name: "Religious", dot: "bg-gold" },
  { name: "Nature", dot: "bg-jade" },
  { name: "Heritage", dot: "bg-terracotta" },
  { name: "Cultural", dot: "bg-jade-light" },
  { name: "Sightseeing", dot: "bg-gold-hover" },
];

interface Props { active: string; onChange: (category: string) => void; }

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((cat) => (
        <button key={cat.name} onClick={() => onChange(cat.name)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            active === cat.name ? "bg-gold text-bg border-gold" : "bg-surface text-muted border-border hover:border-gold/50 hover:text-ink"
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${active === cat.name ? "bg-bg" : cat.dot}`} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}