import { useLoaderData, useNavigate } from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../services/session.server.jsx";
import mongoose from "mongoose";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  const camps = await mongoose.models.camps.find().lean().exec();
  return {
    session: session.data,
    camps: camps.map((camp) => ({
      ...camp,
      StartDate: new Date(camp.StartDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      EndDate: new Date(camp.EndDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
  };
}

export default function CampPage() {
  const { camps } = useLoaderData();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/createCamp");
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Create Camp</button>
      <h1>List of Camps</h1>
      <ul>
        {camps.map((camp) => (
          <li key={camp._id}>
            <h2>{camp.CampName}</h2>
            <p>Start Date: {new Date(camp.StartDate).toLocaleString()}</p>
            <p>End Date: {new Date(camp.EndDate).toLocaleString()}</p>
            <p>Leader: {camp.CampLeader}</p>
            <p>Description: {camp.CampDescription}</p>
            <p>Participants: {camp.Participants.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
