import React from 'react';


export default function InfoCard({ items }) {
  return (
    <div className="bg-white p-8  shadow w-1/2 flex flex-col justify-between">
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between py-1 text-textblue font-medium">
          <span className="font-medium  text-md">{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}