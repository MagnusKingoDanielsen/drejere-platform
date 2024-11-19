import { Form, redirect, useActionData } from "@remix-run/react";
import { commitSession, getSession } from "../services/session.server.jsx";
import { login } from "~/services/encryption.server.jsx";
import Modal from "../components/modal";

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
    <Modal>
      <div className="loginPage">
        <div className="loginContainer">
          <Form method="post" className="loginForm">
            <h1>Login</h1>
            <input
              placeholder="username"
              name="username"
              type="text"
              required
            />
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
    </Modal>
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
