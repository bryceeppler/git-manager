"use client";

import React, { useState } from "react";
import { GitHubRepositoryWithHealth, HealthStatus } from "@/lib/github-api";
import { deleteRepository } from "@/lib/actions/repository-actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Star,
  GitFork,
  ExternalLink,
  Eye,
  Lock,
  Archive,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteRepoDialog } from "@/components/delete-repo-dialog";
import Link from "next/link";

interface GitHubRepositoryCardProps {
  repository: GitHubRepositoryWithHealth;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onDelete: (id: number) => void;
}

function formatFileSize(bytes: number): string {
  const sizes = ["KB", "MB", "GB"];
  if (bytes === 0) return "0 KB";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-500",
    TypeScript: "bg-blue-600",
    Python: "bg-blue-400",
    Java: "bg-orange-600",
    "C++": "bg-blue-500",
    C: "bg-gray-600",
    "C#": "bg-purple-600",
    PHP: "bg-purple-500",
    Ruby: "bg-red-600",
    Go: "bg-cyan-500",
    Rust: "bg-orange-700",
    Swift: "bg-orange-500",
    Kotlin: "bg-purple-500",
    HTML: "bg-orange-400",
    CSS: "bg-blue-500",
    Shell: "bg-green-600",
    Vue: "bg-green-500",
    React: "bg-blue-400",
  };

  return colors[language || ""] || "bg-gray-500";
}

function getHealthStatusColor(status: HealthStatus): {
  bg: string;
  text: string;
  icon: LucideIcon;
} {
  switch (status) {
    case "excellent":
      return {
        bg: "bg-green-500/10 border-green-500/20",
        text: "text-green-600",
        icon: CheckCircle,
      };
    case "good":
      return {
        bg: "bg-blue-500/10 border-blue-500/20",
        text: "text-blue-600",
        icon: CheckCircle,
      };
    case "fair":
      return {
        bg: "bg-yellow-500/10 border-yellow-500/20",
        text: "text-yellow-600",
        icon: AlertTriangle,
      };
    case "poor":
      return {
        bg: "bg-red-500/10 border-red-500/20",
        text: "text-red-600",
        icon: XCircle,
      };
    default:
      return {
        bg: "bg-gray-500/10 border-gray-500/20",
        text: "text-gray-600",
        icon: Info,
      };
  }
}

function RepositoryHealthBadges({
  repository,
}: {
  repository: GitHubRepositoryWithHealth;
}) {
  const isAnalyzing = repository.health?.issues.some(
    (issue) => issue.description === "Analyzing..."
  );

  const healthColors = repository.health
    ? getHealthStatusColor(repository.health.status)
    : null;

  if (!repository.health) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`text-xs border ${
            isAnalyzing
              ? "bg-orange-500/10 border-orange-500/20 text-orange-600"
              : `${healthColors?.bg} ${healthColors?.text}`
          }`}
        >
          <Activity
            className={`h-3 w-3 mr-1 ${isAnalyzing ? "animate-spin" : ""}`}
          />
          {isAnalyzing ? "Analyzing..." : `${repository.health.score}/100`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-2 max-w-xs">
          {isAnalyzing ? (
            <p className="font-medium text-orange-600">
              Currently analyzing repository health...
            </p>
          ) : (
            <>
              <p className="font-medium">
                Health Status:{" "}
                <span className="capitalize">{repository.health.status}</span>
              </p>
              {repository.health.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Issues Found:</p>
                  <ul className="text-xs space-y-1">
                    {repository.health.issues
                      .slice(0, 3)
                      .map((issue, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${
                              issue.severity === "high"
                                ? "bg-red-500"
                                : issue.severity === "medium"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          {issue.description}
                        </li>
                      ))}
                    {repository.health.issues.length > 3 && (
                      <li className="text-muted-foreground">
                        +{repository.health.issues.length - 3} more issues
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function RepositoryTypeBadge({
  repository,
}: {
  repository: GitHubRepositoryWithHealth;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {repository.private && (
        <Badge variant="secondary" className="text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </Badge>
      )}
      {repository.fork && (
        <Badge variant="outline" className="text-xs">
          <GitFork className="h-3 w-3 mr-1" />
          Fork
        </Badge>
      )}
      {repository.archived && (
        <Badge variant="destructive" className="text-xs">
          <Archive className="h-3 w-3 mr-1" />
          Archived
        </Badge>
      )}
    </div>
  );
}

export function GitHubRepositoryCard({
  repository,
  isSelected,
  onSelect,
  onDelete,
}: GitHubRepositoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteRepository(
        repository.owner.login,
        repository.name
      );

      if (result.success) {
        toast.success(`Repository "${repository.name}" deleted successfully`);
        onDelete(repository.id);
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete repository");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete repository");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const isAnalyzing = repository.health?.issues.some(
    (issue) => issue.description === "Analyzing..."
  );

  const handleToggleSelection = () => {
    if (onSelect) {
      onSelect(repository.id, !isSelected);
    }
  };

  return (
    <TooltipProvider>
      <Card className="group relative transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex sm:hidden items-center gap-2">
            <RepositoryHealthBadges repository={repository} />
            <RepositoryTypeBadge repository={repository} />
          </div>
          <div className="flex items-center gap-2 m-0">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelect(repository.id, checked as boolean)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            )}
            <h3
              className={`m-0 text-lg font-semibold truncate ${
                onSelect
                  ? "cursor-pointer hover:text-primary transition-colors"
                  : ""
              }`}
              onClick={handleToggleSelection}
            >
              {repository.name}
            </h3>
            <Link
              href={repository.html_url}
              target="_blank"
              className="text-sm text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden sm:flex sm:flex-row items-center gap-2">
            <RepositoryHealthBadges repository={repository} />
            <RepositoryTypeBadge repository={repository} />
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {repository.description || "No description provided"}
          </p>

          {repository.health &&
            repository.health.issues.length > 0 &&
            !isAnalyzing && (
              <div className="flex flex-wrap gap-1">
                {repository.health.issues.map((issue, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs ${
                      issue.severity === "high"
                        ? "border-red-300 text-red-700 bg-red-50"
                        : issue.severity === "medium"
                        ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                        : "border-gray-300 text-gray-700 bg-gray-50"
                    }`}
                  >
                    {issue.type.replaceAll("_", " ")}
                  </Badge>
                ))}
              </div>
            )}

          {/* Repository Statistics */}
          <div className="flex flex-row items-center gap-7">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                {repository.stargazers_count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {repository.forks_count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {repository.watchers_count.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Footer: Actions */}
        <CardFooter className="flex flex-row items-center justify-between text-sm">
          {/* Repository Metadata - Compact inline layout */}
          <div className="flex items-center gap-3">
            {repository.language && (
              <div className="flex items-center gap-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(
                    repository.language
                  )}`}
                ></div>
                <span>{repository.language}</span>
              </div>
            )}
            <span>{formatFileSize(repository.size)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(repository.updated_at)}</span>
          </div>
        </CardFooter>

        <DeleteRepoDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          repoName={repository.name}
          isLoading={isDeleting}
        />
      </Card>
    </TooltipProvider>
  );
}
