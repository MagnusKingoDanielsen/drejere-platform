import { getSession } from "../../services/session.server.jsx";
import { redirect, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const drejers = await mongoose.models.drejers
    .find()
    .select("username phone email")
    .lean()
    .exec();
  return { session: session.data, drejers: drejers };
}

export default function DrejerListe() {
  const { drejers } = useLoaderData();
  return (
    <Modal>
      <div>
        <p>Drejerliste</p>
        <div className="tablewrapper">
          <table className="Tabel">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {drejers.map((drejer) => (
                <tr key={drejer._id}>
                  <td>{drejer.username}</td>
                  <td>{drejer.phone}</td>
                  <td>{drejer.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
