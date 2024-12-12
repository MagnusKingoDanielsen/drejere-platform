import {
  Form,
  json,
  Outlet,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiEdit2Line } from "react-icons/ri";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user || session.data.usertype !== "admin") {
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

  const handleEditActivity = (activityId) => {
    navigate(`/activities/edit/${activityId}`);
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
        <div className="activityWrapper">
          <div className="activityList">
            {activities.map((activity) => (
              <div className="activity" key={activity._id}>
                <p>{activity.activity}</p>
                <div className="activitiesButtons">
                  <button
                    className="editActivity"
                    onClick={() => handleEditActivity(activity._id)}
                  >
                    <RiEdit2Line />
                  </button>
                  <Form method="post" onSubmit={handleDeleteActivity}>
                    <input
                      type="hidden"
                      name="activityId"
                      value={activity._id}
                    />
                    <button
                      type="submit"
                      name="actionType"
                      value="delete"
                      className="deleteActivity"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </Modal>
  );
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.usertype === "admin") {
    const formData = await request.formData();
    const actionType = formData.get("actionType");
    const activityId = formData.get("activityId");

    if (actionType === "delete") {
      await mongoose.models.activities.deleteOne({ _id: activityId });
    }

    return null;
  } else {
    return json(
      {
        error:
          "Du har ikke tilladelse til at lave denne ændring. Kontakt venligst en admin",
      },
      { status: 403 },
    );
  }
}
