export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/profile",
    "/todos",
    "/todos/:path*",  
    "/createtodo"
  ],
};
