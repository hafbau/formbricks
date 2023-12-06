import NextAuth from "next-auth";
import { authOptions } from "@fastform/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
