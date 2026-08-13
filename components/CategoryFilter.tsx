"use client";

const CATEGORIES = [
  { name: "All", dot: "bg-white/70" },
  { name: "Religious", dot: "bg-gold" },
  { name: "Nature", dot: "bg-jade-light" },
  { name: "Heritage", dot: "bg-terracotta" },
  { name: "Cultural", dot: "bg-jade-light" },
  { name: "Sightseeing", dot: "bg-gold-hover" },
];

interface Props {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onChange(cat.name)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            active === cat.name
              ? "bg-gold text-white border-gold"
              : "bg-white/10 text-white/80 border-white/20 hover:border-gold/60 hover:text-white"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active === cat.name ? "bg-white" : cat.dot}`} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}