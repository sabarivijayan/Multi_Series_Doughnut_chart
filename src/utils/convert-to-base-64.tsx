"use client";
import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";

export const captureChartScreenshot = async (chartComponent: React.ReactElement): Promise<string> => {
  const container = document.createElement('div');
  
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '1000px';
  container.style.height = '1000px';
  container.style.backgroundColor = 'white';
  container.style.zIndex = '1000';
  container.style.overflow = 'visible';
  
  document.body.appendChild(container);
  
  const root = ReactDOM.createRoot(container);
  root.render(chartComponent);
  
  await new Promise(resolve => {
    setTimeout(() => {
      const renderedElements = container.querySelectorAll('*');
      if (renderedElements.length > 0) {
        resolve(true);
      }
    }, 2000);
  });
  
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });
    
    const base64Image = canvas.toDataURL('image/png');
    
    return base64Image;
  } catch (error) {
    console.error('Failed to capture chart screenshot:', error);
    throw error;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};