import type { Metadata } from "next";
import DeleQuiz from "./DeleQuiz";

export const metadata: Metadata = {
  title: "Aprender — Practica DELE",
  description: "Estudia y practica para el DELE. Elige tu nivel CEFR y area de habilidad.",
};

export default function LearnPage() {
  return <DeleQuiz />;
}
