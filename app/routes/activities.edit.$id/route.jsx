import { Form, useLoaderData, redirect } from "react-router-dom";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  console.log("params", params.id);

  const activity = await mongoose.models.activities
    .findById(params.id)
    .lean()
    .exec();

  console.log(activity);

  return { session: session.data, activity: activity };
}

export default function EditActivity() {
  const { activity } = useLoaderData();
  console.log(activity);

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
          <button type="submit">Opdater</button>
        </Form>
      </div>
    </Modal>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const activity = formData.get("activity");

  console.log("activity", activity);
  console.log("params", params.id);

  await mongoose.models.activities.findByIdAndUpdate(params.id, { activity });

  return redirect("/activities");
}
