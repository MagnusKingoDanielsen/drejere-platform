import { Form, redirect, useActionData } from "@remix-run/react";
import { getSession } from "../services/session.server.jsx";
import mongoose from "mongoose";
import { hashPassword } from "../services/encryption.server.jsx";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/");
  }
  return session.data;
}

export default function LoginPage() {
  const error = useActionData();
  return (
    <div className="signupPage">
      <div className="signupContainer">
        <Form method="post">
          <h1>Sign up</h1>
          <input placeholder="email" name="userEmail" type="email" required />
          <input placeholder="username" name="userName" type="text" required />
          <input
            placeholder="password"
            name="userPassword"
            type="password"
            required
          />
          <input placeholder="mobilnr" name="userPhone" type="text" required />
          <input
            placeholder="addresse"
            name="userAddress"
            type="text"
            required
          />
          {error && <p>{error}</p>}
          <button>opret drejer</button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const { userEmail, userPassword, userName, userPhone, userAddress } =
    Object.fromEntries(formData);
  //check if email is valid
  let regexForEmailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (regexForEmailValidation.test(userEmail)) {
    const users = await mongoose.models.drejers.find({});
    //check if email is already in use
    if (users.some((user) => user.email === userEmail)) {
      return "error", "Email already in use. Please try again.";
    }
    //check if username is already in use
    if (users.some((user) => user.username === userName)) {
      return "error", "Username already in use. Please try again.";
    }
    const session = await getSession();
    session.set("user", true);
    const date = new Date().toLocaleString() + "";
    const password = await hashPassword(userPassword);
    const email = userEmail;
    const username = userName;
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
        lastLogin,
      }),
      redirect("/login")
    );
  } else {
    return "error", "Invalid email address. Please try again.";
  }
}
