import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Notification } from '@core/models';

export interface AnalysisProgressEvent { documentId: string; progress: number; status: string; message?: string; }
export interface CollaborationEvent { userId: string; userName: string; action: string; entityId: string; entityType: string; timestamp: string; }

// =======================================================
// FUTURE BACKEND IMPLEMENTATION (comment only — connect(),
// disconnect(), joinCase(), leaveCase(), and
// simulateAnalysisProgress() below are untouched and remain
// exactly the static-demo no-op / setInterval simulation
// they are today).
//
// `@microsoft/signalr` is already a project dependency
// (see package.json) so no new package would be needed.
//
// Endpoint: ${environment.signalRUrl} (e.g. https://api.aegislex.com/hubs)
//
// import * as signalR from '@microsoft/signalr';
//
// private connection?: signalR.HubConnection;
//
// async connect(): Promise<void> {
//   const token = this.tokenService.getAccessToken();
//   this.connection = new signalR.HubConnectionBuilder()
//     .withUrl(`${this.env.signalRUrl}/notifications`, {
//       accessTokenFactory: () => token ?? '',
//     })
//     .withAutomaticReconnect()
//     .build();
//
//   this.connection.on('Notification',      (n: Notification) => this.notificationSubject.next(n));
//   this.connection.on('AnalysisProgress',  (e: AnalysisProgressEvent) => this.analysisProgressSubject.next(e));
//   this.connection.on('Collaboration',     (e: CollaborationEvent) => this.collaborationSubject.next(e));
//   this.connection.on('ReportReady',       (e: { reportId: string; caseId?: string }) => this.reportReadySubject.next(e));
//
//   await this.connection.start();
// }
//
// async disconnect(): Promise<void> { await this.connection?.stop(); }
// async joinCase(caseId: string): Promise<void> { await this.connection?.invoke('JoinCase', caseId); }
// async leaveCase(caseId: string): Promise<void> { await this.connection?.invoke('LeaveCase', caseId); }
//
// A raw-WebSocket alternative (no SignalR hub) would instead open
// `new WebSocket(environment.websocketUrl)` and dispatch on
// `JSON.parse(event.data).type`, for environments that can't expose
// a SignalR/.NET hub.
// =======================================================
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private notificationSubject = new Subject<Notification>();
  private analysisProgressSubject = new Subject<AnalysisProgressEvent>();
  private collaborationSubject = new Subject<CollaborationEvent>();
  private reportReadySubject = new Subject<{ reportId: string; caseId?: string }>();

  notification$ = this.notificationSubject.asObservable();
  analysisProgress$ = this.analysisProgressSubject.asObservable();
  collaboration$ = this.collaborationSubject.asObservable();
  reportReady$ = this.reportReadySubject.asObservable();

  async connect(): Promise<void> { /* static demo — no real connection */ }
  async disconnect(): Promise<void> { /* static demo */ }
  async joinCase(_caseId: string): Promise<void> { /* static demo */ }
  async leaveCase(_caseId: string): Promise<void> { /* static demo */ }

  simulateAnalysisProgress(documentId: string): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      this.analysisProgressSubject.next({ documentId, progress, status: progress < 100 ? 'running' : 'completed' });
      if (progress >= 100) clearInterval(interval);
    }, 600);
  }
}
