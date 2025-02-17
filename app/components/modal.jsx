import PropTypes from "prop-types";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNavRef } from "../utils/navRef";

const Modal = ({ children }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const navRef = getNavRef();

  const handleClickOutside = useCallback(
    (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        (!navRef.current || !navRef.current.contains(event.target))
      ) {
        navigate("/"); // Redirect to the landing page
      }
    },
    [navigate, modalRef, navRef],
  );
  const handleEscapeKey = useCallback(
    (event) => {
      if (event.key === "Escape") {
        navigate("/"); // Redirect to the landing page
      }
    },
    [navigate],
  );

  const handleClickInside = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleClickOutside, handleEscapeKey]);

  return (
    <div
      className="modal-overlay"
      onClick={handleClickOutside}
      onKeyDown={handleEscapeKey}
      role="button"
      tabIndex={0}
    >
      <div
        className="modal-content"
        ref={modalRef}
        onClick={handleClickInside}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            handleClickInside(event);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Modal;
