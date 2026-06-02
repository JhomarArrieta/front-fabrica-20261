import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DetalleHogar from './pages/DetalleHogar';
import Tareas from './pages/Tareas';
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hogares/:hogarId" element={<DetalleHogar />} />
        <Route path="/hogares/:hogarId/tareas" element={<Tareas />} />
        <Route path="/hogares/:hogarId/reportes" element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;