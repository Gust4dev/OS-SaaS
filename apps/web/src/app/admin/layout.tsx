import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@autevo/database";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, ChevronRight } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user is ADMIN_SAAS
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, name: true },
  });

  if (!user || user.role !== "ADMIN_SAAS") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="font-semibold text-white">Autevo Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/admin/tenants" icon={Users} label="Tenants" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <div className="text-sm text-zinc-400 mb-2">
            Logado como <span className="text-white">{user.name}</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 opacity-50" />
    </Link>
  );
}
