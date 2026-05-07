import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { authService } from "../services/api.ts";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  left: {
    flex: 1,
    background: "linear-gradient(160deg,#1a2e1a 0%,#2d4a2d 60%,#3a5c2a 100%)",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brandRow: { display: "flex", alignItems: "center", gap: "10px" },
  brandIcon: {
    width: "36px",
    height: "36px",
    background: "#c8e06a",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  brandName: {
    fontFamily: "'Fraunces', serif",
    fontSize: "20px",
    color: "#e8f0c8",
    fontWeight: 300,
  },
  tagline: {
    fontFamily: "'Fraunces', serif",
    fontSize: "32px",
    color: "#e8f0c8",
    fontWeight: 300,
    lineHeight: 1.4,
    fontStyle: "italic",
  },
  taglineAccent: { color: "#c8e06a", fontStyle: "normal" },
  taglineSub: {
    fontSize: "14px",
    color: "rgba(232,240,200,0.6)",
    marginTop: "12px",
  },
  right: {
    width: "420px",
    background: "#f5f2eb",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: "28px",
    color: "#1a2e1a",
    fontWeight: 400,
    margin: "0 0 6px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: "0 0 32px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #d4cfc4",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#fff",
    color: "#1a2e1a",
    boxSizing: "border-box",
    marginBottom: "18px",
  },
  field: { marginBottom: "4px" },
  btn: {
    width: "100%",
    padding: "13px",
    background: "#1a2e1a",
    color: "#c8e06a",
    border: "none",
    borderRadius: "8px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.03em",
    marginTop: "4px",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  register: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#6b7280",
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Credenciales inválidas. Intenta de nuevo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>🏠</div>
          <span style={styles.brandName}>Domestica</span>
        </div>
        <div>
          <p style={styles.tagline}>
            Organiza tu hogar,
            <br />
            <span style={styles.taglineAccent}>sin esfuerzo</span>
          </p>
          <p style={styles.taglineSub}>
            Gestiona tareas, grupos y responsabilidades del hogar en un solo
            lugar.
          </p>
        </div>
      </div>

      <div style={styles.right}>
        <h1 style={styles.title}>Bienvenido</h1>
        <p style={styles.subtitle}>Ingresa a tu cuenta para continuar</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Correo electrónico
            </label>
            <input
              id="email"
              style={styles.input}
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión →"}
          </button>
        </form>

        <p style={styles.register}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "#3a5c2a", fontWeight: 600 }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
