import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ChildActivityView } from "@/components/parent/ChildActivityView";
import { getChildActivity } from "@/lib/actions";

interface ChildPageProps {
  params: Promise<{ childId: string }>;
}

export default async function ChildPage({ params }: ChildPageProps) {
  const { childId } = await params;
  const activity = await getChildActivity(childId);

  if (!activity) {
    notFound();
  }

  let childName = "Student";
  try {
    const client = await clerkClient();
    const child = await client.users.getUser(childId);
    childName = child.firstName || child.username || childName;
  } catch {
    // fall back to generic label
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <Header />
      <main className="relative z-10 px-6 lg:px-12 py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{childName}'s Progress</h1>
        <ChildActivityView activity={activity} />
      </main>
    </div>
  );
}
