// src/hooks/usePusher.js

import { useState, useEffect, useCallback } from "react";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export function usePusher() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    pusher.connection.bind("connected", () => {
      console.log("✅ Conectado a Pusher");
      setIsConnected(true);
    });

    pusher.connection.bind("disconnected", () => {
      console.log("❌ Desconectado de Pusher");
      setIsConnected(false);
    });

    const channel = pusher.subscribe("water-quality");

    channel.bind("new-reading", (data) => {
      console.log("📡 Nueva lectura:", data);
      setLatestReading(data);
      setReadings((prev) => [data, ...prev].slice(0, 100));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const clearReadings = useCallback(() => {
    setReadings([]);
    setLatestReading(null);
  }, []);

  return {
    isConnected,
    latestReading,
    readings,
    clearReadings,
  };
}
