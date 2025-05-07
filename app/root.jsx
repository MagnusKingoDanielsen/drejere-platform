import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./main.css";
import Nav from "./routes/header/nav";
import { destroySession, getSession } from "./services/session.server";
import backgroundimg from "./img/drejerbackground.jpg";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];
export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return { user: null };
  }
  return { user: session.data };
}

export function meta() {
  return [{ title: "drejer portal" }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content=" width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="backgroundimg">
          <img
            src={backgroundimg}
            alt="background"
            style={{
              position: "absolute",
              bottom: "0",
              zIndex: "-1",
              width: "100%",
            }}
          />
          <Nav />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
