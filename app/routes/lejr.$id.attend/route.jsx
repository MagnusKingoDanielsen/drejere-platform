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

    if (isStartDate) {
      if (startTime <= 9)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-breakfast`}
            name={`${formatDateTable(day)}-breakfast`}
            defaultChecked={isChecked(day, "breakfast")}
          />,
        );
      if (startTime <= 13)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-lunch`}
            name={`${formatDateTable(day)}-lunch`}
            defaultChecked={isChecked(day, "lunch")}
          />,
        );
      if (startTime <= 18)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-dinner`}
            name={`${formatDateTable(day)}-dinner`}
            defaultChecked={isChecked(day, "dinner")}
          />,
        );
    } else if (isEndDate) {
      if (endTime >= 9)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-breakfast`}
            name={`${formatDateTable(day)}-breakfast`}
            defaultChecked={isChecked(day, "breakfast")}
          />,
        );
      if (endTime >= 13)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-lunch`}
            name={`${formatDateTable(day)}-lunch`}
            defaultChecked={isChecked(day, "lunch")}
          />,
        );
      if (endTime >= 18)
        checkboxes.push(
          <input
            type="checkbox"
            key={`${formatDateTable(day)}-dinner`}
            name={`${formatDateTable(day)}-dinner`}
            defaultChecked={isChecked(day, "dinner")}
          />,
        );
    } else {
      checkboxes.push(
        <input
          type="checkbox"
          key={`${formatDateTable(day)}-breakfast`}
          name={`${formatDateTable(day)}-breakfast`}
          defaultChecked={isChecked(day, "breakfast")}
        />,
      );
      checkboxes.push(
        <input
          type="checkbox"
          key={`${formatDateTable(day)}-lunch`}
          name={`${formatDateTable(day)}-lunch`}
          defaultChecked={isChecked(day, "lunch")}
        />,
      );
      checkboxes.push(
        <input
          type="checkbox"
          key={`${formatDateTable(day)}-dinner`}
          name={`${formatDateTable(day)}-dinner`}
          defaultChecked={isChecked(day, "dinner")}
        />,
      );
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
      },
      { method: "post" },
    );
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
      <form onSubmit={handleSubmit}>
        <div className="tablewrapper">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
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
                    {renderCheckboxes(
                      day,
                      dayIndex === 0,
                      dayIndex === days.length - 1,
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <button type="submit">Save Attendance</button>
      </form>
    </Modal>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const userName = formData.get("userName");
  const attendance = JSON.parse(formData.get("attendance"));

  const camp = await mongoose.models.camps.findById(params.id).exec();
  if (!camp) {
    throw new Response("Not found", { status: 404 });
  }

  const participantIndex = camp.Participants.findIndex(
    (participant) => participant.name === userName,
  );

  if (participantIndex !== -1) {
    // Update existing participant's attendance
    camp.Participants[participantIndex].attendance = attendance;
    camp.markModified(`Participants.${participantIndex}.attendance`);
  } else {
    // Add new participant
    camp.Participants.push({ name: userName, attendance });
  }

  await camp.save();

  return redirect(`/lejr/${params.id}`);
}
