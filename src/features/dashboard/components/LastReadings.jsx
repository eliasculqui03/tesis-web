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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    pusher.connection.bind("connected", () => setIsConnected(true));
    pusher.connection.bind("disconnected", () => setIsConnected(false));
    const channel = pusher.subscribe("water-quality");
    channel.bind("new-reading", (data) => {
      setHasNewReading(true);
      loadData();
      setTimeout(() => setHasNewReading(false), 3000);
    });
    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  const isOptimal = (ph, ec) => ph >= 6.5 && ph <= 8.5 && ec >= 200 && ec <= 800;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 h-full animate-pulse">
        <div className="h-5 bg-gray-100 rounded-lg w-1/2 mb-6"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-50 rounded-xl mb-3"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h2 className="font-jakarta text-sm font-bold text-navy uppercase tracking-tight">Últimas Lecturas</h2>
          {hasNewReading && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>
        <button onClick={loadData} className="p-1.5 text-gray-400 hover:text-navy transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {readings.length === 0 ? (
          <div className="text-center py-10 text-[11px] font-bold text-gray-300 uppercase">Sin lecturas</div>
        ) : (
          readings.map((reading, index) => {
            const ph = parseFloat(reading.value_ph);
            const ec = parseFloat(reading.value_ec);
            const optimal = isOptimal(ph, ec);
            const isFirst = index === 0;

            return (
              <div
                key={reading.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isFirst && hasNewReading 
                    ? "bg-emerald-50 border-emerald-100 shadow-sm" 
                    : "bg-white border-gray-50 hover:border-gold/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{reading.datetime}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${optimal ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {optimal ? 'Óptimo' : 'Alerta'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">pH</span>
                    <span className={`text-sm font-black font-jakarta ${ph >= 6.5 && ph <= 8.5 ? 'text-blue-600' : 'text-red-600'}`}>
                      {ph.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-gray-100 pl-4">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">EC</span>
                    <span className={`text-sm font-black font-jakarta ${ec >= 200 && ec <= 800 ? 'text-gold' : 'text-red-600'}`}>
                      {ec.toFixed(0)} <span className="text-[10px] uppercase font-bold">µS</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
