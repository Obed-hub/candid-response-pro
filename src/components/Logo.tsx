import { Link } from "react-router-dom";
import { MessageSquareHeart } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-lg ${className}`}>
    <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-cta text-primary-foreground shadow-glow">
      <MessageSquareHeart className="w-4 h-4" />
    </span>
    <span>Feedback<span className="text-primary">Pro</span></span>
  </Link>
);
