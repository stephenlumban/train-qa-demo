import React from 'react';

const TrainSvg = ({ className = "", animated = true }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Train body */}
      <g>
        <rect x="50" y="40" width="300" height="50" rx="10" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2">
          {animated && (
            <animate attributeName="fill" values="#3B82F6;#2563EB;#3B82F6" dur="4s" repeatCount="indefinite" />
          )}
        </rect>
        {animated && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0; 2 0; -1 0; 0 0"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </g>
      
      {/* Train front */}
      <path d="M50 40 L20 55 L20 75 L50 90 Z" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
      
      {/* Windows */}
      <rect x="70" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="110" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="150" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="190" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="230" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="270" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      <rect x="310" y="50" width="25" height="15" rx="3" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1"/>
      
      {/* Wheels */}
      {[80, 130, 270, 320].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="95" r="12" fill="#374151" stroke="#111827" strokeWidth="2"/>
          <circle cx={cx} cy="95" r="6" fill="#6B7280">
            {animated && (
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from={`0 ${cx} 95`}
                to={`360 ${cx} 95`}
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
      ))}
      
      {/* Front light */}
      <circle cx="30" cy="65" r="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
      <circle cx="30" cy="65" r="4" fill="#FBBF24"/>
      
      {/* Door */}
      <rect x="200" y="55" width="15" height="30" rx="2" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1"/>
      <circle cx="212" cy="70" r="1" fill="#F3F4F6"/>
      
      {/* Train tracks */}
      <rect x="0" y="107" width="400" height="3" fill="#6B7280"/>
      {[10, 35, 60, 85, 110, 135, 160, 185, 210, 235, 260, 285, 310, 335, 360].map((x, index) => (
        <rect key={x} x={x} y="104" width="15" height="9" fill="#8B5CF6">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; -10 0; 0 0"
              dur={`${1 + index * 0.1}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}
      
      {/* Steam/smoke animation */}
      {animated && (
        <g>
          <circle cx="25" cy="30" r="4" fill="#F3F4F6" opacity="0.7">
            <animateTransform attributeName="transform" type="translate" values="0 0; -5 -10; 0 -20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="35" cy="20" r="6" fill="#F3F4F6" opacity="0.5">
            <animateTransform attributeName="transform" type="translate" values="0 0; -5 -15; 0 -25" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="45" cy="25" r="5" fill="#F3F4F6" opacity="0.6">
            <animateTransform attributeName="transform" type="translate" values="0 0; -3 -12; 0 -22" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default TrainSvg;