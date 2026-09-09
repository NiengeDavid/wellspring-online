import { Users } from "lucide-react";
import { Header } from "@/components/Header";
import { ChildrenList } from "@/components/parent/ChildrenList";
import { InviteChildForm } from "@/components/parent/InviteChildForm";
import { getParentDashboardData } from "@/lib/actions";

export default async function ParentPortalPage() {
  const { pendingInvites, children } = await getParentDashboardData();

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

      <main className="relative z-10 px-6 lg:px-12 py-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">Parent Portal</h1>
        </div>
        <p className="text-zinc-400 mb-8">
          Link your child's account to see their quiz scores, points, and course
          progress.
        </p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">
            Invite a Child
          </h2>
          <InviteChildForm />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Your Children</h2>
          <ChildrenList
            linkedChildren={children}
            pendingInvites={pendingInvites}
          />
        </div>
      </main>
    </div>
  );
}
