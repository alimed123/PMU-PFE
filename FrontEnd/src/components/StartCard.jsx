import React from 'react';

export default function StatCard({ title, label, value }) {
  return (
    <div className="bg-textblue/25  py-10 px-4 mb-24 h-full rounded-lg shadow-xl items-center flex flex-row justify-center gap-20 2xl:gap-40 2xl:px-10">
      <div className="text-4xl 2xl:text-6xl font-bold text-white drop-shadow-xl">{title}</div>
      <div className="text-xl 2xl:text-4xl font-bold text-textblue">
        {label}
        <div className="mt-2 text-xl 2xl:text-3xl font-bold">{value}</div>
        
      </div>
    </div>
  );
}