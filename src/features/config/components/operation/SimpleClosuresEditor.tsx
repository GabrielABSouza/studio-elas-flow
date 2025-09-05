import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Calendar, User, Globe } from 'lucide-react';

const mockClosures = [
  {
    id: '1',
    scope: 'global',
    title: 'Ano Novo',
    range: { from: '2024-01-01', to: '2024-01-01' },
    note: 'Feriado nacional',
  },
  {
    id: '2',
    scope: 'global',
    title: 'Carnaval',
    range: { from: '2024-02-12', to: '2024-02-14' },
    note: 'Feriado municipal',
  },
  {
    id: '3',
    scope: 'professional',
    title: 'Férias Ana Silva',
    range: { from: '2024-07-01', to: '2024-07-15' },
    professionalId: '1',
    note: 'Férias de verão',
  },
];

export function SimpleClosuresEditor() {
  const [activeTab, setActiveTab] = useState('global');

  const getClosuresByScope = (scope: string) => {
    return mockClosures.filter(closure => closure.scope === scope);
  };

  const getClosureStatusBadge = (closure: any) => {
    const today = new Date();
    const fromDate = new Date(closure.range.from);
    const toDate = new Date(closure.range.to);

    if (fromDate <= today && toDate >= today) {
      return <Badge variant="destructive">Hoje</Badge>;
    }
    if (fromDate > today) {
      return <Badge variant="default">Futuro</Badge>;
    }
    return <Badge variant="secondary">Passado</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const renderClosuresTable = (scope: string) => {
    const closures = getClosuresByScope(scope);

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {scope === 'global' 
              ? 'Feriados e fechamentos que afetam toda a operação'
              : 'Bloqueios específicos por profissional (férias, licenças, etc.)'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Bloqueio
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                {scope === 'professional' && <TableHead>Profissional</TableHead>}
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={scope === 'professional' ? 5 : 4} className="text-center text-muted-foreground py-8">
                    Nenhum bloqueio encontrado
                  </TableCell>
                </TableRow>
              ) : (
                closures.map((closure) => (
                  <TableRow key={closure.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{closure.title}</div>
                        {closure.note && (
                          <div className="text-sm text-muted-foreground">{closure.note}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(closure.range.from)}
                          {closure.range.from !== closure.range.to && (
                            <> – {formatDate(closure.range.to)}</>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getClosureStatusBadge(closure)}
                    </TableCell>
                    {scope === 'professional' && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Ana Silva</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Bloqueios de Agenda</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie feriados, fechamentos e exceções por profissional
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Geral (Feriados)</TabsTrigger>
            <TabsTrigger value="professional">Por Profissional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="mt-6">
            {renderClosuresTable('global')}
          </TabsContent>
          
          <TabsContent value="professional" className="mt-6">
            {renderClosuresTable('professional')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}