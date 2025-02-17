import { Form, useLoaderData, redirect, json } from "react-router-dom";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user || session.data.usertype !== "Admin") {
    return redirect("/");
  }
  const activity = await mongoose.models.activities
    .findById(params.id)
    .lean()
    .exec();
  return { session: session.data, activity: activity };
}

export default function EditActivity() {
  const { activity } = useLoaderData();

  return (
    <Modal>
      <div className="editActivity">
        <h1>Rediger Aktivitet</h1>
        <Form method="post">
          <div className="formGroup">
            <label htmlFor="activity">Aktivitet:</label>
            <input
              id="activity"
              name="activity"
              type="text"
              defaultValue={activity.activity}
              required
            />
          </div>
          <button type="submit">Gem ændringer</button>
        </Form>
      </div>
    </Modal>
  );
}

export async function action({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.usertype === "Admin") {
    const formData = await request.formData();
    const activity = formData.get("activity");
    await mongoose.models.activities.findByIdAndUpdate(params.id, { activity });
    return redirect("/activities");
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
