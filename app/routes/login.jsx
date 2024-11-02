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
    <div className="loginPage">
      <div className="loginContainer">
        <Form method="post" className="loginForm">
          <h1>Login</h1>
          <input placeholder="username" name="username" type="text" required />
          <input
            placeholder="password"
            name="password"
            type="password"
            required
          />
          {error && <p>{error}</p>}
          <button>Log in</button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const { username, password } = Object.fromEntries(formData);
  const { result } = await login(username, password);
  if (!result) {
    return "Invalid username or password";
  }

  const session = await getSession();
  session.set("user", true);
  session.set("username", username);
  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
