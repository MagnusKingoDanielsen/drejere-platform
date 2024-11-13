import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { getSession } from "~/services/session.server";
import { RiAccountCircleLine } from "react-icons/ri";
import { RiPrinterLine } from "react-icons/ri";
import { RiLogoutBoxRLine } from "react-icons/ri";
import logo from "../../img/Logo_hvid.svg";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return { user: null };
  }
  return { user: session.data.usertype };
}

const Nav = () => {
  const { user: usertype } = useLoaderData();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };
  const handlePrint = () => {
    window.print();
  };
  if (!usertype) {
    return null;
  }

  return (
    <header className="sticky-header">
      <nav className="nav-container">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
        {isMobile ? (
          <>
            <button className="burger-menu" onClick={toggleMenu}>
              ☰
            </button>
            {isMenuOpen && (
              <ul className="nav-menu-mobile">
                <li>
                  <Link to="/lejr" onClick={() => setIsMenuOpen(false)}>
                    Lejre
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tidligereLejre"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tidligere Lejre
                  </Link>
                </li>
                <li>
                  <Link to="/drejerListe" onClick={() => setIsMenuOpen(false)}>
                    Drejerliste
                  </Link>
                </li>
                <li>
                  <Link to="/noegleListe" onClick={() => setIsMenuOpen(false)}>
                    Nøgleliste
                  </Link>
                </li>
                {usertype === "admin" && (
                  <li className="dropdown">
                    <button className="dropbtn" onClick={toggleAdminMenu}>
                      Admin
                    </button>
                    {isAdminMenuOpen && (
                      <div className="dropdown-content">
                        <Link
                          to="/opretLejr"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          opret lejr
                        </Link>
                        <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                          opret drejer
                        </Link>
                      </div>
                    )}
                  </li>
                )}
                <li className="printerIcon">
                  <button onClick={handlePrint} className="printerIconButton">
                    <RiPrinterLine />
                  </button>
                </li>
                <li className="profileIcon">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <RiAccountCircleLine />
                  </Link>
                </li>
                <li className="logoutIcon">
                  <Link to="/logout" onClick={() => setIsMenuOpen(false)}>
                    <RiLogoutBoxRLine />
                  </Link>
                </li>
              </ul>
            )}
          </>
        ) : (
          <ul className="nav-menu">
            <li>
              <Link to="/lejre">Lejre</Link>
            </li>
            <li>
              <Link to="/tidligereLejre">Tidligere Lejre</Link>
            </li>
            <li>
              <Link to="/drejerListe">Drejerliste</Link>
            </li>
            <li>
              <Link to="/noegleListe">Nøgleliste</Link>
            </li>
            {usertype === "admin" && (
              <li className="dropdown">
                <button className="dropbtn">Admin</button>
                <div className="dropdown-content">
                  <Link to="/opretLejr">opret lejr</Link>
                  <Link to="/signup">opret drejer</Link>
                </div>
              </li>
            )}
            <li className="printerIcon">
              <button onClick={handlePrint} className="printerIconButton">
                <RiPrinterLine />
              </button>
            </li>
            <li className="profileIcon">
              <Link to="/profile">
                <RiAccountCircleLine />
              </Link>
            </li>
            <li className="logoutIcon">
              <Link to="/logout">
                <RiLogoutBoxRLine />
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Nav;
