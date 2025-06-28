import React, { useState } from 'react';

const degToRad = (deg) => deg * Math.PI / 180;

const getCoords = (V, angle) => ({
  x: V * Math.cos(degToRad(angle)),
  y: -V * Math.sin(degToRad(angle))
});

const Tooltip = ({ x, y, value, angle, color, name }) => (
  <g>
    <defs>
      <filter id="tooltip-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15"/>
      </filter>
    </defs>
    <rect 
      x={x + 15} 
      y={y - 45} 
      width="120" 
      height="50" 
      rx="8" 
      fill="rgba(255, 255, 255, 0.95)" 
      stroke={color} 
      strokeWidth="2"
      filter="url(#tooltip-shadow)"
    />
    <text x={x + 25} y={y - 28} fill={color} fontSize="14" fontWeight="600">
      {name}
    </text>
    <text x={x + 25} y={y - 12} fill="#4B5563" fontSize="12">
      Mag: {value.toFixed(2)}
    </text>
    <text x={x + 25} y={y + 2} fill="#4B5563" fontSize="12">
      Ang: {angle.toFixed(1)}°
    </text>
  </g>
);

const GridLines = ({ origin, radius }) => (
  <g opacity="0.3">
    {/* Concentric circles */}
    {[0.25, 0.5, 0.75, 1].map((factor, i) => (
      <circle
        key={i}
        cx={origin.x}
        cy={origin.y}
        r={radius * factor}
        stroke="#E5E7EB"
        strokeWidth="1"
        fill="none"
        strokeDasharray={factor === 1 ? "none" : "4,4"}
      />
    ))}
    
    {/* Radial lines */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
      const coords = getCoords(radius, angle);
      return (
        <line
          key={angle}
          x1={origin.x}
          y1={origin.y}
          x2={origin.x + coords.x}
          y2={origin.y + coords.y}
          stroke="#E5E7EB"
          strokeWidth="1"
          strokeDasharray="2,3"
        />
      );
    })}
  </g>
);

const AngleMarkers = ({ origin, radius }) => (
  <g>
    {[0, 90, 180, 270].map(angle => {
      const coords = getCoords(radius + 20, angle);
      const label = angle === 0 ? '0°' : angle === 90 ? '90°' : angle === 180 ? '180°' : '270°';
      return (
        <text
          key={angle}
          x={origin.x + coords.x}
          y={origin.y + coords.y + 5}
          textAnchor="middle"
          fill="#6B7280"
          fontSize="12"
          fontWeight="500"
        >
          {label}
        </text>
      );
    })}
  </g>
);

const PhasorArrow = ({ x1, y1, x2, y2, color }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 12;
  const arrowAngle = Math.PI / 6;
  
  const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle);
  
  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
        <filter id="phasor-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Phasor line with gradient */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="4"
        filter="url(#phasor-glow)"
      />
      
      {/* Arrow head */}
      <polygon
        points={`${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={color}
        filter="url(#phasor-glow)"
      />
    </g>
  );
};

const PhasorDiagram = ({ V = 230, v_a_ang = 0, v_b_ang = -120, v_c_ang = 120, name1 = "Va", name2 = "Vb", name3 = "Vc" }) => {
  const origin = { x: 350, y: 350 };
  const maxRadius = 250;
  const scale = maxRadius / V;

  const va = getCoords(V * scale, v_a_ang);
  const vb = getCoords(V * scale, v_b_ang);
  const vc = getCoords(V * scale, v_c_ang);

  const [hovered, setHovered] = useState(null);

  const phasors = [
    { ...va, name: name1, color: "#EF4444", value: V, angle: v_a_ang, id: 'a' },
    { ...vb, name: name2, color: "#3B82F6", value: V, angle: v_b_ang, id: 'b' },
    { ...vc, name: name3, color: "#10B981", value: V, angle: v_c_ang, id: 'c' }
  ];

  return (
    <div className="flex flex-col items-center p-8">

      
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
        <svg width={700} height={700} className="drop-shadow-sm">
          <defs>
            <radialGradient id="background-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEFEFE"/>
              <stop offset="100%" stopColor="#F8FAFC"/>
            </radialGradient>
          </defs>
                    
          {/* Grid and markers */}
          <GridLines origin={origin} radius={maxRadius} />
          <AngleMarkers origin={origin} radius={maxRadius} />
          
          {/* Main circle */}
          <circle 
            cx={origin.x} 
            cy={origin.y} 
            r={maxRadius} 
            stroke="#1F2937" 
            strokeWidth="2" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Phasors */}
          {phasors.map((phasor, idx) => (
            <g key={idx}>
              <PhasorArrow
                x1={origin.x}
                y1={origin.y}
                x2={origin.x + phasor.x}
                y2={origin.y + phasor.y}
                color={phasor.color}
              />
              
              {/* Phasor label */}
              <g transform={`translate(${origin.x + phasor.x + 15}, ${origin.y + phasor.y})`}>
                <circle r="18" fill={phasor.color} opacity="0.1" />
                <text
                  textAnchor="middle"
                  dy="5"
                  fill={phasor.color}
                  fontSize="14"
                  fontWeight="700"
                >
                  {phasor.name}
                </text>
              </g>
              
              {/* Interactive area */}
              <circle
                cx={origin.x + phasor.x}
                cy={origin.y + phasor.y}
                r={25}
                fill="transparent"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
                className="transition-all duration-200 hover:fill-black hover:fill-opacity-5"
              />
              
              {/* Tooltip */}
              {hovered === idx && (
                <g className="animate-fade-in">
                  <Tooltip
                    x={origin.x + phasor.x}
                    y={origin.y + phasor.y}
                    value={phasor.value}
                    angle={phasor.angle}
                    color={phasor.color}
                    name={phasor.name}
                  />
                </g>
              )}
            </g>
          ))}

          {/* Center point */}
          <circle cx={origin.x} cy={origin.y} r="6" fill="#1F2937" />
          <circle cx={origin.x} cy={origin.y} r="3" fill="#FFFFFF" />
          
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Phasor Values</h3>
        <div className="grid grid-cols-3 gap-6">
          {phasors.map((phasor, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: phasor.color }}
              />
              <div>
                <div className="font-semibold text-slate-800">{phasor.name}</div>
                <div className="text-sm text-slate-600">
                  {phasor.value.toFixed(2)} ∠ {phasor.angle.toFixed(1)}°
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhasorDiagram;