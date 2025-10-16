import { Card } from "@/components/ui/card";
import { Play, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  rating: number;
  posterUrl?: string;
  onClick?: () => void;
}

export const MovieCard = ({ title, genre, rating, posterUrl, onClick }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group hover-lift bg-card border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <span className="text-6xl font-bold text-muted-foreground/20">{title[0]}</span>
          </div>
        )}
        
        <div
          className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-2">
            <Button size="icon" className="rounded-full bg-white hover:bg-white/80 text-black">
              <Play className="h-5 w-5 fill-current" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full border-white/50 hover:border-white">
              <Plus className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full border-white/50 hover:border-white">
              <Info className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center px-4">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <div className="flex items-center gap-2 justify-center text-sm">
              <span className="text-green-500 font-semibold">{rating}/10</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground capitalize">{genre}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
