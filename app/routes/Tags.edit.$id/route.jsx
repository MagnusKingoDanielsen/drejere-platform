import { Form, useLoaderData, redirect, json } from "react-router-dom";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user || session.data.usertype !== "admin") {
    return redirect("/");
  }
  const tag = await mongoose.models.tags.findById(params.id).lean().exec();

  return { session: session.data, tag: tag };
}

export default function EditTag() {
  const { tag } = useLoaderData();

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
          <button type="submit">Gem ændringer</button>
        </Form>
      </div>
    </Modal>
  );
}

export async function action({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.usertype === "admin") {
    const formData = await request.formData();
    const tag = formData.get("tag");

    await mongoose.models.tags.findByIdAndUpdate(params.id, { tag });

    return redirect("/tags");
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
