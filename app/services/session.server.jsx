import { createCookieSessionStorage } from "@remix-run/node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "Eventplatform-session",
      secrets: ["MadeByMeAndOnlyMe"],

      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });
