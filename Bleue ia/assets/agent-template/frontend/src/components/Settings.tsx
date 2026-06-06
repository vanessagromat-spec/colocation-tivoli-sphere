import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Shield,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const availableModels = [
  { value: 'llama3.2', label: 'Llama 3.2 (3B)', desc: 'Rapide, ideal pour machines modestes' },
  { value: 'mistral', label: 'Mistral (7B)', desc: 'Equilibre performance/vitesse, excellent en FR' },
  { value: 'llama3.1', label: 'Llama 3.1 (8B)', desc: 'Tres bonne qualite generale' },
  { value: 'codellama', label: 'CodeLlama (7B)', desc: 'Specialise pour le code' },
  { value: 'gemma2', label: 'Gemma 2 (9B)', desc: 'Haute qualite, Google' },
  { value: 'mixtral', label: 'Mixtral (47B)', desc: 'Qualite maximale, necessite 32GB RAM' },
];

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    model: 'mistral',
    temperature: 0.7,
    memoryEnabled: true,
    memoryWindow: 20,
    authEnabled: false,
    tasksEnabled: true,
    maxTasks: 3,
    moduleCRM: true,
    moduleProjects: true,
    moduleDocuments: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig({
      model: 'mistral',
      temperature: 0.7,
      memoryEnabled: true,
      memoryWindow: 20,
      authEnabled: false,
      tasksEnabled: true,
      maxTasks: 3,
      moduleCRM: true,
      moduleProjects: true,
      moduleDocuments: true,
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Parametres
        </h1>
        <p className="text-muted-foreground">Configurez votre agent IA</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-200 text-green-700 animate-fade-in">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Configuration sauvegardee avec succes !</span>
        </div>
      )}

      <Tabs defaultValue="ai">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="security">Securite</TabsTrigger>
          <TabsTrigger value="system">Systeme</TabsTrigger>
        </TabsList>

        {/* Tab: AI */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Modele d'intelligence artificielle
              </CardTitle>
              <CardDescription>
                Choisissez le modele IA qui execute localement sur votre machine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modele actif</label>
                <Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature: {config.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Precis (0)</span>
                  <span>Equilibre</span>
                  <span>Creatif (2)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Modeles open-source</p>
                  <p>Tous les modeles proposes sont gratuits et open-source. Ils s'executent 100% sur votre machine sans envoi de donnees externes.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Memoire et contexte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Memoire des conversations</p>
                  <p className="text-xs text-muted-foreground">L'agent se souvient du contexte</p>
                </div>
                <Switch
                  checked={config.memoryEnabled}
                  onCheckedChange={(v) => setConfig({ ...config, memoryEnabled: v })}
                />
              </div>

              {config.memoryEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fenetre memoire: {config.memoryWindow} messages</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={config.memoryWindow}
                    onChange={(e) => setConfig({ ...config, memoryWindow: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Modules */}
        <TabsContent value="modules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules actifs</CardTitle>
              <CardDescription>Activez ou desactivez les fonctionnalites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'moduleCRM' as const, label: 'CRM', desc: 'Gestion des contacts et pipeline' },
                { key: 'moduleProjects' as const, label: 'Projets Kanban', desc: 'Gestion de projets en tableau' },
                { key: 'moduleDocuments' as const, label: 'Documents', desc: 'Analyse de documents par IA' },
                { key: 'tasksEnabled' as const, label: 'Agent Autonome', desc: 'Execution de taches automatiques' },
              ].map((module) => (
                <div key={module.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{module.label}</p>
                    <p className="text-xs text-muted-foreground">{module.desc}</p>
                  </div>
                  <Switch
                    checked={config[module.key] as boolean}
                    onCheckedChange={(v) => setConfig({ ...config, [module.key]: v })}
                  />
                </div>
              ))}

              {config.tasksEnabled && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-medium">Taches simultanees max: {config.maxTasks}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={config.maxTasks}
                    onChange={(e) => setConfig({ ...config, maxTasks: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Security */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Authentification requise</p>
                  <p className="text-xs text-muted-foreground">Proteger l'acces par mot de passe</p>
                </div>
                <Switch
                  checked={config.authEnabled}
                  onCheckedChange={(v) => setConfig({ ...config, authEnabled: v })}
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Securite avancee</p>
                  <p>Pour une securite renforcee en production, configurez HTTPS et un reverse proxy (Nginx, Traefik).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: System */}
        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations systeme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Licence</p>
                  <p className="font-medium">Proprietaire</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Base de donnees</p>
                  <p className="font-medium">SQLite</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Moteur IA</p>
                  <p className="font-medium">Ollama</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reinitialiser
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
