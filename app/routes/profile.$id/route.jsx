import mongoose from "mongoose";
import { getSession } from "../../services/session.server";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import Modal from "../../components/modal";
import { RiEdit2Line } from "react-icons/ri";
import { format } from "date-fns";

export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }

  const user = await mongoose.models.drejers
    .findById(params.id)
    .select("-password -__v  -lastLogin -createdAt -updatedAt")
    .lean()
    .exec();

  return { session: session.data, user: user };
}

export default function Profil() {
  const { user } = useLoaderData();

  const getFieldValue = (value) => (value ? value : "-");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy");
  };
  return (
    <Modal>
      <div className="profileContainer">
        <h1>Profil</h1>
        <ul className="profileList">
          <li>
            <strong>Brugernavn:</strong> {getFieldValue(user.username)}
          </li>
          <li>
            <strong>Email:</strong> {getFieldValue(user.email)}
          </li>
          <li>
            <strong>Telefon nr:</strong> {getFieldValue(user.phone)}
          </li>
          <li>
            <strong>Addresse:</strong> {getFieldValue(user.address)}
          </li>
          <li>
            <strong>Fødselsdag:</strong> {formatDate(user.birthday)}
          </li>
          <li>
            <strong>Type:</strong> {getFieldValue(user.type)}
          </li>
          <li id="activities">
            <strong>Aktiviteter:</strong>
            <ul className="activitiesList">
              {user.activities.length > 0 ? (
                user.activities.map((activitiy, index) => (
                  <li key={index}>{activitiy}</li>
                ))
              ) : (
                <span>-</span>
              )}
            </ul>
          </li>
          <li id="tags">
            <strong>Tags:</strong>
            <ul className="tagsList">
              {user.tags.length > 0 ? (
                user.tags.map((tag, index) => <li key={index}>{tag}</li>)
              ) : (
                <span>-</span>
              )}
            </ul>
          </li>
        </ul>
        <div className="editButtonContainer">
          <Link to={`/profil/${user._id}/edit`}>
            <button className="editButton">
              Rediger <RiEdit2Line />
            </button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
