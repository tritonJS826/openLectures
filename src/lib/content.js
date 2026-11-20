import { getCollection } from "astro:content";
import { byDate } from "./site.js";

export async function loadCities() {
  return (await getCollection("cities")).sort((a, b) => a.data.order - b.data.order);
}

export async function loadLectures() {
  return await getCollection("lectures");
}

export function forCity(entries, city, status) {
  return byDate(
    entries.filter((e) => e.data.city === city && e.data.status === status),
    status === "past" ? "desc" : "asc",
  );
}

export function upcomingAcrossCities(entries) {
  return byDate(entries.filter((e) => e.data.status === "upcoming"), "asc");
}
