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
  const tags = await mongoose.models.tags.find().lean().exec();

  return { session: session.data, tags: tags };
}

export default function CampPage() {
  const { tags } = useLoaderData();
  return (
    <Modal>
      <div className="tags">
        <h1>Tags</h1>
        <button className="addTag">Add tag</button>
        <div className="tagList">
          {tags.map((tag) => (
            <div className="tag" key={tag._id}>
              <p>{tag.tag}</p>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </Modal>
  );
}
