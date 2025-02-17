import { getSession } from "../../services/session.server.jsx";
import { redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import mongoose from "mongoose";
import Modal from "../../components/modal";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const drejers = await mongoose.models.drejers
    .find()
    .select("username phone email tags activities type")
    .lean()
    .exec();
  const sortedDrejers = drejers.sort((a, b) =>
    a.username.localeCompare(b.username),
  );
  return { session: session.data, drejers: sortedDrejers };
}

export default function DrejerListe() {
  const userTypes = ["Admin", "Drejer", "Barn"];
  const { drejers } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleTypeChange = (event) => {
    const { value, checked } = event.target;
    setSelectedTypes((prevSelectedTypes) =>
      checked
        ? [...prevSelectedTypes, value]
        : prevSelectedTypes.filter((type) => type !== value),
    );
  };
  const filteredDrejers = drejers.filter((drejer) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      drejer.username.toLowerCase().includes(searchLower) ||
      drejer.phone.toLowerCase().includes(searchLower) ||
      drejer.email.toLowerCase().includes(searchLower) ||
      drejer.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      drejer.activities?.some((activity) =>
        activity.toLowerCase().includes(searchLower),
      );
    const matchesSelectedTypes =
      selectedTypes.length === 0 || selectedTypes.includes(drejer.type);
    return matchesSearchTerm && matchesSelectedTypes;
  });

  return (
    <Modal>
      <div>
        <h1>Drejerliste</h1>
        <div className="searchWrapper">
          <input
            type="text"
            placeholder="Søg efter navn, tlf, email, tags eller aktiviteter"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div>
            {userTypes.map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  value={type}
                  onChange={handleTypeChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        <div className="tablewrapper">
          <table className="Tabel">
            <thead>
              <tr>
                <th>Navn</th>
                <th>Telefon nr:</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrejers.map((drejer) => (
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
