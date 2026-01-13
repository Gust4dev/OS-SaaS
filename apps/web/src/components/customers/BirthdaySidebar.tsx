"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Cake, Gift, Loader2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { WhatsAppButton } from "@/components/whatsapp";
import { trpc } from "@/lib/trpc/provider";
import { DEFAULT_TEMPLATES, replaceTemplateVariables } from "@/lib/whatsapp";

export function BirthdaySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: birthdays, isLoading } = trpc.customer.getBirthdays.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const tenantName = settings?.name || "Nossa Empresa";

  const getBirthdayMessage = (customerName: string) => {
    const template = DEFAULT_TEMPLATES.find((t) => t.key === "birthday");
    if (!template) return "";
    return replaceTemplateVariables(template.message, {
      nome: customerName.split(" ")[0],
      empresa: tenantName,
    });
  };

  const isToday = (date: Date) => {
    return isSameDay(new Date(date), new Date());
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-l-lg rounded-r-none h-24 w-8 shadow-lg border-r-0"
          onClick={() => setIsCollapsed(false)}
        >
          <div className="flex flex-col items-center gap-1">
            <Cake className="h-4 w-4" />
            <ChevronLeft className="h-3 w-3" />
            {birthdays && birthdays.length > 0 && (
              <Badge
                variant="destructive"
                className="h-5 w-5 p-0 text-[10px] flex items-center justify-center"
              >
                {birthdays.length}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-20 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-hidden">
      <Card className="rounded-r-none border-r-0 shadow-xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-base">Aniversariantes</CardTitle>
            {birthdays && birthdays.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {birthdays.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !birthdays || birthdays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Gift className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum aniversariante nos próximos 7 dias
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {birthdays.map((customer) => (
                <div
                  key={customer.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isToday(customer.birthDate!)
                      ? "bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-900/50"
                      : "bg-muted/50 border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{customer.name}</p>
                      {isToday(customer.birthDate!) && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] px-1.5 py-0"
                        >
                          HOJE!
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(customer.birthDate!), "d 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <WhatsAppButton
                    phone={customer.phone}
                    message={getBirthdayMessage(customer.name)}
                    whatsappOptIn={customer.whatsappOptIn}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
                    <Gift className="h-4 w-4 text-green-600" />
                  </WhatsAppButton>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
