import { useLoaderData, redirect, useFetcher } from "@remix-run/react";
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

  return { session: session.data, camp: camp };
}

export default function AttendCampPage() {
  const { camp, session } = useLoaderData();
  const userName = session.username;
  const fetcher = useFetcher();

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

  const userAttendance =
    camp.Participants.find((participant) => participant.name === userName)
      ?.attendance || [];

  const isChecked = (day, meal) => {
    const attendance = userAttendance.find(
      (att) => att.date === formatDateTable(day),
    );
    return attendance?.meals.includes(meal) || false;
  };

  const renderCheckboxes = (day, isStartDate, isEndDate) => {
    const checkboxes = [];
    const startTime = new Date(camp.StartDate).getHours();
    const endTime = new Date(camp.EndDate).getHours();

    const breakfastCheckbox = (
      <input
        type="checkbox"
        key={`${formatDateTable(day)}-breakfast`}
        name={`${formatDateTable(day)}-breakfast`}
        defaultChecked={isChecked(day, "breakfast")}
      />
    );
    const lunchCheckbox = (
      <input
        type="checkbox"
        key={`${formatDateTable(day)}-lunch`}
        name={`${formatDateTable(day)}-lunch`}
        defaultChecked={isChecked(day, "lunch")}
      />
    );
    const dinnerCheckbox = (
      <input
        type="checkbox"
        key={`${formatDateTable(day)}-dinner`}
        name={`${formatDateTable(day)}-dinner`}
        defaultChecked={isChecked(day, "dinner")}
      />
    );
    const disabledCheckbox = (
      <input
        type="checkbox"
        key={`${formatDateTable(day)}-disabled`}
        disabled
        style={{ visibility: "hidden" }}
      />
    );

    if (isStartDate) {
      if (startTime <= 9) checkboxes.push(breakfastCheckbox);
      else checkboxes.push(disabledCheckbox);
      if (startTime <= 13) checkboxes.push(lunchCheckbox);
      else checkboxes.push(disabledCheckbox);
      if (startTime <= 18) checkboxes.push(dinnerCheckbox);
      else checkboxes.push(disabledCheckbox);
    } else if (isEndDate) {
      if (endTime >= 9) checkboxes.push(breakfastCheckbox);
      else checkboxes.push(disabledCheckbox);
      if (endTime >= 13) checkboxes.push(lunchCheckbox);
      else checkboxes.push(disabledCheckbox);
      if (endTime >= 18) checkboxes.push(dinnerCheckbox);
      else checkboxes.push(disabledCheckbox);
    } else {
      checkboxes.push(breakfastCheckbox);
      checkboxes.push(lunchCheckbox);
      checkboxes.push(dinnerCheckbox);
    }

    return checkboxes;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const attendance = [];

    days.forEach((day) => {
      const dayAttendance = [];
      if (formData.get(`${formatDateTable(day)}-breakfast`))
        dayAttendance.push("breakfast");
      if (formData.get(`${formatDateTable(day)}-lunch`))
        dayAttendance.push("lunch");
      if (formData.get(`${formatDateTable(day)}-dinner`))
        dayAttendance.push("dinner");
      attendance.push({ date: formatDateTable(day), meals: dayAttendance });
    });

    fetcher.submit(
      {
        userName,
        attendance: JSON.stringify(attendance),
        _action: "save",
      },
      { method: "post" },
    );
  };

  const handleDelete = (event) => {
    if (!confirm("Are you sure you want to delete your attendance?")) {
      event.preventDefault();
    } else {
      fetcher.submit(
        {
          userName,
          _action: "delete",
        },
        { method: "post" },
      );
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

  const isUserSignedUp = camp.Participants.some(
    (participant) => participant.name === userName,
  );

  return (
    <Modal>
      <form onSubmit={handleSubmit}>
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
            Du kan ændre i din tilmelding indtil lejren går i gang. Ændrer du
            din tilmelding herefter, skal du stadig betale for de måltider, hvor
            du ikke spiser med. Det gælder også for drejere, der er tilmeldt
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
                <tr>
                  <td>{userName}</td>
                  {days.map((day, dayIndex) => (
                    <td key={dayIndex}>
                      <div className="meals">
                        {renderCheckboxes(
                          day,
                          dayIndex === 0,
                          dayIndex === days.length - 1,
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="buttonWrapper">
            <button type="submit">Gem ændringer</button>
            {isUserSignedUp && (
              <button type="button" onClick={handleDelete}>
                Fjern tilmelding
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const userName = formData.get("userName");
  const actionType = formData.get("_action");

  const camp = await mongoose.models.camps.findById(params.id).exec();
  if (!camp) {
    throw new Response("Not found", { status: 404 });
  }

  const participantIndex = camp.Participants.findIndex(
    (participant) => participant.name === userName,
  );
  if (actionType === "save") {
    const attendance = JSON.parse(formData.get("attendance"));

    if (participantIndex !== -1) {
      // Update existing participant's attendance
      camp.Participants[participantIndex].attendance = attendance;
      camp.markModified(`Participants.${participantIndex}.attendance`);
    } else {
      // Add new participant
      camp.Participants.push({ name: userName, attendance });
    }
  } else if (actionType === "delete") {
    if (participantIndex !== -1) {
      // Remove participant
      camp.Participants.splice(participantIndex, 1);
    }
  }

  await camp.save();

  return redirect(`/lejr/${params.id}`);
}
