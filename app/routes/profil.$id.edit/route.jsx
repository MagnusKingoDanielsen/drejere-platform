import mongoose from "mongoose";
import { getSession } from "../../services/session.server";
import {
  redirect,
  useLoaderData,
  Form,
  useNavigate,
  json,
} from "@remix-run/react";
import Modal from "../../components/modal";
import { useState } from "react";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  const allTags = await mongoose.models.tags.find().lean().exec();
  const allActivities = await mongoose.models.activities.find().lean().exec();

  const user = await mongoose.models.drejers
    .findById(params.id)
    .select("-password -__v -_id -lastLogin -createdAt -updatedAt")
    .lean()
    .exec();

  return { session: session.data, user: user, allTags, allActivities };
}

export default function EditProfile() {
  const { user, allTags, allActivities } = useLoaderData();
  const [tags, setTags] = useState(user.tags);
  const [activities, setActivities] = useState(user.activities);
  const navigate = useNavigate();

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const toggleActivity = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter((a) => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("tags", tags.join(","));
    formData.append("activities", activities.join(","));

    const response = await fetch(event.target.action, {
      method: event.target.method,
      body: formData,
    });

    if (response.ok) {
      navigate(`/profile`);
    }
  };

  return (
    <Modal>
      <div className="profileContainer">
        <h1>Rediger profil</h1>
        <Form method="post" className="profileForm" onSubmit={handleSubmit}>
          <ul className="profileList">
            <li className="formGroup">
              <label htmlFor="username">Brugernavn:</label>
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
              />
            </li>
            {user.type === "admin" ? (
              <li className="formGroup">
                <label htmlFor="type">Type:</label>
                <select
                  id="userType"
                  name="userType"
                  required
                  defaultValue={user.type}
                >
                  <option value="">Vælg brugertype</option>
                  <option value="admin">Admin</option>
                  <option value="user">Drejer</option>
                </select>
              </li>
            ) : null}

            <li className="formGroup">
              <label htmlFor="tags">activities:</label>
              <ul className="activitiesList">
                {allActivities.map((activity) => (
                  <button
                    key={activity._id}
                    type="button"
                    onClick={() => toggleActivity(activity.activity)}
                    className={
                      activities.includes(activity.activity) ? "selected" : ""
                    }
                  >
                    {activity.activity}
                    {activities.includes(activity.activity) && (
                      <span style={{ fontSize: "13px" }}> ✔</span>
                    )}
                  </button>
                ))}
              </ul>
            </li>
            {user.type === "admin" ? (
              <li className="formGroup">
                <label htmlFor="tags">Tags:</label>
                <ul className="tagsList">
                  {allTags.map((tag) => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleTag(tag.tag)}
                      className={tags.includes(tag.tag) ? "selected" : ""}
                    >
                      {tag.tag}
                      {tags.includes(tag.tag) && (
                        <span style={{ fontSize: "13px" }}> ✔</span>
                      )}
                    </button>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
          <div className="center">
            <button type="submit">Gem ændringer</button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const { username, email, phone, address, birthday, type, tags, activities } =
    Object.fromEntries(formData);
  if (session.data.username === username || session.data.usertype === "admin") {
    const cleanedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];
    const cleanedActivities = activities
      ? activities
          .split(",")
          .map((activity) => activity.trim())
          .filter((activity) => activity)
      : [];

    await mongoose.models.drejers.updateOne(
      { username: session.data.username },
      {
        username,
        email,
        phone,
        address,
        birthday,
        type,
        tags: cleanedTags,
        activities: cleanedActivities,
      },
    );

    return redirect("/profile");
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
