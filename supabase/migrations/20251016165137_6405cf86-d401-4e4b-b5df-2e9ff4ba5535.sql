-- Create enum for subscription plans
CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium');

-- Create enum for movie genres
CREATE TYPE movie_genre AS ENUM (
  'action', 'adventure', 'animation', 'comedy', 'crime',
  'documentary', 'drama', 'fantasy', 'horror', 'mystery',
  'romance', 'sci-fi', 'thriller', 'western'
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan subscription_plan DEFAULT 'basic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre movie_genre NOT NULL,
  release_year INTEGER,
  duration_minutes INTEGER,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on movies
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Movies are viewable by everyone (authenticated users)
CREATE POLICY "Anyone can view movies"
  ON public.movies FOR SELECT
  TO authenticated
  USING (true);

-- Create user watchlist
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample movies
INSERT INTO public.movies (title, description, genre, release_year, duration_minutes, rating, is_featured, is_trending) VALUES
  ('El Reino de las Sombras', 'Una épica aventura de fantasía donde un joven héroe debe salvar su reino de una amenaza ancestral.', 'fantasy', 2024, 142, 8.5, true, true),
  ('Velocidad Extrema', 'Carreras ilegales en las calles de Tokio llevan a un piloto a descubrir una conspiración global.', 'action', 2024, 118, 7.8, true, true),
  ('Risas en el Metro', 'Una comedia romántica sobre encuentros fortuitos en el metro de una gran ciudad.', 'comedy', 2023, 95, 7.2, false, true),
  ('Ecos del Pasado', 'Un thriller psicológico sobre una detective que investiga crímenes conectados a su propio pasado.', 'thriller', 2024, 128, 8.1, true, false),
  ('Galaxia Perdida', 'Exploradores espaciales descubren una civilización olvidada en los confines del universo.', 'sci-fi', 2024, 156, 8.9, true, true),
  ('Corazones Rotos', 'Un drama romántico sobre amores imposibles en la París de los años 60.', 'romance', 2023, 110, 7.5, false, false),
  ('La Última Frontera', 'Western moderno ambientado en la frontera entre dos mundos en conflicto.', 'western', 2024, 134, 8.0, false, true),
  ('Misterio en la Mansión', 'Un grupo de desconocidos debe resolver un enigma para escapar de una mansión encantada.', 'mystery', 2023, 102, 7.4, false, false),
  ('Animalia', 'Una aventura animada sobre animales que descubren su verdadera misión en el mundo.', 'animation', 2024, 88, 8.3, false, true),
  ('Terror Nocturno', 'Una familia se muda a una casa con un oscuro secreto que despierta por las noches.', 'horror', 2023, 96, 7.6, false, false);