export default function DashboardPage() {
  const stats = [
    {
      label: "Total Usuarios",
      value: "24",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
      color: "bg-emerald-500",
    },
    {
      label: "Lecturas de Hoy",
      value: "156",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
      color: "bg-blue-500",
    },
  ];

  const waterStatus = [
    { label: "Óptimo", count: 12, percent: 60, color: "bg-emerald-500" },
    { label: "Aceptable", count: 6, percent: 30, color: "bg-gray-400" },
    { label: "Crítico", count: 2, percent: 10, color: "bg-red-500" },
  ];

  const totalReadings = waterStatus.reduce((acc, item) => acc + item.count, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicadores</h1>
          <p className="text-gray-500 text-sm">Estadísticas del sistema</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
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
          Hoy
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}
            >
              <div className={`${stat.color.replace("bg-", "text-")}`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Water Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Left Side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500 bg-opacity-10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Calidad del Agua</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReadings}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {waterStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                    />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.percent}% ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Donut Chart */}
          <div className="shrink-0">
            <div className="relative w-48 h-48">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                />
                {
                  waterStatus.reduce(
                    (acc, item, index) => {
                      const offset = acc.offset;
                      const dash = (item.percent / 100) * 251.2;
                      const color =
                        item.color === "bg-emerald-500"
                          ? "#10b981"
                          : item.color === "bg-gray-400"
                          ? "#9ca3af"
                          : "#ef4444";
                      acc.elements.push(
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={color}
                          strokeWidth="12"
                          strokeDasharray={`${dash} 251.2`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                      acc.offset += dash;
                      return acc;
                    },
                    { elements: [], offset: 0 }
                  ).elements
                }
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {totalReadings}
                </span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
