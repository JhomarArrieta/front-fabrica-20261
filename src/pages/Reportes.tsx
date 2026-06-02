import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  reporteService,
  type ReporteUsuarioResponse,
  type DistribucionResponsabilidadResponse,
  type HistorialCumplimientoResponse,
} from '../services/api';
import BrandLogo from '../components/BrandLogo';
import '../styles/dashboard.css';
import '../styles/hogares.css';
import '../styles/reportes.css';
import '../styles/auth.css';

export default function Reportes() {
  const { hogarId } = useParams<{ hogarId: string }>();
  const navigate = useNavigate();
  const id = Number(hogarId);

  const [reporteUsuarios, setReporteUsuarios] = useState<ReporteUsuarioResponse[]>([]);
  const [distribucion, setDistribucion] = useState<DistribucionResponsabilidadResponse[]>([]);
  const [cumplimiento, setCumplimiento] = useState<HistorialCumplimientoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarReportes = () => {
    Promise.all([
      reporteService.tareasPorUsuario(id, fechaInicio || undefined, fechaFin || undefined),
      reporteService.distribucion(id),
      reporteService.cumplimiento(id, undefined, fechaInicio || undefined, fechaFin || undefined),
    ]).then(([r1, r2, r3]) => {
      setReporteUsuarios(r1.data);
      setDistribucion(r2.data);
      setCumplimiento(r3.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { cargarReportes(); }, [id]);

  const handleFiltrar = () => {
    setLoading(true);
    cargarReportes();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="dash-loading">Cargando reportes...</div>;

  return (
    <div className="dash-page">
      <header className="dash-header">
        <BrandLogo />
        <button className="dash-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <main className="dash-main">
        <button className="hogar-back-btn" onClick={() => navigate(`/hogares/${hogarId}`)}>
          ← Volver al hogar
        </button>

        <h1 className="dash-greeting" style={{ marginBottom: '8px' }}>Reportes</h1>
        <p className="dash-greeting-sub">Métricas y estadísticas del hogar</p>

        {/* Filtros de fecha */}
        <div className="reporte-card" style={{ marginBottom: '24px' }}>
          <p className="reporte-card-title">Filtrar por período</p>
          <div className="reporte-filters">
            <div className="reporte-filter-group">
              <label className="reporte-filter-label">Fecha inicio</label>
              <input
                className="reporte-filter-input"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="reporte-filter-group">
              <label className="reporte-filter-label">Fecha fin</label>
              <input
                className="reporte-filter-input"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button className="reporte-filter-btn" onClick={handleFiltrar}>
              Aplicar filtro
            </button>
            {(fechaInicio || fechaFin) && (
              <button
                className="reporte-filter-btn"
                style={{ background: '#f3f4f6', color: '#374151' }}
                onClick={() => { setFechaInicio(''); setFechaFin(''); }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="reportes-grid">

          {/* Reporte tareas por usuario */}
          <div className="reporte-card" style={{ gridColumn: '1 / -1' }}>
            <p className="reporte-card-title">Tareas por usuario</p>
            {reporteUsuarios.length === 0 ? (
              <p className="reporte-empty">No hay datos para mostrar</p>
            ) : (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Asignadas</th>
                    <th>En proceso</th>
                    <th>Completadas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteUsuarios.map((r, i) => (
                    <tr key={i}>
                      <td>{r.usuario}</td>
                      <td>{r.asignadas}</td>
                      <td>{r.enProceso}</td>
                      <td>{r.completadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Distribución de responsabilidades */}
          <div className="reporte-card">
            <p className="reporte-card-title">Distribución de responsabilidades</p>
            {distribucion.length === 0 ? (
              <p className="reporte-empty">No hay tareas registradas</p>
            ) : (
              distribucion.map((d, i) => (
                <div key={i} className="dist-row">
                  <div className="dist-header">
                    <span className="dist-nombre">{d.usuario}</span>
                    <span className="dist-porcentaje">{d.porcentaje?.toFixed(1)}%</span>
                  </div>
                  <div className="dist-bar-bg">
                    <div className="dist-bar-fill" style={{ width: `${d.porcentaje}%` }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    {d.totalTareas} tarea{d.totalTareas !== 1 ? 's' : ''}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Historial de cumplimiento */}
          <div className="reporte-card">
            <p className="reporte-card-title">Historial de cumplimiento</p>
            {cumplimiento.length === 0 ? (
              <p className="reporte-empty">No hay datos de cumplimiento</p>
            ) : (
              cumplimiento.map((c, i) => (
                <div key={i} className="cumplimiento-row">
                  <div>
                    <p className="cumplimiento-nombre">{c.usuario}</p>
                    <p className="cumplimiento-sub">
                      {c.completadas} de {c.asignadas} completadas
                    </p>
                  </div>
                  <span className="cumplimiento-pct">
                    {c.cumplimiento?.toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}