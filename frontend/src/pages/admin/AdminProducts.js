import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Plus, Pencil, Trash2, Loader2, X, ToggleLeft, ToggleRight, Search } from "lucide-react";

const CATEGORIES = [
  { value: "village_pantry", label: "Village Pantry" },
  { value: "season_harvest", label: "Season Harvest" },
  { value: "festive", label: "Festive Collection" },
  { value: "secret_garden", label: "Secret Garden" },
];

const BADGE_TYPES = [
  { value: "", label: "None" },
  { value: "BEST_SELLER", label: "Best Seller" },
  { value: "LIMITED_HARVEST", label: "Limited Harvest" },
  { value: "SEASON_ENDING", label: "Season Ending" },
  { value: "SOLD_OUT", label: "Sold Out" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "CUSTOM", label: "Custom" },
];

const AVAILABILITY = [
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD_OUT", label: "Sold Out" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "PREORDER", label: "Pre-order" },
  { value: "HIDDEN", label: "Hidden" },
];

const availColor = (s) => {
  const map = {
    AVAILABLE: "bg-green-50 text-green-700",
    SOLD_OUT: "bg-red-50 text-red-700",
    COMING_SOON: "bg-amber-50 text-amber-700",
    PREORDER: "bg-blue-50 text-blue-700",
    HIDDEN: "bg-gray-100 text-gray-500",
  };
  return map[s] || "bg-gray-50 text-gray-700";
};

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: "", tagline: "", origin: "", basePrice: 0, unit: "", minQty: 1,
    qtyStep: 1, qtyUnit: "kg", badge: "", badge_type: "", badge_text: "", badge_color: "",
    image: "", category: "village_pantry", comingSoon: false, inStock: true, subscribable: false,
    availability_status: "AVAILABLE", stock_quantity: 100, low_stock_threshold: 5,
    next_harvest_window: "", show_harvest_window: false,
    ...(product || {}),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      basePrice: Number(form.basePrice),
      minQty: Number(form.minQty),
      qtyStep: Number(form.qtyStep),
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
    });
    setSaving(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[600px] mb-10 border border-[#E8E4DE]" data-testid="product-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
          <h3 className="font-playfair text-lg">{isEdit ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="text-[#9B9B8E] hover:text-[#1A1A1A]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-name-input" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white" data-testid="product-category-select">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Tagline</label>
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
              className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Origin</label>
              <input value={form.origin} onChange={(e) => set("origin", e.target.value)}
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Availability</label>
              <select value={form.availability_status} onChange={(e) => set("availability_status", e.target.value)}
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white" data-testid="product-availability-select">
                {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Price (Rs.) *</label>
              <input type="number" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} required min="0"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-price-input" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Unit</label>
              <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="e.g. 1 kg jar"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Qty Unit</label>
              <input value={form.qtyUnit} onChange={(e) => set("qtyUnit", e.target.value)}
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Min Qty</label>
              <input type="number" value={form.minQty} onChange={(e) => set("minQty", e.target.value)} min="1"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Qty Step</label>
              <input type="number" value={form.qtyStep} onChange={(e) => set("qtyStep", e.target.value)} min="1"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Stock Qty</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} min="0"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-stock-input" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Low Stock At</label>
              <input type="number" value={form.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} min="0"
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-low-stock-input" />
            </div>
          </div>

          {/* Badge */}
          <div className="border-t border-[#E8E4DE] pt-4">
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">Product Badge</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Badge Type</label>
                <select value={form.badge_type} onChange={(e) => set("badge_type", e.target.value)}
                  className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white" data-testid="product-badge-type-select">
                  {BADGE_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              {form.badge_type === "CUSTOM" && (
                <div>
                  <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Badge Text</label>
                  <input value={form.badge_text} onChange={(e) => set("badge_text", e.target.value)}
                    placeholder="Custom label..."
                    className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-badge-text-input" />
                </div>
              )}
              <div>
                <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Badge Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.badge_color || "#3A5A40"}
                    onChange={(e) => set("badge_color", e.target.value)}
                    className="w-8 h-8 border border-[#E8E4DE] cursor-pointer" data-testid="product-badge-color-input" />
                  <input value={form.badge_color} onChange={(e) => set("badge_color", e.target.value)}
                    placeholder="#3A5A40"
                    className="flex-1 border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
                </div>
              </div>
            </div>
          </div>

          {/* Legacy badge (read-only display if set) */}
          {form.badge && !form.badge_type && (
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Legacy Badge</label>
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)}
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" />
            </div>
          )}

          {/* Harvest Window */}
          <div className="border-t border-[#E8E4DE] pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Harvest Window</p>
              <label className="flex items-center gap-2 cursor-pointer" data-testid="harvest-window-toggle">
                <div
                  onClick={() => set("show_harvest_window", !form.show_harvest_window)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    form.show_harvest_window ? "bg-[#3A5A40]" : "bg-[#D4D4D4]"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    form.show_harvest_window ? "translate-x-4" : ""
                  }`} />
                </div>
                <span className="font-inter text-[11px] text-[#6B6B60]">
                  {form.show_harvest_window ? "Visible" : "Hidden"}
                </span>
              </label>
            </div>
            <input
              value={form.next_harvest_window}
              onChange={(e) => set("next_harvest_window", e.target.value)}
              placeholder="e.g. Harvested between June 12–18 in Gir region"
              className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]"
              data-testid="harvest-window-input"
            />
          </div>

          <div>
            <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">Image URL</label>
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..."
              className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]" data-testid="product-image-input" />
            {form.image && <img src={form.image} alt="Preview" className="mt-2 h-20 object-cover border border-[#E8E4DE]" />}
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 font-inter text-sm text-[#4B5563] cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="accent-[#3A5A40]" /> In Stock
            </label>
            <label className="flex items-center gap-2 font-inter text-sm text-[#4B5563] cursor-pointer">
              <input type="checkbox" checked={form.comingSoon} onChange={(e) => set("comingSoon", e.target.checked)} className="accent-[#3A5A40]" /> Coming Soon
            </label>
            <label className="flex items-center gap-2 font-inter text-sm text-[#4B5563] cursor-pointer">
              <input type="checkbox" checked={form.subscribable} onChange={(e) => set("subscribable", e.target.checked)} className="accent-[#3A5A40]" /> Subscribable
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E4DE]">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 font-inter text-[11px] uppercase tracking-[0.1em] border border-[#E8E4DE] text-[#9B9B8E] hover:text-[#1A1A1A] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 font-inter text-[11px] uppercase tracking-[0.1em] bg-[#3A5A40] text-white hover:bg-[#2c4430] transition-colors disabled:opacity-50"
              data-testid="product-save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { apiFetch } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const load = useCallback(() => {
  setLoading(true);

  apiFetch("/products")
    .then(setProducts)
    .finally(() => setLoading(false));

}, [apiFetch]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    const isEdit = !!data.id && modal?.id;
    if (isEdit) {
      await apiFetch(`/products/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      const { id, ...rest } = data;
      await apiFetch("/products", { method: "POST", body: JSON.stringify(rest) });
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggleStock = async (id) => {
    await apiFetch(`/products/${id}/stock`, { method: "PATCH" });
    load();
  };

  const filtered = products.filter((p) => {
    if (filterCat !== "all" && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

  return (
    <div data-testid="admin-products">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-[#1A1A1A]">Products</h2>
          <p className="font-inter text-sm text-[#9B9B8E] mt-1">{products.length} total products</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors"
          data-testid="add-product-btn">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B8E]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8E4DE] text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white"
            data-testid="product-search-input" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] bg-white"
          data-testid="product-filter-category">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E8E4DE] bg-[#F9F7F4]">
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Product</th>
                <th className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Category</th>
                <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Price</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Status</th>
                <th className="text-center px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Stock</th>
                <th className="text-right px-4 py-3 font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[#F4F1EC] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover border border-[#E8E4DE]" />
                      <div>
                        <p className="font-inter text-sm font-medium text-[#1A1A1A]">{p.name}</p>
                        <p className="font-inter text-[11px] text-[#9B9B8E]">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-inter text-[11px] px-2 py-0.5 bg-[#F4F1EC] text-[#6B6B60]">
                      {CATEGORIES.find((c) => c.value === p.category)?.label || p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-inter text-sm font-medium">Rs.{fmt(p.basePrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] font-inter px-2 py-0.5 ${availColor(p.availability_status || "AVAILABLE")}`}>
                      {AVAILABILITY.find((a) => a.value === (p.availability_status || "AVAILABLE"))?.label || p.availability_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-inter text-sm ${
                      (p.stock_quantity || 0) <= (p.low_stock_threshold || 5) ? "text-red-600 font-medium" : "text-[#6B6B60]"
                    }`}>
                      {p.stock_quantity ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleStock(p.id)} data-testid={`toggle-stock-${p.id}`}
                        className="transition-colors p-1">
                        {p.inStock !== false ? (
                          <ToggleRight className="w-5 h-5 text-[#3A5A40]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#D4D4D4]" />
                        )}
                      </button>
                      <button onClick={() => setModal(p)} className="p-1.5 text-[#9B9B8E] hover:text-[#3A5A40] transition-colors"
                        data-testid={`edit-product-${p.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#9B9B8E] hover:text-red-500 transition-colors"
                        data-testid={`delete-product-${p.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 font-inter text-sm text-[#9B9B8E]">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && <ProductModal product={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
