"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GitHubRepositoryWithHealth } from "@/lib/github-api";
import { GitHubRepositoryCard } from "./github-repository-card";
import { RepositoryControls } from "./repository-controls";
import { BackToTopButton } from "./back-to-top-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Github, Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

type SortOption = "updated" | "created" | "name" | "stars" | "forks" | "health";
type SortDirection = "asc" | "desc";

interface RepositoryDashboardClientProps {
  initialRepositories: GitHubRepositoryWithHealth[];
}

// Analyzing Animation Component
function AnalyzingAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !progressRef.current) return;

    const container = containerRef.current;
    const progress = progressRef.current;

    // Subtle container glow pulse
    gsap.to(container, {
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    // Smooth progress bar animation
    gsap.fromTo(progress, 
      { 
        backgroundPosition: "-100% center",
      },
      {
        backgroundPosition: "200% center",
        duration: 3,
        repeat: -1,
        ease: "power2.inOut",
      }
    );



    return () => {
      gsap.killTweensOf([container, progress]);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
    >
      {/* Animated progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-400/40 to-blue-500/20">
        <div 
          ref={progressRef}
          className="h-full shadow-sm"
          style={{
            background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 30%, rgba(59, 130, 246, 0.3) 60%, transparent 100%)",
            backgroundSize: "50% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

    </div>
  );
}

export function RepositoryDashboardClient({ initialRepositories }: RepositoryDashboardClientProps) {
  const [repositories, setRepositories] = useState<GitHubRepositoryWithHealth[]>(initialRepositories);
  const [selectedRepositories, setSelectedRepositories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showHealthSummary, setShowHealthSummary] = useState(false);
  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState(false);

  const sortedAndFilteredRepositories = useMemo(() => {
    const filtered = repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "updated":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case "created":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "stars":
          aValue = a.stargazers_count;
          bValue = b.stargazers_count;
          break;
        case "forks":
          aValue = a.forks_count;
          bValue = b.forks_count;
          break;
        case "health":
          aValue = a.health?.score || 0;
          bValue = b.health?.score || 0;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [repositories, searchTerm, sortBy, sortDirection]);

  const handleSelectRepository = (id: number, selected: boolean) => {
    setSelectedRepositories(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleDeleteRepository = (id: number) => {
    setRepositories(prev => prev.filter(repo => repo.id !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRepositories(new Set(sortedAndFilteredRepositories.map(repo => repo.id)));
    } else {
      setSelectedRepositories(new Set());
    }
  };

  const handleBulkDelete = (deletedIds: number[]) => {
    setRepositories(prev => prev.filter(repo => !deletedIds.includes(repo.id)));
    setSelectedRepositories(new Set());
  };

  // Calculate health statistics
  const healthStats = useMemo(() => {
    // Filter out repositories that are currently being analyzed
    const repositoriesWithHealth = repositories.filter(repo => {
      if (!repo.health) return false;
      
      // Skip repositories that are currently being analyzed
      const isAnalyzing = repo.health.issues.some(issue => issue.description === 'Analyzing...');
      return !isAnalyzing;
    });
    
    if (repositoriesWithHealth.length === 0) {
      return null;
    }

    const stats = repositoriesWithHealth.reduce(
      (acc, repo) => {
        if (!repo.health) return acc;
        
        switch (repo.health.status) {
          case "excellent":
            acc.excellent++;
            break;
          case "good":
            acc.good++;
            break;
          case "fair":
            acc.fair++;
            break;
          case "poor":
            acc.poor++;
            break;
        }
        
        acc.totalIssues += repo.health.issues.length;
        acc.averageScore += repo.health.score;
        
        return acc;
      },
      { excellent: 0, good: 0, fair: 0, poor: 0, totalIssues: 0, averageScore: 0 }
    );

    stats.averageScore = Math.round(stats.averageScore / repositoriesWithHealth.length);
    
    return {
      ...stats,
      totalAnalyzed: repositoriesWithHealth.length,
      totalRepositories: repositories.length
    };
  }, [repositories]);

  // Show health summary when health data becomes available
  useMemo(() => {
    if (healthStats && healthStats.totalAnalyzed > 0 && !showHealthSummary) {
      setShowHealthSummary(true);
    }
  }, [healthStats, showHealthSummary]);

  return (
    <>
      {/* Health Summary */}
      {showHealthSummary && healthStats && (
        <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500 relative overflow-hidden">
          {isAnalyzingHealth && <AnalyzingAnimation />}
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${isAnalyzingHealth ? 'text-blue-400 animate-pulse' : 'text-primary'}`} />
                {isAnalyzingHealth ? "Analyzing Repository Health..." : "Repository Health Analysis Complete"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xl font-bold text-green-600">{healthStats.excellent}</span>
                </div>
                <p className="text-xs text-muted-foreground">Excellent</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-xl font-bold text-blue-600">{healthStats.good}</span>
                </div>
                <p className="text-xs text-muted-foreground">Good</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">{healthStats.fair}</span>
                </div>
                <p className="text-xs text-muted-foreground">Fair</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xl font-bold text-red-600">{healthStats.poor}</span>
                </div>
                <p className="text-xs text-muted-foreground">Poor</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
              <Badge variant="secondary" className="px-3 py-1">
                Average Score: {healthStats.averageScore}/100
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Issues Found: {healthStats.totalIssues}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Analyzed: {healthStats.totalAnalyzed}/{healthStats.totalRepositories}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <RepositoryControls
        repositories={repositories}
        setRepositories={setRepositories}
        selectedRepositories={selectedRepositories}
        setSelectedRepositories={setSelectedRepositories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        sortedAndFilteredRepositories={sortedAndFilteredRepositories}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        isAnalyzingHealth={isAnalyzingHealth}
        setIsAnalyzingHealth={setIsAnalyzingHealth}
      />

      {/* Repository Grid */}
      {sortedAndFilteredRepositories.length > 0 ? (
        <div className="grid gap-4">
          {sortedAndFilteredRepositories.map((repo) => (
            <GitHubRepositoryCard
              key={repo.id}
              repository={repo}
              isSelected={selectedRepositories.has(repo.id)}
              onSelect={handleSelectRepository}
              onDelete={handleDeleteRepository}
            />
          ))}
        </div>
      ) : repositories.length === 0 ? (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Github className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No repositories found</h3>
              <p className="text-muted-foreground">
                It looks like you don&apos;t have any repositories yet. Create your first repository on GitHub to get started.
              </p>
              <Button asChild>
                <a href="https://github.com/new" target="_blank" rel="noopener noreferrer">
                  Create Repository
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No repositories match your search</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or clearing the search to see all repositories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <BackToTopButton />
    </>
  );
} 