"use client";

const CATEGORIES = ["All", "Religious", "Nature", "Heritage", "Cultural", "Sightseeing"];

interface Props {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            active === cat
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
