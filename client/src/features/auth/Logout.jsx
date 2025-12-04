/**
 * @file Logout.jsx
 * @description Component that logs out the user and redirects.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Logout = ({ redirectTo = "/login" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const doLogout = async () => {
      const result = await logout();
      if (result.success) {
        navigate(redirectTo);
      } else {
        setError(result.error);
        navigate(redirectTo); // still redirect after clearing state
      }
    };

    doLogout();
  }, [logout, navigate, redirectTo]);

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <p>Logging out...</p>
      {error && <p className="text-danger mt-2"> {error}</p>}
    </div>
  );
};

export default Logout;
