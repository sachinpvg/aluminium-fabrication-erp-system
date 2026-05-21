import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import Requirementdisplaydata from './comp/requirementdisplaydata';
import AdminWindows from './comp/AdminWindows';
import AdminBookings from './comp/AdminBookings';
import AdminWorkers from './comp/AdminWorkers';
import AdminWorkerApprovals from './comp/AdminWorkerApprovals';
import AdminMessages from './comp/AdminMessages';
import AdminAnalytics from './comp/AdminAnalytics';
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const stored = localStorage.getItem('adminUser');
    if (!token) {
      navigate('/adminlogin');
    } else {
      setAuthed(true);
      if (stored) setAdminUser(JSON.parse(stored));
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/adminlogin');
  };

  if (!authed) return null;

  return (
    <div className="container-fluid admin-bg">
      <div className="row min-vh-100">

        {/* Sidebar */}
        <div className={`col-sm-3 col-md-2 p-0 sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="d-flex flex-column p-3 text-white h-100">
            <span className="fs-4 text-center fw-bold mb-3">ADMIN</span>
            <hr />
            <div className="nav flex-column nav-pills">
              <button className="nav-link active mt-2" data-bs-toggle="pill" data-bs-target="#home">Dashboard</button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#win-mgmt">
                <i className="bi bi-window me-1"></i>Windows
              </button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#win-bookings">
                <i className="bi bi-calendar2-check me-1" />Bookings
              </button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#worker-approvals-tab">
                <i className="bi bi-person-check me-1" />Worker Approvals
              </button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#workers-tab">
                <i className="bi bi-people me-1" />Workers
              </button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#profile">
                <i className="bi bi-graph-up me-1" />Analytics Overview
              </button>
              <button className="nav-link mt-2" data-bs-toggle="pill" data-bs-target="#messages">Messages</button>
              <button className="btn btn-danger mt-4" onClick={handleAdminLogout}>Logout</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-sm-10 col-md-10 p-4">
          <button className="btn btn-primary mb-3" onClick={toggleSidebar}>
            <i className="bi bi-layout-sidebar"></i>
          </button>

          <div className="content-card">
            <div className="tab-content">

              {/* HOME TAB — Requirements */}
              <div className="tab-pane fade show active" id="home">
                <h4>Requirements Panel</h4>
                <div className="mt-3">
                  <Requirementdisplaydata />
                </div>
              </div>

              {/* WINDOWS MANAGEMENT TAB */}
              <div className="tab-pane fade" id="win-mgmt">
                <AdminWindows />
              </div>

              {/* BOOKINGS TAB */}
              <div className="tab-pane fade" id="win-bookings">
                <AdminBookings />
              </div>

              {/* WORKER APPROVALS TAB */}
              <div className="tab-pane fade" id="worker-approvals-tab">
                <AdminWorkerApprovals />
              </div>

              {/* WORKERS TAB */}
              <div className="tab-pane fade" id="workers-tab">
                <AdminWorkers />
              </div>

              {/* PROFILE TAB */}
              <div className="tab-pane fade" id="profile">
                <AdminAnalytics />
              </div>

              {/* MESSAGES TAB */}
              <div className="tab-pane fade" id="messages">
                <AdminMessages />
              </div>

             

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}