import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line';
  height?: number;
  showValues?: boolean;
  maxValue?: number;
}

export default function SimpleChart({ 
  data, 
  type, 
  height = 200, 
  showValues = true,
  maxValue 
}: SimpleChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min;

  if (type === 'bar') {
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="flex h-full items-end justify-between gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div className="mb-2 flex w-full items-end justify-center">
                <div
                  className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${((point.value - min) / range) * (height - 40)}px`,
                    backgroundColor: point.color || '#3B82F6'
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {point.label}
                </div>
                {showValues && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {point.value}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (((point.value - min) / range) * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            fill="none"
            stroke={data[0]?.color || '#3B82F6'}
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((point.value - min) / range) * 100);
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={point.color || '#3B82F6'}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((point, index) => (
            <div key={index} className="text-center">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {point.label}
              </div>
              {showValues && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {point.value}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
