import { Line } from "react-chartjs-2";

const formatearMes = (periodo) => {
  const [anio, mes] = periodo.split("-");
  const fecha = new Date(Number(anio), Number(mes) - 1, 1);

  return fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
};

const IngresosMensualesChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => formatearMes(d.periodo)),
    datasets: [
      {
        label: "Ingresos",
        data: data.map((d) => d.total),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#22c55e",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString("es-CO")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "#334155" },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (value) => `$${value.toLocaleString("es-CO")}`,
        },
        grid: { color: "#334155" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default IngresosMensualesChart;
