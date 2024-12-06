"use client";
import React, { useState, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import PdfDocument from "../pdf-content/pdf-content";
import WealthPillarsChart from "@/components/chart-structure/chart-structure";
import { captureChartScreenshot } from "@/utils/convert-to-base-64";

const DownloadReportPage = () => {
  const [chartBase64, setChartBase64] = useState<string | null>(null);

  useEffect(() => {
    const prepareChartScreenshot = async () => {
      try {
        const base64 = await captureChartScreenshot(<WealthPillarsChart />);
        console.log('Chart Base64 Length:', base64.length);
        console.log('Chart Base64 Prefix:', base64.substring(0, 50));
        
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded successfully');
          setChartBase64(base64);
        };
        img.onerror = () => {
          console.error('Invalid image data');
        };
        img.src = base64;
      } catch (error) {
        console.error('Failed to generate chart screenshot:', error);
      }
    };

    prepareChartScreenshot();
  }, []);

  const handleDownload = async () => {
    if (!chartBase64) {
      console.error('Chart screenshot not ready');
      return;
    }

    try {
      const documentInstance = pdf(<PdfDocument chartBase64={chartBase64} />);
      const pdfBlob = await documentInstance.toBlob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = "report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  return (
    <div>
      <h1>Report Page</h1>
      <button 
        onClick={handleDownload} 
        disabled={!chartBase64}
      >
        {chartBase64 ? 'Download Report' : 'Preparing Report...'}
      </button>
      
      <div style={{ width: "100%", height: "600px", border: "1px solid black" }}>
        {chartBase64 && (
          <PDFViewer style={{ width: "100%", height: "100%" }}>
            <PdfDocument chartBase64={chartBase64} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

export default DownloadReportPage;