"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/brevo";
import { writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  DASHBOARD_COURSES_QUERY,
  PARENT_LINK_BY_TOKEN_QUERY,
  PARENT_LINK_FOR_CHILD_QUERY,
  PARENT_LINKS_FOR_PARENT_QUERY,
} from "@/sanity/lib/queries";
import { getStudentQuizActivity } from "./quizzes";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteChild(
  childEmail: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const email = childEmail.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  const { data: existing } = await sanityFetch({
    query: PARENT_LINKS_FOR_PARENT_QUERY,
    params: { parentId: userId },
  });

  if ((existing ?? []).some((link) => link.childEmail === email)) {
    return { success: false, error: "You've already invited this email." };
  }

  const token = crypto.randomUUID();
  const parent = await currentUser();
  const parentName = parent?.firstName || parent?.username || "A parent";

  await writeClient.create({
    _type: "parentLink",
    parent: userId,
    childEmail: email,
    status: "pending",
    token,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/parent/accept/${token}`;

  try {
    await sendEmail({
      to: email,
      subject: `${parentName} wants to follow your progress on Wellspring's Academy`,
      html: `
        <p>${parentName} has invited you to link accounts on Wellspring's Academy so they can see your quiz scores, points, and course progress.</p>
        <p><a href="${acceptUrl}">Accept the invite</a></p>
        <p>If you don't recognize this request, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send parent invite email:", error);
    return {
      success: false,
      error:
        "Invite created, but the email failed to send. Check your Brevo configuration.",
    };
  }

  revalidatePath("/parent");
  return { success: true };
}

export async function getParentDashboardData() {
  const { userId } = await auth();
  if (!userId) {
    return { pendingInvites: [], children: [] };
  }

  const { data: links } = await sanityFetch({
    query: PARENT_LINKS_FOR_PARENT_QUERY,
    params: { parentId: userId },
  });

  const pendingInvites = (links ?? []).filter((l) => l.status === "pending");
  const acceptedLinks = (links ?? []).filter(
    (l) => l.status === "accepted" && l.child,
  );

  const client = await clerkClient();
  const children = await Promise.all(
    acceptedLinks.map(async (link) => {
      try {
        const user = await client.users.getUser(link.child as string);
        return {
          linkId: link._id,
          childId: link.child as string,
          name: user.firstName || user.username || link.childEmail || "Student",
          email: link.childEmail,
        };
      } catch {
        return {
          linkId: link._id,
          childId: link.child as string,
          name: link.childEmail || "Student",
          email: link.childEmail,
        };
      }
    }),
  );

  return { pendingInvites, children };
}

export async function acceptInvite(
  token: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to accept this invite.",
    };
  }

  const { data: link } = await sanityFetch({
    query: PARENT_LINK_BY_TOKEN_QUERY,
    params: { inviteToken: token },
  });

  if (!link) {
    return {
      success: false,
      error: "This invite link is invalid or has expired.",
    };
  }

  if (link.status === "accepted") {
    return { success: false, error: "This invite has already been accepted." };
  }

  if (link.parent === userId) {
    return { success: false, error: "You can't accept your own invite." };
  }

  await writeClient
    .patch(link._id)
    .set({ status: "accepted", child: userId })
    .commit();

  revalidatePath("/parent");
  return { success: true };
}

export async function removeChildLink(
  linkId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const doc = await writeClient.fetch<{ parent: string } | null>(
    `*[_id == $id][0]{ parent }`,
    { id: linkId },
  );

  if (!doc || doc.parent !== userId) {
    return { success: false, error: "Link not found." };
  }

  await writeClient.delete(linkId);
  revalidatePath("/parent");
  return { success: true };
}

export async function getChildActivity(childId: string) {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const { data: link } = await sanityFetch({
    query: PARENT_LINK_FOR_CHILD_QUERY,
    params: { parentId: userId, childId },
  });

  if (!link) {
    return null;
  }

  const [{ data: courses }, quizActivity] = await Promise.all([
    sanityFetch({
      query: DASHBOARD_COURSES_QUERY,
      params: { userId: childId },
    }),
    getStudentQuizActivity(childId),
  ]);

  const courseProgress = (courses ?? []).map((course) => {
    const { total, completed } = (course.modules ?? []).reduce(
      (stats, m) =>
        (m.lessons ?? []).reduce(
          (s, l) => ({
            total: s.total + 1,
            completed: s.completed + (l.completedBy?.includes(childId) ? 1 : 0),
          }),
          stats,
        ),
      { total: 0, completed: 0 },
    );

    return {
      id: course._id,
      title: course.title,
      slug: course.slug?.current ?? null,
      totalLessons: total,
      completedLessons: completed,
      isCompleted: course.completedBy?.includes(childId) ?? false,
    };
  });

  return {
    courseProgress: courseProgress.filter(
      (c) => c.completedLessons > 0 || c.isCompleted,
    ),
    ...quizActivity,
  };
}
