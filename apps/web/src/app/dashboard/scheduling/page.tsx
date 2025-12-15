'use client';

import React, { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { DayCell } from '@/components/scheduling/DayCell';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function SchedulingPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { data: orders = [], isLoading } = trpc.schedule.getByMonth.useQuery({
    month,
    year,
  });

  // Gerar dias do mês
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding para alinhar o primeiro dia da semana
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => null);

  // Agrupar ordens por dia
  const ordersByDay = React.useMemo(() => {
    const map = new Map<string, typeof orders>();
    orders.forEach((order) => {
      const key = format(new Date(order.scheduledAt), 'yyyy-MM-dd');
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(order);
    });
    return map;
  }, [orders]);

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Agendamentos
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os agendamentos do mês
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-lg font-semibold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold uppercase text-muted-foreground py-3"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 bg-gray-200 dark:bg-gray-800 gap-px border-b border-gray-200 dark:border-gray-800">
          {/* Padding cells */}
          {paddingDays.map((_, index) => (
            <div
              key={`pad-${index}`}
              className="min-h-[120px] bg-background"
            />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayOrders = ordersByDay.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <DayCell
                key={dateKey}
                date={day}
                orders={dayOrders}
                isCurrentMonth={isCurrentMonth}
                isToday={isTodayDate}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>Atrasado</span>
        </div>
      </div>
    </div>
  );
}
