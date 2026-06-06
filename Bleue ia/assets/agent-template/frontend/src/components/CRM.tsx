import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Tag,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: 'prospect' | 'client' | 'fournisseur' | 'partenaire';
  notes: string;
  date_creation: string;
}

const mockContacts: Contact[] = [
  { id: '1', nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@email.com', telephone: '+33612345678', statut: 'prospect', notes: 'Interessee par le pack premium', date_creation: '2025-01-10' },
  { id: '2', nom: 'Martin', prenom: 'Jean', email: 'jean.martin@email.com', telephone: '+33687654321', statut: 'client', notes: 'Client depuis 2023', date_creation: '2024-06-15' },
  { id: '3', nom: 'Bernard', prenom: 'Sophie', email: 'sophie.bernard@email.com', telephone: '+33611223344', statut: 'partenaire', notes: 'Partenariat strategique', date_creation: '2024-11-20' },
  { id: '4', nom: 'Petit', prenom: 'Lucas', email: 'lucas.petit@email.com', telephone: '+33655667788', statut: 'fournisseur', notes: 'Fournisseur IT', date_creation: '2025-01-05' },
];

const statutColors = {
  prospect: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  client: 'bg-green-500/10 text-green-600 border-green-200',
  fournisseur: 'bg-blue-500/10 text-blue-600 border-blue-200',
  partenaire: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

const statutLabels = {
  prospect: 'Prospect',
  client: 'Client',
  fournisseur: 'Fournisseur',
  partenaire: 'Partenaire',
};

export function CRM() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', statut: 'prospect' as Contact['statut'], notes: '',
  });

  const filtered = contacts.filter((c) =>
    `${c.nom} ${c.prenom} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nom || !form.prenom) return;
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? { ...c, ...form } : c))
      );
    } else {
      const newContact: Contact = {
        id: `contact_${Date.now()}`,
        ...form,
        date_creation: new Date().toISOString().split('T')[0],
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setForm({ nom: '', prenom: '', email: '', telephone: '', statut: 'prospect', notes: '' });
    setShowForm(false);
    setEditingContact(null);
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setForm({
      nom: contact.nom,
      prenom: contact.prenom,
      email: contact.email,
      telephone: contact.telephone,
      statut: contact.statut,
      notes: contact.notes,
    });
    setShowForm(true);
  };

  const stats = {
    total: contacts.length,
    prospects: contacts.filter((c) => c.statut === 'prospect').length,
    clients: contacts.filter((c) => c.statut === 'client').length,
    partenaires: contacts.filter((c) => c.statut === 'partenaire').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            CRM
          </h1>
          <p className="text-muted-foreground">Gestion de vos contacts</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingContact(null); setForm({ nom: '', prenom: '', email: '', telephone: '', statut: 'prospect', notes: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Prospects', value: stats.prospects, icon: Tag, color: 'text-yellow-600' },
          { label: 'Clients', value: stats.clients, icon: Users, color: 'text-green-600' },
          { label: 'Partenaires', value: stats.partenaires, icon: Users, color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un contact..."
          className="pl-10"
        />
      </div>

      {/* Form */}
      {showForm && (
        <Card className="animate-fade-in border-primary/20">
          <CardHeader>
            <CardTitle>{editingContact ? 'Modifier' : 'Nouveau'} contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom" />
              </div>
              <div>
                <label className="text-sm font-medium">Prenom</label>
                <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} placeholder="Prenom" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium">Telephone</label>
                <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+336..." />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value as Contact['statut'] })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(statutLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={!form.nom || !form.prenom}>
                {editingContact ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact list */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous ({filtered.length})</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </TabsContent>
        <TabsContent value="prospects" className="mt-4 space-y-3">
          {filtered.filter((c) => c.statut === 'prospect').map((contact) => (
            <ContactCard key={contact.id} contact={contact} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </TabsContent>
        <TabsContent value="clients" className="mt-4 space-y-3">
          {filtered.filter((c) => c.statut === 'client').map((contact) => (
            <ContactCard key={contact.id} contact={contact} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactCard({ contact, onEdit, onDelete }: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {contact.prenom[0]}{contact.nom[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">{contact.prenom} {contact.nom}</p>
            <Badge variant="outline" className={cn('text-[10px]', statutColors[contact.statut])}>
              {statutLabels[contact.statut]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.telephone}</span>
          </div>
          {contact.notes && (
            <p className="text-xs text-muted-foreground mt-1">{contact.notes}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(contact)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(contact.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
