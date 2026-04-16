import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== "production",
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: [
            'email',
            'public_profile',
            'pages_show_list',
            'pages_read_engagement',
            'instagram_basic',
            'instagram_content_publish',
            'instagram_manage_comments',
            'instagram_manage_insights',
          ].join(','),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at

        if (account.provider === 'facebook') {
          token.facebookId = (profile as Record<string, unknown>)?.id as string
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.provider = token.provider
      session.facebookId = token.facebookId
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
