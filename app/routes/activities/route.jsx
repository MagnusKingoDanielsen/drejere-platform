import { Outlet, useLoaderData } from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  const activities = await mongoose.models.activities.find().lean().exec();

  return { session: session.data, activities: activities };
}

export default function CampPage() {
  const { activities } = useLoaderData();
  return (
    <Modal>
      <div className="activities">
        <h1>Activities</h1>
        <button className="addActivity">Add activity</button>
        <div className="activityList">
          {activities.map((activity) => (
            <div className="activity" key={activity._id}>
              <p>{activity.activity}</p>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </Modal>
  );
}
