import React, { useEffect, useState } from "react";
import { Document, Page, Image, Text } from "@react-pdf/renderer";
import CustomPageLayout from "@/components/custom-page-layout/custom-page-layout";
import WealthPillarsChart from "@/components/chart-structure/chart-structure";
import { captureChartScreenshot } from "@/utils/convert-to-base-64";

const PdfDocument = () => {
  const [chartBase64, setChartBase64] = useState<string | null>(null);

  useEffect(() => {
    const generateChartBase64 = async () => {
      // Use the utility function to convert the chart component to a base64 image
      const base64 = await captureChartScreenshot(<WealthPillarsChart />);
      setChartBase64(base64);
    };

    generateChartBase64();
  }, []);

  return (
    <Document>
      <Page size="A4">
        <CustomPageLayout pageNumber={1}>
          <Text>This is he content for the first page.</Text>
          {chartBase64 ? (
            <Image src={chartBase64} style={{ width: "100%", height: "auto" }} />
          ) : (
            <Text>Loading chart...</Text>
          )}
        </CustomPageLayout>
      </Page>
      <Page size="A4">
        <CustomPageLayout pageNumber={2}>
          <Text>Content for the second page.</Text>
        </CustomPageLayout>
      </Page>
    </Document>
  );
};

export default PdfDocument;
