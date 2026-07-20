import { Injectable, inject } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatSession, ChatMessage, ApiResponse, PagedResult } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION
//
// Current state: MockService serves all AI responses (mock mode).
// Future state:  All requests route to environment.aiBaseUrl (backend gateway).
//
// Future Provider Flow:
//   Grok (Primary)
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend returns unified StreamChunk response → SaulService consumes as-is.
//
// Frontend does NOT implement provider selection or retry logic.
// The backend AI gateway at environment.aiBaseUrl handles provider routing.
// Switching providers requires zero frontend changes.
//
// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND INTEGRATION (comment only — no runtime change)
//
// When a real backend is available, replace MockService calls with:
//
//   sendMessage(req): Observable<StreamChunk> — SSE / Server-Sent Events:
//     return new Observable(observer => {
//       fetch(`${env.aiBaseUrl}/chat/messages`, { method:'POST', body: JSON.stringify(req),
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } })
//         .then(res => {
//           const reader = res.body!.getReader();
//           const pump = () => reader.read().then(({ done, value }) => {
//             if (done) { observer.next({ chunk:'', done:true }); observer.complete(); return; }
//             const text = new TextDecoder().decode(value);
//             JSON.parse(text).forEach((c: StreamChunk) => observer.next(c));
//             pump();
//           });
//           pump();
//         })
//         .catch(err => observer.error(err));
//     });
//
// Primary Backend Endpoint:  POST ${env.aiBaseUrl}/chat/messages
// Fallback:                  Backend selects Gemini automatically on Grok failure.
//
//   getSessions(): Observable<...>
//     → GET  ${env.aiBaseUrl}/chat/sessions
//
//   getSession(id): Observable<...>
//     → GET  ${env.aiBaseUrl}/chat/sessions/:id?includeMessages=true
//
//   createSession(title?, caseId?): Observable<...>
//     → POST ${env.aiBaseUrl}/chat/sessions { title, caseId }
//
//   deleteSession(id): Observable<...>
//     → DELETE ${env.aiBaseUrl}/chat/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────

export interface SendMessageRequest { sessionId?: string; content: string; documentIds?: string[]; caseId?: string; }
export interface StreamChunk { chunk: string; done: boolean; sessionId?: string; messageId?: string; sources?: any[]; toolsUsed?: string[]; }

const SAUL_RESPONSES: Record<string, string> = {
  default: `I've analyzed your query using the available legal documents and knowledge base. Here are my findings:\n\n**Key Points:**\n- The matter involves significant legal considerations requiring careful analysis\n- I've cross-referenced applicable UAE and international law\n- Multiple risk factors have been identified\n\n**Recommendations:**\n1. Review the flagged clauses before proceeding\n2. Consider engaging specialist counsel for the highlighted provisions\n3. Obtain counterparty agreement on the amended terms\n\nWould you like me to elaborate on any specific aspect or generate a detailed report?`,

  risk: `Based on my analysis using advanced contract intelligence, I've identified the following risk profile:\n\n## Risk Summary — HIGH RISK (Score: 72/100)\n\n**🔴 Critical Risks (1):**\n- Unlimited liability exposure in Clause 8.3 — no financial cap exists\n\n**🟠 High Risks (2):**  \n- Overly broad confidentiality scope (Clause 2.1) — missing standard carve-outs\n- Perpetual confidentiality obligation (Clause 5.1) — likely unenforceable beyond 5 years\n\n**🟡 Medium Risks (1):**\n- Missing dispute resolution mechanism — critical for cross-border transaction\n\n**Immediate Action Required:** Do not execute this agreement without addressing the liability cap. I recommend returning a redline within 5 business days.`,

  similar: `I searched the legal database and found **4 highly relevant precedents:**\n\n### 1. TechVentures v. DataCorp (DIFC Courts, 2022) — 94% match\nCourt capped unlimited liability at contract value. Your unlimited liability clause faces the same risk.\n\n### 2. Al-Futtaim v. Nexus Digital (DIFC, 2021) — 88% match  \nPerpetual confidentiality held unenforceable beyond 7 years. Directly applicable to your Clause 5.1.\n\n### 3. Axiom v. Gulf Innovation (ICC Arbitration, 2023) — 81% match\nMissing arbitration clause led to USD 2.3M in jurisdictional proceedings. Add dispute resolution clause immediately.\n\n### 4. Meridian Holdings v. CloudTech (English High Court, 2022) — 78% match\nOverly broad confidentiality definition severed to exclude public domain. Applicable to your Clause 2.1.\n\n**Strategic Recommendation:** Based on these precedents, renegotiate all four flagged provisions. Courts will likely reform them anyway — negotiate from strength now.`,

  report: `I've generated a comprehensive **Contract Risk Analysis Report** for this matter.\n\n## Report Contents:\n- **Executive Summary** — Overall risk score 72/100 (HIGH)\n- **Risk Analysis** — 4 risks across liability, confidentiality, duration, and dispute resolution  \n- **Entity Extraction** — 6 entities identified (parties, dates, financial terms, applicable laws)\n- **Clause-by-Clause Analysis** — 5 key clauses reviewed with risk flags\n- **Similar Cases** — 4 precedents from DIFC and international courts\n- **Amendment Recommendations** — Specific redline language for all 4 issues\n- **Timeline** — 8 key dates extracted and mapped\n\n**The report is ready to download as PDF or Word document.** Navigate to Reports to access the full document.`,
};

@Injectable({ providedIn: 'root' })
export class SaulService {
  private readonly mock = inject(MockService);

  getSessions(): Observable<ApiResponse<PagedResult<ChatSession>>> { return this.mock.getSessions() as any; }
  getSession(id: string): Observable<ApiResponse<ChatSession>> { return this.mock.getSession(id) as any; }
  createSession(title?: string, caseId?: string): Observable<ApiResponse<ChatSession>> { return this.mock.createSession(title, caseId) as any; }
  deleteSession(_id: string): Observable<ApiResponse<void>> { return this.mock.deleteSession(_id) as any; }
  getMessages(sessionId: string): Observable<ApiResponse<ChatMessage[]>> { return this.mock.getMessages(sessionId) as any; }

  // =======================================================
  // AI READINESS — FUTURE PRODUCTION IMPLEMENTATION
  // (comment only — the mock word-by-word Subject stream below
  // is untouched and remains exactly as before)
  //
  // Primary Backend Endpoint: POST ${env.aiBaseUrl}/chat/messages
  // Provider:  Grok (primary) | Gemini (fallback — backend decides)
  // Transport: Server-Sent Events (text/event-stream)
  // Request:   { sessionId?, content, documentIds?, caseId? }
  // Response:  One JSON-encoded StreamChunk per SSE event.
  //            Final chunk has done=true.
  //
  // Angular example using fetch + ReadableStream (HttpClient does
  // not support SSE natively):
  //
  //   async function* streamSaulMessage(request: SendMessageRequest) {
  //     const res = await fetch(`${env.aiBaseUrl}/chat/messages`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(request),
  //     });
  //     const reader = res.body!.getReader();
  //     const decoder = new TextDecoder();
  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) break;
  //       for (const line of decoder.decode(value).split('\n')) {
  //         if (line.startsWith('data: ')) yield JSON.parse(line.slice(6)) as StreamChunk;
  //       }
  //     }
  //   }
  //
  // A WebSocket-based alternative would open a socket per session
  // and push StreamChunk frames the same shape as today's mock.
  // =======================================================
  sendMessage(request: SendMessageRequest): Observable<StreamChunk> {
    const subject = new Subject<StreamChunk>();
    const content = request.content.toLowerCase();
    let response = SAUL_RESPONSES.default;
    if (content.includes('risk') || content.includes('analyze') || content.includes('review')) response = SAUL_RESPONSES.risk;
    else if (content.includes('similar') || content.includes('case') || content.includes('precedent')) response = SAUL_RESPONSES.similar;
    else if (content.includes('report') || content.includes('generate')) response = SAUL_RESPONSES.report;

    const sessionId = request.sessionId || 'ses-' + Date.now();
    const messageId = 'msg-' + Date.now();
    const words = response.split(' ');
    let idx = 0;

    const stream = () => {
      if (idx < words.length) {
        subject.next({ chunk: (idx === 0 ? '' : ' ') + words[idx], done: false, sessionId, messageId });
        idx++;
        setTimeout(stream, 30 + Math.random() * 20);
      } else {
        setTimeout(() => {
          subject.next({ chunk: '', done: true, sessionId, messageId, toolsUsed: ['legal_rag_search', 'contract_analysis', 'risk_detection'] });
          subject.complete();
        }, 100);
      }
    };
    setTimeout(stream, 500);
    return subject.asObservable();
  }

  analyzeDocument(documentId: string, prompt: string): Observable<ApiResponse<any>> {
    // Future Backend Integration:
    // Primary Provider: Grok  | Fallback: Gemini (backend decides automatically)
    // POST ${env.aiBaseUrl}/documents/${documentId}/analyze  { prompt }
    return of({ data: { analysis: SAUL_RESPONSES.risk }, success: true }).pipe(delay(1500)) as any;
  }

  getSummary(_documentId: string): Observable<ApiResponse<{ summary: string; keyPoints: string[] }>> {
    // Future Backend Integration:
    // Primary Provider: Grok  | Fallback: Gemini (backend decides automatically)
    // GET ${env.aiBaseUrl}/documents/${_documentId}/summary
    return of({
      data: {
        summary: 'This NDA presents high risk with 4 critical issues. Unlimited liability (Clause 8.3) and overly broad confidentiality scope (Clause 2.1) require immediate renegotiation before execution.',
        keyPoints: ['Unlimited liability exposure — negotiate cap at USD 5M', 'Confidentiality definition missing standard carve-outs', 'Perpetual obligation may be unenforceable under UAE law', 'No dispute resolution mechanism for cross-border dispute'],
      },
      success: true,
    }).pipe(delay(800)) as any;
  }
}
