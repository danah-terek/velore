import { useState, useEffect, useCallback } from "react";
import { AdminAuthProvider, useAdminAuth } from "./auth/AdminAuthContext";
import AdminLogin from "./auth/AdminLogin";
import adminService from "./adminService";

// ─── Status styles ──────────────────────────────────────────────────────────
const statusStyle = {
  delivered:  "bg-emerald-100 text-emerald-700",
  shipped:    "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  pending:    "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-100 text-red-700",
};

// ─── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
  { icon: "⊡",  label: "Dashboard" },
  { icon: "👥", label: "Users" },
  { icon: "📦", label: "Products" },
  { icon: "🛍️", label: "Orders" },
  { icon: "📋", label: "Audit Logs" },
];

// ─── Mini sparkline chart ───────────────────────────────────────────────────
const MiniChart = ({ values }) => {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const h = 56, w = 220;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="rgba(255,255,255,0.15)" />
    </svg>
  );
};

// ─── Revenue bar chart ──────────────────────────────────────────────────────
const RevenueBar = ({ values, months }) => {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t-md bg-violet-500 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:bg-violet-400 cursor-pointer relative"
            style={{ height: `${(v / max) * 100}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              ${v}k
            </div>
          </div>
          <span className="text-[9px] text-gray-400 hidden sm:block">{months[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
  </div>
);

// ─── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
      <p className="text-xs text-gray-500">
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >← Prev</button>
        <button
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPage(pagination.page + 1)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >Next →</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ════════════════════════════════════════════════════════════════════════════
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SPARKLINE = [420,380,510,470,620,580,710,680,820,760,910,880];

function DashboardView({ onNavigate }) {
  const [dash, setDash]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setDash(res.data))
      .catch(err => setError(err.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <p className="text-rose-400 text-sm p-6">{error}</p>;

  const stats = [
    { label: "Total Users",    value: dash.users.total.toLocaleString(),   icon: "👥", color: "from-violet-500 to-indigo-600" },
    { label: "Total Orders",   value: dash.orders.total.toLocaleString(),  icon: "🛍️", color: "from-rose-500 to-pink-600" },
    { label: "Total Products", value: dash.products.total.toLocaleString(),icon: "📦", color: "from-amber-500 to-orange-500" },
    { label: "Total Revenue",  value: `$${Number(dash.revenue.total).toLocaleString()}`, icon: "💰", color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`relative rounded-2xl bg-gradient-to-br ${stat.color} p-4 sm:p-5 overflow-hidden shadow-lg`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-black/10 translate-y-6 -translate-x-4" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
                {i === 1 && dash.orders.pending > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white/20 text-white">
                    {dash.orders.pending} pending
                  </span>
                )}
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              <div className="mt-2 sm:mt-3 pt-3 border-t border-white/10">
                <MiniChart values={SPARKLINE.slice(i * 2, i * 2 + 8)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Annual Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold">${Number(dash.revenue.total).toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">↑ From completed payments</p>
            </div>
            <div className="flex gap-2">
              {["W","M","Y"].map((t) => (
                <button key={t} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${t === "M" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>{t}</button>
              ))}
            </div>
          </div>
          <RevenueBar values={SPARKLINE} months={MONTHS} />
        </div>

        <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 space-y-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Quick Overview</p>
          {[
            { label: "Active Users",    value: dash.users.active,              bar: Math.round((dash.users.active / (dash.users.total || 1)) * 100),  color: "bg-violet-500" },
            { label: "Pending Orders",  value: dash.orders.pending,            bar: Math.round((dash.orders.pending / (dash.orders.total || 1)) * 100), color: "bg-rose-500" },
            { label: "Active Products", value: dash.products.total,            bar: 80, color: "bg-amber-500" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">{item.label}</span>
                <span className="text-xs font-semibold text-gray-200">{item.value}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(item.bar, 100)}%` }} />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{dash.users.active}</p>
              <p className="text-[11px] text-gray-500">Active Users</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{dash.orders.pending}</p>
              <p className="text-[11px] text-gray-500">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold">Recent Orders</p>
          <button onClick={() => onNavigate("Orders")} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all →</button>
        </div>
        <div className="space-y-2">
          {dash.recent_orders.map((o, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                {(o.user || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate group-hover:text-violet-300 transition-colors">{o.user}</p>
                <p className="text-[11px] text-gray-500">#{o.order_id} · {new Date(o.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[o.status] || "bg-gray-100 text-gray-600"}`}>
                {o.status}
              </span>
              <p className="text-sm font-semibold text-gray-200 flex-shrink-0">${Number(o.amount || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// USERS VIEW
// ════════════════════════════════════════════════════════════════════════════
function UsersView() {
  const [data, setData]         = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page: p, limit: 15, search: s });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1, ""); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      const res = await adminService.toggleUserStatus(id);
      setData(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActionId(id);
    try {
      await adminService.deleteUser(id);
      setData(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  return (
    <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-sm font-semibold">Users {pagination && <span className="text-gray-500 font-normal">({pagination.total})</span>}</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 w-52"
          />
          <button type="submit" className="px-3 py-2 text-xs rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors">Search</button>
        </form>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name","Email","Role","Orders","Points","Status","Actions"].map(h => (
                    <th key={h} className="text-left text-gray-500 pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map(u => (
                  <tr key={u.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-200 truncate max-w-[100px]">{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 truncate max-w-[140px]">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px]">{u.role || "user"}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{u.orders_count}</td>
                    <td className="py-3 pr-4 text-gray-400">{u.loyalty_points}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionId === u.id}
                          onClick={() => handleToggle(u.id)}
                          className="px-2 py-1 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-40"
                        >
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                        <button
                          disabled={actionId === u.id}
                          onClick={() => handleDelete(u.id)}
                          className="px-2 py-1 text-[10px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPage={(p) => { setPage(p); load(p, search); }} />
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTS VIEW
// ════════════════════════════════════════════════════════════════════════════
function ProductsView() {
  const [data, setData]         = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({ page: p, limit: 15, search: s });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1, ""); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(1, search); };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      const res = await adminService.toggleProductStatus(id);
      setData(prev => prev.map(p => p.id === id ? { ...p, is_active: res.data.is_active } : p));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setActionId(id);
    try {
      await adminService.deleteProduct(id);
      setData(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  return (
    <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-sm font-semibold">Products {pagination && <span className="text-gray-500 font-normal">({pagination.total})</span>}</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 w-52"
          />
          <button type="submit" className="px-3 py-2 text-xs rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors">Search</button>
        </form>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name","Brand","Category","Price","Variants","Status","Actions"].map(h => (
                    <th key={h} className="text-left text-gray-500 pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map(p => (
                  <tr key={p.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-200 truncate max-w-[140px]">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.brand || "—"}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.category || "—"}</td>
                    <td className="py-3 pr-4 text-gray-200">${Number(p.price).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.variants_count}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionId === p.id}
                          onClick={() => handleToggle(p.id)}
                          className="px-2 py-1 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-40"
                        >
                          {p.is_active ? "Disable" : "Enable"}
                        </button>
                        <button
                          disabled={actionId === p.id}
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-1 text-[10px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPage={(p) => load(p, search)} />
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORDERS VIEW
// ════════════════════════════════════════════════════════════════════════════
const ORDER_STATUSES = ["pending","processing","shipped","delivered","cancelled"];

function OrdersView() {
  const [data, setData]           = useState([]);
  const [pagination, setPag]      = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setFilter] = useState("");
  const [updatingId, setUpdating] = useState(null);

  const load = useCallback(async (p = 1, s = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({ page: p, limit: 15, status: s || undefined });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1, ""); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await adminService.updateOrderStatus(id, newStatus);
      setData(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status } : o));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-sm font-semibold">Orders {pagination && <span className="text-gray-500 font-normal">({pagination.total})</span>}</p>
        <select
          value={statusFilter}
          onChange={e => { setFilter(e.target.value); load(1, e.target.value); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order ID","Customer","Items","Amount","Payment","Date","Status"].map(h => (
                    <th key={h} className="text-left text-gray-500 pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map(o => (
                  <tr key={o.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-mono text-violet-400">#{o.id}</td>
                    <td className="py-3 pr-4">
                      <p className="text-gray-200 font-medium">{o.user?.name || "—"}</p>
                      <p className="text-gray-500 text-[10px]">{o.user?.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{o.items_count}</td>
                    <td className="py-3 pr-4 text-gray-200">${Number(o.payment?.amount || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-gray-400">{o.payment?.payment_meth || "—"}</td>
                    <td className="py-3 pr-4 text-gray-400">{new Date(o.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <select
                        disabled={updatingId === o.id}
                        value={o.status}
                        onChange={e => handleStatusUpdate(o.id, e.target.value)}
                        className={`text-[10px] px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none disabled:opacity-40
                          ${statusStyle[o.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPage={(p) => load(p, statusFilter)} />
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS VIEW
// ════════════════════════════════════════════════════════════════════════════
function AuditLogsView() {
  const [data, setData]       = useState([]);
  const [pagination, setPag]  = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ page: p, limit: 50 });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-[#18181f] rounded-2xl border border-white/5 p-5 sm:p-6">
      <p className="text-sm font-semibold mb-6">Audit Logs {pagination && <span className="text-gray-500 font-normal">({pagination.total})</span>}</p>

      {loading ? <Spinner /> : (
        <>
          <div className="space-y-2">
            {data.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-[10px] text-violet-400 flex-shrink-0 mt-0.5">
                  📋
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-200">{log.action}</span>
                    <span className="text-[10px] text-violet-400">{log.admin || "System"}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{log.details}</p>
                </div>
                <p className="text-[10px] text-gray-600 flex-shrink-0">{new Date(log.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPage={load} />
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SHELL (sidebar + header + view switcher)
// ════════════════════════════════════════════════════════════════════════════
function AdminShell() {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav]     = useState("Dashboard");

  const navigate = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  const initials = admin?.name
    ? admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : (admin?.email?.[0] || "A").toUpperCase();

  const renderView = () => {
    switch (activeNav) {
      case "Dashboard":  return <DashboardView onNavigate={navigate} />;
      case "Users":      return <UsersView />;
      case "Products":   return <ProductsView />;
      case "Orders":     return <OrdersView />;
      case "Audit Logs": return <AuditLogsView />;
      default:           return <DashboardView onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white font-sans flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#18181f] border-r border-white/5 z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/30">V</div>
            <div>
              <p className="font-semibold text-sm tracking-wide">Velore</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Eyewear Admin</p>
            </div>
          </div>
        </div>

        {/* Admin user */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.name || admin?.email}</p>
              <p className="text-[11px] text-gray-500 capitalize">{admin?.role || "Admin"}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 px-3 pb-2">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left
                ${activeNav === item.label
                  ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-violet-300 border border-violet-500/20"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {activeNav === item.label && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200"
          >
            <span className="text-base w-5 text-center">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0f0f13]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400"
            >☰</button>
            <div>
              <h1 className="text-sm font-semibold">{activeNav}</h1>
              <p className="text-[11px] text-gray-500">Velore Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {admin?.email}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {renderView()}
          <div className="pb-2 text-center text-xs text-gray-700">
            Velore Admin Panel · 2026 · Built with ♥
          </div>
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT — wraps everything in auth context, shows login or shell
// ════════════════════════════════════════════════════════════════════════════
export default function VeloreAdmin() {
  return (
    <AdminAuthProvider>
      <AuthGate />
    </AdminAuthProvider>
  );
}

function AuthGate() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <AdminShell /> : <AdminLogin />;
}