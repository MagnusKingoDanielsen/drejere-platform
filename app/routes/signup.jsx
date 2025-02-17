import { Form, redirect, useActionData } from "@remix-run/react";
import { getSession } from "../services/session.server.jsx";
import mongoose from "mongoose";
import { hashPassword } from "../services/encryption.server.jsx";
import Modal from "../components/modal";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user || session.data.usertype !== "Admin") {
    return redirect("/");
  }
  return session.data;
}

export default function LoginPage() {
  const error = useActionData();
  return (
    <Modal>
      <div className="signupPage">
        <div className="signupContainer">
          <Form method="post" className="signupForm">
            <h1>Opret drejer</h1>
            <div className="formGroup">
              <label htmlFor="userEmail">Email:</label>
              <input
                id="userEmail"
                placeholder="Email"
                name="userEmail"
                type="email"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="userName">Brugernavn:</label>
              <input
                id="userName"
                placeholder="Brugernavn"
                name="userName"
                type="text"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="userPassword">Password:</label>
              <input
                id="userPassword"
                placeholder="Password"
                name="userPassword"
                type="password"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="userPhone">Mobilnr:</label>
              <input
                id="userPhone"
                placeholder="Mobilnr"
                name="userPhone"
                type="text"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="userAddress">Addresse:</label>
              <input
                id="userAddress"
                placeholder="Addresse"
                name="userAddress"
                type="text"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="userType">Brugertype:</label>
              <select id="userType" name="userType" required>
                <option value="">Vælg brugertype</option>
                <option value="Admin">Admin</option>
                <option value="Aspirant">Aspirant</option>
                <option value="Barn">Barn</option>
                <option value="Drejer">Drejer</option>
              </select>
            </div>
            {error && <p className="error">{error}</p>}
            <div className="center">
              <button type="submit">Opret drejer</button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const {
    userEmail,
    userPassword,
    userName,
    userPhone,
    userAddress,
    userType,
  } = Object.fromEntries(formData);

  const session = await getSession(request.headers.get("cookie"));

  if (session.data.usertype === "Admin") {
    //check if email is valid
    let regexForEmailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (regexForEmailValidation.test(userEmail)) {
      const users = await mongoose.models.drejers.find({});
      //check if email is already in use
      if (users.some((user) => user.email === userEmail)) {
        return "error", "Email allerede i brug.";
      }
      //check if username is already in use
      if (users.some((user) => user.username === userName)) {
        return "error", "Brugernavn allerede i brug.";
      }
      const session = await getSession();
      session.set("user", true);
      const date = new Date().toLocaleString() + "";
      const password = await hashPassword(userPassword);
      const email = userEmail;
      const username = userName;
      const type = userType;
      const phone = userPhone;
      const address = userAddress;
      const lastLogin = new Date().toLocaleDateString("en-GB");

      return (
        await mongoose.models.drejers.create({
          date,
          email,
          password,
          username,
          phone,
          address,
          type,
          lastLogin,
        }),
        redirect("/login")
      );
    } else {
      return "error", "fejl i email. prøv igen.";
    }
  } else {
    throw new Response(
      "Du har ikke tilladelse til at lave denne ændring. Kontakt venligst en admin",
      { status: 403 },
    );
  }
}
