import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { DashboardShell } from "@/components/layout";
import { prisma } from "@autevo/database";

interface ClerkPublicMetadata {
  tenantId?: string;
  role?: string;
  tenantStatus?: string;
  dbUserId?: string;
}

const getTenantSettings = unstable_cache(
  async (tenantId: string) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        logo: true,
        name: true,
      },
    });
    return tenant;
  },
  ["tenant-settings"],
  { revalidate: 300, tags: ["tenant-settings"] }
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const metadata = sessionClaims?.public_metadata as
    | ClerkPublicMetadata
    | undefined;
  const tenantId = metadata?.tenantId;
  const role = metadata?.role;
  const tenantStatus = metadata?.tenantStatus;

  if (role !== "ADMIN_SAAS") {
    if (tenantStatus === "PENDING_ACTIVATION") {
      redirect("/activate");
    }
    if (tenantStatus === "SUSPENDED") {
      redirect("/suspended");
    }
  }

  const initialSettings = tenantId ? await getTenantSettings(tenantId) : null;

  return (
    <DashboardShell userRole={role} initialSettings={initialSettings}>
      {children}
    </DashboardShell>
  );
}
