import { useMemo } from "react";

// Generador de números pseudo-aleatorios con seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generar datos fuera del componente (estáticos)
function generateChartData() {
  const data = [];
  const months = [
    { name: "Enero", days: 31 },
    { name: "Febrero", days: 28 },
  ];

  let seed = 1;

  months.forEach((month) => {
    for (let day = 1; day <= month.days; day++) {
      seed++;

      // pH: rango normal 6.5-8.5, promedio ~7.2
      const phBase = 7.2 + Math.sin(day * 0.3) * 0.4;
      const phVariation = (seededRandom(seed) - 0.5) * 0.6;
      let ph = phBase + phVariation;

      // EC: rango normal 200-800 µS/cm, promedio ~450
      const ecBase = 450 + Math.cos(day * 0.2) * 100;
      const ecVariation = (seededRandom(seed + 100) - 0.5) * 150;
      let ec = ecBase + ecVariation;

      // Añadir algunos picos críticos
      if (day === 8 && month.name === "Enero") {
        ph = 8.9;
        ec = 920;
      }
      if (day === 15 && month.name === "Enero") {
        ph = 6.1;
      }
      if (day === 22 && month.name === "Enero") {
        ec = 180;
      }
      if (day === 5 && month.name === "Febrero") {
        ph = 8.7;
      }
      if (day === 12 && month.name === "Febrero") {
        ec = 890;
      }
      if (day === 20 && month.name === "Febrero") {
        ph = 6.2;
        ec = 210;
      }

      data.push({
        day,
        month: month.name,
        label: `${day} ${month.name.substring(0, 3)}`,
        ph: Math.round(ph * 100) / 100,
        ec: Math.round(ec),
      });
    }
  });

  return data;
}

// Datos generados una sola vez
const CHART_DATA = generateChartData();

export default function DashboardPage() {
  // Usar datos pre-generados
  const chartData = CHART_DATA;

  // Calcular estadísticas
  const stats = useMemo(() => {
    const phValues = chartData.map((d) => d.ph);
    const ecValues = chartData.map((d) => d.ec);

    return {
      ph: {
        min: Math.min(...phValues),
        max: Math.max(...phValues),
        avg: (phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2),
        minIndex: phValues.indexOf(Math.min(...phValues)),
        maxIndex: phValues.indexOf(Math.max(...phValues)),
      },
      ec: {
        min: Math.min(...ecValues),
        max: Math.max(...ecValues),
        avg: Math.round(ecValues.reduce((a, b) => a + b, 0) / ecValues.length),
        minIndex: ecValues.indexOf(Math.min(...ecValues)),
        maxIndex: ecValues.indexOf(Math.max(...ecValues)),
      },
    };
  }, [chartData]);

  // Rangos normales
  const phRange = { min: 6.5, max: 8.5 };
  const ecRange = { min: 200, max: 800 };

  // Normalizar valores para el gráfico
  const phMin = 5.5,
    phMax = 9.5;
  const ecMin = 100,
    ecMax = 1000;

  const normalizePh = (value) => ((value - phMin) / (phMax - phMin)) * 100;
  const normalizeEc = (value) => ((value - ecMin) / (ecMax - ecMin)) * 100;

  // Generar path para líneas
  const generatePath = (data, normalize) => {
    const width = 100;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = 100 - normalize(d);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  // Generar área
  const generateArea = (data, normalize) => {
    const width = 100;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = 100 - normalize(d);
      return `${x},${y}`;
    });
    return `M 0,100 L ${points.join(" L ")} L 100,100 Z`;
  };

  const phPath = generatePath(
    chartData.map((d) => d.ph),
    normalizePh
  );
  const ecPath = generatePath(
    chartData.map((d) => d.ec),
    normalizeEc
  );
  const phArea = generateArea(
    chartData.map((d) => d.ph),
    normalizePh
  );
  const ecArea = generateArea(
    chartData.map((d) => d.ec),
    normalizeEc
  );

  // Stats cards
  const statCards = [
    {
      label: "pH Promedio",
      value: stats.ph.avg,
      icon: (
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
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      label: "EC Promedio",
      value: `${stats.ec.avg} µS`,
      icon: (
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
      ),
      color: "amber",
    },
    {
      label: "Alertas",
      value: "6",
      icon: (
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
      color: "red",
    },
    {
      label: "Días Analizados",
      value: "59",
      icon: (
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
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
      color: "emerald",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Monitoreo de Calidad del Agua
          </h1>
          <p className="text-gray-500 text-sm">
            Datos de Enero - Febrero 2025 (24 muestras/día)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div
              className={`w-10 h-10 rounded-lg ${colorClasses[stat.color].bg} ${
                colorClasses[stat.color].text
              } flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            pH y Conductividad Eléctrica (EC)
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">pH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-600">EC (µS/cm)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Crítico</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {/* Y Axis Labels - pH (left) */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-blue-600">
            <span>9.5</span>
            <span>8.5</span>
            <span>7.0</span>
            <span>6.5</span>
            <span>5.5</span>
          </div>

          {/* Y Axis Labels - EC (right) */}
          <div className="absolute right-0 top-0 bottom-8 w-14 flex flex-col justify-between text-xs text-amber-600 text-right">
            <span>1000</span>
            <span>800</span>
            <span>550</span>
            <span>200</span>
            <span>100</span>
          </div>

          {/* Chart Area */}
          <div className="ml-14 mr-16 h-80 sm:h-96 relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Zona normal pH */}
              <rect
                x="0"
                y={100 - normalizePh(phRange.max)}
                width="100"
                height={normalizePh(phRange.max) - normalizePh(phRange.min)}
                fill="rgba(59, 130, 246, 0.05)"
              />

              {/* Zona normal EC */}
              <rect
                x="0"
                y={100 - normalizeEc(ecRange.max)}
                width="100"
                height={normalizeEc(ecRange.max) - normalizeEc(ecRange.min)}
                fill="rgba(245, 158, 11, 0.05)"
              />

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.2"
                />
              ))}

              {/* Límites pH */}
              <line
                x1="0"
                y1={100 - normalizePh(phRange.max)}
                x2="100"
                y2={100 - normalizePh(phRange.max)}
                stroke="#3b82f6"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              <line
                x1="0"
                y1={100 - normalizePh(phRange.min)}
                x2="100"
                y2={100 - normalizePh(phRange.min)}
                stroke="#3b82f6"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />

              {/* Límites EC */}
              <line
                x1="0"
                y1={100 - normalizeEc(ecRange.max)}
                x2="100"
                y2={100 - normalizeEc(ecRange.max)}
                stroke="#f59e0b"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              <line
                x1="0"
                y1={100 - normalizeEc(ecRange.min)}
                x2="100"
                y2={100 - normalizeEc(ecRange.min)}
                stroke="#f59e0b"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />

              {/* Área EC */}
              <path d={ecArea} fill="rgba(245, 158, 11, 0.15)" />

              {/* Área pH */}
              <path d={phArea} fill="rgba(59, 130, 246, 0.15)" />

              {/* Línea EC */}
              <path d={ecPath} fill="none" stroke="#f59e0b" strokeWidth="0.5" />

              {/* Línea pH */}
              <path d={phPath} fill="none" stroke="#3b82f6" strokeWidth="0.5" />

              {/* Puntos críticos pH */}
              {chartData.map((d, i) => {
                if (d.ph > phRange.max || d.ph < phRange.min) {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - normalizePh(d.ph);
                  return (
                    <g key={`ph-critical-${i}`}>
                      <circle cx={x} cy={y} r="1.2" fill="#ef4444" />
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="0.3"
                        opacity="0.5"
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* Puntos críticos EC */}
              {chartData.map((d, i) => {
                if (d.ec > ecRange.max || d.ec < ecRange.min) {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - normalizeEc(d.ec);
                  return (
                    <g key={`ec-critical-${i}`}>
                      <circle cx={x} cy={y} r="1.2" fill="#ef4444" />
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="0.3"
                        opacity="0.5"
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* Punto máximo pH */}
              <circle
                cx={(stats.ph.maxIndex / (chartData.length - 1)) * 100}
                cy={100 - normalizePh(stats.ph.max)}
                r="1.5"
                fill="#dc2626"
              />

              {/* Punto mínimo pH */}
              <circle
                cx={(stats.ph.minIndex / (chartData.length - 1)) * 100}
                cy={100 - normalizePh(stats.ph.min)}
                r="1.5"
                fill="#dc2626"
              />

              {/* Punto máximo EC */}
              <circle
                cx={(stats.ec.maxIndex / (chartData.length - 1)) * 100}
                cy={100 - normalizeEc(stats.ec.max)}
                r="1.5"
                fill="#dc2626"
              />

              {/* Punto mínimo EC */}
              <circle
                cx={(stats.ec.minIndex / (chartData.length - 1)) * 100}
                cy={100 - normalizeEc(stats.ec.min)}
                r="1.5"
                fill="#dc2626"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 transform translate-y-6">
              <span>1 Ene</span>
              <span>8 Ene</span>
              <span>15 Ene</span>
              <span>22 Ene</span>
              <span>31 Ene</span>
              <span>7 Feb</span>
              <span>14 Feb</span>
              <span>21 Feb</span>
              <span>28 Feb</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-6 border-t border-gray-100">
          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-blue-600 mb-1">pH Máximo</p>
            <p className="text-lg font-bold text-blue-700">{stats.ph.max}</p>
            <p className="text-xs text-blue-500">
              {chartData[stats.ph.maxIndex]?.label}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-blue-600 mb-1">pH Mínimo</p>
            <p className="text-lg font-bold text-blue-700">{stats.ph.min}</p>
            <p className="text-xs text-blue-500">
              {chartData[stats.ph.minIndex]?.label}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50">
            <p className="text-xs text-amber-600 mb-1">EC Máximo</p>
            <p className="text-lg font-bold text-amber-700">
              {stats.ec.max} µS
            </p>
            <p className="text-xs text-amber-500">
              {chartData[stats.ec.maxIndex]?.label}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50">
            <p className="text-xs text-amber-600 mb-1">EC Mínimo</p>
            <p className="text-lg font-bold text-amber-700">
              {stats.ec.min} µS
            </p>
            <p className="text-xs text-amber-500">
              {chartData[stats.ec.minIndex]?.label}
            </p>
          </div>
        </div>

        {/* Range Info */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-200" />
            Rango normal pH: {phRange.min} - {phRange.max}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-200" />
            Rango normal EC: {ecRange.min} - {ecRange.max} µS/cm
          </span>
        </div>
      </div>
    </div>
  );
}
