import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@filmtech/database';
import { DashboardShell } from '@/components/layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user needs to complete setup
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: true,
      tenant: {
        select: {
          address: true,
        },
      },
    },
  });

  // If user is Owner and Tenant has no address (proxy for "not setup"), redirect to setup
  if (user?.role === 'ADMIN_SAAS' || user?.role === 'OWNER') {
      if (!user.tenant?.address) {
          redirect('/setup');
      }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
