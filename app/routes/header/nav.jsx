import { Link, useLoaderData } from "react-router-dom";
import { getSession } from "~/services/session.server";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return { user: null };
  }
  return { user: session.data.usertype };
}

const Nav = () => {
  const { user: usertype } = useLoaderData();
  if (!usertype) {
    return null;
  }
  return (
    <header className="sticky-header">
      <nav className="nav-container">
        <ul className="nav-menu">
          <li>
            <Link to="/camp">Lejre</Link>
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
                <Link to="/createcamp">opret lejr</Link>
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
