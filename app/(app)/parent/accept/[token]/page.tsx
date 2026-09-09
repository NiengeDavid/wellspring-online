import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { AcceptInviteButton } from "@/components/parent/AcceptInviteButton";
import { sanityFetch } from "@/sanity/lib/live";
import { PARENT_LINK_BY_TOKEN_QUERY } from "@/sanity/lib/queries";

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { token } = await params;

  const { data: link } = await sanityFetch({
    query: PARENT_LINK_BY_TOKEN_QUERY,
    params: { inviteToken: token },
  });

  if (!link) {
    notFound();
  }

  let parentName = "A parent";
  try {
    const client = await clerkClient();
    const parent = await client.users.getUser(link.parent as string);
    parentName = parent.firstName || parent.username || parentName;
  } catch {
    // fall back to generic label
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <Header />
      <main className="relative z-10 px-6 py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-3">Link with {parentName}?</h1>
        <p className="text-zinc-400 mb-8">
          {parentName} wants to follow your quiz scores, points, and course
          progress on Wellspring's Academy.
        </p>
        <AcceptInviteButton token={token} />
      </main>
    </div>
  );
}
