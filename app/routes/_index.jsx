import { getSession, destroySession } from "../services/session.server.jsx";
import { redirect, useLoaderData, Form } from "@remix-run/react";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/login");
  }
  return session.data;
}

export default function Index() {
  const sessionData = useLoaderData();
  return (
    <div>
      <h1>Welcome, {sessionData.username}!</h1>
      <p>You are now logged in.</p>
      <Form action="/camps">
        <button type="submit">Go to Camps</button>
      </Form>

      <Form method="post">
        <button type="submit">Logout</button>
      </Form>
    </div>
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
