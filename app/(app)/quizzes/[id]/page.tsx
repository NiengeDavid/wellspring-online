import { notFound } from "next/navigation";
import { GatedFallback } from "@/components/courses/GatedFallback";
import { Header } from "@/components/Header";
import { LockedFallback, QuizPlayer } from "@/components/quiz";
import { getQuizForTaking } from "@/lib/actions";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const result = await getQuizForTaking(id);

  if (!result.success && !result.requiredTier && !result.locked) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <Header />

      <main className="relative z-10 px-6 lg:px-12 py-8 max-w-3xl mx-auto">
        {result.success ? (
          <QuizPlayer
            initialQuiz={result.quiz}
            initialResult={result.latestAttempt}
          />
        ) : result.locked ? (
          <LockedFallback
            backHref={result.backHref ?? "/dashboard"}
            backLabel={result.backLabel ?? "Back"}
          />
        ) : (
          <GatedFallback requiredTier={result.requiredTier} />
        )}
      </main>
    </div>
  );
}
