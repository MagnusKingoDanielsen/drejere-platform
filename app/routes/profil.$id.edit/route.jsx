import mongoose from "mongoose";
import { getSession } from "../../services/session.server";
import { redirect, useLoaderData, Form } from "@remix-run/react";
import Modal from "../../components/modal";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const user = await mongoose.models.drejers
    .findById(params.id)
    .select("-password -__v -_id -lastLogin -createdAt -updatedAt")
    .lean()
    .exec();

  return { session: session.data, user: user };
}

export default function EditProfile() {
  const { user } = useLoaderData();
  const tags = user.tags;
  const activities = user.activities;

  return (
    <Modal>
      <div className="profileContainer">
        <h1>Edit Profile</h1>
        <Form method="post" className="profileForm">
          <ul className="profileList">
            <li className="formGroup">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={user.username}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="phone">Telefon nr:</label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={user.phone}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="address">Addresse:</label>
              <input
                id="address"
                name="address"
                type="text"
                defaultValue={user.address}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="birthday">Fødselsdag:</label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                defaultValue={user.birthday}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="type">Type:</label>
              <input
                id="type"
                name="type"
                type="text"
                defaultValue={user.type}
                required
              />
            </li>
            <li className="formGroup">
              <label htmlFor="tags">activities:</label>
              <ul className="tagsList">
                {activities.map((activitiy, index) => (
                  <li key={index}>{activitiy}</li>
                ))}
                <li>
                  <span>+</span>
                </li>
              </ul>
            </li>
            <li className="formGroup">
              <label htmlFor="tags">Tags:</label>
              <ul className="tagsList">
                {tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
                <li>
                  <span>+</span>
                </li>
              </ul>
            </li>
          </ul>
          <div className="center">
            <button type="submit">Save Changes</button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const { username, email, phone, address, birthday, type, tags } =
    Object.fromEntries(formData);

  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  await mongoose.models.drejers.updateOne(
    { username: session.data.username },
    {
      username,
      email,
      phone,
      address,
      birthday,
      type,
      tags: tags.split(",").map((tag) => tag.trim()),
    },
  );

  return redirect("/profile");
}
