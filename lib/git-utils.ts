import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export interface Repository {
  id: string;
  name: string;
  path: string;
  lastCommitDate?: Date;
  currentBranch?: string;
  isDirty?: boolean;
  remoteUrl?: string;
  size?: number;
}

export async function scanForRepositories(rootPath: string): Promise<Repository[]> {
  const repositories: Repository[] = [];
  
  try {
    const items = await fs.readdir(rootPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const itemPath = path.join(rootPath, item.name);
        const gitPath = path.join(itemPath, '.git');
        
        try {
          const gitStat = await fs.stat(gitPath);
          if (gitStat.isDirectory()) {
            const repoInfo = await getRepositoryInfo(itemPath);
            repositories.push(repoInfo);
          }
        } catch {
          // Not a git repository, continue
        }
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error);
  }
  
  return repositories;
}

export async function getRepositoryInfo(repoPath: string): Promise<Repository> {
  const git: SimpleGit = simpleGit(repoPath);
  const repoName = path.basename(repoPath);
  const id = Buffer.from(repoPath).toString('base64');
  
  try {
    const [status, log, remotes] = await Promise.all([
      git.status(),
      git.log({ maxCount: 1 }),
      git.getRemotes(true),
    ]);
    
    const lastCommit = log.latest;
    const remoteUrl = remotes.find(r => r.name === 'origin')?.refs?.fetch || '';
    
    // Get directory size
    const size = await getDirectorySize(repoPath);
    
    return {
      id,
      name: repoName,
      path: repoPath,
      lastCommitDate: lastCommit ? new Date(lastCommit.date) : undefined,
      currentBranch: status.current || 'unknown',
      isDirty: !status.isClean(),
      remoteUrl,
      size,
    };
  } catch (error) {
    console.error('Error getting repository info:', error);
    return {
      id,
      name: repoName,
      path: repoPath,
    };
  }
}

export async function deleteRepository(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Error deleting repository:', error);
    throw new Error(`Failed to delete repository: ${error}`);
  }
}

async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const stats = await fs.stat(dirPath);
    if (stats.isFile()) {
      return stats.size;
    }
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        totalSize += await getDirectorySize(filePath);
      }
      
      return totalSize;
    }
    
    return 0;
  } catch {
    return 0;
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
} 