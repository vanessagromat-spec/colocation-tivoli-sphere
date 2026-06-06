import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  FolderKanban,
  FileText,
  Bot,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { systemAPI } from '@/lib/api';

interface Stats {
  conversations: number;
  tasks: number;
  contacts: number;
  documents: number;
}

const statCards = [
  { key: 'conversations' as const, label: 'Conversations', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'contacts' as const, label: 'Contacts CRM', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'tasks' as const, label: 'Taches executees', icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'documents' as const, label: 'Documents', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const recentActivities = [
  { id: 1, action: 'Conversation avec l\'agent', detail: 'Analyse de marche', time: '2 min', icon: MessageSquare },
  { id: 2, action: 'Contact ajoute', detail: 'Marie Dupont - Prospect', time: '15 min', icon: Users },
  { id: 3, action: 'Tache autonome', detail: 'Generation de rapport PDF', time: '1h', icon: Bot },
  { id: 4, action: 'Document analyse', detail: 'Contrat-de-service.pdf', time: '2h', icon: FileText },
  { id: 5, action: 'Projet cree', detail: 'Campagne Q1 2025', time: '3h', icon: FolderKanban },
];

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ conversations: 0, tasks: 0, contacts: 0, documents: 0 });
  const [health, setHealth] = useState<{ status: string; ollama: boolean; model: string } | null>(null);

  useEffect(() => {
    systemAPI.getStats().then(setStats).catch(() => {});
    systemAPI.getHealth().then(setHealth).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre agent IA</p>
      </div>

      {/* Status bar */}
      {health && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Activity className={health.ollama ? 'h-5 w-5 text-green-500' : 'h-5 w-5 text-red-500'} />
              <div>
                <p className="text-sm font-medium">
                  {health.ollama ? 'Agent IA operationnel' : 'Service IA hors ligne'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Modele : {health.model}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${health.ollama ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs text-muted-foreground">{health.status}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stats[stat.key]}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activite recente
            </CardTitle>
            <CardDescription>Dernieres actions realisees par l'agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Acces direct aux fonctions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              icon={MessageSquare}
              label="Nouvelle conversation"
              description="Demarrer un chat avec l'agent"
              href="/chat"
            />
            <QuickAction
              icon={Bot}
              label="Tache autonome"
              description="Lancer une tache automatique"
              href="/agent"
            />
            <QuickAction
              icon={Users}
              label="Ajouter un contact"
              description="Nouveau contact CRM"
              href="/crm"
            />
            <QuickAction
              icon={FolderKanban}
              label="Nouveau projet"
              description="Creer un projet Kanban"
              href="/projects"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-all group"
    >
      <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
