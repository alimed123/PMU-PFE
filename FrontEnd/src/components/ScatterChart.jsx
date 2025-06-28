import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis
} from 'recharts';

// Example scatter data
const points = Array.from({ length: 50 }, (_, i) => ({
  x:  Math.random() * 800,
  y: -Math.random() * 4000,
  pf: Math.random(),
}));

export default function PowerScatter() {
  return (
    <ResponsiveContainer width="80%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {/* light grey circular grid */}
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />

        {/* axes colored to match scatter points */}
        <XAxis
          type="number"
          dataKey="x"
          name="Active power"
          unit="W"
          stroke="#8884d8"
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Reactive power"
          unit="var"
          stroke="#82ca9d"
        />

        {/* point size mapped via ZAxis */}
        <ZAxis dataKey="pf" range={[100, 400]} />

        {/* tooltip with orange outline */}
        <Tooltip cursor={{ stroke: "#ff7300", strokeWidth: 2 }} />
        <Legend />

        {/* scatter points in orange */}
        <Scatter
          name="Power points"
          data={points}
          fill="#ff7300"
          fillOpacity={0.8}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
