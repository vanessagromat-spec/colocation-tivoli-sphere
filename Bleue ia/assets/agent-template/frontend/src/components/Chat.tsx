import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function Chat() {
  const { messages, isLoading, sendMessage, clearChat } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const quickActions = [
    { label: 'Redige un email', prompt: 'Redige un email professionnel pour...' },
    { label: 'Resume un texte', prompt: 'Resume le texte suivant : ' },
    { label: 'Analyse de donnees', prompt: 'Analyse ces donnees : ' },
    { label: 'Code Python', prompt: 'Ecris un script Python qui...' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Chat IA</h2>
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Bienvenue !</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Votre assistant IA 100% local est pret. Posez vos questions, demandez de l'aide
              pour vos projets, ou utilisez les raccourcis ci-dessous.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.prompt);
                    inputRef.current?.focus();
                  }}
                  className="text-left px-4 py-3 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-fade-in',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  msg.role === 'user'
                    ? 'bg-secondary'
                    : 'bg-primary/10'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
                <span
                  className={cn(
                    'text-[10px] mt-1 block',
                    msg.role === 'user'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">L'agent reflechit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
