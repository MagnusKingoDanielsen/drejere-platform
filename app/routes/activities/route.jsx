import { Form, Outlet, useLoaderData, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleAddActivity = () => {
    navigate("/activities/add");
  };
  const handleDeleteActivity = (event) => {
    if (!window.confirm("Er du sikker på du vil slette denne aktivitet?")) {
      event.preventDefault();
    }
  };

  return (
    <Modal>
      <div className="activities">
        <h1>Aktiviteter</h1>
        <button className="addActivity" onClick={handleAddActivity}>
          Tilføj aktivitet
        </button>
        <div className="activityList">
          {activities.map((activity) => (
            <div className="activity" key={activity._id}>
              <p>{activity.activity}</p>
              <button className="editActivity">Rediger</button>
              <Form method="post" onSubmit={handleDeleteActivity}>
                <input type="hidden" name="activityId" value={activity._id} />
                <input type="hidden" name="actionType" value="delete" />
                <button
                  type="submit"
                  name="actionType"
                  value="delete"
                  className="deleteActivity"
                >
                  Slet
                </button>
              </Form>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </Modal>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const activityId = formData.get("activityId");

  if (actionType === "delete") {
    await mongoose.models.activities.deleteOne({ _id: activityId });
  }

  return null;
}
