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
  const tag = formData.get("tag");

  await mongoose.models.tags.create({ tag });

  return redirect("/tags");
}

export default function AddTag() {
  return (
    <Modal>
      <div className="addTag">
        <h1>Tilføj Tag</h1>
        <Form method="post" className="addTagForm">
          <div className="formGroup">
            <label htmlFor="tag">Navn:</label>
            <input id="tag" name="tag" type="text" required />
          </div>
          <button type="submit">Tilføj</button>
        </Form>
      </div>
    </Modal>
  );
}
