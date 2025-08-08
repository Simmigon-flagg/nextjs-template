export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/profile",
    "/todos",
    "/todos/:path*",  
    "/createtodo"
  ],
};
