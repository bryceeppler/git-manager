'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubAPIClient, GitHubRepository, GitHubRepositoryWithHealth, RepositoryHealth } from '@/lib/github-api'
import { revalidatePath } from 'next/cache'

export async function getRepositoriesWithoutHealth(): Promise<{ repositories?: GitHubRepository[], error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return { error: 'Unauthorized - Please sign in with GitHub' }
    }

    const githubClient = new GitHubAPIClient(session.accessToken)
    const repositories = await githubClient.getRepositories()
    
    return { repositories }
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return { error: 'Failed to fetch repositories from GitHub' }
  }
}

export async function analyzeRepositoryHealth(repository: GitHubRepository): Promise<{ health?: RepositoryHealth, error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return { error: 'Unauthorized' }
    }

    const githubClient = new GitHubAPIClient(session.accessToken)
    const health = await githubClient.analyzeRepositoryHealth(repository)
    
    return { health }
  } catch (error) {
    console.error('Error analyzing repository health:', error)
    return { error: 'Failed to analyze repository health' }
  }
}

export async function getRepositories(): Promise<{ repositories?: GitHubRepositoryWithHealth[], error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return { error: 'Unauthorized - Please sign in with GitHub' }
    }

    const githubClient = new GitHubAPIClient(session.accessToken)
    const repositories = await githubClient.getRepositoriesWithHealth()
    
    return { repositories }
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return { error: 'Failed to fetch repositories from GitHub' }
  }
}

export async function deleteRepository(owner: string, repo: string): Promise<{ success: boolean, error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return { success: false, error: 'Unauthorized' }
    }

    const githubClient = new GitHubAPIClient(session.accessToken)
    await githubClient.deleteRepository(owner, repo)
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error deleting repository:', error)
    return { success: false, error: 'Failed to delete repository' }
  }
} 