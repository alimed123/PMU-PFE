import StatCard from '../components/StartCard';
import InfoCard from '../components/InfoCard';
import PhasorDiagram from '../components/RadarChart';
import ScatterChart from '../components/ScatterChart';
import UpperBar from '../components/UpperBar';
import axios from 'axios';
import { useEffect, useState } from 'react';

const timelines = [
  { label: 'Last 1 second', value: '-1s' },
  { label: 'Last 5 seconds', value: '-5s' },
  { label: 'Last 15 seconds', value: '-15s' },
  { label: 'Last 30 seconds', value: '-30s' },
  { label: 'Last 1 minute', value: '-1m' },
  { label: 'Last 5 minutes', value: '-5m' },
  { label: 'Last 10 minutes', value: '-10m' },
  { label: 'Last 30 minutes', value: '-30m' },
];
const info = [
  ['Grid Name', 'Grid Name'],
  ['Nominal Frequency', '50 Hz'],
  ['Number of Substations (monitored)', '48 (44)'],
];

const getPmuNames = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/getpmus');
    //console.log('PMU Names:', response); // Log the PMU names for debugging
    return response.data.pmus || []; // Assuming the API returns {pmus: [...]}
  } catch (error) {
    console.error('Error fetching PMU names:', error);
    return [];
  }
};

const protocolOptions = [
  { label: 'UDP', value: 'udp' },
  { label: 'TCP', value: 'tcp' },
  
];

export default function App() {
  //call function to get pmu names
  const [pmuNames, setPmuNames] = useState([]);
  const [selectedPmu, setSelectedPmu] = useState('');
  const [pmuData, setPmuData] = useState(null);
  const [selectedTimeline, setSelectedTimeline] = useState(timelines[0].value);
  const [selectedPhase, setSelectedPhase] = useState('a'); // Default phase

  // Protocol state with localStorage persistence
  const [selectedProtocol, setSelectedProtocol] = useState(() => {
    return localStorage.getItem('selectedProtocol') || 'udp';
  });

  useEffect(() => {
    const fetchPmuNames = async () => {
      const names = await getPmuNames();
      setPmuNames(names);
      if (names.length > 0) {
        setSelectedPmu(names[0]); // Set first PMU as default
      }
    };
    fetchPmuNames();
  }, []);

  useEffect(() => {
    if (!selectedPmu) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/power_a`, {
          params: {
            pmu: selectedPmu,
            start: selectedTimeline,
            phasor: selectedPhase, // Include phase in the request
          },
        });
        console.log('PMU Data:', response.data); // Log the PMU data for debugging
        setPmuData(response.data);
      } catch (error) {
        console.error('Error loading PMU data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for continuous fetching
    const intervalId = setInterval(fetchData, 1000); // Fetch every second

    // Cleanup interval on component unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [selectedPmu, selectedTimeline, selectedPhase]);

  const handleTimelineChange = (e) => {
    setSelectedTimeline(e.target.value);
  };

  const handlePhasorlineChange = (e) => {
    setSelectedPhase(e.target.value);
  };

  const handlePmuChange = async (e) => {
    const selected = e.target.value;
    setSelectedPmu(selected);
  };

  // Protocol select handler
  const handleProtocolChange = async (e) => {
    const protocol = e.target.value;
    setSelectedProtocol(protocol);
    localStorage.setItem('selectedProtocol', protocol);
    try {
      await axios.post(`http://localhost:8000/api/changeprotocol?protocol=${protocol}`);
    } catch (error) {
      console.error('Error changing protocol:', error);
    }
  };

  return (
    <div className="bg-backgroundlight min-h-screen">
      <div className='flex justify-end gap-10 p-4'>
        <div>
          <select
            value={selectedTimeline}
            onChange={handleTimelineChange}
            className="mb-4 p-2 border rounded-lg bg-blue-700 text-white shadow"
          >
            {timelines.map((timeline, index) => (
              <option key={index} value={timeline.value}>
                {timeline.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPmu}
            onChange={handlePmuChange}
            className="mb-4 p-2 border rounded-lg bg-blue-700 text-white shadow"
          >
            <option value="">Select PMU</option>
            {pmuNames.map((pmu, index) => (
              <option key={index} value={pmu}>{pmu}</option>
            ))}
          </select>
        </div>

        {/* Protocol select */}
        <div>
          <select
            value={selectedProtocol}
            onChange={handleProtocolChange}
            className="mb-4 p-2 border rounded-lg bg-blue-700 text-white shadow"
          >
            {protocolOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPhase}
            onChange={handlePhasorlineChange}
            className="mb-4 p-2 border rounded-lg bg-blue-700 text-white shadow"
          >
            <option value="">Select Phasor</option>
            {["a", "b", "c"].map((timeline, _) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6 p-8">
        <StatCard
          key="PF"
          title="PF"
          label="Power Factor"
          value={pmuData?.PF?.toFixed(3) || 'N/A'}
        />
        <StatCard
          key="P"
          title="P"
          label="Active Power"
          value={`${pmuData?.P?.toFixed(2)} W`}
        />
        <StatCard
          key="Q"
          title="Q"
          label="Reactive Power"
          value={`${(pmuData?.Q / 1000).toFixed(5)} kVAR`}
        />
        <StatCard
          key="S"
          title="S"
          label="Apparent Power"
          value={`${(pmuData?.S / 1000).toFixed(5)} kVA`}
        />
      </div>
      <div className="flex flex-row justify-between gap-24 mb-6 p-8">
        <div className="flex flex-col justify-center items-center col-span-2 bg-white p-4 shadow w-1/2">
          <h2 className="font-semibold mb-2">Voltage Phasors</h2>
          <PhasorDiagram
          V={pmuData?.V}
          v_a_ang={pmuData?.v_a_ang}
          v_b_ang={pmuData?.v_b_ang}
          v_c_ang={pmuData?.v_c_ang}
          name1 = "va"
          name2 = "vb"
          name3 = "vc"
        />
        
        </div>
        <div className="flex flex-col justify-center items-center col-span-2 bg-white p-4 shadow w-1/2">
          <h2 className="font-semibold mb-2">Current Phasors</h2>
          <PhasorDiagram
          V={pmuData?.V}
          v_a_ang={pmuData?.i_a_ang}
          v_b_ang={pmuData?.i_b_ang}
          v_c_ang={pmuData?.i_c_ang}
          name1 = "Ia"
          name2 = "Ib"
          name3 = "Ic"
        />
        
        </div>
      </div>

    </div>
  );
}