import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { hogarService, type DetalleHogarResponse } from "../services/api";
import BrandLogo from "../components/BrandLogo";
import "../styles/dashboard.css";
import "../styles/hogares.css";
import "../styles/auth.css";

export default function DetalleHogar() {
  const { hogarId } = useParams<{ hogarId: string }>();
  const [hogar, setHogar] = useState<DetalleHogarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<
    "eliminar" | "abandonar" | null
  >(null);
  const navigate = useNavigate();

  const cargarHogar = () => {
    if (!hogarId) return;
    hogarService
      .getDetalle(Number(hogarId))
      .then(({ data }) => setHogar(data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarHogar();
  }, [hogarId]);

  const handleEliminar = async () => {
    await hogarService.eliminar(Number(hogarId));
    navigate("/dashboard");
  };

  const handleAbandonar = async () => {
    await hogarService.abandonar(Number(hogarId));
    navigate("/dashboard");
  };

  if (loading) return <div className="dash-loading">Cargando...</div>;
  if (!hogar) return null;

  // Detectar si el usuario actual es admin comparando con el token
  const esAdmin = hogar.miembros.some((m) => m.esAdministrador);

  return (
    <div className="hogar-page">
      <header className="dash-header">
        <BrandLogo />
        <button
          className="dash-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <main className="hogar-main">
        <button
          className="hogar-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver al dashboard
        </button>

        <div className="hogar-hero">
          <div>
            <h1 className="hogar-hero-name">{hogar.nombre}</h1>
            {hogar.codigoAcceso && (
              <div className="hogar-codigo-row">
                <span className="hogar-codigo-label">Código de acceso:</span>
                <span className="hogar-codigo-value">{hogar.codigoAcceso}</span>
              </div>
            )}
          </div>
          <div className="hogar-hero-actions">
            <Link to={`/hogares/${hogarId}/tareas`}>
              <button
                className="auth-btn"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                Ver tareas
              </button>
            </Link>
            <Link to={`/hogares/${hogarId}/reportes`}>
              <button
                className="auth-btn"
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  background: "#2d4a2d",
                }}
              >
                Reportes
              </button>
            </Link>
            <button
              className="btn-outline-danger"
              onClick={() => setShowConfirm("abandonar")}
            >
              Abandonar
            </button>
            {esAdmin && (
              <button
                className="btn-outline-danger"
                onClick={() => setShowConfirm("eliminar")}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Miembros */}
        <div className="miembros-card" style={{ marginBottom: "20px" }}>
          <p className="miembros-title">Miembros ({hogar.miembros.length})</p>
          {hogar.miembros.map((m) => {
            const initials = m.nombre
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div key={m.usuarioId} className="miembro-item">
                <div className="miembro-avatar">{initials}</div>
                <div>
                  <p className="miembro-nombre">{m.nombre}</p>
                  <p className="miembro-email">{m.email}</p>
                </div>
                <span
                  className={`miembro-badge ${m.esAdministrador ? "" : "miembro-badge-member"}`}
                >
                  {m.esAdministrador ? "Admin" : "Miembro"}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {showConfirm === "eliminar"
                ? "¿Eliminar grupo?"
                : "¿Abandonar grupo?"}
            </h2>
            <p className="modal-sub">
              {showConfirm === "eliminar"
                ? "Esta acción eliminará el grupo y todas sus tareas permanentemente."
                : "Dejarás de tener acceso a este grupo y sus tareas."}
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={
                  showConfirm === "eliminar" ? handleEliminar : handleAbandonar
                }
              >
                {showConfirm === "eliminar" ? "Sí, eliminar" : "Sí, abandonar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
