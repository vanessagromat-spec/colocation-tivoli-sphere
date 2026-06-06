import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  nom: string;
  description: string;
  statut: 'actif' | 'termine' | 'en_pause';
  date_echeance: string;
  progression: number;
}

interface Task {
  id: string;
  project_id: string;
  titre: string;
  description: string;
  colonne: 'a_faire' | 'en_cours' | 'termine';
  priorite: 'basse' | 'moyenne' | 'haute';
  assigne_a?: string;
}

const mockProjects: Project[] = [
  { id: '1', nom: 'Refonte Site Web', description: 'Nouveau design et fonctionnalites', statut: 'actif', date_echeance: '2025-03-15', progression: 65 },
  { id: '2', nom: 'Campagne Marketing Q1', description: 'Strategie et contenu', statut: 'actif', date_echeance: '2025-02-28', progression: 30 },
  { id: '3', nom: 'Migration Base de donnees', description: 'Transfert vers nouveau serveur', statut: 'en_pause', date_echeance: '2025-04-01', progression: 10 },
];

const mockTasks: Task[] = [
  { id: '1', project_id: '1', titre: 'Maquettes Figma', description: 'Design des pages principales', colonne: 'termine', priorite: 'haute', assigne_a: 'Marie' },
  { id: '2', project_id: '1', titre: 'Integration frontend', description: 'Developpement React', colonne: 'en_cours', priorite: 'haute', assigne_a: 'Jean' },
  { id: '3', project_id: '1', titre: 'Tests utilisateurs', description: 'Recette fonctionnelle', colonne: 'a_faire', priorite: 'moyenne' },
  { id: '4', project_id: '1', titre: 'Deploiement', description: 'Mise en production', colonne: 'a_faire', priorite: 'haute' },
  { id: '5', project_id: '2', titre: 'Calendrier editorial', description: 'Planifier les publications', colonne: 'en_cours', priorite: 'moyenne', assigne_a: 'Sophie' },
];

const colonnes = [
  { key: 'a_faire' as const, label: 'A faire', icon: Circle, color: 'border-t-slate-400' },
  { key: 'en_cours' as const, label: 'En cours', icon: Clock, color: 'border-t-blue-500' },
  { key: 'termine' as const, label: 'Termine', icon: CheckCircle2, color: 'border-t-green-500' },
];

const prioriteColors = {
  basse: 'bg-slate-100 text-slate-600',
  moyenne: 'bg-yellow-100 text-yellow-700',
  haute: 'bg-red-100 text-red-700',
};

export function Projects() {
  const [projects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedProject, setSelectedProject] = useState<string>('1');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ titre: '', description: '', priorite: 'moyenne' as Task['priorite'] });

  const currentProject = projects.find((p) => p.id === selectedProject);
  const projectTasks = tasks.filter((t) => t.project_id === selectedProject);

  const moveTask = (taskId: string, newColonne: Task['colonne']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, colonne: newColonne } : t)));
  };

  const handleAddTask = () => {
    if (!newTask.titre.trim()) return;
    const task: Task = {
      id: `task_${Date.now()}`,
      project_id: selectedProject,
      titre: newTask.titre,
      description: newTask.description,
      colonne: 'a_faire',
      priorite: newTask.priorite,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({ titre: '', description: '', priorite: 'moyenne' });
    setShowNewTask(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            Projets
          </h1>
          <p className="text-muted-foreground">Gestion de projets en Kanban</p>
        </div>
        <Button onClick={() => setShowNewTask(!showNewTask)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tache
        </Button>
      </div>

      {/* Project selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project.id)}
            className={cn(
              'flex-shrink-0 px-4 py-3 rounded-lg border text-left transition-all hover:shadow-md',
              selectedProject === project.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card'
            )}
          >
            <p className="font-medium text-sm">{project.nom}</p>
            <p className="text-xs text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{project.date_echeance}</span>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {project.progression}%
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* New task form */}
      {showNewTask && (
        <Card className="animate-fade-in border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Nouvelle tache - {currentProject?.nom}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={newTask.titre}
              onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
              placeholder="Titre de la tache"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewTask(false)}>Annuler</Button>
              <Button size="sm" onClick={handleAddTask} disabled={!newTask.titre.trim()}>Ajouter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban board */}
      {currentProject && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {colonnes.map((colonne) => {
            const colTasks = projectTasks.filter((t) => t.colonne === colonne.key);
            return (
              <div
                key={colonne.key}
                className={cn('bg-muted/50 rounded-lg border-t-4', colonne.color)}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <colonne.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{colonne.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
                </div>
                <div className="p-3 pt-0 space-y-2">
                  {colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onMoveLeft={() => {
                        const cols: Task['colonne'][] = ['a_faire', 'en_cours', 'termine'];
                        const idx = cols.indexOf(task.colonne);
                        if (idx > 0) moveTask(task.id, cols[idx - 1]);
                      }}
                      onMoveRight={() => {
                        const cols: Task['colonne'][] = ['a_faire', 'en_cours', 'termine'];
                        const idx = cols.indexOf(task.colonne);
                        if (idx < cols.length - 1) moveTask(task.id, cols[idx + 1]);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KanbanCard({ task, onMoveLeft, onMoveRight }: {
  task: Task;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium flex-1">{task.titre}</p>
          <Badge className={cn('text-[10px] ml-2', prioriteColors[task.priorite])}>
            {task.priorite}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {task.assigne_a && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{task.assigne_a[0]}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {task.colonne !== 'a_faire' && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveLeft}>
                <ArrowRight className="h-3 w-3 rotate-180" />
              </Button>
            )}
            {task.colonne !== 'termine' && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveRight}>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
