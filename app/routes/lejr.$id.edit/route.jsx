import { useLoaderData, Form, redirect, json } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  if (session.data.usertype !== "Admin") {
    return redirect("/lejre");
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

export default function CampEditPage() {
  const { camp } = useLoaderData();

  const startDate = new Date(camp.StartDate).toISOString().slice(0, 16);
  const endDate = new Date(camp.EndDate).toISOString().slice(0, 16);

  return (
    <Modal>
      <div className="modal">
        <h1>Edit Camp</h1>
        <Form method="post" className="edit-camp-form">
          <label>
            Lejr navn:
            <input
              type="text"
              name="CampName"
              defaultValue={camp.CampName}
              required
            />
          </label>
          <label>
            Start dato:
            <input
              type="datetime-local"
              name="StartDate"
              defaultValue={startDate}
              required
            />
          </label>
          <label>
            Slut dato:
            <input
              type="datetime-local"
              name="EndDate"
              defaultValue={endDate}
              required
            />
          </label>
          <label>
            Lejr leder:
            <input
              type="text"
              name="CampLeader"
              defaultValue={camp.CampLeader}
            />
          </label>
          <label>
            Beskrivelse:
            <textarea
              name="CampDescription"
              defaultValue={camp.CampDescription}
            />
          </label>
          <button type="submit">Gem ændringer</button>
        </Form>
      </div>
    </Modal>
  );
}

// Action
export async function action({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  if (session.data.usertype === "Admin") {
    const updatedCamp = {
      CampName: formData.get("CampName"),
      StartDate: formData.get("StartDate"),
      EndDate: formData.get("EndDate"),
      CampLeader: formData.get("CampLeader"),
      CampDescription: formData.get("CampDescription"),
    };

    await mongoose.models.camps.findByIdAndUpdate(params.id, updatedCamp);
    return redirect(`/lejr/${params.id}`);
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
