import { Line } from "react-chartjs-2";

const formatearMes = (periodo) => {
  const [anio, mes] = periodo.split("-");
  const fecha = new Date(Number(anio), Number(mes) - 1, 1);

  return fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
};

const CrecimientoClientesChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => formatearMes(d.periodo)),
    datasets: [
      {
        label: "Clientes nuevos",
        data: data.map((d) => d.total),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "#334155" },
      },
      y: {
        ticks: { color: "#94a3b8", precision: 0 },
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

export default CrecimientoClientesChart;
