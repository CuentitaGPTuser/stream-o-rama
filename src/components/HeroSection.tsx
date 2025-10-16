import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export const HeroSection = () => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-end pb-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            El Reino de las <span className="text-gradient">Sombras</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
            Una épica aventura de fantasía donde un joven héroe debe salvar su reino de una amenaza ancestral. 
            El destino de miles depende de su valentía.
          </p>

          <div className="flex gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-white hover:bg-white/80 text-black font-semibold px-8 gap-2"
            >
              <Play className="h-5 w-5 fill-current" />
              Reproducir
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/50 hover:border-white hover:bg-white/10 gap-2"
            >
              <Info className="h-5 w-5" />
              Más información
            </Button>
          </div>

          <div className="flex gap-4 text-sm text-foreground/80">
            <span className="text-green-500 font-semibold">8.5/10</span>
            <span>•</span>
            <span>2024</span>
            <span>•</span>
            <span>142 min</span>
            <span>•</span>
            <span className="px-2 py-0.5 border border-foreground/30 rounded">Fantasy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
