import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { tareaService, type TareaResponse, type TareaCompletadaResponse } from '../services/api';
import BrandLogo from '../components/BrandLogo';
import '../styles/dashboard.css';
import '../styles/tareas.css';
import '../styles/hogares.css';
import '../styles/auth.css';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA'];
const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA'];

const estadoLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', COMPLETADA: 'Completada',
};
const estadoSiguiente: Record<string, string> = {
  PENDIENTE: 'EN_PROCESO', EN_PROCESO: 'COMPLETADA',
};

export default function Tareas() {
  const { hogarId } = useParams<{ hogarId: string }>();
  const navigate = useNavigate();

  const [tareas, setTareas] = useState<TareaResponse[]>([]);
  const [completadas, setCompletadas] = useState<TareaCompletadaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activas' | 'completadas'>('activas');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [tareaActual, setTareaActual] = useState<TareaResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nombre: '', descripcion: '', prioridad: 'MEDIA',
    fechaInicio: '', fechaLimite: '',
  });

  const id = Number(hogarId);

  const cargarTareas = () => {
    tareaService.listar(id, undefined, filtroEstado || undefined)
      .then(({ data }) => setTareas(data))
      .finally(() => setLoading(false));
  };

  const cargarCompletadas = () => {
    tareaService.completadas(id)
      .then(({ data }) => setCompletadas(data));
  };

  useEffect(() => {
    cargarTareas();
    cargarCompletadas();
  }, [id, filtroEstado]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await tareaService.crear({ ...form, hogarId: id });
      setSuccess('¡Tarea creada exitosamente!');
      setShowCrear(false);
      setForm({ nombre: '', descripcion: '', prioridad: 'MEDIA', fechaInicio: '', fechaLimite: '' });
      cargarTareas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al crear la tarea.');
    } finally { setSubmitting(false); }
  };

  const handleEditar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tareaActual) return;
    setError(''); setSubmitting(true);
    try {
      await tareaService.actualizar(tareaActual.id, form);
      setSuccess('¡Tarea actualizada!');
      setShowEditar(false);
      cargarTareas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al actualizar la tarea.');
    } finally { setSubmitting(false); }
  };

  const handleCambiarEstado = async (tarea: TareaResponse) => {
    const siguiente = estadoSiguiente[tarea.estado];
    if (!siguiente) return;
    try {
      await tareaService.cambiarEstado(tarea.id, siguiente);
      cargarTareas();
      cargarCompletadas();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al cambiar estado.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEliminar = async (tareaId: number) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await tareaService.eliminar(tareaId);
      cargarTareas();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al eliminar la tarea.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const abrirEditar = (tarea: TareaResponse) => {
    setTareaActual(tarea);
    setForm({
      nombre: tarea.nombre,
      descripcion: tarea.descripcion || '',
      prioridad: tarea.prioridad,
      fechaInicio: tarea.fechaInicio || '',
      fechaLimite: tarea.fechaLimite,
    });
    setError('');
    setShowEditar(true);
  };

  if (loading) return <div className="dash-loading">Cargando...</div>;

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 className="dash-greeting" style={{ margin: 0 }}>Tareas</h1>
          <button
            className="auth-btn"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => { setShowCrear(true); setError(''); }}
          >
            + Nueva tarea
          </button>
        </div>

        {success && <div className="auth-success" style={{ marginBottom: '16px' }}>{success}</div>}
        {error && !showCrear && !showEditar && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

        <div className="tareas-tabs">
          <button className={`tab-btn ${tab === 'activas' ? 'active' : ''}`} onClick={() => setTab('activas')}>
            Activas ({tareas.length})
          </button>
          <button className={`tab-btn ${tab === 'completadas' ? 'active' : ''}`} onClick={() => setTab('completadas')}>
            Completadas ({completadas.length})
          </button>
        </div>

        {tab === 'activas' && (
          <>
            <div className="tareas-filters">
              <div className="tareas-filters-left">
                <select className="filter-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {ESTADOS.filter(e => e !== 'COMPLETADA').map(e => (
                    <option key={e} value={e}>{estadoLabel[e]}</option>
                  ))}
                </select>
              </div>
            </div>

            {tareas.length === 0 ? (
              <div className="tareas-empty">No hay tareas. ¡Crea la primera!</div>
            ) : (
              tareas.map((t) => (
                <div key={t.id} className="tarea-card">
                  <div className="tarea-info">
                    <p className="tarea-nombre">{t.nombre}</p>
                    {t.descripcion && <p className="tarea-desc">{t.descripcion}</p>}
                    <div className="tarea-meta">
                      <span className={`tarea-badge badge-${t.estado.toLowerCase()}`}>{estadoLabel[t.estado]}</span>
                      <span className={`tarea-badge badge-${t.prioridad.toLowerCase()}`}>{t.prioridad}</span>
                      <span className="tarea-fecha">Límite: {t.fechaLimite}</span>
                      <span className="tarea-asignado">👤 {t.miembroAsignado}</span>
                    </div>
                  </div>
                  <div className="tarea-actions">
                    {estadoSiguiente[t.estado] && (
                      <button className="btn-icon btn-icon-next" title={`Avanzar a ${estadoLabel[estadoSiguiente[t.estado]]}`} onClick={() => handleCambiarEstado(t)}>
                        <ChevronRight size={16} />
                      </button>
                    )}
                    <button className="btn-icon btn-icon-edit" title="Editar" onClick={() => abrirEditar(t)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn-icon btn-icon-delete" title="Eliminar" onClick={() => handleEliminar(t.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'completadas' && (
          <>
            {completadas.length === 0 ? (
              <div className="tareas-empty">No hay tareas completadas aún.</div>
            ) : (
              completadas.map((t) => (
                <div key={t.id} className="tarea-card">
                  <div className="tarea-info">
                    <p className="tarea-nombre">{t.nombreTarea}</p>
                    <div className="tarea-meta">
                      <span className="tarea-badge badge-completada">Completada</span>
                      <span className="tarea-asignado">👤 {t.miembro}</span>
                      <span className="tarea-fecha">Finalizada: {t.fechaFinalizacion}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      {/* Modal Crear Tarea */}
      {showCrear && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <h2 className="modal-title">Nueva tarea</h2>
            <p className="modal-sub">Completa los campos para crear la tarea</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleCrear}>
              <label htmlFor="nombre" className="auth-label">Nombre *</label>
              <input id="nombre" className="auth-input" type="text" placeholder="Nombre de la tarea"
                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />

              <label htmlFor="descripcion" className="auth-label">Descripción</label>
              <input id="descripcion" className="auth-input" type="text" placeholder="Descripción opcional"
                value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

              <label htmlFor="prioridad" className="auth-label">Prioridad *</label>
              <select id="prioridad" className="auth-input" value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value })} required>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <label htmlFor="fechaInicio" className="auth-label">Fecha de inicio</label>
              <input id="fechaInicio" className="auth-input" type="date"
                value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />

              <label htmlFor="fechaLimite" className="auth-label">Fecha límite *</label>
              <input id="fechaLimite" className="auth-input" type="date"
                value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCrear(false)}>Cancelar</button>
                <button type="submit" className="auth-btn" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Tarea */}
      {showEditar && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <h2 className="modal-title">Editar tarea</h2>
            <p className="modal-sub">Modifica los campos que deseas actualizar</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleEditar}>
              <label htmlFor="editNombre" className="auth-label">Nombre *</label>
              <input id="editNombre" className="auth-input" type="text"
                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />

              <label htmlFor="editDesc" className="auth-label">Descripción</label>
              <input id="editDesc" className="auth-input" type="text"
                value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

              <label htmlFor="editPrioridad" className="auth-label">Prioridad *</label>
              <select id="editPrioridad" className="auth-input" value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value })} required>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <label htmlFor="editFechaInicio" className="auth-label">Fecha de inicio</label>
              <input id="editFechaInicio" className="auth-input" type="date"
                value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />

              <label htmlFor="editFechaLimite" className="auth-label">Fecha límite *</label>
              <input id="editFechaLimite" className="auth-input" type="date"
                value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditar(false)}>Cancelar</button>
                <button type="submit" className="auth-btn" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}