import React from "react";
import { useAlerts } from "../components/context/AlertContext";

export default function Notification() {
  const { alerts } = useAlerts();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-4">⚠️ PMU Notifications</h2>
      <div className="bg-white rounded shadow p-4">
        {alerts.length === 0 ? (
          <div className="text-gray-500">No alerts yet.</div>
        ) : (
          <ul className="divide-y">
            {alerts.map((alert, idx) => (
              <li key={idx} className="py-2">
                <span className="font-medium">PMU {alert.pmu}</span> has abnormal{" "}
                <span className="text-red-600 font-semibold">{alert.type}</span> —{" "}
                {alert.value?.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}