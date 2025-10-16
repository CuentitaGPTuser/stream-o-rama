import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { MovieRow } from "@/components/MovieRow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  genre: string;
  release_year: number | null;
  duration_minutes: number | null;
  rating: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  created_at: string;
}

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        fetchMovies();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchMovies();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMovies = async () => {
    setIsLoading(true);
    
    const { data: featured, error: featuredError } = await supabase
      .from("movies")
      .select("*")
      .eq("is_featured", true)
      .limit(10);

    const { data: trending, error: trendingError } = await supabase
      .from("movies")
      .select("*")
      .eq("is_trending", true)
      .limit(10);

    const { data: latest, error: latestError } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (featuredError || trendingError || latestError) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las películas",
        variant: "destructive",
      });
    } else {
      setFeaturedMovies(featured || []);
      setTrendingMovies(trending || []);
      setLatestMovies(latest || []);
    }

    setIsLoading(false);
  };

  const handleMovieClick = (id: string) => {
    console.log("Movie clicked:", id);
    // Navigate to movie detail page when implemented
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold">
              Películas, series y mucho más. <span className="text-gradient">Sin límites.</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Disfruta donde quieras. Cancela cuando quieras.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-streaming-red text-white px-8 py-4 rounded-md text-lg font-semibold transition-colors"
            >
              Comenzar ahora
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        <HeroSection />
        
        <div className="space-y-12 py-8">
          {featuredMovies.length > 0 && (
            <MovieRow
              title="Destacadas"
              movies={featuredMovies.map(m => ({
                id: m.id,
                title: m.title,
                genre: m.genre,
                rating: m.rating || 0,
                poster_url: m.poster_url || undefined,
              }))}
              onMovieClick={handleMovieClick}
            />
          )}

          {trendingMovies.length > 0 && (
            <MovieRow
              title="Tendencias"
              movies={trendingMovies.map(m => ({
                id: m.id,
                title: m.title,
                genre: m.genre,
                rating: m.rating || 0,
                poster_url: m.poster_url || undefined,
              }))}
              onMovieClick={handleMovieClick}
            />
          )}

          {latestMovies.length > 0 && (
            <MovieRow
              title="Últimos lanzamientos"
              movies={latestMovies.map(m => ({
                id: m.id,
                title: m.title,
                genre: m.genre,
                rating: m.rating || 0,
                poster_url: m.poster_url || undefined,
              }))}
              onMovieClick={handleMovieClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}
