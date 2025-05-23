import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GitHubAPIClient } from '@/lib/github-api';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in with GitHub' },
        { status: 401 }
      );
    }

    const githubClient = new GitHubAPIClient(session.accessToken);
    const repositories = await githubClient.getRepositories();
    
    return NextResponse.json({ repositories });
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories from GitHub' },
      { status: 500 }
    );
  }
} 