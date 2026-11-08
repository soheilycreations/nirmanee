import { Abhaya_Libre, Fraunces, Inter, Noto_Sans_Sinhala } from "next/font/google";

// Variables consumed by the design tokens in globals.css.
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
export const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["SOFT", "opsz"] });
export const notoSinhala = Noto_Sans_Sinhala({ variable: "--font-noto-sinhala", subsets: ["sinhala"], display: "swap", preload: false });
export const abhaya = Abhaya_Libre({ variable: "--font-abhaya", subsets: ["sinhala"], weight: ["400", "600", "700"], display: "swap", preload: false });

export const fontVariables = `${inter.variable} ${fraunces.variable} ${notoSinhala.variable} ${abhaya.variable}`;
