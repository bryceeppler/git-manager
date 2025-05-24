import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Search, 
  Trash2, 
  BarChart3, 
  Shield, 
  Lock,
  Settings
} from "lucide-react";
import { HeroActions } from "./landing-page/hero-actions";
import { CTASection } from "./landing-page/cta-section";

export function LandingPage() {
  const features = [
    {
      icon: Trash2,
      title: "Just Delete Things",
      description: "Click delete, press confirm, it gets deleted. No extra-childproof popups unless you want them.",
      highlight: "Zero Friction"
    },
    {
      icon: Search,
      title: "Find Your Repos",
      description: "Search by name, language, or whatever. Filter for bulk cleanup sessions.",
      highlight: "Quick & Easy"
    },
    {
      icon: Settings,
      title: "Safety Mode (Optional)",
      description: "Safe by default, but you can turn it off if you want to be a little more reckless.",
      highlight: "Your Call"
    },
    {
      icon: BarChart3,
      title: "See What You've Got",
      description: "Stars, forks, size, last update. All the info you need to decide what stays.",
      highlight: "No Guessing"
    }
  ];

  const stats = [
    { icon: Shield, label: "Secure", value: "OAuth 2.0" },
    { icon: Lock, label: "Private", value: "Your Data" },
    { icon: Trash2, label: "Fast", value: "No BS" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Git<span className="font-swanky text-primary font-normal">Rekt</span>
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                GitHub Cleanup
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Without the Handholding
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Delete repos fast. Safe by default, but you can turn it off if you want to be a little more reckless.
              </p>
            </div>
            
            <HeroActions />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12 max-w-md mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-background/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">What It Actually Does</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage repos how you want. Fast by default, safe when you choose.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {feature.highlight}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three steps. That&apos;s it.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Github,
                title: "Connect GitHub",
                description: "Sign in with GitHub. We use OAuth so no passwords get shared."
              },
              {
                step: "02", 
                icon: Search,
                title: "Browse Your Repos",
                description: "See all your repos. Search and filter to find the ones you want gone."
              },
              {
                step: "03",
                icon: Trash2,
                title: "Delete Away",
                description: "Click delete, confirm, it's gone. Disable confirmations in settings if you want."
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative z-10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-4xl font-bold text-primary/20">
                      {step.step}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <CTASection />
    </div>
  );
} 