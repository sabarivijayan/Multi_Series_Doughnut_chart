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
  const [patterns, setPatterns] = useState<{
    sharedInner: CanvasPattern | null;
  }>({ sharedInner: null });

  const sharedInnerImagePath = "./gold12.png";

  const outerColors: Record<string, string> = {
    Assets: "#DEA839",
    Advisors: "#DEA839",
    Documentation: "#DEA839",
    Structures: "#DEA839",
    Governance: "#DEA839",
    "Sustainable Philanthropy": "#DEA839",
  };
// Function to create pattern from image URL based on score
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
    img.onerror = () => resolve(null);
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

  const curvedTextPlugin = {
    id: "curvedText",
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

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
          ctx.fillStyle = "#000"; // Custom text color
          ctx.font = "16px Arial"; // Custom font style
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

          ctx.fillText(section, 0, -1); // Section name
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

  const data: ChartData<"doughnut"> = {
    labels: [],
    datasets: [
      {
        data: outerSections.map(() => 1),
        backgroundColor: outerSections.map((section) => outerColors[section]),
        borderColor: "#FFFFFF",
        borderWidth: 2,
        weight: 60,
      },
      {
        data: innerSections.map(() => 1),
        backgroundColor: function (context) {
          const { chart } = context;
          const { ctx } = chart;

          if (!ctx) return "#CCCCCC";

          // Create the shared pattern if it doesn't already exist
          if (!patterns.sharedInner) {
            createPattern(ctx, sharedInnerImagePath).then((pattern) => {
              if (pattern) {
                setPatterns((prev) => ({ ...prev, sharedInner: pattern }));
              }
            });
          }

          return patterns.sharedInner || "#CCCCCC";
        },
        borderColor: "#FFFFFF",
        borderWidth: 2,
        weight: 80,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    cutout: "50%",
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
    },
    layout: { padding: 10 },
    animation: { animateRotate: true, animateScale: true },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    elements: {
      arc: {
        hoverOffset: 50,
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Doughnut data={data} options={options} plugins={[curvedTextPlugin]} />
        <div className={styles.centerContent}>
          <img src="/pillars.png" alt="Pillars" width={200} height={200} />
        </div>
      </div>
    </div>
  );
};

export default WealthPillarsChart;
