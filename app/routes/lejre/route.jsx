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
  const camps = await mongoose.models.camps
    .find()
    .select("-EndDate -campLeader -CampDescription -__v")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return { session: session.data, camps: camps };
}

export default function CampPage() {
  const { camps } = useLoaderData();
  const filteredCamps = camps.filter((camp) => {
    return new Date(camp.StartDate) > new Date();
  });
  const sortedCamps = filteredCamps.sort((a, b) =>
    a.StartDate.localeCompare(b.StartDate),
  );
  return (
    <Modal>
      <div>
        <h1>Lejre</h1>
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
