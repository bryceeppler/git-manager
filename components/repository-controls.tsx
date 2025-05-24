"use client";

import { useState } from "react";
import { GitHubRepositoryWithHealth, RepositoryHealth } from "@/lib/github-api";
import { getRepositoriesWithoutHealth, analyzeRepositoryHealth } from "@/lib/actions/repository-actions";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, ArrowUpDown, Calendar, Clock, Star, GitFork, Activity } from "lucide-react";
import { toast } from "sonner";

type SortOption = "updated" | "created" | "name" | "stars" | "forks" | "health";
type SortDirection = "asc" | "desc";

interface RepositoryControlsProps {
  repositories: GitHubRepositoryWithHealth[];
  setRepositories: (repos: GitHubRepositoryWithHealth[] | ((prev: GitHubRepositoryWithHealth[]) => GitHubRepositoryWithHealth[])) => void;
  selectedRepositories: Set<number>;
  setSelectedRepositories: (selected: Set<number>) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortedAndFilteredRepositories: GitHubRepositoryWithHealth[];
  onBulkDelete: (deletedIds: number[]) => void;
  isAnalyzingHealth: boolean;
  setIsAnalyzingHealth: (isAnalyzing: boolean) => void;
}

export function RepositoryControls({
  repositories,
  setRepositories,
  selectedRepositories,
  setSelectedRepositories,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  sortedAndFilteredRepositories,
  onBulkDelete,
  isAnalyzingHealth,
  setIsAnalyzingHealth,
}: RepositoryControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const { repositories: newRepositories, error } = await getRepositoriesWithoutHealth();

      if (newRepositories) {
        const repositoriesWithHealth = newRepositories.map(repo => ({ ...repo, health: undefined }));
        setRepositories(repositoriesWithHealth);
        setSelectedRepositories(new Set());
        toast.success(`Loaded ${newRepositories.length} repositories`);
      } else {
        toast.error(error || "Failed to fetch repositories");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch repositories");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeHealthForAll = async () => {
    setIsAnalyzingHealth(true);
    try {
      const repositoriesWithoutHealth = repositories.filter(repo => !repo.health);
      
      if (repositoriesWithoutHealth.length === 0) {
        toast.info("All repositories already have health data");
        return;
      }

      const total = repositoriesWithoutHealth.length;
      setAnalysisProgress({ current: 0, total });
      
      toast.info(`Starting health analysis for ${total} repositories...`);

      for (let i = 0; i < repositoriesWithoutHealth.length; i++) {
        const repository = repositoriesWithoutHealth[i];
        
        try {
          const analyzingHealth: RepositoryHealth = {
            score: 0, 
            status: 'poor', 
            issues: [{ type: 'no_description', severity: 'low', description: 'Analyzing...' }], 
            lastAnalyzed: new Date().toISOString() 
          };
          
          setRepositories(prev => 
            prev.map(repo => 
              repo.id === repository.id 
                ? { ...repo, health: analyzingHealth }
                : repo
            )
          );

          const { health, error } = await analyzeRepositoryHealth(repository);
          
          if (health) {
            setRepositories(prev => 
              prev.map(repo => 
                repo.id === repository.id 
                  ? { ...repo, health }
                  : repo
              )
            );
          } else {
            console.error(`Failed to analyze health for ${repository.name}:`, error);
            setRepositories(prev => 
              prev.map(repo => 
                repo.id === repository.id 
                  ? { ...repo, health: undefined }
                  : repo
              )
            );
          }
        } catch (error) {
          console.error(`Error analyzing ${repository.name}:`, error);
          setRepositories(prev => 
            prev.map(repo => 
              repo.id === repository.id 
                ? { ...repo, health: undefined }
                : repo
            )
          );
        }
        
        setAnalysisProgress({ current: i + 1, total });

        if (i < repositoriesWithoutHealth.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      toast.success(`Health analysis completed! Analyzed ${total} repositories.`);
    } catch (error) {
      console.error("Health analysis error:", error);
      toast.error("Failed to analyze repository health");
    } finally {
      setIsAnalyzingHealth(false);
      setAnalysisProgress({ current: 0, total: 0 });
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const getSortDirectionLabel = (sortBy: SortOption, sortDirection: SortDirection) => {
    switch (sortBy) {
      case "updated":
      case "created":
        return sortDirection === "desc" ? "Newest First" : "Oldest First";
      case "name":
        return sortDirection === "asc" ? "A-Z" : "Z-A";
      case "stars":
      case "forks":
        return sortDirection === "desc" ? "Most First" : "Least First";
      case "health":
        return sortDirection === "desc" ? "Best First" : "Worst First";
      default:
        return sortDirection === "desc" ? "High to Low" : "Low to High";
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{sortedAndFilteredRepositories.length}</span> of{" "}
              <span className="font-semibold text-foreground">{repositories.length}</span> repositories
            </div>
            
            {searchTerm && (
              <div className="md:border-l md:pl-2">
                filtered by: <span className="font-medium text-foreground">&ldquo;{searchTerm}&rdquo;</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Updated
                      </div>
                    </SelectItem>
                    <SelectItem value="created">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created Date
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Name
                      </div>
                    </SelectItem>
                    <SelectItem value="stars">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Stars
                      </div>
                    </SelectItem>
                    <SelectItem value="forks">
                      <div className="flex items-center gap-2">
                        <GitFork className="h-4 w-4" />
                        Forks
                      </div>
                    </SelectItem>
                    <SelectItem value="health">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Health Score
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={toggleSortDirection}
                  variant="outline"
                  className="min-w-[140px] justify-start"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span className="truncate">{getSortDirectionLabel(sortBy, sortDirection)}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <Button
              onClick={fetchRepositories}
              disabled={isLoading}
              variant="outline"
              className="md:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Repositories
            </Button>

            <Button
              onClick={analyzeHealthForAll}
              disabled={isAnalyzingHealth || repositories.length === 0}
              variant="outline"
              className="md:w-auto"
            >
              <Activity className={`h-4 w-4 mr-2 ${isAnalyzingHealth ? "animate-pulse" : ""}`} />
              {isAnalyzingHealth 
                ? `Analyzing... (${analysisProgress.current}/${analysisProgress.total})` 
                : "Analyze Health"
              }
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedRepositories.size > 0 && (
            <div className="flex flex-col md:flex-row gap-3 md:ml-auto">
              <Button
                variant="ghost"
                onClick={() => setSelectedRepositories(new Set())}
                className="md:w-auto"
              >
                Clear Selection ({selectedRepositories.size})
              </Button>
              
              <BulkDeleteDialog
                selectedRepositories={selectedRepositories}
                repositories={repositories}
                onBulkDelete={onBulkDelete}
                onSelectionChange={setSelectedRepositories}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 