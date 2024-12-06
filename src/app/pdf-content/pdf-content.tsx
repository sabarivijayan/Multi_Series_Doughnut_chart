"use client";
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import CustomPageLayout from "@/components/custom-page-layout/custom-page-layout";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
  },
});

interface PdfDocumentProps {
  chartBase64: string | null;
}

const PdfDocument: React.FC<PdfDocumentProps> = ({ chartBase64 }) => {
  if (!chartBase64) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Loading...</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4">
        <CustomPageLayout pageNumber={1}>
          <Text>This is the content for the first page.</Text>
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