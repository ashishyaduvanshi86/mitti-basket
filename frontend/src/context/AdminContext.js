import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL + "/api/admin";
console.log("BACKEND URL:", process.env.REACT_APP_BACKEND_URL);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setAdmin(d))
      .catch(() => { localStorage.removeItem("admin_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  localStorage.setItem("admin_token", data.token);
  setToken(data.token);
  setAdmin({ email: data.email, name: data.name });

  return data;
};

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
  };

  const apiFetch = useCallback(async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}, [headers]);
  return (
    <AdminContext.Provider value={{ admin, loading, token, login, logout, apiFetch }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
