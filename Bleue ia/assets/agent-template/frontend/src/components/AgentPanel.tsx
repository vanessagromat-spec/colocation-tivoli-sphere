import { useState } from 'react';
import {
  Bot,
  Play,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  FileText,
  Globe,
  Mail,
  BarChart3,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tasksAPI } from '@/lib/api';

const taskTypes = [
  { value: 'web_search', label: 'Recherche web', icon: Globe, description: 'Rechercher des informations sur internet' },
  { value: 'file_processing', label: 'Traitement fichier', icon: FileText, description: 'Analyser ou transformer un document' },
  { value: 'email_generation', label: 'Generation email', icon: Mail, description: 'Rediger un email professionnel' },
  { value: 'data_analysis', label: 'Analyse de donnees', icon: BarChart3, description: 'Analyser un jeu de donnees' },
  { value: 'code_generation', label: 'Generation de code', icon: Code, description: 'Ecrire du code dans n\'importe quel langage' },
];

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  running: { label: 'En cours', color: 'bg-blue-500', icon: Loader2 },
  completed: { label: 'Terminee', color: 'bg-green-500', icon: CheckCircle2 },
  failed: { label: 'Echec', color: 'bg-red-500', icon: XCircle },
};

interface Task {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  result?: string;
}

export function AgentPanel() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Recherche concurrentielle', type: 'web_search', status: 'completed', created_at: '2025-01-15T10:00:00', result: '3 concurrents identifies' },
    { id: '2', name: 'Analyse contrat.pdf', type: 'file_processing', status: 'running', created_at: '2025-01-15T11:30:00' },
    { id: '3', name: 'Email relance clients', type: 'email_generation', status: 'pending', created_at: '2025-01-15T12:00:00' },
  ]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState('web_search');
  const [newTaskPrompt, setNewTaskPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !newTaskPrompt.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await tasksAPI.create({
        name: newTaskName,
        type: newTaskType,
        params: { prompt: newTaskPrompt },
      });

      const task: Task = {
        id: response.id,
        name: newTaskName,
        type: newTaskType,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      setTasks((prev) => [task, ...prev]);
      setNewTaskName('');
      setNewTaskPrompt('');
      setShowNewTask(false);
    } catch {
      const fallbackTask: Task = {
        id: `task_${Date.now()}`,
        name: newTaskName,
        type: newTaskType,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setTasks((prev) => [fallbackTask, ...prev]);
      setNewTaskName('');
      setNewTaskPrompt('');
      setShowNewTask(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const selectedType = taskTypes.find((t) => t.value === newTaskType);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Agent Autonome
          </h1>
          <p className="text-muted-foreground">Lancez des taches automatisees</p>
        </div>
        <Button onClick={() => setShowNewTask(!showNewTask)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tache
        </Button>
      </div>

      {/* New task form */}
      {showNewTask && (
        <Card className="animate-fade-in border-primary/20">
          <CardHeader>
            <CardTitle>Nouvelle tache autonome</CardTitle>
            <CardDescription>Definissez la tache que l'agent doit executer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la tache</label>
                <Input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Ex: Recherche de prospects"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de tache</label>
                <Select value={newTaskType} onValueChange={setNewTaskType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedType && (
              <p className="text-xs text-muted-foreground">{selectedType.description}</p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions detaillees</label>
              <textarea
                value={newTaskPrompt}
                onChange={(e) => setNewTaskPrompt(e.target.value)}
                placeholder="Decrivez ce que l'agent doit faire en detail..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTask(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={isSubmitting || !newTaskName.trim() || !newTaskPrompt.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creation...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Lancer la tache
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks list */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Toutes ({tasks.length})</TabsTrigger>
          <TabsTrigger value="running">En cours ({tasks.filter((t) => t.status === 'running').length})</TabsTrigger>
          <TabsTrigger value="completed">Terminees ({tasks.filter((t) => t.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TasksList tasks={tasks} onDelete={handleDeleteTask} />
        </TabsContent>
        <TabsContent value="running" className="mt-4">
          <TasksList tasks={tasks.filter((t) => t.status === 'running')} onDelete={handleDeleteTask} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TasksList tasks={tasks.filter((t) => t.status === 'completed')} onDelete={handleDeleteTask} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TasksList({ tasks, onDelete }: { tasks: Task[]; onDelete: (id: string) => void }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune tache dans cette categorie</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = statusConfig[task.status];
        const typeInfo = taskTypes.find((t) => t.value === task.type);
        return (
          <Card key={task.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`p-2 rounded-full ${status.color} bg-opacity-20`}>
                <status.icon className={`h-4 w-4 ${task.status === 'running' ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{task.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {typeInfo?.label || task.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.result || `Cree le ${new Date(task.created_at).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${status.color} text-white`}
                >
                  {status.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
