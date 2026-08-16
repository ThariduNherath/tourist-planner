export default function HeroBanner({ children }: { children: React.ReactNode }) {
  const images = ["/hero/scene1.jpg", "/hero/scene2.jpg", "/hero/scene3.jpg", "/hero/scene4.jpg"];

  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden min-h-[600px] sm:min-h-[340px] mb-0 -mt-20">
      {images.map((src) => (
        <div key={src} className="hero-scene bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
      ))}

      <div className="absolute inset-0 bg-gradient-to-br from-jade/15 via-transparent to-gold/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/25 via-transparent to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pt-24 pb-8 min-h-[300px] sm:min-h-[340px]">
        {children}
      </div>
    </div>
  );
}