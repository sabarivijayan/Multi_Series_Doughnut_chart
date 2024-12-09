/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import styles from "./chart-structure.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PillarData {
  label: string;
  value: number;
  name: string;
}

interface WealthPillarsChartProps {
  onChartClick?: (section: string) => void;
  setSelectedCategory: (category: number) => void;
  selectedCategory: number | null;
}

const WealthPillarsChart = ({
  onChartClick,
  setSelectedCategory,
}: WealthPillarsChartProps) => {
  const [chartData] = useState<PillarData[]>([]);
  const [patterns, setPatterns] = useState<
    Record<string, CanvasPattern | null>
  >({});

  const sectionImages: Record<string, string> = {
    Health: "./gold19.png",
    Vision: "./gold21.png",
    Education: "./gold.png",
    Communication: "./gold.png",
  };

  const outerColors: Record<string, string> = {
    Assets: "#DEA839",
    Advisors: "#DEA839",
    Documentation: "#DEA839",
    Structures: "#DEA839",
    Governance: "#DEA839",
    "Sustainable Philanthropy": "#DEA839",
  };

  const createPattern = async (
    ctx: CanvasRenderingContext2D,
    imagePath: string
  ): Promise<CanvasPattern | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const pattern = ctx.createPattern(img, "repeat");
        resolve(pattern);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = imagePath;
    });
  };

  const outerSections = [
    "Assets",
    "Advisors",
    "Documentation",
    "Structures",
    "Governance",
    "Sustainable Philanthropy",
  ];

  const innerSections = ["Health", "Vision", "Education", "Communication"];

  const normalize = (str: string) => str.trim().toLowerCase();

  const getDataForSection = (name: string): PillarData => {
    const normalizedSectionName = normalize(name);
    const sectionData = chartData.find(
      (item) => normalize(item.name) === normalizedSectionName
    );
    return sectionData || { label: "", value: 0, name };
  };

  // Combined plugin for drawing and text
  const combinedPlugin = {
    id: 'combinedPlugin',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      
      // Clear the canvas
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, chart.width, chart.height);
      ctx.restore();
      
      // Determine active elements for scaling
      const activeElements = chart.getActiveElements();
      
      // Draw function with optional scaling
      const drawDataset = (meta: any, sections: string[], isInner: boolean) => {
        meta.data.forEach((arc: any, index: number) => {
          const section = sections[index];
          const data = getDataForSection(section);
          
          // Check if this arc is the active element
          const isActive = activeElements.some(
            (el: any) => 
              el.datasetIndex === meta.index && 
              el.index === index
          );
          
          // Save context and apply scaling if active
          ctx.save();
          if (isActive) {
            ctx.translate(arc.x, arc.y);
            ctx.scale(1.1, 1.1);
            ctx.translate(-arc.x, -arc.y);
          }
          
          // Draw the arc
          arc.draw(ctx);
          
          // Restore context
          ctx.restore();
          
          // Draw text on arc
          ctx.save();
          
          // Calculate arc center angle
          const startAngle = arc.startAngle;
          const endAngle = arc.endAngle;
          const centerAngle = (startAngle + endAngle) / 2;

          // Calculate radius
          const outerRadius = arc.outerRadius;
          const innerRadius = arc.innerRadius;
          const midRadius = (outerRadius + innerRadius) / 2;

          // Calculate text position
          const x = centerX + Math.cos(centerAngle) * midRadius;
          const y = centerY + Math.sin(centerAngle) * midRadius;

          ctx.translate(x, y);
          ctx.rotate(centerAngle - Math.PI / 2);

          // Flip text if it's on the left side of the chart
          if (centerAngle > Math.PI / 2 && centerAngle < (3 * Math.PI) / 2) {
            ctx.rotate(Math.PI);
          }

          // Set text styles
          ctx.fillStyle = isInner ? "#333333" : "#000000";
          ctx.font = isInner ? "12px Arial" : "14px Arial";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Draw section name
          ctx.fillText(section, 0, 0);

          // Draw label if exists
          if (data.label) {
            ctx.font = "10px Arial";
            ctx.fillStyle = "#666666";
            ctx.fillText(data.label, 0, 14);
          }
          

          ctx.restore();
        });
      };
      
      // Draw outer ring (dataset 0)
      const outerMeta = chart.getDatasetMeta(0);
      drawDataset(outerMeta, outerSections, false);
      
      // Draw inner ring (dataset 1)
      const innerMeta = chart.getDatasetMeta(1);
      drawDataset(innerMeta, innerSections, true);
      
      // Prevent default drawing
      return false;
    }
  };

  const data: ChartData<"doughnut"> = {
    labels: [],
    datasets: [
      {
        data: outerSections.map(() => 1),
        backgroundColor: outerSections.map((section) => outerColors[section]),
        borderColor: "#FFFFFF",
        borderWidth: 0.5,
        weight: 60,
        hoverBackgroundColor: outerSections.map((section) => outerColors[section]),
      },
      {
        data: innerSections.map(() => 1),
        backgroundColor: function (context) {
          const { chart } = context;
          const { ctx } = chart;
          if (!ctx) return "#CCCCCC";

          const section = innerSections[context.dataIndex];
          const imagePath = sectionImages[section];
          const patternKey = `inner_${section}`;

          if (!patterns[patternKey]) {
            createPattern(ctx, imagePath).then((pattern) => {
              if (pattern) {
                setPatterns((prev) => ({ ...prev, [patternKey]: pattern }));
              }
            });
          }

          return patterns[patternKey] || "#CCCCCC";
        },
        borderColor: "#FFFFFF",
        borderWidth: 0.5,
        weight: 80,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    layout: {
      padding: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60
      }
    },
    responsive: true,
    cutout: "50%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const section =
          chartElement.datasetIndex === 0
            ? outerSections[chartElement.index]
            : innerSections[chartElement.index];

        if (onChartClick) {
          onChartClick(section);
          if (chartElement.datasetIndex !== 0) {
            const index = innerSections.indexOf(
              innerSections[chartElement.index]
            );
            setSelectedCategory(index + 1);
          } else {
            const index = outerSections.indexOf(
              outerSections[chartElement.index]
            );
            setSelectedCategory(index + 5);
          }
        }
      }
    },
    onHover: (event, elements) => {
      const canvas = event.native?.target as HTMLCanvasElement;
      canvas.style.cursor = elements.length ? "pointer" : "default";
      canvas.style.overflow = "visible";
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 200
    },
    hover: {
      mode: "nearest",
      intersect: true,
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Doughnut 
          data={data} 
          options={options} 
          plugins={[combinedPlugin]} 
        />
        <div className={styles.centerContent}>
          <img src="/pillars.png" alt="Pillars" width={200} height={200} />
        </div>
      </div>
    </div>
  );
};

export default WealthPillarsChart;