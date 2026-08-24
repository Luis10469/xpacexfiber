import { Bar } from "react-chartjs-2";

const PlanesMasContratadosChart = ({ data }) => {
  if (!data.length) {
    return (
      <p className="text-slate-400 text-sm text-center py-16">
        Sin datos suficientes.
      </p>
    );
  }

  const chartData = {
    labels: data.map((d) => d.plan),
    datasets: [
      {
        label: "Clientes",
        data: data.map((d) => d.total),
        backgroundColor: "#a855f7",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", precision: 0 },
        grid: { color: "#334155" },
        beginAtZero: true,
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PlanesMasContratadosChart;
