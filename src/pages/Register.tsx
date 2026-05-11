import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import "../styles/auth.css";
import BrandLogo from "../components/BrandLogo";


export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.register(nombre, email, password);
      setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          "Error al crear la cuenta. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <BrandLogo />
        <div>
          <p className="auth-tagline">
            Únete a tu
            <br />
            <span>hogar digital</span>
          </p>
          <p className="auth-tagline-sub">
            Crea tu cuenta y empieza a organizar las tareas de tu hogar.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Completa el formulario para registrarte</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nombre" className="auth-label">
              Nombre completo
            </label>
            <input
              id="nombre"
              className="auth-input"
              type="text"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Correo electrónico
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta →"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
