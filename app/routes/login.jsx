import { Form, redirect, useActionData } from "@remix-run/react";
import { commitSession, getSession } from "../services/session.server.jsx";
import { login } from "~/services/encryption.server.jsx";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.data.user) {
    return redirect("/");
  }
  return session.data;
}

export default function LoginPage() {
  const error = useActionData();
  return (
    <div className="loginModal">
      <div className="loginContainer">
        <Form method="post" className="loginForm">
          <h1>Login</h1>
          <div className="formGroup">
            <label htmlFor="username">Brugernavn:</label>
            <input
              id="username"
              placeholder="Brugernavn"
              name="username"
              type="text"
              required
            />
          </div>
          <div className="formGroup">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              placeholder="Password"
              name="password"
              type="password"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="center">
            <button type="submit">Log in</button>
          </div>
        </Form>
        <p className="center">
          Hvis du ikke har et brugernavn/password så send en mail til
          ick@assenbaek.dk hvori du skriver: dit fulde navn, det ønskede
          brugernavn og password.
        </p>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const { username, password } = Object.fromEntries(formData);

  const loginResult = await login(username, password);

  if (!loginResult || !loginResult.result) {
    return "Invalid username or password";
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("user", true);
  session.set("username", loginResult.username);
  session.set("usertype", loginResult.usertype);

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
