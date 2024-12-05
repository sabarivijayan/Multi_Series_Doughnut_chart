'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './chart-structure.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PillarData {
  label: string;
  value: number;
  name: string;
}

const WealthPillarsChart = () => {
  const [chartData, setChartData] = useState<PillarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chart-data');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getColor = (label: string | number) => {
    const numericValue = parseInt(String(label).split('/')[0], 10); // Convert label to string and extract numeric part
    if (numericValue >= 1 && numericValue <= 2) return '#FF4444'; // Red
    if (numericValue >= 3 && numericValue <= 4) return '#FF8C42'; // Orange
    if (numericValue >= 5 && numericValue <= 6) return '#FFD700'; // Yellow
    if (numericValue === 7) return '#9ACD32'; // Lime
    if (numericValue >= 8 && numericValue <= 10) return '#4CAF50'; // Green
    return '#CCCCCC'; // Default color for missing or invalid labels
  };

  const outerSections = ['Governance', 'Structures', 'Sustainable Philanthropy', 'Assets', 'Advisors', 'Documentation'];
  const innerSections = ['Vision', 'Education', 'Health', 'Communication'];

  const normalize = (str: string) => str.trim().toLowerCase();

  const getDataForSection = (name: string): PillarData => {
    const normalizedSectionName = normalize(name);
    const sectionData = chartData.find(item => normalize(item.name) === normalizedSectionName);
    return sectionData || { label: '0/10', value: 0, name };
  };

  const curvedTextPlugin = {
    id: 'curvedText',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const drawTextOnArc = (meta: any, sections: any, isInner: any) => {
        meta.data.forEach((arc: any, index: any) => {
          const section = sections[index];
          const data = getDataForSection(section);

          const angle = (arc.startAngle + arc.endAngle) / 2; // Middle angle
          const radius = isInner
            ? (arc.outerRadius + arc.innerRadius) / 2
            : (arc.outerRadius + arc.innerRadius) / 2;

          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.save();
          ctx.fillStyle = '#000'; // Custom text color
          ctx.font = '16px Arial'; // Custom font style
          ctx.translate(x, y);

          if (angle >= 0 && angle <= Math.PI / 2) {
            ctx.rotate(angle + Math.PI / 2 + Math.PI);
          } else if (angle > (3 * Math.PI) / 2 && angle <= 2 * Math.PI) {
            ctx.rotate(angle + Math.PI / 2 + Math.PI);
          } else if (angle >= Math.PI / 2 && angle <= Math.PI) {
            ctx.rotate(angle + Math.PI / 2 + Math.PI);
          } else {
            ctx.rotate(angle + Math.PI / 2);
          }

          ctx.fillText(section, 0, -10); // Section name
          ctx.fillText(data.label, 0, 10); // Data label
          ctx.restore();
        });
      };

      const outerMeta = chart.getDatasetMeta(0);
      drawTextOnArc(outerMeta, outerSections, false);

      const innerMeta = chart.getDatasetMeta(1);
      drawTextOnArc(innerMeta, innerSections, true);

      ctx.restore();
    },
  };

  const data: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: outerSections.map(() => 1),
        backgroundColor: outerSections.map((section) => {
          const data = getDataForSection(section);
          return getColor(data.label);
        }),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 40,
      },
      {
        data: innerSections.map(() => 1),
        backgroundColor: innerSections.map((section) => {
          const data = getDataForSection(section);
          return getColor(data.label);
        }),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 30,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const sections =
              context.datasetIndex === 0 ? outerSections : innerSections;
            const section = sections[context.dataIndex];
            const data = getDataForSection(section);
            return `${section}: ${data.label}`;
          },
        },
      },
    },
    onClick: (_event, elements, chart) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const section =
          chartElement.datasetIndex === 0
            ? outerSections[chartElement.index]
            : innerSections[chartElement.index];
        window.location.href = `/section/${section}`;
      }
    },
    layout: { padding: 20 },
    animation: { animateRotate: true, animateScale: true },
    hover: {
      mode: 'nearest',
      intersect: true,
      animationDuration: 400, // Hover animation duration
    },
    elements: {
      arc: {
        hoverOffset: 50, // Bulging effect when hovered
      },
    },
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <Doughnut data={data} options={options} plugins={[curvedTextPlugin]} />
          <div className={styles.centerContent}>
            <img src="./Group.svg" alt="Pillars" />
          </div>
        </div>
      </div>
    );
  }
};

export default WealthPillarsChart;
