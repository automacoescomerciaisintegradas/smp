import type { DefaultSession, DefaultJWT } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    facebookId?: string
    user?: {
      id?: string
    } & DefaultSession["user"]
  }

  interface User {
    facebookId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    provider?: string
    refreshToken?: string
    expiresAt?: number
    facebookId?: string
  }
}
