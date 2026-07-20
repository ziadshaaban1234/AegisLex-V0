import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { UploadProgress, Case } from '@core/models';

interface UploadFile { id: string; file: File; progress: UploadProgress; documentId?: string; }

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnInit, OnDestroy {
  private readonly mockService  = inject(MockService);
  private readonly toastService = inject(ToastService);
  readonly lang                 = inject(LanguageService);

  isDragOver           = signal(false);
  uploadFiles          = signal<UploadFile[]>([]);
  cases                = signal<Case[]>([]);
  selectedCaseId       = signal<string>('');
  analyzeAfterUpload   = signal(true);
  loading              = signal(true);

  /** Tracks active upload intervals so they can be cancelled on destroy */
  private activeIntervals = new Set<ReturnType<typeof setInterval>>();

  toggleAnalyzeAfterUpload(): void { this.analyzeAfterUpload.update(v => !v); }

  ngOnDestroy(): void {
    // Cancel all in-progress simulated upload intervals to prevent
    // memory leaks and state mutations after component destruction.
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeIntervals.clear();
  }

  readonly allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  readonly maxSizeMB = 50;

  ngOnInit(): void {
    this.mockService.getCases(1, 100).subscribe({
      next: (res: any) => { this.cases.set(res.data.items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragOver.set(true); }
  onDragLeave(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragOver.set(false); }

  onDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isDragOver.set(false);
    this.processFiles(Array.from(event.dataTransfer?.files || []));
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFiles(Array.from(input.files || []));
    input.value = '';
  }

  private processFiles(files: File[]): void {
    for (const file of files) {
      if (file.size > this.maxSizeMB * 1024 * 1024) {
        this.toastService.error(this.lang.t('upload.toast.too_large'), `${file.name} exceeds ${this.maxSizeMB}MB limit`);
        continue;
      }
      const uploadFile: UploadFile = { id: crypto.randomUUID(), file, progress: { fileName: file.name, progress: 0, status: 'uploading' } };
      this.uploadFiles.update(f => [...f, uploadFile]);
      this.simulateUpload(uploadFile);
    }
  }

  private simulateUpload(uploadFile: UploadFile): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.activeIntervals.delete(interval);
        this.mockService.uploadDocument(uploadFile.file, this.selectedCaseId() || undefined).subscribe({
          next: (res: any) => {
            this.uploadFiles.update(files => files.map(f => f.id === uploadFile.id
              ? { ...f, progress: { ...f.progress, progress: 100, status: 'complete', documentId: res.data.id }, documentId: res.data.id }
              : f));
            this.toastService.success(this.lang.t('upload.toast.complete'), uploadFile.file.name);
          },
        });
      } else {
        this.uploadFiles.update(files => files.map(f => f.id === uploadFile.id
          ? { ...f, progress: { ...f.progress, progress: Math.round(progress) } }
          : f));
      }
    }, 300);
    this.activeIntervals.add(interval);
  }

  removeFile(id: string): void { this.uploadFiles.update(f => f.filter(x => x.id !== id)); }
  clearCompleted(): void { this.uploadFiles.update(f => f.filter(x => x.progress.status !== 'complete')); }
  retryUpload(uploadFile: UploadFile): void {
    this.uploadFiles.update(f => f.map(x => x.id === uploadFile.id
      ? { ...x, progress: { ...x.progress, status: 'uploading', progress: 0 } }
      : x));
    this.simulateUpload(uploadFile);
  }
  trackById(_: number, item: UploadFile): string { return item.id; }

  getStatusLabel(status: string, progress: number): string {
    if (status === 'uploading')   return `${progress}%`;
    if (status === 'processing')  return this.lang.t('upload.status.processing');
    if (status === 'complete')    return this.lang.t('upload.status.complete');
    return this.lang.t('upload.status.failed');
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = { pdf: 'picture_as_pdf', png: 'image', jpg: 'image', jpeg: 'image', tiff: 'image', doc: 'description', docx: 'description' };
    return icons[ext || ''] || 'insert_drive_file';
  }

  getFileIconColor(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = { pdf: '#ef4444', png: '#10b981', jpg: '#10b981', jpeg: '#10b981', tiff: '#10b981', doc: '#3b82f6', docx: '#3b82f6' };
    return colors[ext || ''] || '#94a3b8';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  get hasCompleted(): boolean { return this.uploadFiles().some(f => f.progress.status === 'complete'); }
  get allDone(): boolean { return this.uploadFiles().length > 0 && this.uploadFiles().every(f => f.progress.status === 'complete' || f.progress.status === 'error'); }
}
