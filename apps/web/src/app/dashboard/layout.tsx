import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout";
import { prisma } from "@autevo/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check tenant status for activation/suspension redirects
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: true,
      tenant: {
        select: { status: true },
      },
    },
  });

  // ADMIN_SAAS bypasses all tenant checks
  if (user && user.role !== "ADMIN_SAAS") {
    if (user.tenant?.status === "PENDING_ACTIVATION") {
      redirect("/activate");
    }

    if (user.tenant?.status === "SUSPENDED") {
      redirect("/suspended");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
