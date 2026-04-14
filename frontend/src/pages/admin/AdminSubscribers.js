import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Loader2, Search, Download, Mail, Calendar, Tag } from "lucide-react";

export default function AdminSubscribers() {
  const { apiFetch } = useAdmin();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(() => {
  setLoading(true);

  apiFetch("/subscribers")
    .then(setSubscribers)
    .finally(() => setLoading(false));

}, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const filtered = subscribers.filter(s => {
    if (typeFilter !== "all" && s.waitlist_type !== typeFilter) return false;
    if (search && !(s.email || "").toLowerCase().includes(search.toLowerCase()) && !(s.name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const types = [...new Set(subscribers.map(s => s.waitlist_type))];

  return (
    <div data-testid="admin-subscribers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-[#1A1A1A]">Subscribers</h2>
          <p className="font-inter text-sm text-[#9B9B8E] mt-1">{subscribers.length} subscribers</p>
        </div>
        <button onClick={() => {
          const API = process.env.REACT_APP_BACKEND_URL + "/api/admin";
          const token = localStorage.getItem("admin_token");
          fetch(`${API}/subscribers/export`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `mitti_basket_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            });
        }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors"
          data-testid="export-subscribers-csv">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B8E]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or name..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8E4DE] text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white"
            data-testid="subscriber-search-input" />
        </div>
        {types.length > 1 && (
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-[#E8E4DE] px-3 py-2 text-sm font-inter bg-white focus:outline-none focus:border-[#3A5A40]"
            data-testid="subscriber-type-filter">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><Mail className="w-4 h-4 text-[#9B9B8E]" /></div>
          <div>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Total</p>
            <p className="font-playfair text-xl text-[#1A1A1A]">{subscribers.length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><Tag className="w-4 h-4 text-[#9B9B8E]" /></div>
          <div>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Newsletter</p>
            <p className="font-playfair text-xl text-[#1A1A1A]">{subscribers.filter(s => s.waitlist_type === "newsletter").length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8E4DE] p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center"><Calendar className="w-4 h-4 text-[#9B9B8E]" /></div>
          <div>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Subscription</p>
            <p className="font-playfair text-xl text-[#1A1A1A]">{subscribers.filter(s => s.waitlist_type === "subscription").length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E8E4DE] bg-[#F9F7F4]">
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Email</th>
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Name</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Type</th>
                <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-[#F4F1EC] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 font-inter text-sm text-[#1A1A1A]">{s.email}</td>
                  <td className="px-4 py-3 font-inter text-sm text-[#6B6B60]">{s.name || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] font-inter px-2 py-0.5 ${
                      s.waitlist_type === "newsletter" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>{s.waitlist_type?.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-inter text-[12px] text-[#9B9B8E]">{s.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 font-inter text-sm text-[#9B9B8E]">No subscribers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
