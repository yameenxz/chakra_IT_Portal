import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/home",
    "/offboarding",
    "/dashboard",
    "/employees",
    "/upload",
    "/reports",
    "/history",
    "/director",
    "/partner",
  ],
};