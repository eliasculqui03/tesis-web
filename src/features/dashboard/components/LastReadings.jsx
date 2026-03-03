import { useState, useEffect } from "react";
import { measurementService } from "../../../api/measurementService.js";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export default function LastReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewReading, setHasNewReading] = useState(false);

  // Cargar datos
  const loadData = async () => {
    try {
      const response = await measurementService.getLastReadings();
      setReadings(response.data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Pusher - Solo en este componente
  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });

    pusher.connection.bind("connected", () => {
      console.log("✅ LastReadings: Conectado a Pusher");
      setIsConnected(true);
    });

    pusher.connection.bind("disconnected", () => {
      console.log("❌ LastReadings: Desconectado");
      setIsConnected(false);
    });

    const channel = pusher.subscribe("water-quality");

    channel.bind("new-reading", (data) => {
      console.log("📡 LastReadings: Nueva lectura", data);
      setHasNewReading(true);
      loadData();

      // Quitar indicador después de 3 segundos
      setTimeout(() => setHasNewReading(false), 3000);
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  const isOptimal = (ph, ec) => {
    return ph >= 6.5 && ph <= 8.5 && ec >= 200 && ec <= 800;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">Últimas Lecturas</h2>
          {hasNewReading && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-gray-300"}`}
          />
          <button
            onClick={loadData}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar"
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
          </button>
        </div>
      </div>

      {/* Lista */}
      {readings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
          Sin lecturas disponibles
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {readings.map((reading, index) => {
            const ph = parseFloat(reading.value_ph);
            const ec = parseFloat(reading.value_ec);
            const optimal = isOptimal(ph, ec);
            const isFirst = index === 0;

            return (
              <div
                key={reading.id}
                className={`px-4 py-3 transition-colors ${
                  isFirst && hasNewReading
                    ? "bg-emerald-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${optimal ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="text-sm text-gray-600">
                      {reading.datetime}
                    </span>
                  </div>
                  {isFirst && hasNewReading && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Nueva
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        ph >= 6.5 && ph <= 8.5
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      pH: {ph.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        ec >= 200 && ec <= 800
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      EC: {ec.toFixed(0)} µS
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      optimal
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {optimal ? "Óptimo" : "Alerta"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
