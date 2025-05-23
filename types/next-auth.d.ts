import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: number;
  }

  interface JWT {
    accessToken?: string;
    userId?: number;
  }
} 