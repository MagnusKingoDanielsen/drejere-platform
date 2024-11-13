import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "../../services/session.server";
import { Link } from "react-router-dom";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return redirect("/login");
  }
  //   const username = session.data.username;
  const usertype = session.data.usertype;

  return { usertype };
}

const Nav = () => {
  const { usertype } = useLoaderData();
  return (
    <header className="sticky-header">
      <nav className="nav-container">
        <ul className="nav-menu">
          <li>
            <Link to="lejre">Lejre</Link>
          </li>
          <li>
            <Link to="/tidligere-lejre">Tidligere Lejre</Link>
          </li>
          <li>
            <Link to="/drejerliste">Drejerliste</Link>
          </li>
          <li>
            <Link to="/noegleliste">Nøgleliste</Link>
          </li>
          {usertype === "admin" && (
            <li className="dropdown">
              <button className="dropbtn">Admin</button>
              <div className="dropdown-content">
                <Link to="/admin/option1">Option 1</Link>
                <Link to="/admin/option2">Option 2</Link>
                <Link to="/admin/option3">Option 3</Link>
              </div>
            </li>
          )}
          <li>
            <Link to="/drejers-online">Drejers Online</Link>
          </li>
          <li>
            <Link to="/print">
              <i className="fas fa-print"></i>
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <i className="fas fa-user"></i>
            </Link>
          </li>
          <li>
            <Link to="/logout">
              <i className="fas fa-sign-out-alt"></i>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
