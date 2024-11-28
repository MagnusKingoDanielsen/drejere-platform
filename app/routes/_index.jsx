import { getSession } from "../services/session.server.jsx";
import { redirect, useLoaderData } from "@remix-run/react";

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
    <div className="welcome">
      <h1>Velkommen tilbage {sessionData.username}!</h1>
    </div>
  );
}
