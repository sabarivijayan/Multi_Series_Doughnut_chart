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
        const response = await fetch('http://localhost:4000/api/chart-data');
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

  const getColor = (
    ctx: CanvasRenderingContext2D,
    chartArea: any,
    numericValue: number
  ) => {
    const { width, height } = chartArea;
    const gradient = ctx.createLinearGradient(0, height, width, 0);

  
    if (numericValue >= 1 && numericValue <= 2) {
      // Red gradient
      gradient.addColorStop(0, '#FF0101'); // Bright red
      gradient.addColorStop(1, '#997A00'); // Dark red
    } else if (numericValue >= 3 && numericValue <= 4) {
      // Orange gradient
      gradient.addColorStop(0, '#F67119'); // Bright orange
      gradient.addColorStop(1, '#90420F'); // Dark orange
    } else if (numericValue >= 5 && numericValue <= 6) {
      // Yellow gradient
      gradient.addColorStop(0, '#FFFF00'); // Bright yellow
      gradient.addColorStop(1, '#8C8C00'); // Dark yellow
    } else if (numericValue === 7) {
      // Lime gradient
      gradient.addColorStop(0, '#CCFF33'); // Bright lime
      gradient.addColorStop(1, '#7A991F'); // Dark lime
    } else if (numericValue >= 8 && numericValue <= 10) {
      // Green gradient
      gradient.addColorStop(0, '#78E019'); // Bright green
      gradient.addColorStop(1, '#008027'); // Dark green
    } else {
      // Default grey gradient
      gradient.addColorStop(0, '#CCCCCC'); // Light grey
      gradient.addColorStop(1, '#999999'); // Dark grey
    }
  
    return gradient;
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
        backgroundColor: function (context) {
          const { chart } = context;
          const { ctx, chartArea } = chart;
  
          if (!chartArea) return '#CCCCCC'; // Default fallback color
  
          return outerSections.map((section) => {
            const data = getDataForSection(section);
            const numericValue = parseInt(String(data.label).split('/')[0], 10);
            return getColor(ctx, chartArea, numericValue);
          })[context.dataIndex];
        },
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 40,
      },
      {
        data: innerSections.map(() => 1),
        backgroundColor: function (context) {
          const { chart } = context;
          const { ctx, chartArea } = chart;
  
          if (!chartArea) return '#CCCCCC'; // Default fallback color
  
          return innerSections.map((section) => {
            const data = getDataForSection(section);
            const numericValue = parseInt(String(data.label).split('/')[0], 10);
            return getColor(ctx, chartArea, numericValue);
          })[context.dataIndex];
        },
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 40,
      },
    ],
  };
  
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
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
    onHover: (event, elements) => {
      const canvas = event.native?.target as HTMLCanvasElement;
      canvas.style.cursor = elements.length ? 'pointer' : 'default';
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
        hoverOffset: 50,
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