import { useLoaderData, useFetcher } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { getSession } from "../services/session.server.jsx";
import mongoose from "mongoose";

export async function loader({ request, params }) {
  console.log(params.id);

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
  const fetcher = useFetcher();
  const userName = session.username;
  const isAttending = camp.Participants.includes(userName);
  console.log(userName, isAttending);
  return (
    <div>
      <h1>{camp.CampName}</h1>
      <p>
        Start Date: {new Date(camp.StartDate).toLocaleDateString()}{" "}
        {new Date(camp.StartDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p>
        End Date: {new Date(camp.EndDate).toLocaleDateString()}{" "}
        {new Date(camp.EndDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p>Leader: {camp.CampLeader}</p>
      <p>Description: {camp.CampDescription}</p>
      <p>Participants: {camp.Participants.join(", ")}</p>
      <fetcher.Form method="post">
        <button type="submit">{isAttending ? "Attending" : "Join"}</button>
      </fetcher.Form>
    </div>
  );
}
export async function action({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const camp = await mongoose.models.camps.findById(params.id).exec();
  if (!camp) {
    throw new Response("Not found", { status: 404 });
  }

  const userName = session.data.username;
  if (!camp.Participants.includes(userName)) {
    camp.Participants.push(userName);
    await camp.save();
  }

  return redirect(`/camp/${params.id}`);
}
