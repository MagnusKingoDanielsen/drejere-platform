import { Form, redirect } from "@remix-run/react";
import mongoose from "mongoose";
import { getSession } from "../../services/session.server.jsx";
import Modal from "~/components/modal.jsx";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/login");
  }
  if (session.data.usertype !== "admin") {
    return redirect("/lejre");
  }

  return { session: session.data };
}

export default function OpretLejr() {
  return (
    <Modal>
      <div className="campWrapper">
        <h1>Opret ny lejr</h1>
        <Form method="post" action="/opretLejr" className="edit-camp-form">
          <label>
            Lejr navn:
            <input type="text" id="CampName" name="CampName" required />
          </label>
          <label>
            Start dato og tid:
            <input
              type="datetime-local"
              id="StartDate"
              name="StartDate"
              required
              max="9999-12-31T23:59"
            />
          </label>
          <label>
            Slut dato og tid:
            <input
              type="datetime-local"
              id="EndDate"
              name="EndDate"
              required
              max="9999-12-31T23:59"
            />
          </label>
          <label>
            Lejr leder:
            <input type="text" id="CampLeader" name="CampLeader" required />
          </label>
          <label>
            Beskrivelse:
            <textarea id="CampDescription" name="CampDescription" required />
          </label>
          <button type="submit">Opret lejr</button>
        </Form>
      </div>
    </Modal>
  );
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  const { CampName, StartDate, EndDate, CampLeader, CampDescription } =
    Object.fromEntries(formData);

  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.user) {
    throw new Response("Not authenticated", { status: 401 });
  }

  const Participants = [];

  if (session.data.usertype === "admin") {
    if (
      typeof CampName !== "string" ||
      typeof StartDate !== "string" ||
      typeof EndDate !== "string" ||
      typeof CampLeader !== "string" ||
      typeof CampDescription !== "string" ||
      typeof Participants !== "object"
    ) {
      throw new Error("Bad request");
    }

    await mongoose.models.camps.create({
      CampName,
      StartDate,
      EndDate,
      CampLeader,
      CampDescription,
      Participants,
    });
    return redirect("/lejre");
  } else {
    throw new Response("Not authenticated", { status: 401 });
  }
};
