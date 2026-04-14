import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Loader2, Search, Users, Mail, Phone, MapPin, ShoppingCart, IndianRupee } from "lucide-react";

export default function AdminCustomers() {
  const { apiFetch } = useAdmin();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
  setLoading(true);

  apiFetch("/customers")
    .then(setCustomers)
    .finally(() => setLoading(false));

}, [apiFetch]);
  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.name || "").toLowerCase().includes(s) || (c.email || "").toLowerCase().includes(s) || (c.phone || "").includes(s);
  });

  const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

  return (
    <div data-testid="admin-customers">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl text-[#1A1A1A]">Customers</h2>
        <p className="font-inter text-sm text-[#9B9B8E] mt-1">{customers.length} unique customers</p>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B8E]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8E4DE] text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white"
            data-testid="customer-search-input" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><Users className="w-4 h-4 text-[#9B9B8E]" /></div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Total Customers</p>
                <p className="font-playfair text-xl text-[#1A1A1A]">{customers.length}</p>
              </div>
            </div>
            <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-[#9B9B8E]" /></div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Total Orders</p>
                <p className="font-playfair text-xl text-[#1A1A1A]">{customers.reduce((a, c) => a + c.total_orders, 0)}</p>
              </div>
            </div>
            <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><IndianRupee className="w-4 h-4 text-[#9B9B8E]" /></div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Total Revenue</p>
                <p className="font-playfair text-xl text-[#1A1A1A]">₹{fmt(customers.reduce((a, c) => a + c.total_spent, 0))}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E8E4DE] overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#F9F7F4]">
                  <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Customer</th>
                  <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Contact</th>
                  <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Address</th>
                  <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Orders</th>
                  <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Spent</th>
                  <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-[#F4F1EC] hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-inter text-sm font-medium text-[#1A1A1A]">{c.name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#6B6B60]">
                          <Mail className="w-3 h-3" /><span className="font-inter text-[12px]">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#6B6B60]">
                          <Phone className="w-3 h-3" /><span className="font-inter text-[12px]">{c.phone || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-inter text-[12px] text-[#6B6B60] max-w-[200px] truncate">{c.address || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-inter text-sm font-medium text-[#1A1A1A]">{c.total_orders}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-inter text-sm font-medium text-[#3A5A40]">₹{fmt(c.total_spent)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-inter text-[12px] text-[#9B9B8E]">{c.last_order?.slice(0, 10) || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 font-inter text-sm text-[#9B9B8E]">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
