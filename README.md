# GitHub Repository Manager

A Next.js application for managing and cleaning up your GitHub repositories with ease.

## Features

- 🔐 **GitHub Authentication** - Secure login with GitHub OAuth
- 📊 **Repository Browsing** - View all your GitHub repositories in one place
- 📋 **Repository Details** - View repository information including:
  - Stars, forks, and watchers count
  - Last updated date
  - Programming language
  - Repository size
  - Public/private status
  - Fork and archived status
- 🗑️ **Safe Deletion** - Delete GitHub repositories with confirmation dialogs
- ⚙️ **User Settings** - Customize safety preferences:
  - Require typing repository name for deletion confirmation
  - Disable bulk operations for extra safety
- 🔍 **Search & Filter** - Find specific repositories by name, description, or owner
- 🔄 **Real-time Sync** - Refresh to get latest repository data from GitHub
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

This application uses PostgreSQL with Drizzle ORM for user settings and preferences.

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `git_manager`
3. Set the `DATABASE_URL` environment variable

#### Option B: Cloud Database (Recommended)
Use a cloud PostgreSQL service like:
- [Neon](https://neon.tech) (Free tier available)
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app)
- [PlanetScale](https://planetscale.com)

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with these settings:
   - **Application name**: Git Repository Manager
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/git_manager"

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Database Migration

Run the database migrations to set up the required tables:

```bash
# Generate migration files
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Or push schema directly (for development)
pnpm db:push
```

### 6. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Apply pending migrations to the database
- `pnpm db:push` - Push schema changes directly (development only)
- `pnpm db:studio` - Open Drizzle Studio for database management

## Usage

1. **Sign in** with your GitHub account
2. **Configure settings** at `/settings` to customize safety preferences
3. **View all repositories** from your GitHub account automatically loaded
4. **Browse repository details** including stars, forks, language, and size
5. **Search repositories** using the search box to filter by name, description, or owner
6. **Delete repositories** using the trash icon with confirmation dialogs (based on your settings)
7. **Refresh** to get the latest data from GitHub

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with GitHub provider
- **GitHub API**: Octokit/rest for GitHub API integration
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Forms**: React Hook Form with Zod validation

## Safety Features

- **Authentication Required**: Only authenticated users can delete repositories
- **Configurable Confirmations**: Users can require typing repository name for deletion
- **Bulk Operation Controls**: Option to disable bulk operations for extra safety
- **GitHub API Integration**: Direct integration with GitHub's official API
- **Error Handling**: Comprehensive error handling and user feedback
- **Real-time Updates**: Immediate UI updates after operations
- **Database Persistence**: User preferences stored securely in PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
