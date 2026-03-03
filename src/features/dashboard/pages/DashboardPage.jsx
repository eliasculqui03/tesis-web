import { useState, useEffect } from "react";
import { measurementService } from "../../../api/measurementService.js";
import LastReadings from "../components/LastReadings.jsx";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export default function DashboardPage() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("7days");
  const [newReading, setNewReading] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await measurementService.getAll({ filter });
      setChartData(response.data || []);
      setStats(response.stats || null);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    pusher.connection.bind("connected", () => setIsConnected(true));
    pusher.connection.bind("disconnected", () => setIsConnected(false));
    const channel = pusher.subscribe("water-quality");
    channel.bind("new-reading", (data) => {
      setNewReading(data);
      setTimeout(() => setNewReading(null), 10000);
    });
    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  const getStatusColor = (val, type) => {
    if (type === 'ph') {
      return (val >= 6.5 && val <= 8.5) ? 'text-emerald-500' : 'text-red-500';
    }
    return (val >= 200 && val <= 800) ? 'text-blue-500' : 'text-red-500';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
  };

  const generatePath = (data, key, minVal, maxVal) => {
    if (!data || data.length === 0) return "";
    const points = data.map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const value = parseFloat(d[key]) || 0;
      const y = 100 - ((value - minVal) / (maxVal - minVal)) * 100;
      return `${x.toFixed(2)},${Math.max(0, Math.min(100, y)).toFixed(2)}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const phPath = generatePath(chartData, "ph_avg", 5, 10);
  const ecPath = generatePath(chartData, "ec_avg", 0, 1200);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Panel de monitoreo en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all ${isConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
             <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
             {isConnected ? "En Vivo" : "Desconectado"}
           </div>
           <button onClick={loadData} className="p-2 text-navy-muted bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
           </button>
        </div>
      </div>

      {/* New Reading Alert */}
      {newReading && (
        <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-xl shadow-emerald-500/5 animate-in slide-in-from-top duration-500">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-navy font-jakarta">Nueva Lectura</span>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{newReading.datetime}</span>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">pH</p>
                <p className={`text-xl font-black ${getStatusColor(newReading.value_ph, 'ph')}`}>{newReading.value_ph?.toFixed(2)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">EC</p>
                <p className={`text-xl font-black ${getStatusColor(newReading.value_ec, 'ec')}`}>{newReading.value_ec?.toFixed(0)} <span className="text-xs font-bold uppercase">µS</span></p>
              </div>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Template */}
        {[
          { label: 'pH Actual', value: stats?.latest?.value_ph?.toFixed(2) || "-", icon: 'ph', color: 'blue', status: 'Óptimo' },
          { label: 'Conductividad', value: stats?.latest?.value_ec?.toFixed(0) || "-", suffix: 'µS', icon: 'ec', color: 'amber', status: 'Estable' },
          { label: 'Lecturas Hoy', value: stats?.today_readings || 0, icon: 'chart', color: 'emerald', trend: '+12%' },
          { label: 'Alertas Hoy', value: stats?.today_alerts || 0, icon: 'alert', color: 'red', status: 'Alerta' }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gold/30 transition-all group shadow-sm">
             <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center text-${item.color}-500 group-hover:bg-${item.color}-500 group-hover:text-white transition-all`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon === 'ph' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                    {item.icon === 'ec' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                    {item.icon === 'chart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                    {item.icon === 'alert' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                  </svg>
                </div>
                {item.status && <span className={`text-[9px] font-black bg-${item.color}-50 text-${item.color}-700 px-2 py-0.5 rounded uppercase`}>{item.status}</span>}
                {item.trend && <span className="text-xs font-bold text-emerald-600">{item.trend}</span>}
             </div>
             <p className="font-jakarta text-2xl font-black text-navy">{item.value} {item.suffix && <span className="text-xs font-bold">{item.suffix}</span>}</p>
             <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-jakarta text-lg font-bold text-navy tracking-tight">Histórico de Calidad</h2>
              <div className="flex bg-gray-50 p-1 rounded-lg">
                 {['today', '7days', '30days'].map((f) => (
                   <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${filter === f ? 'bg-navy text-white shadow-md' : 'text-gray-400 hover:text-navy'}`}
                   >
                    {f === 'today' ? 'Hoy' : f === '7days' ? '7 Días' : '30 Días'}
                   </button>
                 ))}
              </div>
           </div>

           <div className="relative h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-300 font-black text-xs uppercase tracking-widest animate-pulse">Cargando datos...</div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  ))}
                  <rect x="0" y="30" width="100" height="40" fill="rgba(197, 165, 90, 0.05)" />
                  <path d={phPath} fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
                  <path d={ecPath} fill="none" stroke="#c5a55a" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
           </div>
           
           <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm" />
                <span className="text-[11px] font-bold text-navy-muted uppercase tracking-tight">pH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-gold shadow-sm" />
                <span className="text-[11px] font-bold text-navy-muted uppercase tracking-tight">Conductividad</span>
              </div>
           </div>
        </div>

        {/* Sidebar Readings */}
        <div className="lg:col-span-1 h-full">
          <LastReadings />
        </div>
      </div>
    </div>
  );
}
