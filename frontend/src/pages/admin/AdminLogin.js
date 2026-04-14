import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const { admin, loading, login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#DDB892] animate-spin" />
    </div>
  );
  if (admin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <h1 className="font-playfair text-3xl text-white tracking-tight">Mitti Basket</h1>
          <p className="font-inter text-[11px] uppercase tracking-[0.25em] text-white/30 mt-2">Admin Console</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-inter p-3 mb-6" data-testid="admin-login-error">
              {error}
            </div>
          )}
          <div className="mb-5">
            <label className="block font-inter text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 text-white font-inter text-sm px-4 py-3 focus:outline-none focus:border-[#DDB892]/50 transition-colors"
              data-testid="admin-email-input" />
          </div>
          <div className="mb-6">
            <label className="block font-inter text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white font-inter text-sm px-4 py-3 pr-10 focus:outline-none focus:border-[#DDB892]/50 transition-colors"
                data-testid="admin-password-input" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-[#DDB892] text-[#1A1A1A] py-3 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#c9a67e] transition-colors disabled:opacity-50"
            data-testid="admin-login-btn">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
          </button>
        </form>

        <p className="text-center font-inter text-[10px] text-white/20 mt-6 tracking-wide">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}
