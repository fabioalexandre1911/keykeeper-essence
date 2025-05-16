
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("password-manager-auth");
    
    if (isLoggedIn === "true") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [navigate]);

  return null;
};

export default Index;
