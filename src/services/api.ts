import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

// --- Services ---
export const authService = {
  login: (email: string, password: string) =>
    api.post("/api/v1/auth/login", { email, password }),
  register: (nombre: string, email: string, password: string) =>
    api.post("/api/v1/auth/register", { nombre, email, password }),
};

export const usuarioService = {
  getPerfil: () => api.get<UsuarioResponse>("/api/v1/usuarios/perfil"),
  actualizarPerfil: (nombre: string, email: string) =>
    api.put<UsuarioResponse>("/api/v1/usuarios/perfil", { nombre, email }),
};

export const hogarService = {
  crear: (nombre: string) =>
    api.post<HogarResponse>("/api/v1/hogares", { nombre }),
  getDetalle: (hogarId: number) =>
    api.get<DetalleHogarResponse>(`/api/v1/hogares/${hogarId}`),
  eliminar: (hogarId: number) => api.delete(`/api/v1/hogares/${hogarId}`),
  abandonar: (hogarId: number) =>
    api.delete(`/api/v1/hogares/${hogarId}/abandonar`),
};

export const solicitudService = {
  unirse: (codigoAcceso: string) =>
    api.post("/api/v1/solicitudes", { codigoAcceso }),
};

export default api;
