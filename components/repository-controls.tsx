"use client";

import { useState } from "react";
import { GitHubRepositoryWithHealth, RepositoryHealth } from "@/lib/github-api";
import { getRepositoriesWithoutHealth, analyzeRepositoryHealth } from "@/lib/actions/repository-actions";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  onSelectAll: (checked: boolean) => void;
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
  onSelectAll,
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

      // Process repositories one by one for real-time streaming updates
      for (let i = 0; i < repositoriesWithoutHealth.length; i++) {
        const repository = repositoriesWithoutHealth[i];
        
        try {
          // Show analyzing state immediately
          const analyzingHealth: RepositoryHealth = {
            score: 0, 
            status: 'poor', 
            issues: [{ type: 'no_description', severity: 'low', description: 'Analyzing...' }], 
            lastAnalyzed: new Date().toISOString() 
          };
          
          // Update UI immediately with analyzing state
          setRepositories(prev => 
            prev.map(repo => 
              repo.id === repository.id 
                ? { ...repo, health: analyzingHealth }
                : repo
            )
          );

          const { health, error } = await analyzeRepositoryHealth(repository);
          
          if (health) {
            // Update with actual health data
            setRepositories(prev => 
              prev.map(repo => 
                repo.id === repository.id 
                  ? { ...repo, health }
                  : repo
              )
            );
          } else {
            console.error(`Failed to analyze health for ${repository.name}:`, error);
            // Remove the analyzing state if failed
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
          // Remove the analyzing state if failed
          setRepositories(prev => 
            prev.map(repo => 
              repo.id === repository.id 
                ? { ...repo, health: undefined }
                : repo
            )
          );
        }
        
        // Update progress
        setAnalysisProgress({ current: i + 1, total });

        // Small delay between requests to prevent overwhelming the API
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
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Search and Sort Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
                variant="secondary"
              >
                <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{getSortDirectionLabel(sortBy, sortDirection)}</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={fetchRepositories}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 flex-shrink-0 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>

              <Button
                onClick={analyzeHealthForAll}
                disabled={isAnalyzingHealth || repositories.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Activity className={`h-4 w-4 mr-2 flex-shrink-0 ${isAnalyzingHealth ? "animate-pulse" : ""}`} />
                <span className="hidden md:inline">
                  {isAnalyzingHealth 
                    ? `Analyzing... (${analysisProgress.current}/${analysisProgress.total})` 
                    : "Analyze Health"
                  }
                </span>
                <span className="md:hidden">
                  {isAnalyzingHealth 
                    ? `${analysisProgress.current}/${analysisProgress.total}` 
                    : "Health"
                  }
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {sortedAndFilteredRepositories.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedRepositories.size > 0 && selectedRepositories.size === sortedAndFilteredRepositories.length}
                  onCheckedChange={onSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({sortedAndFilteredRepositories.length})
                </label>
              </div>
              
              {selectedRepositories.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedRepositories.size} selected
                </div>
              )}
            </div>

            {selectedRepositories.size > 0 && (
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full xs:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRepositories(new Set())}
                  className="w-full xs:w-auto"
                >
                  Clear Selection
                </Button>
                
                <BulkDeleteDialog
                  selectedRepositories={selectedRepositories}
                  repositories={repositories}
                  onBulkDelete={onBulkDelete}
                />
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{sortedAndFilteredRepositories.length}</span> of{" "}
            <span className="font-medium text-foreground">{repositories.length}</span> repositories
          </div>
          
          {searchTerm && (
            <div className="sm:text-right">
              Filtered by: <span className="font-medium text-foreground break-words">&ldquo;{searchTerm}&rdquo;</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 