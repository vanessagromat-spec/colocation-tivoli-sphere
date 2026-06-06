const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
    throw new APIError(response.status, error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Chat
export const chatAPI = {
  send: (message: string, conversationId?: string, stream = false) =>
    request<{ response: string; conversation_id: string }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId, stream }),
    }),
  getConversations: () =>
    request<Array<{ id: string; title: string; updated_at: string }>>('/chat/conversations'),
  getMessages: (convId: string) =>
    request<Array<{ role: string; content: string; timestamp: string }>>(`/chat/conversations/${convId}/messages`),
  deleteConversation: (convId: string) =>
    request<void>(`/chat/conversations/${convId}`, { method: 'DELETE' }),
};

// Taches autonomes
export const tasksAPI = {
  list: () =>
    request<Array<{ id: string; name: string; type: string; status: string; created_at: string }>>('/tasks/list'),
  create: (task: { name: string; type: string; params: Record<string, unknown>; schedule?: string }) =>
    request<{ id: string }>('/tasks/create', { method: 'POST', body: JSON.stringify(task) }),
  getStatus: (taskId: string) =>
    request<{ status: string; result?: unknown }>(`/tasks/${taskId}/status`),
  cancel: (taskId: string) =>
    request<void>(`/tasks/${taskId}/cancel`, { method: 'POST' }),
};

// CRM
export const crmAPI = {
  getContacts: () =>
    request<Array<{ id: string; nom: string; prenom: string; email: string; telephone: string; statut: string; notes: string }>>('/crm/contacts'),
  createContact: (contact: { nom: string; prenom: string; email: string; telephone?: string; statut?: string; notes?: string }) =>
    request<{ id: string }>('/crm/contacts', { method: 'POST', body: JSON.stringify(contact) }),
  updateContact: (id: string, contact: Partial<unknown>) =>
    request<void>(`/crm/contacts/${id}`, { method: 'PUT', body: JSON.stringify(contact) }),
  deleteContact: (id: string) =>
    request<void>(`/crm/contacts/${id}`, { method: 'DELETE' }),
};

// Projets
export const projectsAPI = {
  getProjects: () =>
    request<Array<{ id: string; nom: string; description: string; statut: string; date_echeance?: string }>>('/projects'),
  getTasks: (projectId: string) =>
    request<Array<{ id: string; titre: string; description: string; colonne: string; priorite: string; assigne_a?: string }>>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, task: { titre: string; description?: string; colonne?: string; priorite?: string }) =>
    request<{ id: string }>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(task) }),
  moveTask: (taskId: string, colonne: string) =>
    request<void>(`/tasks/${taskId}/move`, { method: 'PUT', body: JSON.stringify({ colonne }) }),
};

// Documents
export const documentsAPI = {
  list: () =>
    request<Array<{ id: string; nom: string; type: string; taille: number; upload_date: string }>>('/documents'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ id: string }>('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  analyze: (docId: string, type: string) =>
    request<{ result: string }>(`/documents/${docId}/analyze`, { method: 'POST', body: JSON.stringify({ type }) }),
};

// Systeme
export const systemAPI = {
  getHealth: () =>
    request<{ status: string; ollama: boolean; model: string }>('/health'),
  getStats: () =>
    request<{ conversations: number; tasks: number; contacts: number; documents: number }>('/stats'),
  getModels: () =>
    request<Array<{ name: string; size: string; parameter_size?: string }>>('/models/available'),
};

export { APIError };
