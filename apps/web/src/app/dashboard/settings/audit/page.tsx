import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@filmtech/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AuditPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { tenantId: true, role: true },
  });

  if (!user || !["OWNER", "ADMIN_SAAS"].includes(user.role)) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    where: { tenantId: user.tenantId! },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "destructive";
    if (action.includes("create")) return "default";
    if (action.includes("update")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <p className="text-muted-foreground">Histórico de ações no sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Ações</CardTitle>
          <CardDescription>Mostrando os últimos 100 registros</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum registro encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {log.entityType}
                        {log.entityId && ` #${log.entityId.slice(0, 8)}`}
                      </span>
                    </div>
                    <p className="text-sm">
                      {log.user?.name || log.user?.email || "Sistema"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(log.createdAt, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
