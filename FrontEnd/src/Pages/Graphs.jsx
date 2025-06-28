import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
  zoomPlugin,
  ScatterController
);

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#e6194b", "#3cb44b"];
const PHASE_OPTIONS = [
  { value: "a", label: "Phase A" },
  { value: "b", label: "Phase B" },
  { value: "c", label: "Phase C" }
];
const PHASE_LABELS = { a: "A", b: "B", c: "C" };

async function getPmuNames() {
  try {
    const response = await axios.get("http://localhost:8000/api/getpmus");
    return response.data.pmus || [];
  } catch (error) {
    console.error("Error fetching PMU names:", error);
    return [];
  }
}

function getFieldNames(base, phases, data) {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  // Always include total field if present
  const totalKey = base;
  const candidates = phases.map(ph => `${base}_${ph.toUpperCase()}`);
  const result = [];
  if (keys.includes(totalKey)) result.push(totalKey);
  candidates.forEach(k => { if (keys.includes(k)) result.push(k); });
  return result;
}

function ChartWrapper({ title, datasets, labels, yLabel }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", axis: "xy", intersect: false },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: yLabel || "" } }
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
      zoom: {
        pan: { enabled: true, mode: "xy" },
        zoom: {
          wheel: { enabled: true },
          drag: { enabled: true, borderColor: "red", borderWidth: 1 },
          mode: "xy"
        }
      }
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 w-full h-[420px]">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="w-full h-full">
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}

function PQScatterChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Active Power (P)" } },
      y: { title: { display: true, text: "Reactive Power (Q)" } }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => {
            const { P, Q, PF } = ctx.raw;
            return [
              `P: ${P?.toFixed(2)} W`,
              `Q: ${Q?.toFixed(2)} VAR`,
              `PF: ${PF?.toFixed(3)}`
            ];
          }
        }
      },
      zoom: {
        pan: { enabled: true, mode: "xy" },
        zoom: {
          wheel: { enabled: true },
          drag: { enabled: true, borderColor: "red", borderWidth: 1 },
          mode: "xy"
        }
      }
    }
  };

  const scatterData = {
    datasets: [
      {
        label: "P-Q Points",
        data: data.map(d => ({ x: d.P, y: d.Q, P: d.P, Q: d.Q, PF: d.PF })),
        backgroundColor: "#8884d8"
      }
    ]
  };

  return (
    <div className="bg-white rounded shadow p-4 w-full h-[420px]">
      <h3 className="font-semibold mb-2">P-Q Scatter (Zoom + Tooltip)</h3>
      <div className="w-full h-full">
        <Scatter data={scatterData} options={options} />
      </div>
    </div>
  );
}



export default function Graphs() {
  const [pmuNames, setPmuNames] = useState([]);
  const [selectedPmu, setSelectedPmu] = useState("");
  const [selectedPhases, setSelectedPhases] = useState(["A", "B", "C"]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    getPmuNames().then(names => {
      setPmuNames(names);
      if (names.length > 0) setSelectedPmu(names[0]);
    });
  }, []);

  // Real-time polling
  useEffect(() => {
    if (!selectedPmu) return;
    setLoading(true);

    const fetchData = () => {
      axios
        .get("http://localhost:8000/api/power_timeseries", {
          params: { pmu: selectedPmu, start: "-1h", window: "10s" }
        })
        .then(res => setData(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, 5000); // Poll every 5s

    return () => clearInterval(intervalRef.current);
  }, [selectedPmu]);

  const handlePhaseChange = (value) => {
    setSelectedPhases(prev => {
      const next = prev.includes(value) ? prev.filter(ph => ph !== value) : [...prev, value];
      return next.length ? next : prev;
    });
  };

  const labels = data.map(d => d.time?.slice(11, 19));

  // Always show total + selected phases
  const powerFields = getFieldNames("P", selectedPhases, data)
    .concat(getFieldNames("Q", selectedPhases, data))
    .concat(getFieldNames("PF", selectedPhases, data));
  const voltageFields = getFieldNames("V", selectedPhases, data);
  const currentFields = getFieldNames("I", selectedPhases, data);

  const makeDatasets = (fields) =>
    fields.map((key, i) => ({
      label: key,
      data: data.map(d => d[key]),
      fill: false,
      borderColor: COLORS[i % COLORS.length],
      tension: 0.2
    }));

  return (
    <div className="bg-backgroundlight min-h-screen flex flex-col items-center">
      <div className="bg-white mt-8 mb-6 rounded-2xl shadow-lg w-full max-w-[1800px] p-8">
        <h2 className="font-bold text-2xl text-center mb-8">⚡ PMU Power Dashboard</h2>

        <div className="flex flex-wrap items-center gap-6 mb-8 justify-center">
          <label className="font-semibold">PMU:</label>
          <select
            className="p-2 border rounded focus:outline-blue-500 min-w-[160px]"
            value={selectedPmu}
            onChange={e => setSelectedPmu(e.target.value)}
          >
            {pmuNames.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label className="font-semibold ml-4">Phasors:</label>
          <div className="flex gap-2 bg-gray-100 rounded px-3 py-2">
            {PHASE_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPhases.includes(opt.value.toUpperCase())}
                  onChange={() => handlePhaseChange(opt.value.toUpperCase())}
                  className="accent-blue-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse py-16">Loading data...</div>
        ) : (
          <div className="flex flex-col gap-10 w-full">
            <div className="w-full">
              <PQScatterChart data={data} />
            </div>
            <div className="w-full">
              <ChartWrapper
                title="Power (P, Q, PF) Over Time"
                datasets={makeDatasets(powerFields)}
                labels={labels}
                yLabel="Power (W / VAR)"
              />
            </div>
            <div className="w-full">
              <ChartWrapper
                title="Current Over Time"
                datasets={makeDatasets(currentFields)}
                labels={labels}
                yLabel="Current (A)"
              />
            </div>
            <div className="w-full">
              <ChartWrapper
                title="Voltage Over Time"
                datasets={makeDatasets(voltageFields)}
                labels={labels}
                yLabel="Voltage (V)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}