import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ClipboardList, BarChart2, Pencil, LogOut, Trash2 } from "lucide-react";
import { hogarService, type DetalleHogarResponse } from "../services/api";
import BrandLogo from "../components/BrandLogo";
import "../styles/dashboard.css";
import "../styles/hogares.css";
import "../styles/auth.css";

export default function DetalleHogar() {
  const { hogarId } = useParams<{ hogarId: string }>();
  const [hogar, setHogar] = useState<DetalleHogarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<"eliminar" | "abandonar" | null>(null);
  const [showEditar, setShowEditar] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const cargarHogar = () => {
    if (!hogarId) return;
    hogarService
      .getDetalle(Number(hogarId))
      .then(({ data }) => setHogar(data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarHogar(); }, [hogarId]);

  const handleEliminar = async () => {
    await hogarService.eliminar(Number(hogarId));
    navigate("/dashboard");
  };

  const handleAbandonar = async () => {
    await hogarService.abandonar(Number(hogarId));
    navigate("/dashboard");
  };

  const handleActualizar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await hogarService.actualizar(Number(hogarId), editNombre, editDescripcion);
      setSuccess("¡Hogar actualizado exitosamente!");
      setShowEditar(false);
      cargarHogar();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al actualizar el hogar.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="dash-loading">Cargando...</div>;
  if (!hogar) return null;

  const esAdmin = hogar.miembros.some((m) => m.esAdministrador);

  return (
    <div className="hogar-page">
      <header className="dash-header">
        <BrandLogo />
        <button className="dash-logout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
          Cerrar sesión
        </button>
      </header>

      <main className="hogar-main">
        <button className="hogar-back-btn" onClick={() => navigate("/dashboard")}>
          ← Volver al dashboard
        </button>

        {success && <div className="auth-success" style={{ marginBottom: "16px" }}>{success}</div>}
        {error && !showEditar && <div className="auth-error" style={{ marginBottom: "16px" }}>{error}</div>}

        {/* Hero */}
        <div className="hogar-hero" style={{ marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <div className="hogar-hero-top">
              <div>
                <h1 className="hogar-hero-name">{hogar.nombre}</h1>
                {hogar.descripcion && (
                  <p style={{ color: "rgba(232,240,200,0.7)", fontSize: "14px", marginTop: "4px" }}>
                    {hogar.descripcion}
                  </p>
                )}
              </div>
              {esAdmin && (
                <button
                  className="hogar-hero-edit-btn"
                  title="Editar hogar"
                  onClick={() => { setEditNombre(hogar.nombre); setEditDescripcion(hogar.descripcion || ""); setError(""); setShowEditar(true); }}
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
            {hogar.codigoAcceso && (
              <div className="hogar-codigo-row" style={{ marginTop: "12px" }}>
                <span className="hogar-codigo-label">Código de acceso:</span>
                <span className="hogar-codigo-value">{hogar.codigoAcceso}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="hogar-actions-grid">
          <Link to={`/hogares/${hogarId}/tareas`} className="hogar-action-card">
            <div className="hogar-action-icon hogar-action-icon-green">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="hogar-action-label">Tareas</p>
              <p className="hogar-action-sub">Ver y gestionar tareas del hogar</p>
            </div>
          </Link>

          <Link to={`/hogares/${hogarId}/reportes`} className="hogar-action-card">
            <div className="hogar-action-icon hogar-action-icon-blue">
              <BarChart2 size={22} />
            </div>
            <div>
              <p className="hogar-action-label">Reportes</p>
              <p className="hogar-action-sub">Estadísticas y métricas del hogar</p>
            </div>
          </Link>
        </div>

        {/* Miembros */}
        <div className="miembros-card" style={{ marginBottom: "20px" }}>
          <p className="miembros-title">Miembros ({hogar.miembros.length})</p>
          {hogar.miembros.map((m) => {
            const initials = m.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={m.usuarioId} className="miembro-item">
                <div className="miembro-avatar">{initials}</div>
                <div>
                  <p className="miembro-nombre">{m.nombre}</p>
                  <p className="miembro-email">{m.email}</p>
                </div>
                <span className={`miembro-badge ${m.esAdministrador ? "" : "miembro-badge-member"}`}>
                  {m.esAdministrador ? "Admin" : "Miembro"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Zona de peligro */}
        <div className="danger-zone">
          <p className="danger-zone-title">Zona de peligro</p>
          <div className="danger-zone-actions">
            <button className="danger-btn danger-btn-outline" onClick={() => setShowConfirm("abandonar")}>
              <LogOut size={15} /> Abandonar hogar
            </button>
            {esAdmin && (
              <button className="danger-btn danger-btn-solid" onClick={() => setShowConfirm("eliminar")}>
                <Trash2 size={15} /> Eliminar hogar
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Modal Editar Hogar */}
      {showEditar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Editar hogar</h2>
            <p className="modal-sub">Actualiza la información del hogar</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleActualizar}>
              <label htmlFor="editNombreHogar" className="auth-label">Nombre *</label>
              <input id="editNombreHogar" className="auth-input" type="text"
                value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
              <label htmlFor="editDescripcion" className="auth-label">Descripción</label>
              <input id="editDescripcion" className="auth-input" type="text"
                placeholder="Descripción opcional"
                value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditar(false)}>Cancelar</button>
                <button type="submit" className="auth-btn" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {showConfirm === "eliminar" ? "¿Eliminar hogar?" : "¿Abandonar hogar?"}
            </h2>
            <p className="modal-sub">
              {showConfirm === "eliminar"
                ? "Esta acción eliminará el hogar y todas sus tareas permanentemente. No se puede deshacer."
                : "Dejarás de tener acceso a este hogar y sus tareas."}
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={showConfirm === "eliminar" ? handleEliminar : handleAbandonar}>
                {showConfirm === "eliminar" ? "Sí, eliminar" : "Sí, abandonar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}