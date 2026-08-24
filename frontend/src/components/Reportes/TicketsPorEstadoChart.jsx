import { Doughnut } from "react-chartjs-2";

const COLORES_ESTADO = {
  Pendiente: "#eab308",
  "En proceso": "#3b82f6",
  Respondido: "#a855f7",
  Resuelto: "#22c55e",
  Cerrado: "#64748b",
};

const TicketsPorEstadoChart = ({ data }) => {
  if (!data.length) {
    return (
      <p className="text-slate-400 text-sm text-center py-16">
        Sin datos suficientes.
      </p>
    );
  }

  const chartData = {
    labels: data.map((d) => d.estado),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: data.map((d) => COLORES_ESTADO[d.estado] || "#94a3b8"),
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8" },
      },
    },
  };

  return (
    <div className="h-72">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default TicketsPorEstadoChart;
