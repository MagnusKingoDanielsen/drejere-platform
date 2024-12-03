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

  const tag = await mongoose.models.tags.findById(params.id).lean().exec();

  console.log(tag);

  return { session: session.data, tag: tag };
}

export default function EditTag() {
  const { tag } = useLoaderData();
  console.log(tag);

  return (
    <Modal>
      <div className="edittag">
        <h1>Rediger Aktivitet</h1>
        <Form method="post">
          <div className="formGroup">
            <label htmlFor="tag">Aktivitet:</label>
            <input
              id="tag"
              name="tag"
              type="text"
              defaultValue={tag.tag}
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
  const tag = formData.get("tag");

  await mongoose.models.tags.findByIdAndUpdate(params.id, { tag });

  return redirect("/tags");
}
