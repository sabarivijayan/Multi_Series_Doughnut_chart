"use client";
import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

interface CustomPageLayoutProps {
  pageNumber: number;
  
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      position: "relative",
      minHeight: "100%", // Ensure the page takes full height
      display: "flex",
      flexDirection: "column",
    },
    header: {
      paddingTop: 10,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 20,
      marginBottom: 60,
      backgroundColor: "#000",
    },
    logo: {
      paddingTop: 10,
      width: 60,
      height: "auto",
      left: "4%",
    },
    watermark: {
      position: "absolute",
      bottom: 60, // Adjust based on footer position
      left: "42.5%",
      opacity: 0.1,
      width: "15%",
      height: "auto",
    },
    content: {
      flexGrow: 1, // Allow content to expand
      minHeight: 0, // Ensure content doesn't prevent footer positioning
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 10,
      color: "#999",
    },
  });
const CustomPageLayout: React.FC<CustomPageLayoutProps> = ({
  pageNumber,
  children,
}) => {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Image src="./logo.png" style={styles.logo} />
      </View>

      <View>{children}</View>

      <Image src="./watermark.png" style={styles.watermark} />

      <Text style={styles.footer}>Page 0{pageNumber} of 05</Text>
    </View>
  );
};

export default CustomPageLayout;
