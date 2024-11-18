import PropTypes from "prop-types";

const Modal = ({ children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>
  );
};
Modal.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Modal;
