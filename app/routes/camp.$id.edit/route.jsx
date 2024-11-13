import { useLoaderData, Form, redirect, json } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";

// Loader
export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  if (session.data.usertype !== "admin") {
    return redirect("/camps");
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

// Page
export default function CampEditPage() {
  const { camp, session } = useLoaderData();
  const userName = session.username;
  const startDate = new Date(camp.StartDate).toISOString().slice(0, 16);
  const endDate = new Date(camp.EndDate).toISOString().slice(0, 16);
  if (camp.CampLeader !== userName) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="modal">
      <h1>Edit Camp</h1>
      <Form method="post">
        <label>
          Camp Name:
          <input type="text" name="CampName" defaultValue={camp.CampName} />
        </label>
        <label>
          Start Date:
          <input
            type="datetime-local"
            name="StartDate"
            defaultValue={startDate}
          />
        </label>
        <label>
          End Date:
          <input type="datetime-local" name="EndDate" defaultValue={endDate} />
        </label>
        <label>
          Camp Leader:
          <input type="text" name="CampLeader" defaultValue={camp.CampLeader} />
        </label>
        <label>
          Description:
          <textarea
            name="CampDescription"
            defaultValue={camp.CampDescription}
          />
        </label>
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}

// Action
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
  if (camp.CampLeader !== userName) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  const updatedCamp = {
    CampName: formData.get("CampName"),
    StartDate: formData.get("StartDate"),
    EndDate: formData.get("EndDate"),
    CampLeader: formData.get("CampLeader"),
    CampDescription: formData.get("CampDescription"),
  };

  await mongoose.models.camps.findByIdAndUpdate(params.id, updatedCamp);
  return redirect(`/camp/${params.id}`);
}
