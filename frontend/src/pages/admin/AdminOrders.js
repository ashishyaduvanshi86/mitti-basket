import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Loader2, Search, Eye, X, Truck, PackageCheck, MapPin, Phone, Mail, Download, Package, CheckSquare, Square, MessageCircle } from "lucide-react";

const STATUS_OPTIONS = ["Placed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Failed"];
const PAYMENT_FILTERS = ["All", "Paid", "Pending", "Failed"];
const STATUS_FILTERS = ["All", "Placed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Failed", "Created", "Confirmed"];

const buildWhatsAppUrl = (phone, message) => {
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  if (cleaned.length === 10) cleaned = "91" + cleaned;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};

const waOrderConfirmation = (o) => {
  const items = (o.items || []).map((i) => `${i.name} x${i.quantity} ${i.qtyUnit || ""}`).join("\n");
  return `Hi ${o.name},\n\nThank you for ordering from *Mitti Basket*!\n\n*Order #${(o.id || "").slice(0, 8).toUpperCase()}*\n${items}\n\n*Total: Rs.${(o.subtotal || 0).toLocaleString("en-IN")}*\n\nWe'll keep you updated on your order.\n\n— Team Mitti Basket`;
};

const waShipped = (o) => {
  return `Hi ${o.name},\n\nYour Mitti Basket order *#${(o.id || "").slice(0, 8).toUpperCase()}* has been *shipped*!\n\nExpected delivery in 3–5 business days.\n\nThank you for supporting farm-fresh food.\n\n— Team Mitti Basket`;
};

const waOutForDelivery = (o) => {
  return `Hi ${o.name},\n\nYour order *#${(o.id || "").slice(0, 8).toUpperCase()}* is *out for delivery* today!\n\nDelivery to: ${o.address}, ${o.pincode}\n\nPlease keep your phone handy.\n\n— Team Mitti Basket`;
};

const statusColor = (s) => {
  const map = {
    "Placed": "bg-blue-50 text-blue-700",
    "Created": "bg-blue-50 text-blue-700",
    "Confirmed": "bg-blue-50 text-blue-700",
    "Processing": "bg-amber-50 text-amber-700",
    "Packed": "bg-indigo-50 text-indigo-700",
    "Shipped": "bg-purple-50 text-purple-700",
    "Out for Delivery": "bg-orange-50 text-orange-700",
    "Delivered": "bg-green-50 text-green-700",
    "Cancelled": "bg-red-50 text-red-700",
    "Failed": "bg-red-50 text-red-700",
    "Payment Failed": "bg-red-50 text-red-700",
  };
  return map[s] || "bg-gray-50 text-gray-700";
};

const paymentColor = (s) => {
  const map = { "Paid": "bg-green-50 text-green-700", "Pending": "bg-amber-50 text-amber-700", "Failed": "bg-red-50 text-red-700" };
  return map[s] || "bg-gray-50 text-gray-700";
};

function OrderDetail({ order, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.order_status || "Placed");
  const [updating, setUpdating] = useState(false);
  const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

  const handleUpdate = async () => {
    setUpdating(true);
    await onStatusUpdate(order.id, newStatus);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[600px] mb-10 border border-[#E8E4DE]" data-testid="order-detail-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
          <h3 className="font-playfair text-lg">Order Details</h3>
          <button onClick={onClose} className="text-[#9B9B8E] hover:text-[#1A1A1A]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Order ID</p>
              <p className="font-inter text-sm font-medium mt-0.5">{order.id?.slice(0, 8) || "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Date</p>
              <p className="font-inter text-sm mt-0.5">{order.created_at?.slice(0, 10)}</p>
            </div>
          </div>
          <div className="bg-[#F9F7F4] p-4 space-y-2">
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-2">Customer</p>
            <p className="font-inter text-sm font-medium">{order.name}</p>
            <div className="flex items-center gap-2 text-[#6B6B60]"><Mail className="w-3 h-3" /><span className="font-inter text-[12px]">{order.email}</span></div>
            <div className="flex items-center gap-2 text-[#6B6B60]"><Phone className="w-3 h-3" /><span className="font-inter text-[12px]">{order.phone}</span></div>
            <div className="flex items-start gap-2 text-[#6B6B60]"><MapPin className="w-3 h-3 mt-0.5" /><span className="font-inter text-[12px]">{order.address}, {order.city || ""} - {order.pincode}</span></div>
          </div>
          <div>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-[#F4F1EC]">
                  <div>
                    <p className="font-inter text-sm">{item.name}</p>
                    <p className="font-inter text-[11px] text-[#9B9B8E]">{item.quantity} {item.qtyUnit || "unit"}</p>
                  </div>
                  <p className="font-inter text-sm font-medium">Rs.{fmt(item.total_price || 0)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-[#E8E4DE]">
              <span className="font-inter text-sm font-semibold">Total</span>
              <span className="font-inter text-lg font-bold text-[#3A5A40]">Rs.{fmt(order.subtotal || 0)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Payment</p>
              <span className={`inline-block text-[11px] font-inter px-2 py-1 ${paymentColor(order.payment_status)}`}>
                {order.payment_status || "Pending"}
              </span>
              {order.razorpay_payment_id && (
                <p className="font-inter text-[10px] text-[#9B9B8E] mt-1">RZP: {order.razorpay_payment_id}</p>
              )}
            </div>
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Order Status</p>
              <span className={`inline-block text-[11px] font-inter px-2 py-1 ${statusColor(order.order_status)}`}>
                {order.order_status || "Pending"}
              </span>
            </div>
          </div>
          <div className="bg-[#F9F7F4] p-4">
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">Update Status</p>
            <div className="flex gap-3">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 border border-[#E8E4DE] px-3 py-2 text-sm font-inter bg-white focus:outline-none focus:border-[#3A5A40]"
                data-testid="order-status-select">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleUpdate} disabled={updating || newStatus === order.order_status}
                className="px-4 py-2 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] disabled:opacity-40 transition-colors"
                data-testid="order-update-status-btn">
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
              </button>
            </div>
          </div>
          {(order.shipped_at || order.delivered_at || order.out_for_delivery_at) && (
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">Timeline</p>
              <div className="space-y-2">
                {order.shipped_at && (
                  <div className="flex items-center gap-2 text-[11px] font-inter text-[#6B6B60]">
                    <Truck className="w-3 h-3 text-purple-500" /> Shipped: {order.shipped_at.slice(0, 10)}
                  </div>
                )}
                {order.out_for_delivery_at && (
                  <div className="flex items-center gap-2 text-[11px] font-inter text-[#6B6B60]">
                    <Package className="w-3 h-3 text-orange-500" /> Out for Delivery: {order.out_for_delivery_at.slice(0, 10)}
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-center gap-2 text-[11px] font-inter text-[#6B6B60]">
                    <PackageCheck className="w-3 h-3 text-green-500" /> Delivered: {order.delivered_at.slice(0, 10)}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* WhatsApp Quick Send */}
          {order.phone && (
            <div className="bg-[#F9F7F4] p-4" data-testid="whatsapp-section">
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">
                Send on WhatsApp
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildWhatsAppUrl(order.phone, waOrderConfirmation(order))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white font-inter text-[10px] uppercase tracking-[0.08em] hover:bg-[#1fb855] transition-colors"
                  data-testid="wa-order-confirm"
                >
                  <MessageCircle className="w-3 h-3" /> Order Confirmation
                </a>
                <a
                  href={buildWhatsAppUrl(order.phone, waShipped(order))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white font-inter text-[10px] uppercase tracking-[0.08em] hover:bg-[#1fb855] transition-colors"
                  data-testid="wa-shipped"
                >
                  <MessageCircle className="w-3 h-3" /> Shipped
                </a>
                <a
                  href={buildWhatsAppUrl(order.phone, waOutForDelivery(order))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white font-inter text-[10px] uppercase tracking-[0.08em] hover:bg-[#1fb855] transition-colors"
                  data-testid="wa-ofd"
                >
                  <MessageCircle className="w-3 h-3" /> Out for Delivery
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const { apiFetch } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

const load = useCallback(() => {
  setLoading(true);

  let query = "";
  const params = [];

  if (statusFilter !== "All") params.push(`status=${statusFilter}`);
  if (paymentFilter !== "All") params.push(`payment=${paymentFilter}`);
  if (params.length) query = "?" + params.join("&");

  apiFetch(`/orders${query}`)
    .then((data) => {
      setOrders(data);
      setSelected([]);
    })
    .finally(() => setLoading(false));

}, [apiFetch, statusFilter, paymentFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ order_status: newStatus }),
    });
    load();
    const updated = await apiFetch("/orders");
    const updatedOrder = updated.find((o) => o.id === orderId);
    if (updatedOrder) setDetail(updatedOrder);
  };

  const handleBulkAction = async (status) => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    await apiFetch("/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ order_ids: selected, new_status: status }),
    });
    setBulkLoading(false);
    load();
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((o) => o.id));
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (o.name || "").toLowerCase().includes(s) || (o.email || "").toLowerCase().includes(s) || (o.id || "").toLowerCase().includes(s);
  });

  const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

  return (
    <div data-testid="admin-orders">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-[#1A1A1A]">Orders</h2>
          <p className="font-inter text-sm text-[#9B9B8E] mt-1">{orders.length} orders</p>
        </div>
        <button onClick={() => {
          const API = process.env.REACT_APP_BACKEND_URL + "/api/admin";
          const token = localStorage.getItem("admin_token");
          fetch(`${API}/orders/export`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.blob())
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `mitti_basket_orders_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            });
        }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors"
          data-testid="export-orders-csv">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B8E]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, ID..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8E4DE] text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white"
            data-testid="order-search-input" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E8E4DE] px-3 py-2 text-sm font-inter bg-white focus:outline-none focus:border-[#3A5A40]"
          data-testid="order-status-filter">
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
          className="border border-[#E8E4DE] px-3 py-2 text-sm font-inter bg-white focus:outline-none focus:border-[#3A5A40]"
          data-testid="order-payment-filter">
          {PAYMENT_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-[#3A5A40]/5 border border-[#3A5A40]/20 px-4 py-3" data-testid="bulk-actions-bar">
          <span className="font-inter text-sm text-[#3A5A40] font-medium">
            {selected.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleBulkAction("Shipped")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white font-inter text-[10px] uppercase tracking-[0.1em] hover:bg-purple-700 disabled:opacity-50 transition-colors"
              data-testid="bulk-mark-shipped">
              <Truck className="w-3 h-3" /> Mark Shipped
            </button>
            <button onClick={() => handleBulkAction("Out for Delivery")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white font-inter text-[10px] uppercase tracking-[0.1em] hover:bg-orange-600 disabled:opacity-50 transition-colors"
              data-testid="bulk-mark-ofd">
              <Package className="w-3 h-3" /> Out for Delivery
            </button>
            <button onClick={() => handleBulkAction("Delivered")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-inter text-[10px] uppercase tracking-[0.1em] hover:bg-green-700 disabled:opacity-50 transition-colors"
              data-testid="bulk-mark-delivered">
              <PackageCheck className="w-3 h-3" /> Mark Delivered
            </button>
          </div>
          {bulkLoading && <Loader2 className="w-4 h-4 text-[#3A5A40] animate-spin" />}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E8E4DE] bg-[#F9F7F4]">
                <th className="text-center px-3 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-[#9B9B8E] hover:text-[#3A5A40]" data-testid="select-all-orders">
                    {selected.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#3A5A40]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Order</th>
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Customer</th>
                <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Amount</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Payment</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Status</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Date</th>
                <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className={`border-b border-[#F4F1EC] hover:bg-[#FAFAF8] transition-colors ${selected.includes(o.id) ? "bg-[#3A5A40]/3" : ""}`}>
                  <td className="text-center px-3 py-3">
                    <button onClick={() => toggleSelect(o.id)} className="text-[#9B9B8E] hover:text-[#3A5A40]">
                      {selected.includes(o.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#3A5A40]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-inter text-sm font-medium text-[#1A1A1A]">#{o.id?.slice(0, 8)}</p>
                    <p className="font-inter text-[10px] text-[#9B9B8E]">{(o.items || []).length} items</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-inter text-sm">{o.name}</p>
                    <p className="font-inter text-[11px] text-[#9B9B8E]">{o.phone}</p>
                    <p className="font-inter text-[11px] text-[#9B9B8E]">{o.city}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-inter text-sm font-medium">Rs.{fmt(o.subtotal || 0)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] font-inter px-2 py-0.5 ${paymentColor(o.payment_status)}`}>
                      {o.payment_status || "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] font-inter px-2 py-0.5 ${statusColor(o.order_status)}`}>
                      {o.order_status || "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-inter text-[12px] text-[#9B9B8E]">{o.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDetail(o)} className="p-1.5 text-[#9B9B8E] hover:text-[#3A5A40] transition-colors"
                      data-testid={`view-order-${o.id}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 font-inter text-sm text-[#9B9B8E]">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} onStatusUpdate={handleStatusUpdate} />}
    </div>
  );
}
