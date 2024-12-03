import { Form, redirect } from "react-router-dom";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  return { session: session.data };
}

export async function action({ request }) {
  const formData = await request.formData();
  const activity = formData.get("activity");

  await mongoose.models.activities.create({ activity });

  return redirect("/activities");
}

export default function AddActivity() {
  return (
    <Modal>
      <div className="addActivity">
        <h1>Add Activity</h1>
        <Form method="post">
          <div className="formGroup">
            <label htmlFor="activity">Activity:</label>
            <input id="activity" name="activity" type="text" required />
          </div>
          <button type="submit">Add</button>
        </Form>
      </div>
    </Modal>
  );
}
