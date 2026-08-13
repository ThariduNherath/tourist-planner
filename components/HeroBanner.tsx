export default function HeroBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#182420] mb-8">
      <div className="hero-scene" />
      <div className="hero-scene" />
      <div className="hero-scene" />
      <div className="hero-scene" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#182420] via-transparent to-[#182420]/50" />
      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14">{children}</div>
    </div>
  );
}