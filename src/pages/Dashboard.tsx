
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordManager from "../components/PasswordManager";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isLoggedIn = localStorage.getItem("password-manager-auth");
    if (isLoggedIn !== "true") {
      navigate("/");
    }
  }, [navigate]);

  return <PasswordManager />;
};

export default Dashboard;
