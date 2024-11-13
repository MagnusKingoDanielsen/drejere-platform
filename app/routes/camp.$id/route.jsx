import {
  useLoaderData,
  Link,
  Outlet,
  Form,
  redirect,
  json,
} from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  if (typeof params.id !== "string") {
    throw new Response("Not found", { status: 404 });
  }
  const camp = await mongoose.models.camps.findById(params.id).lean().exec();
  if (!camp) {
    throw new Response("Not found", { status: 404 });
  }

  return { session: session.data, camp: camp };
}

export default function CampDetailPage() {
  const { camp, session } = useLoaderData();
  const userName = session.username;

  const handleDelete = (event) => {
    if (!confirm("Are you sure you want to delete this camp?")) {
      event.preventDefault();
    }
  };

  return (
    <div>
      <h1>{camp.CampName}</h1>
      <p>Start Date: {new Date(camp.StartDate).toLocaleDateString()}</p>
      <p>End Date: {new Date(camp.EndDate).toLocaleDateString()}</p>
      <p>Leader: {camp.CampLeader}</p>
      <p>Description: {camp.CampDescription}</p>
      <p>Participants: {camp.Participants.join(", ")}</p>
      <Form method="post">
        <button type="submit">
          {camp.Participants.includes(userName) ? "Attending" : "Join"}
        </button>
      </Form>
      {userName === camp.CampLeader && (
        <>
          <Form method="post" onSubmit={handleDelete}>
            <button name="_action" value="delete" type="submit">
              Delete Camp
            </button>
          </Form>
          <Link to="edit">
            <button type="button">Edit Camp</button>
          </Link>
        </>
      )}
      <Outlet />
    </div>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const camp = await mongoose.models.camps.findById(params.id).exec();
  if (!camp) {
    throw new Response("Not found", { status: 404 });
  }

  const userName = session.data.username;
  if (formData.get("_action") === "delete") {
    if (camp.CampLeader === userName) {
      await mongoose.models.camps.findByIdAndDelete(params.id);
      return redirect("/camps");
    } else {
      return json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  if (camp.Participants.includes(userName)) {
    camp.Participants = camp.Participants.filter(
      (participant) => participant !== userName,
    );
  } else {
    camp.Participants.push(userName);
  }

  await camp.save();
  return null;
}
