"use client";
import Image from "next/image";
import styles from "./page.module.css";
import ChartPage from "./chart/page";

export default function Home() {
  return (
    <div className={styles.page}>
      <ChartPage/>
    </div>
  );
}
