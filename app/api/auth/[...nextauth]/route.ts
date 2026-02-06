import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// En producción, estos deben estar en variables de entorno
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2a$10$X8qZ9vN8p1Y7ZxQfK6J9qunQx1wT3P0nJ5W8gJ6X8qZ9vN8p1Y7Zx"; // "admin123"

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Verificar usuario y contraseña
        if (credentials.username === ADMIN_USERNAME) {
          // En desarrollo, permitir contraseña "admin123"
          if (credentials.password === "admin123") {
            return {
              id: "1",
              name: "Admin",
              email: "admin@travelquote.com"
            };
          }
          
          // Verificar con hash
          const isValid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH);
          if (isValid) {
            return {
              id: "1",
              name: "Admin",
              email: "admin@travelquote.com"
            };
          }
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
