'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const BarChart = ({ data, backgroundColor, borderColor, borderWidth }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((item) => item.category), // X-axis labels
        datasets: [
          {
            label: 'Browser Usage',
            data: data.map((item) => item.total), // Y-axis values
            backgroundColor,
            borderColor,
            borderWidth,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false, text: 'Browser Usage Statistics' },
        },
        scales: {
          x: {
            grid: {
              display: false, // Turn off grid lines for the x-axis
            },
          },
          y: {
            ticks: {
              stepSize: 1, // Ensure only integers appear
              beginAtZero: true, // Ensure the y-axis starts at 0
            },
            grid: {
              display: false, // Turn off grid lines for the y-axis
            },
          },
        },
      },
    });

    return () => {
      chart.destroy(); // Clean up on unmount
    };
  }, [data]);

  return <canvas ref={canvasRef} />;
};

export default BarChart;
