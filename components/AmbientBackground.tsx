export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="ambient-blob w-[420px] h-[420px] bg-terracotta top-[-100px] left-[-80px]" />
      <div className="ambient-blob w-[500px] h-[500px] bg-jade top-[10%] right-[-140px]" style={{ animationDelay: "6s" }} />
      <div className="ambient-blob w-[380px] h-[380px] bg-gold bottom-[5%] left-[10%]" style={{ animationDelay: "12s" }} />
      <div className="ambient-blob w-[340px] h-[340px] bg-jade-light bottom-[-100px] right-[15%]" style={{ animationDelay: "18s" }} />
      <div className="absolute inset-0 bg-bg/55" />
    </div>
  );
}