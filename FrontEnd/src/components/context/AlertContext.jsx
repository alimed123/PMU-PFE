import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Create context
const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const ws = useRef(null);

  // Sound effect
  const playSound = () => {
    const audio = new Audio("/alert.mp3"); // place alert.mp3 in public/
    audio.play();
  };

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/alerts");

    ws.current.onmessage = (event) => {
      const newAlerts = JSON.parse(event.data);
      setAlerts(prev => {
        const updated = [...prev, ...newAlerts];
        return updated;
      });
      playSound();
    };

    ws.current.onerror = () => console.error("WebSocket error");
    ws.current.onclose = () => console.warn("WebSocket closed");

    return () => {
      ws.current && ws.current.close();
    };
  }, []);

  return (
    <AlertContext.Provider value={{ alerts }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
