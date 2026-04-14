import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { IndianRupee, ShoppingCart, Users, TrendingUp, Package, Clock, Loader2, Download, RefreshCw } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3A5A40", "#DDB892", "#6B8F71", "#A67C52", "#4B7A56", "#C9A67E", "#2C4430", "#8B7355"];

function StatCard({ icon: Icon, label, value, sub, color = "text-[#3A5A40]" }) {
  return (
    <div className="bg-white border border-[#E8E4DE] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#9B9B8E]">{label}</p>
          <p className={`font-playfair text-2xl mt-1 ${color}`}>{value}</p>
          {sub && <p className="font-inter text-[11px] text-[#9B9B8E] mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 bg-[#F4F1EC] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#9B9B8E]" />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E4DE] p-3 shadow-sm">
      <p className="font-inter text-[11px] text-[#9B9B8E] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-inter text-[12px]" style={{ color: p.color }}>
          {p.name}: {p.name === "revenue" ? `₹${fmt(p.value)}` : p.value}
        </p>
      ))}
    </div>
  );
}

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

export default function AdminDashboard() {
  const { apiFetch } = useAdmin();
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    Promise.all([
      apiFetch("/dashboard"),
      apiFetch(`/dashboard/charts?days=${chartDays}`),
    ])
      .then(([d, c]) => { setData(d); setCharts(c); })
      .finally(() => setLoading(false));
  }, [apiFetch, chartDays]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" /></div>;
  if (!data) return null;

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h2 className="font-playfair text-2xl text-[#1A1A1A]">Dashboard</h2>
        <p className="font-inter text-sm text-[#9B9B8E] mt-1">Overview of your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${fmt(data.total_revenue)}`} sub={`₹${fmt(data.today_revenue || 0)} today`} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={data.total_orders} sub={`${data.today_orders} today`} />
        <StatCard icon={Users} label="Customers" value={data.customer_count} sub={`${data.repeat_customers || 0} repeat`} />
        <StatCard icon={TrendingUp} label="Top Product" value={data.top_products?.length > 0 ? data.top_products[0].name : "—"} sub={data.top_products?.length > 0 ? `${data.top_products[0].count} sold · ₹${fmt(data.top_products[0].revenue)}` : "No sales yet"} />
        <StatCard icon={Clock} label="Pending" value={data.pending_orders} sub={`${data.failed_orders} failed`} color="text-amber-600" />
        <StatCard icon={RefreshCw} label="Repeat Customers" value={data.repeat_customers || 0} sub={data.customer_count > 0 ? `${Math.round(((data.repeat_customers || 0) / data.customer_count) * 100)}% retention` : "—"} color="text-[#3A5A40]" />
      </div>

      {/* Revenue Chart */}
      {charts && (
        <div className="bg-white border border-[#E8E4DE] p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#9B9B8E] flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Revenue & Orders
            </h3>
            <div className="flex gap-1">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => { setChartDays(d); setLoading(true); }}
                  className={`px-3 py-1 font-inter text-[10px] uppercase tracking-[0.08em] border transition-colors ${
                    chartDays === d
                      ? "bg-[#3A5A40] text-white border-[#3A5A40]"
                      : "bg-white text-[#9B9B8E] border-[#E8E4DE] hover:border-[#3A5A40]"
                  }`} data-testid={`chart-${d}d`}>{d}D</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.daily} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A5A40" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3A5A40" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "Inter", fill: "#9B9B8E" }}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fontFamily: "Inter", fill: "#9B9B8E" }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3A5A40" strokeWidth={2}
                fill="url(#revenueGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Orders Chart + Status Distribution */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Orders Bar Chart */}
          <div className="bg-white border border-[#E8E4DE] p-6">
            <h3 className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#9B9B8E] flex items-center gap-2 mb-5">
              <ShoppingCart className="w-3.5 h-3.5" /> Daily Orders
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.daily} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "Inter", fill: "#9B9B8E" }}
                  tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fontFamily: "Inter", fill: "#9B9B8E" }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="paid" stackId="a" fill="#3A5A40" name="paid" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill="#E74C3C" name="failed" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie */}
          <div className="bg-white border border-[#E8E4DE] p-6">
            <h3 className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#9B9B8E] flex items-center gap-2 mb-5">
              <Package className="w-3.5 h-3.5" /> Order Status
            </h3>
            {charts.order_status.length === 0 ? (
              <p className="font-inter text-sm text-[#9B9B8E] py-10 text-center">No data yet</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={charts.order_status} dataKey="count" nameKey="status" cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {charts.order_status.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => v} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {charts.order_status.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-inter text-[12px] text-[#6B6B60] flex-1">{s.status}</span>
                      <span className="font-inter text-[12px] font-medium">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Revenue + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Revenue */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#9B9B8E] mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Top Selling Products
          </h3>
          {data.top_products.length === 0 ? (
            <p className="font-inter text-sm text-[#9B9B8E]">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.top_products.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F4F1EC] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#F4F1EC] flex items-center justify-center text-[11px] font-inter font-bold text-[#9B9B8E]">{i + 1}</span>
                    <span className="font-inter text-sm text-[#1A1A1A]">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-inter text-sm font-medium text-[#1A1A1A]">{p.count} sold</span>
                    <span className="font-inter text-[11px] text-[#9B9B8E] ml-2">₹{fmt(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#9B9B8E] mb-4 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Recent Orders
          </h3>
          {data.recent_orders.length === 0 ? (
            <p className="font-inter text-sm text-[#9B9B8E]">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.recent_orders.map((o, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F4F1EC] last:border-0">
                  <div>
                    <p className="font-inter text-sm text-[#1A1A1A]">{o.name}</p>
                    <p className="font-inter text-[11px] text-[#9B9B8E]">{o.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-sm font-medium">₹{fmt(o.subtotal || 0)}</p>
                    <span className={`inline-block text-[10px] font-inter px-2 py-0.5 mt-0.5 ${
                      o.payment_status === "Paid" ? "bg-green-50 text-green-700" :
                      o.payment_status === "Failed" ? "bg-red-50 text-red-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{o.payment_status || "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
