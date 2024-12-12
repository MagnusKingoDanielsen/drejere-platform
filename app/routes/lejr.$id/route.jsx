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
import { RiEdit2Line } from "react-icons/ri";

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

  const isUserSignedUp = camp.Participants.some(
    (participant) => participant.name === userName,
  );

  const isPastStartDate = new Date() > new Date(camp.StartDate);
  const isPastEndDate = new Date() > new Date(camp.EndDate);

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

  const formatDate = (date) => {
    return new Date(date)
      .toLocaleString("da-DK", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const formatDateTable = (date) => {
    return new Date(date)
      .toLocaleDateString("da-DK", {
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, ".");
  };

  return (
    <Modal>
      <div className="camp-details">
        <h1 className="camp-title">{camp.CampName}</h1>
        <p className="camp-leader">Lejr leder: {camp.CampLeader}</p>
        <p className="camp-date">
          dato: {formatDate(camp.StartDate)} {" | "}
          {formatDate(camp.EndDate)}
        </p>
        <p className="camp-description">
          <strong>Beskrivelse:</strong>
          <br />
          {camp.CampDescription}
        </p>
        <p className="camp-remember">
          <strong>Husk:</strong>
          <br />
          Du kan ændre i din tilmelding indtil lejren går i gang. Ændrer du din
          tilmelding herefter, skal du stadig betale for de måltider, hvor du
          ikke spiser med. Det gælder også for drejere, der er tilmeldt
          guldkort-plus-ordningen.
        </p>
        <div className="tablewrapper">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Navn/Dato</th>
                {days.map((day, index) => (
                  <th key={index}>{formatDateTable(day)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {camp.Participants.map((participant, index) => (
                <tr key={index}>
                  <td>{participant.name}</td>
                  {days.map((day, dayIndex) => {
                    const attendance = participant.attendance.find(
                      (att) => att.date === formatDateTable(day),
                    );
                    return (
                      <td key={dayIndex}>
                        <div className="meals">
                          <span title="Breakfast">
                            {attendance &&
                            attendance.meals.includes("breakfast")
                              ? "🍳"
                              : ""}
                          </span>
                          <span title="Lunch">
                            {attendance && attendance.meals.includes("lunch")
                              ? "🥪"
                              : ""}
                          </span>
                          <span title="Dinner">
                            {attendance && attendance.meals.includes("dinner")
                              ? "🍽️"
                              : ""}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td>Total</td>
                {days.map((day, dayIndex) => {
                  let breakfastCount = 0;
                  let lunchCount = 0;
                  let dinnerCount = 0;

                  camp.Participants.forEach((participant) => {
                    const attendance = participant.attendance.find(
                      (att) => att.date === formatDateTable(day),
                    );
                    if (attendance) {
                      if (attendance.meals.includes("breakfast")) {
                        breakfastCount++;
                      }
                      if (attendance.meals.includes("lunch")) {
                        lunchCount++;
                      }
                      if (attendance.meals.includes("dinner")) {
                        dinnerCount++;
                      }
                    }
                  });

                  return (
                    <td key={dayIndex}>
                      <div className="meals">
                        <span title="Breakfast">{breakfastCount}</span>
                        <span title="Lunch">{lunchCount}</span>
                        <span title="Dinner">{dinnerCount}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="buttonWrapper">
          {!isPastStartDate && !isPastEndDate && (
            <Link to="attend" className="campButton">
              <button type="button" className="editButton">
                {isUserSignedUp ? (
                  <>Ret tilmelding {<RiEdit2Line />}</>
                ) : (
                  "Tilmeld"
                )}
              </button>
            </Link>
          )}

          {isPastStartDate && (
            <button type="button" disabled>
              {isPastEndDate ? "Lejren er slut" : "Lejren er i gang"}
            </button>
          )}
        </div>

        {session.usertype === "admin" && (
          <div className="adminButtons">
            <Link to="edit" className="campButton">
              <button type="button" className="editButton">
                Rediger lejr <RiEdit2Line />
              </button>
            </Link>
            <Form method="post" onSubmit={handleDelete} className="warning">
              <button name="_action" value="delete" type="submit">
                Slet lejr
              </button>
            </Form>
          </div>
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

  if (formData.get("_action") === "delete") {
    if (session.data.usertype === "admin") {
      await mongoose.models.camps.findByIdAndDelete(params.id);
      return redirect("/lejre");
    } else {
      return json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  await camp.save();
  return null;
}
