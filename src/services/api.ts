import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Types ---
export interface GrupoPerfilResponse {
  hogarId: number;
  hogar: string;
  rol: string;
  esAdministrador: boolean;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  grupos: GrupoPerfilResponse[];
  mensaje: string;
}

export interface MiembroGrupoResponse {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  esAdministrador: boolean;
}

export interface HogarResponse {
  id: number;
  nombre: string;
  descripcion: string;
  mensaje: string;
  links: Record<string, string>;
}

export interface DetalleHogarResponse {
  id: number;
  nombre: string;
  descripcion: string;
  codigoAcceso: string;
  miembros: MiembroGrupoResponse[];
  mensaje: string;
  links: Record<string, string>;
}

export interface TareaResponse {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fechaInicio: string;
  fechaLimite: string;
  usuarioId: number;
  miembroAsignado: string;
  hogarId: number;
}

export interface TareaCompletadaResponse {
  id: number;
  nombreTarea: string;
  miembro: string;
  fechaFinalizacion: string;
}

export interface MisSolicitudesResponse {
  id: number;
  hogar: string;
  estado: string;
  fechaSolicitud: string;
}

export interface ReporteUsuarioResponse {
  usuario: string;
  asignadas: number;
  enProceso: number;
  completadas: number;
}

export interface DistribucionResponsabilidadResponse {
  usuario: string;
  totalTareas: number;
  porcentaje: number;
}

export interface HistorialCumplimientoResponse {
  usuario: string;
  asignadas: number;
  completadas: number;
  cumplimiento: number;
}

// --- Services ---
export const authService = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  register: (nombre: string, email: string, password: string) =>
    api.post('/api/v1/auth/register', { nombre, email, password }),
};

export const usuarioService = {
  getPerfil: () => api.get<UsuarioResponse>('/api/v1/usuarios/perfil'),
  actualizarPerfil: (nombre: string, email: string) =>
    api.put<UsuarioResponse>('/api/v1/usuarios/perfil', { nombre, email }),
};

export const hogarService = {
  crear: (nombre: string) =>
    api.post<HogarResponse>('/api/v1/hogares', { nombre }),
  getDetalle: (hogarId: number) =>
    api.get<DetalleHogarResponse>(`/api/v1/hogares/${hogarId}`),
  actualizar: (hogarId: number, nombre: string, descripcion: string) =>
    api.put<HogarResponse>(`/api/v1/hogares/${hogarId}`, { nombre, descripcion }),
  eliminar: (hogarId: number) =>
    api.delete(`/api/v1/hogares/${hogarId}`),
  abandonar: (hogarId: number) =>
    api.delete(`/api/v1/hogares/${hogarId}/abandonar`),
};

export const solicitudService = {
  unirse: (codigoAcceso: string) =>
    api.post('/api/v1/solicitudes', { codigoAcceso }),
  responder: (solicitudId: number, accion: string, rol: string) =>
    api.put(`/api/v1/solicitudes/${solicitudId}`, { accion, rol }),
  misSolicitudes: () =>
    api.get<MisSolicitudesResponse[]>('/api/v1/solicitudes/mis-solicitudes'),
};

export const tareaService = {
  listar: (hogarId: number, usuarioId?: number, estado?: string) =>
    api.get<TareaResponse[]>(`/api/v1/tareas/hogar/${hogarId}`, {
      params: { usuarioId, estado },
    }),
  crear: (data: {
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaLimite: string;
    prioridad: string;
    hogarId: number;
  }) => api.post('/api/v1/tareas', data),
  actualizar: (tareaId: number, data: {
    nombre: string;
    descripcion: string;
    prioridad: string;
    fechaInicio: string;
    fechaLimite: string;
  }) => api.put(`/api/v1/tareas/${tareaId}`, data),
  cambiarEstado: (tareaId: number, estado: string) =>
    api.put(`/api/v1/tareas/${tareaId}/estado`, { estado }),
  eliminar: (tareaId: number) =>
    api.delete(`/api/v1/tareas/${tareaId}`),
  completadas: (hogarId: number) =>
    api.get<TareaCompletadaResponse[]>(`/api/v1/tareas/hogar/${hogarId}/completadas`),
};

export const reporteService = {
  tareasPorUsuario: (hogarId: number, fechaInicio?: string, fechaFin?: string) =>
    api.get<ReporteUsuarioResponse[]>(`/api/v1/reportes/tareas-usuarios/${hogarId}`, {
      params: { fechaInicio, fechaFin },
    }),
  distribucion: (hogarId: number) =>
    api.get<DistribucionResponsabilidadResponse[]>(`/api/v1/reportes/distribucion/${hogarId}`),
  cumplimiento: (hogarId: number, usuarioId?: number, fechaInicio?: string, fechaFin?: string) =>
    api.get<HistorialCumplimientoResponse[]>(`/api/v1/reportes/cumplimiento/${hogarId}`, {
      params: { usuarioId, fechaInicio, fechaFin },
    }),
};



export default api;