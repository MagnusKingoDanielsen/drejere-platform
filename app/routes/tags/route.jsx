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
  const tags = await mongoose.models.tags.find().lean().exec();

  return { session: session.data, tags: tags };
}

export default function CampPage() {
  const { tags } = useLoaderData();
  const navigate = useNavigate();

  const handleAddTag = () => {
    navigate("/tags/add");
  };

  const handleEditTag = (tagId) => {
    navigate(`/tags/edit/${tagId}`);
  };

  const handleDeleteTag = (event) => {
    if (!window.confirm("Er du sikker på du vil slette dette tag?")) {
      event.preventDefault();
    }
  };
  return (
    <Modal>
      <div className="tags">
        <h1>Tags</h1>
        <button className="addTag" onClick={handleAddTag}>
          Tilføj tag
        </button>
        <div className="tagWrapper">
          <div className="tagList">
            {tags.map((tag) => (
              <div className="tag" key={tag._id}>
                <p>{tag.tag}</p>
                <div className="tagButtons">
                  <button
                    className="editTag"
                    onClick={() => handleEditTag(tag._id)}
                  >
                    Rediger
                  </button>
                  <Form method="post" onSubmit={handleDeleteTag}>
                    <input type="hidden" name="tagId" value={tag._id} />
                    <button
                      type="submit"
                      name="actionType"
                      value="delete"
                      className="deleteTag"
                    >
                      Slet
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
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const tagId = formData.get("tagId");

  if (actionType === "delete") {
    await mongoose.models.tags.deleteOne({ _id: tagId });
  }

  return null;
}
