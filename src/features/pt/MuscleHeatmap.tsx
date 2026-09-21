import { useMemo } from "react";
import type { LibraryExercise, PtExercise } from "./api";
import { calculateMuscleCredits, type Muscle, type MuscleCredit } from "./muscle-logic";

type Intensity = "none" | "low" | "medium" | "high";

const intensityClass: Record<Intensity, string> = {
  none: "fill-muted stroke-border",
  low: "fill-lavender-soft stroke-primary/30",
  medium: "fill-primary/55 stroke-primary/60",
  high: "fill-primary stroke-primary",
};

function creditLabel(item: MuscleCredit) {
  return `${item.muscle}: ${item.credits.toLocaleString()} set ${item.credits === 1 ? "credit" : "credits"}`;
}

function BodyRegion({
  muscle,
  credits,
  maxCredits,
  d,
}: {
  muscle: Muscle;
  credits: number;
  maxCredits: number;
  d: string;
}) {
  const ratio = maxCredits > 0 ? credits / maxCredits : 0;
  const intensity: Intensity = ratio === 0 ? "none" : ratio < 0.34 ? "low" : ratio < 0.67 ? "medium" : "high";
  const label = creditLabel({ muscle, credits });
  return (
    <path
      d={d}
      className={`${intensityClass[intensity]} outline-none transition-colors focus:stroke-brand focus:stroke-2`}
      strokeWidth="1"
      tabIndex={credits > 0 ? 0 : undefined}
      aria-label={credits > 0 ? label : `${muscle}: not trained`}
    >
      <title>{label}</title>
    </path>
  );
}

function Figure({ side, credits }: { side: "front" | "back"; credits: MuscleCredit[] }) {
  const byMuscle = Object.fromEntries(credits.map((item) => [item.muscle, item.credits])) as Record<Muscle, number>;
  const maxCredits = Math.max(0, ...credits.map((item) => item.credits));
  const region = (muscle: Muscle, d: string) => (
    <BodyRegion
      key={`${side}-${muscle}-${d}`}
      muscle={muscle}
      credits={byMuscle[muscle] ?? 0}
      maxCredits={maxCredits}
      d={d}
    />
  );

  return (
    <div className="min-w-0 text-center">
      <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">{side}</p>
      <svg
        viewBox="0 0 160 300"
        role="img"
        aria-label={`${side === "front" ? "Front" : "Back"} muscles trained`}
        className="mx-auto h-[210px] w-full max-w-[132px] overflow-visible sm:h-[230px]"
      >
        <circle cx="80" cy="25" r="17" className="fill-muted stroke-border" />
        <path d="M68 42 L92 42 L98 57 L62 57 Z" className="fill-muted stroke-border" />
        {side === "front" ? (
          <>
            {region("Shoulders", "M62 55 C48 55 40 64 38 78 L52 82 L64 70 Z M98 55 C112 55 120 64 122 78 L108 82 L96 70 Z")}
            {region("Chest", "M64 58 C69 55 75 56 80 62 C85 56 91 55 96 58 L102 88 C91 94 69 94 58 88 Z")}
            {region("Arms", "M39 78 L52 82 L48 122 L37 146 L27 141 L34 116 Z M108 82 L121 78 L126 116 L133 141 L123 146 L112 122 Z")}
            {region("Core", "M59 91 C69 95 91 95 101 91 L98 148 L62 148 Z")}
            {region("Quads", "M62 151 L79 151 L76 223 L57 221 Z M81 151 L98 151 L103 221 L84 223 Z")}
          </>
        ) : (
          <>
            {region("Shoulders", "M61 55 C48 56 40 64 38 78 L53 83 L65 69 Z M99 55 C112 56 120 64 122 78 L107 83 L95 69 Z")}
            {region("Back", "M64 57 L80 63 L96 57 L104 105 L96 145 L64 145 L56 105 Z")}
            {region("Arms", "M38 79 L52 83 L48 120 L38 147 L27 142 L34 115 Z M108 83 L122 79 L126 115 L133 142 L122 147 L112 120 Z")}
            {region("Glutes", "M62 147 C69 143 76 145 80 151 C84 145 91 143 98 147 L100 177 C91 185 69 185 60 177 Z")}
            {region("Hamstrings", "M60 180 C67 184 73 184 78 181 L76 224 L57 222 Z M82 181 C87 184 93 184 100 180 L103 222 L84 224 Z")}
          </>
        )}
        <path d="M57 225 L76 227 L73 278 L60 278 Z M84 227 L103 225 L100 278 L87 278 Z" className="fill-muted stroke-border" />
        <path d="M59 278 L74 278 L75 286 L53 286 Z M86 278 L101 278 L107 286 L85 286 Z" className="fill-muted stroke-border" />
      </svg>
    </div>
  );
}

export function MuscleHeatmap({
  exercises,
  library,
  loading,
}: {
  exercises: PtExercise[];
  library: LibraryExercise[];
  loading: boolean;
}) {
  const credits = useMemo(
    () => calculateMuscleCredits(exercises, library),
    [exercises, library],
  );
  const hasActivity = credits.some((item) => item.credits > 0);

  return (
    <section className="mt-4 border-t border-border pt-3.5" aria-labelledby="muscles-trained-title">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 id="muscles-trained-title" className="text-sm font-semibold">Muscles Trained</h3>
        <p className="text-[10px] font-normal text-muted-foreground">(today&apos;s damage…)</p>
      </div>

      {loading ? (
        <div className="mt-2 h-[236px] animate-pulse rounded-xl bg-muted" />
      ) : (
        <>
          <div className="mx-auto mt-1 grid max-w-[330px] grid-cols-2 gap-3" aria-live="polite">
            <Figure side="front" credits={credits} />
            <Figure side="back" credits={credits} />
          </div>
          {!hasActivity ? (
            <p className="-mt-1 text-center text-[11px] text-muted-foreground">
              Add exercises to see muscles trained.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}