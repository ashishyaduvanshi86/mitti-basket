import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Loader2, Mail, Settings, Send } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/subscribers", icon: Mail, label: "Subscribers" },
  { to: "/admin/broadcast", icon: Send, label: "Broadcast" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAdmin();

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#DDB892] animate-spin" />
    </div>
  );
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[#F4F1EC] flex">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1A1A1A] text-white flex-shrink-0 flex flex-col fixed h-full z-30">
        <div className="px-6 py-6 border-b border-white/8">
          <h1 className="font-playfair text-lg text-white tracking-tight">Mitti Basket</h1>
          <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-[#DDB892] mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-[13px] font-inter transition-colors ${
                  isActive ? "bg-[#DDB892]/15 text-[#DDB892]" : "text-white/50 hover:text-white hover:bg-white/5"
                }`
              } data-testid={`admin-nav-${label.toLowerCase()}`}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <div className="border-t border-white/8 pt-4 px-3">
            <p className="font-inter text-[10px] text-white/30 truncate">{admin.email}</p>
            <button onClick={logout}
              className="flex items-center gap-2 mt-3 text-white/40 hover:text-red-400 text-[12px] font-inter transition-colors"
              data-testid="admin-logout-btn">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-[220px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
