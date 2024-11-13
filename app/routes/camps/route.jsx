import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";

import mongoose from "mongoose";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  const camps = await mongoose.models.camps.find().lean().exec();

  return { session: session.data, camps: camps };
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
            <p>
              Start Date: {new Date(camp.StartDate).toLocaleDateString()}{" "}
              {new Date(camp.StartDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              End Date: {new Date(camp.EndDate).toLocaleDateString()}{" "}
              {new Date(camp.EndDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <Link to={`/camp/${camp._id}`}>View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
