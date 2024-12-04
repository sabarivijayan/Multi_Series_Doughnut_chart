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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chart-data');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getColor = (value: number) => {
    if (value <= 2) return '#FF4444'; // Red
    if (value <= 4) return '#FF8C42'; // Orange
    if (value <= 6) return '#FFD700'; // Yellow
    if (value <= 8) return '#9ACD32'; // Lime
    return '#4CAF50'; // Green
  };

  // Organize data into outer and inner ring sections
  const outerSections = ['Governance', 'Structures', 'Sustainable Philanthropy', 'Assets', 'Advisors', 'Documentation'];
  const innerSections = ['Vision', 'Education', 'Health', 'Communication'];

  const getDataForSection = (name: string) => {
    return chartData.find(item => item.name === name) || { label: '0/10', value: 0, name };
  };

  const curvedTextPlugin = {
    id: 'curvedText',
    afterDraw: (chart:any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
  
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
  
      // Helper to calculate position in the arc
      const drawTextOnArc = (meta:any, sections:any, isInner:any) => {
        meta.data.forEach((arc:any, index:any) => {
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
          ctx.font = '12px Arial'; // Custom font style
          ctx.translate(x, y);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillText(section, 0, -10); // Section name
          ctx.fillText(data.label, 0, 10); // Data label
          ctx.restore();
        });
      };
  
      // Draw for outer ring
      const outerMeta = chart.getDatasetMeta(0);
      drawTextOnArc(outerMeta, outerSections, false);
  
      // Draw for inner ring
      const innerMeta = chart.getDatasetMeta(1);
      drawTextOnArc(innerMeta, innerSections, true);
  
      ctx.restore();
    },
  };
  

  const data: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      // Outer ring (6 sections)
      {
        data: outerSections.map(() => 1),
        backgroundColor: outerSections.map(section => {
          const data = getDataForSection(section);
          return getColor(data.value);
        }),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 40,
        circular: true,
        
      },
      // Inner ring (4 sections)
      {
        data: innerSections.map(() => 1),
        backgroundColor: innerSections.map(section => {
          const data = getDataForSection(section);
          return getColor(data.value);
        }),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        weight: 30,
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const sections = context.datasetIndex === 0 ? outerSections : innerSections;
            const section = sections[context.dataIndex];
            const data = getDataForSection(section);
            return `${section}: ${data.label}`;
          }
        }
      }
    },
    layout: {
      padding: 20
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Doughnut 
          data={data} 
          options={options} 
          plugins={[curvedTextPlugin]}
        />
        <div className={styles.centerContent}>
          <p>10 PILLARS</p>
          <p>of</p>
          <p>Generational</p>
          <p>Wealth</p>
        </div>
      </div>
    </div>
  );
};

export default WealthPillarsChart;