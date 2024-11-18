import mongoose from "mongoose";
import { getSession } from "../../services/session.server";
import { redirect, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const user = await mongoose.models.drejers
    .findOne({ username: session.data.username })
    .select("-password -__v -_id -lastLogin -createdAt -updatedAt")
    .lean()
    .exec();

  return { session: session.data, user: user };
}

export default function Profil() {
  const { user } = useLoaderData();

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>This is your profile</p>
      <ul>
        <li>
          <strong>Username:</strong> {user.username}
        </li>
        <li>
          <strong>Email:</strong> {user.email}
        </li>
        <li>
          <strong>Telefon nr:</strong> {user.phone}
        </li>
        <li>
          <strong>Addresse:</strong> {user.address}
        </li>
        <li>
          <strong>Type:</strong> {user.type}
        </li>
        <li>
          <strong>Tags:</strong>
          <ul>
            {user.tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
        </li>
        <li>
          <strong>Activities:</strong>
          <ul>
            {user.activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
