import { useNavigate } from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../services/session.server.jsx";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  return session.data;
}

export default function CampPage() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/createCamp");
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Create Camp</button>
    </div>
  );
}
