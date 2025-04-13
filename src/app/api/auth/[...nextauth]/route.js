import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Password Login",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const pw = credentials?.password;
        const isValid = await bcrypt.compare(pw, process.env.APP_PASSWORD_HASH);
        if (isValid) {
          return { id: "1", name: "Authorized User" };
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin" // Custom sign-in page path.
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
