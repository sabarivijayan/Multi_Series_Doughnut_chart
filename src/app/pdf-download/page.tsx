"use client";

import React, { useRef } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import PdfDocument from "../pdf-content/pdf-content";

const DownloadReportPage = () => {
  const pdfInstance = useRef<any>();

  const handleDownload = async () => {
    const pdfBlob = await pdf(<PdfDocument />).toBlob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdfBlob);
    link.download = "report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Report Page</h1>
      <button onClick={handleDownload}>Download Report</button>
      <div style={{ width: "100%", height: "600px", border: "1px solid black" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <PdfDocument />
        </PDFViewer>
      </div>
    </div>
  );
};

export default DownloadReportPage;
