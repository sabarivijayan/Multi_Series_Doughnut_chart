/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
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

  // Modified drawing plugin to control render order
  const drawingPlugin = {
    id: 'drawingPlugin',
    beforeDraw: (chart: any) => {
      const activeElements = chart.getActiveElements();
      const ctx = chart.ctx;
      
      // Clear the canvas
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, chart.width, chart.height);
      ctx.restore();
      
      // First draw the outer ring (dataset 0)
      const outerMeta = chart.getDatasetMeta(0);
      outerMeta.data.forEach((arc: any) => {
        arc.draw(ctx);
      });
      
      // Then draw the inner ring (dataset 1)
      const innerMeta = chart.getDatasetMeta(1);
      innerMeta.data.forEach((arc: any) => {
        arc.draw(ctx);
      });
      
      // If there's an active element, draw it last and scaled
      if (activeElements.length > 0) {
        const activeElement = activeElements[0];
        const activeMeta = chart.getDatasetMeta(activeElement.datasetIndex);
        const activeArc = activeMeta.data[activeElement.index];
        
        ctx.save();
        const centerX = activeArc.x;
        const centerY = activeArc.y;
        
        ctx.translate(centerX, centerY);
        ctx.scale(1.1, 1.1);
        ctx.translate(-centerX, -centerY);
        
        activeArc.draw(ctx);
        ctx.restore();
      }
      
      // Prevent default drawing
      return false;
    }
  };

  const curvedTextPlugin = {
    id: "curvedText",
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
  
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
  
      const drawTextOnArc = (meta: any, sections: string[], isInner: boolean) => {
        meta.data.forEach((arc: any, index: number) => {
          const section = sections[index];
          const data = getDataForSection(section);
  
          // Calculate middle angle and radius
          const angle = (arc.startAngle + arc.endAngle) / 2;
          const baseRadius = (arc.outerRadius + arc.innerRadius) / 2;
          const radius = isInner ? baseRadius : baseRadius + 25;
  
          ctx.save();
          ctx.translate(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          );
          ctx.rotate(angle + Math.PI / 2);
  
          // Adjust rotation for upside-down text
          if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
            ctx.rotate(Math.PI);
          }
  
          // Draw section name
          ctx.fillStyle = isInner ? "#333333" : "#000000";
          ctx.font = "bold 14px Arial";
          ctx.fillText(section, 0, 0);
  
          // Draw additional label if present
          if (data.label) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "#666666";
            ctx.fillText(data.label, 0, 16); // Offset for label
          }
  
          ctx.restore();
        });
      };
  
      // Draw outer text, then inner text
      const outerMeta = chart.getDatasetMeta(0);
      const innerMeta = chart.getDatasetMeta(1);
      drawTextOnArc(outerMeta, outerSections, false);
      drawTextOnArc(innerMeta, innerSections, true);
  
      ctx.restore();
    },
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
          plugins={[curvedTextPlugin, drawingPlugin]} 
        />
        <div className={styles.centerContent}>
          <img src="/pillars.png" alt="Pillars" width={200} height={200} />
        </div>
      </div>
    </div>
  );
};

export default WealthPillarsChart;