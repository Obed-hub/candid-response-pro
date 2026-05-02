import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
    <div className="relative w-9 h-9 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#FFD700] rounded-xl rotate-6 opacity-20 animate-pulse"></div>
      <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFB800] p-1 shadow-elegant ring-1 ring-black/5">
        <img src="/icon.png" alt="userpov Bee" className="w-full h-full object-contain" />
      </div>
    </div>
    <span className="tracking-tight">user<span className="text-[#FFB800]">pov</span></span>
  </Link>
);
