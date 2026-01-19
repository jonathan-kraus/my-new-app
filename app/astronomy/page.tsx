import { loadAstronomySnapshots } from "@/app/astronomy/loader";
import { AstronomyCard } from "@/app/astronomy/AstronomyCard";

export default async function Page() {
  const { today, tomorrow } = await loadAstronomySnapshots();

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AstronomyCard today={today} tomorrow={tomorrow} />
    </section>
  );
}
