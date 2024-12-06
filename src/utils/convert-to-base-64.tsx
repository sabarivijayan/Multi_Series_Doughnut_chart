"use client";
import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";

export const captureChartScreenshot = async (chartComponent: React.ReactElement): Promise<string> => {
  // Create a temporary container to render the chart
  const container = document.createElement('div');
  
  // Style the container to ensure visibility and proper rendering
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '1000px';
  container.style.height = '1000px';
  container.style.backgroundColor = 'white';
  container.style.zIndex = '1000';
  
  // Append the container to the body
  document.body.appendChild(container);

  // Render the chart into the container
  const root = ReactDOM.createRoot(container);
  root.render(chartComponent);

  // Wait a moment for rendering
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Capture the chart as a canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Convert canvas to base64
    const base64Image = canvas.toDataURL('image/png');

    return base64Image;
  } catch (error) {
    console.error('Failed to capture chart screenshot:', error);
    throw error;
  } finally {
    // Clean up
    root.unmount();
    document.body.removeChild(container);
  }
};