import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  FileSpreadsheet,
  FileCode,
  FileImage,
  File,
  Loader2,
  Sparkles,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  nom: string;
  type: string;
  taille: number;
  upload_date: string;
  status: 'uploaded' | 'analyzing' | 'analyzed';
  summary?: string;
}

const mockDocs: Document[] = [
  { id: '1', nom: 'Contrat-de-prestation.pdf', type: 'pdf', taille: 245760, upload_date: '2025-01-15', status: 'analyzed', summary: 'Contrat de prestation de services, duree 12 mois, renouvelable' },
  { id: '2', nom: 'Rapport-annuel-2024.xlsx', type: 'xlsx', taille: 512000, upload_date: '2025-01-14', status: 'analyzed', summary: 'Chiffre d\'affaires: 1.2M€, +15% vs 2023' },
  { id: '3', nom: 'Presentation-projet.pptx', type: 'pptx', taille: 3145728, upload_date: '2025-01-13', status: 'uploaded' },
  { id: '4', nom: 'Notes-reunion.md', type: 'md', taille: 4096, upload_date: '2025-01-12', status: 'analyzed', summary: 'Points abordes: budget Q1, recrutement, outils' },
];

const fileIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  docx: FileText,
  pptx: FileImage,
  md: FileCode,
  txt: FileText,
  default: File,
};

const fileColors: Record<string, string> = {
  pdf: 'text-red-500 bg-red-50',
  xlsx: 'text-green-500 bg-green-50',
  csv: 'text-green-500 bg-green-50',
  docx: 'text-blue-500 bg-blue-50',
  pptx: 'text-orange-500 bg-orange-50',
  md: 'text-slate-500 bg-slate-50',
  txt: 'text-slate-500 bg-slate-50',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Documents() {
  const [docs, setDocs] = useState<Document[]>(mockDocs);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter((d) =>
    d.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simuler l'upload
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const ext = file.name.split('.').pop()?.toLowerCase() || 'default';
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      nom: file.name,
      type: ext,
      taille: file.size,
      upload_date: new Date().toISOString().split('T')[0],
      status: 'uploaded',
    };

    setDocs((prev) => [newDoc, ...prev]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (docId: string) => {
    setAnalyzingId(docId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: 'analyzed' as const, summary: 'Analyse complete. Document traite avec succes.' }
          : d
      )
    );
    setAnalyzingId(null);
  };

  const handleDelete = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Documents
          </h1>
          <p className="text-muted-foreground">Analysez vos documents avec l'IA</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.pptx,.txt,.md,.csv"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importer
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un document..."
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: docs.length },
          { label: 'Analyses', value: docs.filter((d) => d.status === 'analyzed').length },
          { label: 'En attente', value: docs.filter((d) => d.status === 'uploaded').length },
          { label: 'En cours', value: docs.filter((d) => d.status === 'analyzing').length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document list */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous ({filtered.length})</TabsTrigger>
          <TabsTrigger value="analyzed">Analyses</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} onAnalyze={handleAnalyze} onDelete={handleDelete} isAnalyzing={analyzingId === doc.id} />
          ))}
        </TabsContent>
        <TabsContent value="analyzed" className="mt-4 space-y-3">
          {filtered.filter((d) => d.status === 'analyzed').map((doc) => (
            <DocCard key={doc.id} doc={doc} onAnalyze={handleAnalyze} onDelete={handleDelete} isAnalyzing={analyzingId === doc.id} />
          ))}
        </TabsContent>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {filtered.filter((d) => d.status === 'uploaded').map((doc) => (
            <DocCard key={doc.id} doc={doc} onAnalyze={handleAnalyze} onDelete={handleDelete} isAnalyzing={analyzingId === doc.id} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocCard({
  doc,
  onAnalyze,
  onDelete,
  isAnalyzing,
}: {
  doc: Document;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  isAnalyzing: boolean;
}) {
  const Icon = fileIcons[doc.type] || fileIcons.default;
  const colorClass = fileColors[doc.type] || fileColors.default;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-start gap-4 py-4">
        <div className={cn('p-3 rounded-lg flex-shrink-0', colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{doc.nom}</p>
            <Badge variant="outline" className="text-[10px] uppercase">{doc.type}</Badge>
            {doc.status === 'analyzed' && (
              <Badge className="bg-green-500 text-white text-[10px]">Analyse</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{formatSize(doc.taille)}</span>
            <span>Ajoute le {new Date(doc.upload_date).toLocaleDateString('fr-FR')}</span>
          </div>
          {doc.summary && (
            <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
              {doc.summary}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {doc.status === 'uploaded' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAnalyze(doc.id)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(doc.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
