import { getSession } from "../../services/session.server.jsx";
import { redirect, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  return session.data;
}

export default function Profil() {
  const sessionData = useLoaderData();
  return (
    <div>
      <h1>Welcome, {sessionData.username}!</h1>
      <p>This is your profile</p>
    </div>
  );
}
