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

  // Cargar datos
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

  // Cargar cuando cambia el filtro
  useEffect(() => {
    loadData();
  }, [filter]);

  // Pusher para mostrar nueva lectura
  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });

    pusher.connection.bind("connected", () => setIsConnected(true));
    pusher.connection.bind("disconnected", () => setIsConnected(false));

    const channel = pusher.subscribe("water-quality");

    channel.bind("new-reading", (data) => {
      console.log("📡 Dashboard: Nueva lectura", data);
      setNewReading(data);

      // Ocultar después de 10 segundos
      setTimeout(() => setNewReading(null), 10000);
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  // Helpers
  const statusColors = {
    óptimo: "text-emerald-600",
    bajo: "text-amber-600",
    alto: "text-red-600",
  };

  const getPhStatus = (ph) => {
    if (!ph) return null;
    if (ph >= 6.5 && ph <= 8.5) return "óptimo";
    return ph < 6.5 ? "bajo" : "alto";
  };

  const getEcStatus = (ec) => {
    if (!ec) return null;
    if (ec >= 200 && ec <= 800) return "óptimo";
    return ec < 200 ? "bajo" : "alto";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    });
  };

  // SVG Paths
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

  const generateArea = (data, key, minVal, maxVal) => {
    if (!data || data.length === 0) return "";
    const points = data.map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const value = parseFloat(d[key]) || 0;
      const y = 100 - ((value - minVal) / (maxVal - minVal)) * 100;
      return `${x.toFixed(2)},${Math.max(0, Math.min(100, y)).toFixed(2)}`;
    });
    return `M 0,100 L ${points.join(" L ")} L 100,100 Z`;
  };

  const phPath = generatePath(chartData, "ph_avg", 5, 10);
  const ecPath = generatePath(chartData, "ec_avg", 0, 1200);
  const phArea = generateArea(chartData, "ph_avg", 5, 10);
  const ecArea = generateArea(chartData, "ec_avg", 0, 1200);

  // Etiquetas X
  const getXLabels = () => {
    if (!chartData || chartData.length === 0) return [];
    const step = Math.max(Math.floor(chartData.length / 6), 1);
    const labels = [];
    for (let i = 0; i < chartData.length; i += step) {
      labels.push({
        pos: (i / (chartData.length - 1)) * 100,
        date: chartData[i].date,
      });
    }
    return labels.slice(0, 7);
  };

  const xLabels = getXLabels();

  // Puntos críticos
  const getCriticalPoints = () => {
    if (!chartData || chartData.length === 0) return [];
    const points = [];
    chartData.forEach((d, i) => {
      const x = (i / Math.max(chartData.length - 1, 1)) * 100;
      const ph = parseFloat(d.ph_avg) || 0;
      const ec = parseFloat(d.ec_avg) || 0;

      if (ph < 6.5 || ph > 8.5) {
        const y = 100 - ((ph - 5) / 5) * 100;
        points.push({ x, y: Math.max(0, Math.min(100, y)), type: "ph" });
      }
      if (ec < 200 || ec > 800) {
        const y = 100 - (ec / 1200) * 100;
        points.push({ x, y: Math.max(0, Math.min(100, y)), type: "ec" });
      }
    });
    return points;
  };

  const criticalPoints = getCriticalPoints();

  const filters = [
    { key: "today", label: "Hoy" },
    { key: "7days", label: "7 días" },
    { key: "30days", label: "30 días" },
    { key: "60days", label: "60 días" },
  ];

  const phStatus = getPhStatus(stats?.latest?.value_ph);
  const ecStatus = getEcStatus(stats?.latest?.value_ec);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Monitoreo de Calidad del Agua
          </h1>
          <p className="text-gray-500 text-sm">
            Sistema en tiempo real - JASS Vituya
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Indicador conexión */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
            />
            {isConnected ? "En tiempo real" : "Desconectado"}
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Banner nueva lectura */}
      {newReading && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-700">
              Nueva lectura recibida
            </span>
            <span className="text-sm text-gray-500 ml-auto">
              {newReading.datetime}
            </span>
            <button
              onClick={() => setNewReading(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">pH</p>
              <p
                className={`text-2xl font-bold ${newReading.value_ph >= 6.5 && newReading.value_ph <= 8.5 ? "text-emerald-600" : "text-red-600"}`}
              >
                {newReading.value_ph?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">EC</p>
              <p
                className={`text-2xl font-bold ${newReading.value_ec >= 200 && newReading.value_ec <= 800 ? "text-blue-600" : "text-red-600"}`}
              >
                {newReading.value_ec?.toFixed(0)}{" "}
                <span className="text-sm font-normal">µS/cm</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Estado pH</p>
              <p
                className={`text-lg font-semibold capitalize ${statusColors[getPhStatus(newReading.value_ph)]}`}
              >
                {getPhStatus(newReading.value_ph)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Estado EC</p>
              <p
                className={`text-lg font-semibold capitalize ${statusColors[getEcStatus(newReading.value_ec)]}`}
              >
                {getEcStatus(newReading.value_ec)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">pH Actual</p>
          <p className="text-xl font-bold text-gray-900">
            {stats?.latest?.value_ph?.toFixed(2) || "-"}
          </p>
          {phStatus && (
            <p className={`text-xs capitalize ${statusColors[phStatus]}`}>
              {phStatus}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">EC Actual</p>
          <p className="text-xl font-bold text-gray-900">
            {stats?.latest?.value_ec?.toFixed(0) || "-"}{" "}
            <span className="text-sm font-normal text-gray-500">µS</span>
          </p>
          {ecStatus && (
            <p className={`text-xs capitalize ${statusColors[ecStatus]}`}>
              {ecStatus}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">Lecturas Hoy</p>
          <p className="text-xl font-bold text-gray-900">
            {stats?.today_readings || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">Alertas Hoy</p>
          <p className="text-xl font-bold text-gray-900">
            {stats?.today_alerts || 0}
          </p>
        </div>
      </div>

      {/* Gráfico + Últimas lecturas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Histórico pH y EC
            </h2>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">pH (6.5 - 8.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">EC (200 - 800 µS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Fuera de rango</span>
            </div>
          </div>

          {/* SVG Chart */}
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <svg
                className="animate-spin w-8 h-8 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Cargando...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Sin datos
            </div>
          ) : (
            <div className="relative h-64 sm:h-72">
              {/* Eje Y izquierdo */}
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-xs text-blue-600 font-medium">
                <span>10</span>
                <span>8.5</span>
                <span>7</span>
                <span>6.5</span>
                <span>5</span>
              </div>

              {/* Eje Y derecho */}
              <div className="absolute right-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-amber-600 font-medium text-right">
                <span>1200</span>
                <span>800</span>
                <span>500</span>
                <span>200</span>
                <span>0</span>
              </div>

              {/* SVG */}
              <div className="absolute left-10 right-14 top-0 bottom-6">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="0.3"
                    />
                  ))}
                  <rect
                    x="0"
                    y="30"
                    width="100"
                    height="40"
                    fill="rgba(59, 130, 246, 0.08)"
                  />
                  <rect
                    x="0"
                    y="33.3"
                    width="100"
                    height="50"
                    fill="rgba(245, 158, 11, 0.08)"
                  />
                  <path d={phArea} fill="rgba(59, 130, 246, 0.15)" />
                  <path d={ecArea} fill="rgba(245, 158, 11, 0.15)" />
                  <path
                    d={phPath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d={ecPath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  {criticalPoints.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="1.5"
                      fill="#dc2626"
                    />
                  ))}
                </svg>
              </div>

              {/* Eje X */}
              <div className="absolute left-10 right-14 bottom-0 h-5 flex justify-between text-xs text-gray-500">
                {xLabels.map((item, i) => (
                  <span key={i}>{formatDate(item.date)}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>{stats?.total_readings || 0} lecturas</span>
            <span>{stats?.alerts_count || 0} alertas</span>
          </div>
        </div>

        {/* Últimas 10 lecturas */}
        <div className="lg:col-span-1">
          <LastReadings />
        </div>
      </div>
    </div>
  );
}
