import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, RotateCcw, Save, Loader2 } from 'lucide-react';
import { useBusinessHours, useSaveBusinessHours } from '../../hooks/operation';
import type { BusinessHours, DayKey, TimeHHMM, DayInterval } from '../../types/operation';
import { DAY_LABELS, APP_TZ, DEFAULT_BUSINESS_HOURS } from '../../types/operation';

// Generate time options in 15-minute steps
const generateTimeOptions = (): TimeHHMM[] => {
  const times: TimeHHMM[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      const h = hour.toString().padStart(2, '0');
      const m = minute === 0 ? '00' : minute.toString() as '15'|'30'|'45';
      times.push(`${h}:${m}` as TimeHHMM);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Validation schema
const dayIntervalSchema = z.object({
  start: z.string().refine((val): val is TimeHHMM => /^\d{2}:(00|15|30|45)$/.test(val)),
  end: z.string().refine((val): val is TimeHHMM => /^\d{2}:(00|15|30|45)$/.test(val)),
}).refine(data => data.start < data.end, {
  message: "Horário de início deve ser anterior ao fim",
  path: ["end"]
});

const businessHoursSchema = z.object({
  days: z.record(z.object({
    enabled: z.boolean(),
    intervals: z.array(dayIntervalSchema).refine((intervals) => {
      // Check for overlapping intervals
      for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          const a = intervals[i];
          const b = intervals[j];
          if (a.start < b.end && b.start < a.end) {
            return false;
          }
        }
      }
      return true;
    }, { message: "Intervalos não podem se sobrepor" })
  }))
});

export function BusinessHoursEditor() {
  const { data: businessHours, isLoading } = useBusinessHours();
  const saveBusinessHours = useSaveBusinessHours();
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<Pick<BusinessHours, 'days'>>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: {
      days: DEFAULT_BUSINESS_HOURS.days,
    },
  });

  const { watch, setValue, handleSubmit, reset, formState: { errors } } = form;
  const watchedDays = watch('days');

  // Reset form when data loads
  useEffect(() => {
    if (businessHours) {
      reset({ days: businessHours.days });
      setHasChanges(false);
    }
  }, [businessHours, reset]);

  // Watch for changes
  useEffect(() => {
    if (businessHours) {
      const currentData = JSON.stringify(watchedDays);
      const originalData = JSON.stringify(businessHours.days);
      setHasChanges(currentData !== originalData);
    }
  }, [watchedDays, businessHours]);

  const toggleDay = (dayKey: DayKey, enabled: boolean) => {
    setValue(`days.${dayKey}.enabled`, enabled, { shouldValidate: true });
    if (!enabled) {
      setValue(`days.${dayKey}.intervals`, [], { shouldValidate: true });
    } else if (watchedDays[dayKey].intervals.length === 0) {
      setValue(`days.${dayKey}.intervals`, [{ start: '09:00', end: '18:00' }], { shouldValidate: true });
    }
  };

  const addInterval = (dayKey: DayKey) => {
    const currentIntervals = watchedDays[dayKey].intervals;
    const newInterval: DayInterval = { start: '09:00', end: '18:00' };
    setValue(`days.${dayKey}.intervals`, [...currentIntervals, newInterval], { shouldValidate: true });
  };

  const removeInterval = (dayKey: DayKey, index: number) => {
    const currentIntervals = watchedDays[dayKey].intervals;
    setValue(`days.${dayKey}.intervals`, currentIntervals.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const updateInterval = (dayKey: DayKey, index: number, field: 'start' | 'end', value: TimeHHMM) => {
    const currentIntervals = [...watchedDays[dayKey].intervals];
    currentIntervals[index] = { ...currentIntervals[index], [field]: value };
    setValue(`days.${dayKey}.intervals`, currentIntervals, { shouldValidate: true });
  };

  const onSubmit = (data: Pick<BusinessHours, 'days'>) => {
    const updatedBusinessHours: BusinessHours = {
      timezone: APP_TZ,
      defaultSlotMinutes: businessHours?.defaultSlotMinutes || 30,
      days: data.days,
    };
    saveBusinessHours.mutate(updatedBusinessHours);
  };

  const resetToDefault = () => {
    reset({ days: DEFAULT_BUSINESS_HOURS.days });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Horários de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded w-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Atendimento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure os horários de funcionamento para cada dia da semana
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Dia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Horários</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(DAY_LABELS) as DayKey[]).map((dayKey) => {
                const dayData = watchedDays[dayKey];
                const dayErrors = errors.days?.[dayKey];
                
                return (
                  <TableRow key={dayKey}>
                    <TableCell className="font-medium">
                      {DAY_LABELS[dayKey]}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={dayData.enabled}
                          onCheckedChange={(enabled) => toggleDay(dayKey, enabled)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {dayData.enabled ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dayData.enabled ? (
                        <div className="space-y-2">
                          {dayData.intervals.map((interval, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Select
                                value={interval.start}
                                onValueChange={(value: TimeHHMM) => updateInterval(dayKey, index, 'start', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-muted-foreground">–</span>
                              <Select
                                value={interval.end}
                                onValueChange={(value: TimeHHMM) => updateInterval(dayKey, index, 'end', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInterval(dayKey, index)}
                                disabled={dayData.intervals.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {dayErrors?.intervals && (
                            <p className="text-sm text-destructive">{dayErrors.intervals.message}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Dia fechado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {dayData.enabled && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addInterval(dayKey)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Fuso horário: {APP_TZ}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={resetToDefault}
            disabled={saveBusinessHours.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar padrão
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!hasChanges || saveBusinessHours.isPending}
          >
            {saveBusinessHours.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar horários
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}