import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  usuarioService,
  hogarService,
  solicitudService,
  type UsuarioResponse,
  type MisSolicitudesResponse,
} from "../services/api";
import "../styles/dashboard.css";
import "../styles/hogares.css";
import "../styles/auth.css";
import BrandLogo from "../components/BrandLogo";

export default function Dashboard() {
  const [perfil, setPerfil] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCrear, setShowCrear] = useState(false);
  const [showUnirse, setShowUnirse] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);
  const [nombreHogar, setNombreHogar] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [solicitudes, setSolicitudes] = useState<MisSolicitudesResponse[]>([]);
  const navigate = useNavigate();

  const cargarPerfil = () => {
    usuarioService
      .getPerfil()
      .then(({ data }) => setPerfil(data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => setLoading(false));

    solicitudService
      .misSolicitudes()
      .then(({ data }) => setSolicitudes(data))
      .catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    cargarPerfil();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCrearHogar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await hogarService.crear(nombreHogar);
      setSuccess("¡Hogar creado exitosamente!");
      setShowCrear(false);
      setNombreHogar("");
      cargarPerfil();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al crear el hogar.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnirse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await solicitudService.unirse(codigoAcceso);
      setSuccess("¡Solicitud enviada! Espera a que el admin te acepte.");
      setShowUnirse(false);
      setCodigoAcceso("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          "Código inválido o ya tienes una solicitud pendiente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditarPerfil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await usuarioService.actualizarPerfil(editNombre, editEmail);
      setSuccess("¡Perfil actualizado exitosamente!");
      setShowEditarPerfil(false);
      cargarPerfil();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al actualizar el perfil.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="dash-loading">Cargando...</div>;
  if (!perfil) return null;

  const initials = perfil.nombre
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="dash-page">
      <header className="dash-header">
        <BrandLogo />
        <button className="dash-logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <main className="dash-main">
        <h1 className="dash-greeting">
          Hola, {perfil.nombre.split(" ")[0]} 👋
        </h1>
        <p className="dash-greeting-sub">
          Bienvenido de nuevo a tu espacio del hogar
        </p>

        {success && (
          <div className="auth-success" style={{ marginBottom: "20px" }}>
            {success}
          </div>
        )}

        <div className="dash-grid">
          {/* Tarjeta Perfil */}
          <div className="dash-card">
            <p className="dash-card-title">Mi perfil</p>
            <div className="dash-profile-row">
              <div className="dash-avatar">{initials}</div>
              <div>
                <p className="dash-profile-name">{perfil.nombre}</p>
                <p className="dash-profile-email">{perfil.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditNombre(perfil.nombre);
                setEditEmail(perfil.email);
                setError("");
                setShowEditarPerfil(true);
              }}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "9px",
                background: "transparent",
                border: "1.5px solid #d4cfc4",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "#374151",
              }}
            >
              Editar perfil
            </button>
          </div>

          {/* Tarjeta Hogares */}
          <div className="dash-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <p className="dash-card-title" style={{ margin: 0 }}>
                Mis hogares ({perfil.grupos?.length || 0})
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setShowUnirse(true);
                    setError("");
                  }}
                  style={{
                    fontSize: "12px",
                    padding: "5px 10px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Unirse
                </button>
                <button
                  onClick={() => {
                    setShowCrear(true);
                    setError("");
                  }}
                  style={{
                    fontSize: "12px",
                    padding: "5px 10px",
                    background: "#1a2e1a",
                    color: "#c8e06a",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Crear
                </button>
              </div>
            </div>

            {perfil.grupos && perfil.grupos.length > 0 ? (
              perfil.grupos.map((g) => (
                <Link
                  key={g.hogarId}
                  to={`/hogares/${g.hogarId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="dash-hogar-item"
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <p className="dash-hogar-name">{g.hogar}</p>
                      <p className="dash-hogar-rol">{g.rol}</p>
                    </div>
                    <span
                      className={`dash-badge ${g.esAdministrador ? "" : "dash-badge-member"}`}
                    >
                      {g.esAdministrador ? "Admin" : "Miembro"}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="dash-empty">No perteneces a ningún hogar aún</p>
            )}
          </div>
          {/* Mis Solicitudes */}
          {solicitudes.length > 0 && (
            <div className="dash-card">
              <p className="dash-card-title">
                Mis solicitudes ({solicitudes.length})
              </p>
              {solicitudes.map((s) => (
                <div key={s.id} className="dash-hogar-item">
                  <div>
                    <p className="dash-hogar-name">{s.hogar}</p>
                    <p className="dash-hogar-rol">
                      Enviada: {s.fechaSolicitud}
                    </p>
                  </div>
                  <span
                    className={`dash-badge ${
                      s.estado === "ACEPTADA"
                        ? ""
                        : s.estado === "RECHAZADA"
                          ? "dash-badge-member"
                          : "dash-badge-pendiente"
                    }`}
                  >
                    {s.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear Hogar */}
      {showCrear && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Crear hogar</h2>
            <p className="modal-sub">Ingresa el nombre de tu nuevo hogar</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleCrearHogar}>
              <label htmlFor="nombreHogar" className="auth-label">
                Nombre del hogar
              </label>
              <input
                id="nombreHogar"
                className="auth-input"
                type="text"
                placeholder="Mi hogar"
                value={nombreHogar}
                onChange={(e) => setNombreHogar(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCrear(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Creando..." : "Crear hogar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Unirse */}
      {showUnirse && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Unirse a un hogar</h2>
            <p className="modal-sub">
              Ingresa el código que te compartió el administrador
            </p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleUnirse}>
              <label htmlFor="codigo" className="auth-label">
                Código de acceso
              </label>
              <input
                id="codigo"
                className="auth-input"
                type="text"
                placeholder="XXXXXX"
                value={codigoAcceso}
                onChange={(e) => setCodigoAcceso(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowUnirse(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {showEditarPerfil && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Editar perfil</h2>
            <p className="modal-sub">Actualiza tu información personal</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleEditarPerfil}>
              <label htmlFor="editNombre" className="auth-label">
                Nombre completo
              </label>
              <input
                id="editNombre"
                className="auth-input"
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                required
              />
              <label htmlFor="editEmail" className="auth-label">
                Correo electrónico
              </label>
              <input
                id="editEmail"
                className="auth-input"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditarPerfil(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
