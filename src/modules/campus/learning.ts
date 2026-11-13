import type { CampusData, Student } from "./types";

// One shared projection for both portals. Synthetic learning details, no API.
export function learningForStudent(data: CampusData, student: Student) {
  const tutor = data.tutors.find((t) => t.id === student.tutorId);
  const subjects = [
    "Italiano",
    "Matematica",
    "Inglese",
    student.course === "Informatica"
      ? "Informatica"
      : student.course === "Liceo scientifico"
        ? "Fisica"
        : "Economia aziendale",
  ].map((name, index) => ({
    id: `${student.id}-M${index}`,
    name,
    year: index < 2 ? "Recupero anni precedenti" : "Anno corrente",
    progress: Math.max(0, Math.min(100, student.progress + index * 4 - 6)),
  }));
  const lessons = subjects
    .slice(0, 3)
    .map((subject, i) => ({
      id: `${student.id}-L${i}`,
      subject: subject.name,
      date: `2026-11-${16 + i * 2}`,
      time: `${14 + i}:30`,
      tutorName: tutor?.name ?? "Da assegnare",
    }));
  return { subjects, lessons, tutor };
}
