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
import Modal from "~/components/modal.jsx";

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
  console.log(camp.Participants);

  return { session: session.data, camp: camp };
}

export default function CampDetailPage() {
  const { camp, session } = useLoaderData();
  const userName = session.username;

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];

    // Remove the time component from the start and end dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let currentDate = new Date(start);
    while (currentDate <= end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };
  const days = calculateDays(camp.StartDate, camp.EndDate);

  const handleDelete = (event) => {
    if (!confirm("Er du sikker på du vil slette denne lejr?")) {
      event.preventDefault();
    }
  };

  return (
    <Modal>
      <div className="camp-details">
        <h1 className="camp-title">{camp.CampName}</h1>
        <p className="camp-leader">Lejr leder: {camp.CampLeader}</p>
        <p className="camp-date">
          Start:{" "}
          {new Date(camp.StartDate).toLocaleString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" | "}
          slut:{" "}
          {new Date(camp.EndDate).toLocaleString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {/* <p className="camp-date"></p> */}
        <p className="camp-description">{camp.CampDescription}</p>
        <p className="camp-remember">
          <strong>Husk:</strong> Du kan ændre i din tilmelding indtil lejren går
          i gang. Ændrer du din tilmelding herefter, skal du stadig betale for
          de måltider, hvor du ikke spiser med. Det gælder også for drejere, der
          er tilmeldt guldkort-plus-ordningen.
        </p>
        <div className="tablewrapper">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                {days.map((day, index) => (
                  <th key={index}>
                    {day.toLocaleDateString([], {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {camp.Participants.map((participant, index) => (
                <tr key={index}>
                  <td>{participant.name}</td>
                  {days.map((day, dayIndex) => {
                    const attendance = participant.attendance.find(
                      (att) => att.date === day.toLocaleDateString(),
                    );
                    return (
                      <td key={dayIndex}>
                        {attendance &&
                          attendance.meals.includes("breakfast") && (
                            <span>🍳</span>
                          )}
                        {attendance && attendance.meals.includes("lunch") && (
                          <span>🥪</span>
                        )}
                        {attendance && attendance.meals.includes("dinner") && (
                          <span>🍽️</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link to="attend">
          <button type="button">
            {camp.Participants.includes(userName) ? "Attending" : "Join"}
          </button>
        </Link>

        {session.usertype === "admin" && (
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
    </Modal>
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
      return redirect("/lejre");
    } else {
      return json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  await camp.save();
  return null;
}
