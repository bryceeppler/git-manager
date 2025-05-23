#!/bin/bash

echo "🔐 Git Manager - GitHub OAuth Setup"
echo "===================================="
echo ""

echo "1. Go to GitHub Developer Settings:"
echo "   https://github.com/settings/applications/new"
echo ""

echo "2. Create a new OAuth App with these settings:"
echo "   - Application name: Git Repository Manager"
echo "   - Homepage URL: http://localhost:3000"
echo "   - Authorization callback URL: http://localhost:3000/api/auth/callback/github"
echo ""

echo "3. Copy your Client ID and Client Secret"
echo ""

echo "4. Create .env.local file with your credentials:"
echo ""
echo "cat > .env.local << 'EOF'"
echo "# GitHub OAuth Configuration"
echo "GITHUB_CLIENT_ID=your_actual_client_id_here"
echo "GITHUB_CLIENT_SECRET=your_actual_client_secret_here"
echo ""
echo "# NextAuth Configuration"
echo "NEXTAUTH_URL=http://localhost:3000"
echo "NEXTAUTH_SECRET=\$(openssl rand -base64 32)"
echo "EOF"
echo ""

echo "5. Restart the development server:"
echo "   pnpm dev"
echo ""

echo "6. Visit http://localhost:3000 and sign in with GitHub!"
echo ""

if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "✅ Generated NEXTAUTH_SECRET for you: $SECRET"
    echo "   Use this as your NEXTAUTH_SECRET value"
else
    echo "⚠️  OpenSSL not found. Please generate a random secret key manually."
fi

echo ""
echo "🚀 After setup, your Git Manager will be ready to:"
echo "   • Scan directories for Git repositories"
echo "   • View repository details (size, last commit, branch, etc.)"
echo "   • Safely delete repositories with confirmation"
echo "   • Search and filter repositories" 