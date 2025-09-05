import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';

const DAY_LABELS = {
  mon: 'Segunda-feira',
  tue: 'Terça-feira', 
  wed: 'Quarta-feira',
  thu: 'Quinta-feira',
  fri: 'Sexta-feira',
  sat: 'Sábado',
  sun: 'Domingo'
};

type DayKey = keyof typeof DAY_LABELS;

const TIME_OPTIONS = ['09:00', '09:15', '09:30', '09:45', '10:00', '18:00', '18:15', '18:30', '18:45', '19:00'];

export function SimpleBusinessHoursEditor() {
  const [businessHours, setBusinessHours] = useState({
    mon: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    tue: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    wed: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    thu: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    fri: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    sat: { enabled: false, intervals: [] },
    sun: { enabled: false, intervals: [] },
  });

  const toggleDay = (dayKey: DayKey, enabled: boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled,
        intervals: enabled ? [{ start: '09:00', end: '18:00' }] : []
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Atendimento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure os horários de funcionamento para cada dia da semana
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Dia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Horários</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(DAY_LABELS) as DayKey[]).map((dayKey) => {
              const dayData = businessHours[dayKey];
              
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
                            <Select value={interval.start}>
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
                            <Select value={interval.end}>
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Dia fechado</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Fuso horário: America/Sao_Paulo
        </p>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar horários
        </Button>
      </CardFooter>
    </Card>
  );
}