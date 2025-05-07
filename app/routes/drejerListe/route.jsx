import { getSession } from "../../services/session.server.jsx";
import { Form, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import mongoose from "mongoose";
import Modal from "../../components/modal";
import { json } from "node:stream/consumers";

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
  const userTypes = ["Aspirant", "Barn", "Drejer"];
  const navigate = useNavigate(); // Hook to programmatically navigate
  const { drejers, session } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]); // State to store selected emails

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleTypeChange = (event) => {
    const { value, checked } = event.target;
    setSelectedTypes((prevSelectedTypes) => {
      if (checked) {
        // If "Drejer" is selected, also include "Admin"
        if (value === "Drejer") {
          return [...new Set([...prevSelectedTypes, value, "Admin"])];
        }
        return [...prevSelectedTypes, value];
      } else {
        // If "Drejer" is deselected, remove both "Drejer" and "Admin"
        if (value === "Drejer") {
          return prevSelectedTypes.filter(
            (type) => type !== value && type !== "Admin",
          );
        }
        return prevSelectedTypes.filter((type) => type !== value);
      }
    });
  };
  const handleGetMail = (event) => {
    const { value, checked } = event.target;
    setSelectedEmails((prevSelectedEmails) => {
      if (checked) {
        // Add the email if checked
        console.log("checked", prevSelectedEmails);
        return [...prevSelectedEmails, value];
      } else {
        // Remove the email if unchecked
        console.log("unchecked", prevSelectedEmails);
        return prevSelectedEmails.filter((email) => email !== value);
      }
    });
  };
  const copyEmailsToClipboard = () => {
    const emailString = selectedEmails.join(", ");
    navigator.clipboard.writeText(emailString).then(() => {
      if (selectedEmails.length === 0) {
        alert("Ingen emails valgt!");
        return;
      }
      // Show a success message after copying
      alert("Emails kopieret til udklipsholderen!");
    });
  };
  const handleEdit = (userId) => {
    navigate(`/profil/${userId}/edit`); // Navigate to the edit page for the user
  };
  const handleDelete = (event) => {
    if (!window.confirm("Er du sikker på du vil slette denne aktivitet?")) {
      event.preventDefault();
    }
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
            className="search"
            type="text"
            placeholder="Søg efter navn, tlf, email, tags eller aktiviteter"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="typeFilter">
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
        <div className="tablewrapper" style={{ maxHeight: "400px" }}>
          <table className="Tabel">
            <thead>
              <tr>
                <th>Navn </th>
                <th>Telefon nr:</th>
                <th>Email</th>
                <th className="getMail">
                  <button onClick={copyEmailsToClipboard}>Kopier Emails</button>
                </th>
                <th style={{ width: "175px", textAlign: "center" }}>
                  {session.usertype === "Admin" && <>Admin muligheder</>}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrejers.map((drejer) => (
                <tr key={drejer._id}>
                  <td>{drejer.username}</td>
                  <td>{drejer.phone}</td>
                  <td>{drejer.email} </td>
                  <td className="getMail">
                    <input
                      type="checkbox"
                      value={drejer.email}
                      onChange={handleGetMail}
                    />
                  </td>
                  <td>
                    {session.usertype === "Admin" && (
                      <div className="adminButtons">
                        <button
                          className="editButton"
                          onClick={() => handleEdit(drejer._id)}
                        >
                          Edit
                        </button>
                        <Form method="post" onSubmit={handleDelete}>
                          <input
                            type="hidden"
                            name="drejerId"
                            value={drejer._id}
                          />
                          <button
                            type="submit"
                            name="actionType"
                            value="delete"
                            className="warningbutton"
                          >
                            Delete
                          </button>
                        </Form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.usertype === "Admin") {
    const formData = await request.formData();
    const actionType = formData.get("actionType");
    const drejerId = formData.get("drejerId");

    if (actionType === "delete") {
      await mongoose.models.drejers.deleteOne({ _id: drejerId });
    }

    return null;
  } else {
    return json(
      {
        error:
          "Du har ikke tilladelse til at lave denne ændring. Kontakt venligst en admin",
      },
      { status: 403 },
    );
  }
}
