import "./SlideButton.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function SlideButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate("/requirement");
    } else {
      navigate("/login", { state: { from: "/requirement" } });
    }
  };

  return (
    <button className="slide-btn" onClick={handleClick}>
      <span>Requirement  <i className="bi bi-receipt-cutoff"></i></span>
    </button>
  );
}

export default SlideButton;
