import React from 'react';
import './nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/home">VECTOR INDUSTRIES</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link text-light" to="/home">Home</Link></li>
            <li className="nav-item"><Link className="nav-link text-light" to="/aboutas">About</Link></li>
            <li className="nav-item"><Link className="nav-link text-light" to="/contactus">Contact</Link></li>
            <li className="nav-item"><Link className="nav-link text-light" to="/windows">Windows</Link></li>
            {user ? (
              <li className="nav-item dropdown ms-2">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  id="userDropdown"
                >
                  <span className="user-avatar-badge">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  {user.username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item py-2" to="/userdashboard#details">
                      <i className="bi bi-person-badge me-2"></i>User Details
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/userdashboard#status">
                      <i className="bi bi-hourglass-split me-2"></i>Requirement Status
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/userdashboard#quotations">
                      <i className="bi bi-receipt me-2"></i>Quotations
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/userdashboard#bookings">
                      <i className="bi bi-calendar2-check me-2"></i>My Bookings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-light" to="/signuppage">Register</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-primary" to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
