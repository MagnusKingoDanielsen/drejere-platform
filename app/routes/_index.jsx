import { getSession } from "../services/session.server.jsx";
import { redirect } from "@remix-run/react";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/login");
  }
  return session.data;
}

export default function index() {}
