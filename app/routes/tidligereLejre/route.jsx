import { Link, Outlet, useLoaderData } from "react-router-dom";
import { redirect } from "@remix-run/react";
import { getSession } from "../../services/session.server.jsx";
import mongoose from "mongoose";
import Modal from "../../components/modal";
import { TbUsers } from "react-icons/tb";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  const currentDate = new Date();
  const camps = await mongoose.models.camps
    .find({ EndDate: { $lt: currentDate } })
    .select("-EndDate -campLeader -CampDescription -__v")
    .lean()
    .exec();

  return { session: session.data, camps: camps };
}

export default function TidligereLejre() {
  const { camps } = useLoaderData();
  const sortedCamps = camps.sort((b, a) =>
    a.StartDate.localeCompare(b.StartDate),
  );

  return (
    <Modal>
      <div>
        <h1>Tidligere lejre</h1>
        <div className="tablewrapper">
          <table className="Tabel">
            <thead>
              <tr>
                <th>Lejre </th>
                <th>Start dato</th>
                <th id="ParticipantsRow">
                  <TbUsers />
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedCamps.map((camp) => (
                <tr key={camp._id}>
                  <td>{camp.CampName}</td>
                  <td>
                    {new Date(camp.StartDate).toLocaleDateString()}
                    <br />
                    {new Date(camp.StartDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td id="ParticipantsRow">{camp.Participants.length}</td>
                  <td id="ButtonRight">
                    <Link to={`/lejr/${camp._id}`}>
                      <button> Læs mere</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Outlet />
      </div>
    </Modal>
  );
}
