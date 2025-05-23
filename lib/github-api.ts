import { Octokit } from "@octokit/rest";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  html_url: string;
  clone_url: string;
  default_branch: string;
  archived: boolean;
  disabled: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export type HealthStatus = "excellent" | "good" | "fair" | "poor";

export interface RepositoryHealth {
  score: number; // 0-100
  status: HealthStatus;
  issues: HealthIssue[];
  lastAnalyzed: string;
}

export interface HealthIssue {
  type: "no_recent_activity" | "empty_repo" | "no_description" | "large_size";
  severity: "high" | "medium" | "low"
  description: string;
}



export interface GitHubRepositoryWithHealth extends GitHubRepository {
  health?: RepositoryHealth;
}

export class GitHubAPIClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        type: "owner",
      });

      return response.data as GitHubRepository[];
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw new Error("Failed to fetch repositories from GitHub");
    }
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.rest.repos.delete({
        owner,
        repo,
      });
    } catch (error) {
      console.error("Error deleting repository:", error);
      throw new Error("Failed to delete repository from GitHub");
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return response.data as GitHubRepository;
    } catch (error) {
      console.error("Error fetching repository:", error);
      throw new Error("Failed to fetch repository from GitHub");
    }
  }

  async analyzeRepositoryHealth(repository: GitHubRepository): Promise<RepositoryHealth> {
    const issues: HealthIssue[] = [];

    // Check for description
    if (!repository.description || repository.description.trim().length === 0) {
      issues.push({
        type: "no_description",
        severity: "low",
        description: "Repository has no description",
      });

    }

    // Check for recent activity
    const daysSinceLastPush = repository.pushed_at 
      ? Math.floor((Date.now() - new Date(repository.pushed_at).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    if (daysSinceLastPush > 365) {
      issues.push({
        type: "no_recent_activity",
        severity: "medium",
        description: `No activity for ${Math.floor(daysSinceLastPush / 365)} year(s)`,
      });

    } else if (daysSinceLastPush > 180) {
      issues.push({
        type: "no_recent_activity",
        severity: "low",
        description: `No activity for ${daysSinceLastPush} days`,
      });
    }

    // Check if repository is effectively empty (using simpler metrics)
    if (repository.size <= 1) {
      issues.push({
        type: "empty_repo",
        severity: "high",
        description: "Repository appears to be empty or minimal",
      });
    }

    // Check repository size (in KB)
    if (repository.size > 100000) { // > 100MB
      issues.push({
        type: "large_size",
        severity: "medium",
        description: `Repository is large (${Math.round(repository.size / 1024)}MB)`,
      });
    }

    // Calculate health score (0-100)
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case "high":
          score -= 25;
          break;
        case "medium":
          score -= 15;
          break;
        case "low":
          score -= 5;
          break;
      }
    });

    score = Math.max(0, score);

    // Determine status
    let status: HealthStatus;
    if (score >= 80) status = "excellent";
    else if (score >= 60) status = "good";
    else if (score >= 40) status = "fair";
    else status = "poor";

    return {
      score,
      status,
      issues,
      lastAnalyzed: new Date().toISOString(),
    };
  }

  async getRepositoriesWithHealth(): Promise<GitHubRepositoryWithHealth[]> {
    const repositories = await this.getRepositories();
    
    // Analyze health for repositories in batches to avoid rate limiting
    const repositoriesWithHealth: GitHubRepositoryWithHealth[] = [];
    
    for (let i = 0; i < repositories.length; i += 5) {
      const batch = repositories.slice(i, i + 5);
      const batchPromises = batch.map(async (repo) => {
        try {
          const health = await this.analyzeRepositoryHealth(repo);
          return { ...repo, health };
        } catch (error) {
          console.error(`Failed to analyze health for ${repo.name}:`, error);
          return repo; // Return without health data if analysis fails
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      repositoriesWithHealth.push(...batchResults);
      
      // Small delay to avoid hitting rate limits
      if (i + 5 < repositories.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return repositoriesWithHealth;
  }
} 