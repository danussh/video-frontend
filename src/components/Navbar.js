import React from "react";
import { Link, useHistory } from "react-router-dom";

const Navbar = () => {
  const history = useHistory();

  const logout = () => {
    sessionStorage.clear();
    history.push("/");
  };
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">
          TakeLeap
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            {!sessionStorage.getItem("accesToken") ? (
              <>
                <li className="nav-item active">
                  <Link className="nav-link" to="/">
                    Login
                  </Link>
                </li>
                <li className="nav-item active">
                  <Link className="nav-link" to="/signup">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item active">
                  <a className="nav-link" href="/dashboard">
                    DashBoard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/timelogs">
                    Time Logs
                  </a>
                </li>
                <button className="btn btn-danger " onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
