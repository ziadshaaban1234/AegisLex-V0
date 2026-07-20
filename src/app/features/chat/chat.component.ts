// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION — FUTURE BACKEND INTEGRATION
//
// Current state: SaulService uses MockService for all chat responses (mock mode).
//
// Future Provider Flow:
//   Grok (Primary) — legal reasoning, contract analysis, SSE streaming
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend streams unified StreamChunk SSE response → ChatComponent renders it.
//
// The ChatComponent itself requires ZERO changes for backend integration.
// Only SaulService.sendMessage() needs to be updated to call the backend.
// See saul.service.ts for the full integration plan.
//
// Future Backend Endpoint:
//   POST ${env.aiBaseUrl}/chat/messages
//   Transport: Server-Sent Events (text/event-stream)
//   Request:   { sessionId?, content, documentIds?, caseId? }
//   Response:  StreamChunk per event, final chunk has done=true.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component, OnInit, OnDestroy, inject, signal,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SaulService, SendMessageRequest, StreamChunk } from '@core/services/saul.service';
import { MockService } from '@core/mock/mock.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { ChatSession, ChatMessage, Document } from '@core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;
  @ViewChild('messageInput') private messageInputRef!: ElementRef<HTMLTextAreaElement>;

  private readonly saulService = inject(SaulService);
  private readonly mockService = inject(MockService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  readonly lang = inject(LanguageService);

  readonly currentUser = this.authService.currentUser;
  sessions = signal<ChatSession[]>([]);
  activeSession = signal<ChatSession | null>(null);
  messages = signal<ChatMessage[]>([]);
  isStreaming = signal(false);
  isLoadingSessions = signal(true);
  isLoadingMessages = signal(false);
  inputMessage = signal('');
  attachedDocumentIds = signal<string[]>([]);
  availableDocuments = signal<Document[]>([]);
  showDocumentPicker = signal(false);
  streamingContent = signal('');
  sidebarOpen = signal(window.innerWidth > 1024);

  private streamSubscription?: Subscription;
  private shouldScrollToBottom = false;

  get suggestedPrompts(): string[] {
    return [
      this.lang.t('chat.prompt.analyze_nda'),
      this.lang.t('chat.prompt.liability_issues'),
      this.lang.t('chat.prompt.similar_cases'),
      this.lang.t('chat.prompt.summarize_obligations'),
      this.lang.t('chat.prompt.create_timeline'),
      this.lang.t('chat.prompt.risk_assessment'),
      this.lang.t('chat.prompt.contradictions'),
      this.lang.t('chat.prompt.legal_options'),
    ];
  }

  ngOnInit(): void {
    this.loadSessions();
    this.loadDocuments();
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (sessionId) this.loadSession(sessionId);
  }

  ngOnDestroy(): void { this.streamSubscription?.unsubscribe(); }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) { this.scrollToBottom(); this.shouldScrollToBottom = false; }
  }

  private loadSessions(): void {
    this.isLoadingSessions.set(true);
    this.saulService.getSessions().subscribe({
      next: res => { this.sessions.set(res.data.items); this.isLoadingSessions.set(false); },
    });
  }

  private loadDocuments(): void {
    this.mockService.getDocuments().subscribe({
      next: (res: any) => this.availableDocuments.set(res.data.items),
    });
  }

  loadSession(sessionId: string): void {
    this.isLoadingMessages.set(true);
    this.saulService.getSession(sessionId).subscribe({
      next: res => {
        this.activeSession.set(res.data);
        this.messages.set(res.data.messages || []);
        this.isLoadingMessages.set(false);
        this.shouldScrollToBottom = true;
      },
    });
  }

  /** Selects a session and closes the sidebar on mobile (≤1024px) */
  selectSession(sessionId: string): void {
    this.loadSession(sessionId);
    if (window.innerWidth <= 1024) {
      this.sidebarOpen.set(false);
    }
  }

  createNewSession(): void {
    this.activeSession.set(null);
    this.messages.set([]);
    this.inputMessage.set('');
    this.attachedDocumentIds.set([]);
  }

  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();
    this.saulService.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions.update(s => s.filter(x => x.id !== sessionId));
        if (this.activeSession()?.id === sessionId) this.createNewSession();
        this.toastService.success(this.lang.t('chat.toast.deleted'));
      },
    });
  }

  sendMessage(): void {
    const content = this.inputMessage().trim();
    if (!content || this.isStreaming()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), sessionId: this.activeSession()?.id || '',
      role: 'user', content, contentType: 'text', createdAt: new Date().toISOString(),
    };
    this.messages.update(m => [...m, userMsg]);
    this.inputMessage.set('');
    this.isStreaming.set(true);
    this.streamingContent.set('');
    this.shouldScrollToBottom = true;

    const streamingMsg: ChatMessage = {
      id: 'streaming', sessionId: this.activeSession()?.id || '',
      role: 'saul', content: '', contentType: 'markdown',
      createdAt: new Date().toISOString(), isStreaming: true,
    };
    this.messages.update(m => [...m, streamingMsg]);

    const request: SendMessageRequest = {
      sessionId: this.activeSession()?.id,
      content, documentIds: this.attachedDocumentIds(),
    };

    this.streamSubscription = this.saulService.sendMessage(request).subscribe({
      next: (chunk: StreamChunk) => {
        if (!chunk.done) {
          this.streamingContent.update(c => c + chunk.chunk);
          this.messages.update(msgs => msgs.map(m => m.id === 'streaming' ? { ...m, content: this.streamingContent() } : m));
          this.shouldScrollToBottom = true;
        }
        if (chunk.done) {
          const finalMsg: ChatMessage = {
            id: chunk.messageId || crypto.randomUUID(),
            sessionId: chunk.sessionId || this.activeSession()?.id || '',
            role: 'saul', content: this.streamingContent(),
            contentType: 'markdown', createdAt: new Date().toISOString(),
            isStreaming: false, toolsUsed: chunk.toolsUsed,
          };
          this.messages.update(msgs => msgs.map(m => m.id === 'streaming' ? finalMsg : m));
          this.isStreaming.set(false);
          this.streamingContent.set('');

          if (!this.activeSession() && chunk.sessionId) {
            this.saulService.createSession('New Conversation').subscribe({
              next: res => {
                this.activeSession.set(res.data);
                this.sessions.update(s => [res.data, ...s]);
              },
            });
          }
        }
      },
      error: () => {
        this.messages.update(m => m.filter(x => x.id !== 'streaming'));
        this.isStreaming.set(false);
        this.toastService.error(this.lang.t('chat.toast.error'), this.lang.t('chat.toast.error_detail'));
      },
    });
  }

  useSuggestedPrompt(prompt: string): void {
    this.inputMessage.set(prompt);
    this.messageInputRef?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.sendMessage(); }
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.inputMessage.set(val);
    this.autoResizeTextarea(event.target as HTMLTextAreaElement);
  }

  private autoResizeTextarea(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }

  toggleDocumentPicker(): void { this.showDocumentPicker.update(v => !v); }
  toggleDocument(docId: string): void { this.attachedDocumentIds.update(ids => ids.includes(docId) ? ids.filter(id => id !== docId) : [...ids, docId]); }
  isDocumentAttached(docId: string): boolean { return this.attachedDocumentIds().includes(docId); }
  removeAttachedDocument(docId: string): void { this.attachedDocumentIds.update(ids => ids.filter(id => id !== docId)); }
  getAttachedDocumentName(docId: string): string { return this.availableDocuments().find(d => d.id === docId)?.originalName || 'Document'; }
  stopStreaming(): void { this.streamSubscription?.unsubscribe(); this.messages.update(m => m.filter(x => x.id !== 'streaming')); this.isStreaming.set(false); }
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  trackById(_: number, msg: ChatMessage): string { return msg.id; }
  trackBySessionId(_: number, session: ChatSession): string { return session.id; }

  /**
   * Escapes raw HTML special characters so user/AI-provided text can never
   * inject markup or scripts through [innerHTML]. Must run BEFORE the
   * markdown-style replacements below, since those replacements are the
   * only HTML tags we intentionally want to allow through.
   */
  private escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatMessageContent(content: string): string {
    if (!content) return '';
    return this.escapeHtml(content)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  getSessionTitle(session: ChatSession): string {
    if (session.title) return session.title;
    return this.lang.t('chat.msg.new_conversation');
  }

  formatSessionDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return this.lang.t('chat.msg.today');
    if (d === 1) return this.lang.t('chat.msg.yesterday');
    return new Date(dateStr).toLocaleDateString(this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' });
  }

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }

  private scrollToBottom(): void {
    try { this.messagesEndRef?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }
}
