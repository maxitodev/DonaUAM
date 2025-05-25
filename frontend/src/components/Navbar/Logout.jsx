import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Eliminar el token de autenticación
    localStorage.removeItem("token");
    // Redirigir al inicio
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;
