import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WeatherChart({ daily, units }) {
  // Formater les dates (YYYY-MM-DD -> Jour JJ/MM)
  const labels = daily.time.map((dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: `Max (${units.temperature_2m_max})`,
        data: daily.temperature_2m_max,
        borderColor: '#ff5722',
        backgroundColor: 'rgba(255, 87, 34, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: `Min (${units.temperature_2m_min})`,
        data: daily.temperature_2m_min,
        borderColor: '#0070f3',
        backgroundColor: 'rgba(0, 112, 243, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Évolution des températures sur 5 jours' }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `${value}°C`
        }
      }
    }
  };

  return (
    <div style={{ marginTop: '25px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #eee' }}>
      <Line data={data} options={options} />
    </div>
  );
}