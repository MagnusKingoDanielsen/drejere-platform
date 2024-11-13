import { redirect } from "@remix-run/react";
import mongoose from "mongoose";
import { getSession } from "../../services/session.server.jsx";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/login");
  }
  if (session.data.usertype !== "admin") {
    return redirect("/camps");
  }

  return { session: session.data };
}

export default function OpretLejr() {
  return (
    <div>
      <h1>Create a New Camp</h1>
      <form method="post" action="/opretLejr">
        <div>
          <label htmlFor="CampName">Camp Name:</label>
          <input type="text" id="CampName" name="CampName" required />
        </div>
        <div>
          <label htmlFor="StartDate">Start Date and Time:</label>
          <input
            type="datetime-local"
            id="StartDate"
            name="StartDate"
            required
          />
        </div>
        <div>
          <label htmlFor="EndDate">End Date and Time:</label>
          <input type="datetime-local" id="EndDate" name="EndDate" required />
        </div>
        <div>
          <label htmlFor="CampLeader">Camp Leader:</label>
          <input type="text" id="CampLeader" name="CampLeader" required />
        </div>
        <div>
          <label htmlFor="CampDescription">Camp Description:</label>
          <textarea
            id="CampDescription"
            name="CampDescription"
            required
          ></textarea>
        </div>
        <button type="submit">Create Camp</button>
      </form>
    </div>
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
  const Participants = [session.data.username];
  console.log(
    CampName,
    StartDate,
    EndDate,
    CampLeader,
    CampDescription,
    Participants,
  );
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
  return redirect("/camps");
};
