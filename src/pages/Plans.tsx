import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "€7.99",
    description: "Perfecto para empezar",
    features: [
      "Calidad HD",
      "1 dispositivo simultáneo",
      "Acceso a todo el catálogo",
      "Cancelación cuando quieras",
    ],
  },
  {
    id: "standard",
    name: "Estándar",
    price: "€12.99",
    description: "Lo más popular",
    features: [
      "Calidad Full HD",
      "2 dispositivos simultáneos",
      "Acceso a todo el catálogo",
      "Descargas disponibles",
      "Cancelación cuando quieras",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "€17.99",
    description: "La mejor experiencia",
    features: [
      "Calidad 4K + HDR",
      "4 dispositivos simultáneos",
      "Acceso a todo el catálogo",
      "Descargas ilimitadas",
      "Audio espacial",
      "Cancelación cuando quieras",
    ],
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentPlan(profile.subscription_plan);
        }
      }
    };

    checkAuth();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para seleccionar un plan",
      });
      navigate("/auth");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_plan: planId as "basic" | "standard" | "premium" })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    } else {
      setCurrentPlan(planId);
      toast({
        title: "¡Plan actualizado!",
        description: `Ahora tienes el plan ${planId}`,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Elige el plan perfecto para ti
            </h1>
            <p className="text-xl text-muted-foreground">
              Disfruta de contenido ilimitado con la mejor calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-glow scale-105"
                    : "border-border"
                } ${currentPlan === plan.id ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Más popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={currentPlan === plan.id ? "outline" : "default"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {currentPlan === plan.id ? "Plan actual" : "Seleccionar plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
