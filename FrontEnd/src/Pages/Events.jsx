import React, { useEffect, useRef, useState } from 'react';
import ReactTableUI from 'react-table-ui';
import axios from 'axios';

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

const Events = () => {
  const [data, setData] = useState([]);
  const [pmuCount, setPmuCount] = useState(0);
  const [pmuNames, setPmuNames] = useState([]);
  const [selectedPmu, setSelectedPmu] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState(timelines[0].value);
  const tableInstanceRef = useRef(null);

  // Fetch PMU names on mount
  useEffect(() => {
    const fetchPmuNames = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/getpmus');
        setPmuNames(response.data.pmus || []);
        if (response.data.pmus && response.data.pmus.length > 0) {
          setSelectedPmu(response.data.pmus[0]);
        }
      } catch (error) {
        console.error('Error fetching PMU names:', error);
      }
    };
    fetchPmuNames();
  }, []);

  // Fetch data when selectedPmu or selectedTimeline changes
  useEffect(() => {
    if (!selectedPmu) return;
    const fetchData = async () => {
      try {
        const start = selectedTimeline;
        const response = await fetch(
          `http://localhost:8000/api/data?start=${encodeURIComponent(start)}&pmu=${selectedPmu}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // If the API returns an array of objects with all voltages/currents per row
        const transformed = result.map(item => ({
          Time: item.time,
          'Vₐ': item.v_a !== undefined ? item.v_a.toFixed(2) : '',
          'Vᵦ': item.v_b !== undefined ? item.v_b.toFixed(2) : '',
          'V𝒸': item.v_c !== undefined ? item.v_c.toFixed(2) : '',
          'Iₐ': item.i_a !== undefined ? item.i_a.toFixed(2) : '',
          'Iᵦ': item.i_b !== undefined ? item.i_b.toFixed(2) : '',
          'I𝒸': item.i_c !== undefined ? item.i_c.toFixed(2) : '',
          PMURef: item.pmu_id || item.tags?.pmu_id || 'pmu1'
        }));

        setData(transformed);

        // Calculate unique PMU count
        const uniquePMUs = new Set(transformed.map(row => row.PMURef));
        setPmuCount(uniquePMUs.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    }, [selectedPmu, selectedTimeline]);

  const handlePmuChange = (e) => {
    setSelectedPmu(e.target.value);
  };

  const handleTimelineChange = (e) => {
    setSelectedTimeline(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedTimeline}
          onChange={handleTimelineChange}
          className="p-2 border rounded-lg bg-blue-700 text-white shadow"
        >
          {timelines.map((timeline, index) => (
            <option key={index} value={timeline.value}>
              {timeline.label}
            </option>
          ))}
        </select>
        <select
          value={selectedPmu}
          onChange={handlePmuChange}
          className="p-2 border rounded-lg bg-blue-700 text-white shadow"
        >
          {pmuNames.map((pmu, idx) => (
            <option key={idx} value={pmu}>{pmu}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Number of PMUs: {pmuCount}
      </div>
      <ReactTableUI
        title='InfluxDB Events'
        data={data}
        tableInstanceRef={tableInstanceRef}
      />
    </div>
  );
};

export default Events;