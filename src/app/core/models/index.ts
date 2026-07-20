// ============================================
// AegisLex Core Domain Models
// ============================================

// --- Authentication ---
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  role?: string;
  deviceId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationName?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  analysisComplete: boolean;
  reportReady: boolean;
}

export type UserRole = 'admin' | 'lawyer' | 'analyst' | 'viewer';

// --- Cases ---
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  caseType: CaseType;
  clientName?: string;
  assignedTo?: User;
  createdBy: User;
  documents: Document[];
  tags: string[];
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type CaseStatus = 'active' | 'pending' | 'review' | 'closed' | 'archived';
export type CasePriority = 'critical' | 'high' | 'medium' | 'low';
export type CaseType = 'contract' | 'litigation' | 'compliance' | 'investigation' | 'advisory' | 'other';

export interface CreateCaseRequest {
  title: string;
  description?: string;
  caseType: CaseType;
  priority: CasePriority;
  clientName?: string;
  tags?: string[];
}

// --- Documents ---
export interface Document {
  id: string;
  caseId?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  status: DocumentStatus;
  ocrStatus: OcrStatus;
  analysisStatus: AnalysisStatus;
  extractedText?: string;
  language?: string;
  pageCount?: number;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
  metadata?: DocumentMetadata;
}

export type DocumentStatus = 'uploaded' | 'processing' | 'processed' | 'error';
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'not_needed';
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface DocumentMetadata {
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  subject?: string;
  keywords?: string[];
  pageCount?: number;
  wordCount?: number;
  language?: string;
}

// --- AI Chat / Messages ---
export interface ChatSession {
  id: string;
  title: string;
  caseId?: string;
  documentIds?: string[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'saul' | 'system';
  content: string;
  contentType: 'text' | 'markdown' | 'analysis' | 'report';
  attachments?: MessageAttachment[];
  thinking?: string;
  sources?: LegalSource[];
  toolsUsed?: string[];
  createdAt: string;
  isStreaming?: boolean;
}

export interface MessageAttachment {
  documentId: string;
  fileName: string;
  pageReference?: number;
}

export interface LegalSource {
  id: string;
  title: string;
  sourceType: 'law' | 'case' | 'document' | 'article';
  excerpt: string;
  relevanceScore: number;
  url?: string;
}

// --- AI Analysis ---
export interface DocumentAnalysis {
  id: string;
  documentId: string;
  caseId?: string;
  status: AnalysisStatus;
  summary?: string;
  risks: Risk[];
  entities: LegalEntity[];
  clauses: ContractClause[];
  timeline: TimelineEvent[];
  relationships: LegalRelationship[];
  recommendations: Recommendation[];
  contradictions: Contradiction[];
  overallRiskScore: number;
  createdAt: string;
  completedAt?: string;
}

export interface Risk {
  id: string;
  severity: RiskSeverity;
  category: string;
  title: string;
  description: string;
  affectedClauses: string[];
  recommendation: string;
  confidence: number;
}

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface LegalEntity {
  id: string;
  name: string;
  entityType: EntityType;
  mentions: EntityMention[];
  attributes: Record<string, string>;
}

export type EntityType = 'person' | 'organization' | 'date' | 'money' | 'location' | 'law' | 'case' | 'clause';

export interface EntityMention {
  text: string;
  startIndex: number;
  endIndex: number;
  pageNumber?: number;
  confidence: number;
}

export interface ContractClause {
  id: string;
  clauseNumber: string;
  title: string;
  content: string;
  clauseType: string;
  risks: Risk[];
  summary: string;
  pageNumber?: number;
  startIndex?: number;
  endIndex?: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  eventType: TimelineEventType;
  parties?: string[];
  documentRef?: string;
  importance: 'high' | 'medium' | 'low';
}

export type TimelineEventType = 'contract_signed' | 'deadline' | 'payment' | 'legal_action' | 'amendment' | 'termination' | 'other';

export interface LegalRelationship {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  relationshipType: string;
  description?: string;
  strength: number;
  documentRef?: string;
}

export interface Recommendation {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  relatedRisks?: string[];
}

export interface Contradiction {
  id: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  clause1: string;
  clause2: string;
  explanation: string;
  suggestion?: string;
}

// --- Reports ---
export interface Report {
  id: string;
  caseId?: string;
  documentId?: string;
  title: string;
  reportType: ReportType;
  status: 'generating' | 'completed' | 'failed';
  content?: string;
  htmlContent?: string;
  summary?: string;
  sections: ReportSection[];
  createdBy: User;
  createdAt: string;
  completedAt?: string;
}

export type ReportType = 'contract_analysis' | 'risk_assessment' | 'legal_summary' | 'due_diligence' | 'case_report' | 'custom';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  sectionType: string;
}

// --- Similar Cases ---
export interface SimilarCase {
  id: string;
  title: string;
  caseNumber?: string;
  court?: string;
  year?: number;
  jurisdiction?: string;
  summary: string;
  outcome?: string;
  relevanceScore: number;
  matchingTopics: string[];
  sourceUrl?: string;
}

// --- Notifications ---
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'analysis_complete' | 'report_ready' | 'mention';

// --- Dashboard ---
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  documentsAnalyzed: number;
  reportsGenerated: number;
  risksDetected: number;
  pendingTasks: number;
  recentActivity: ActivityItem[];
  casesByStatus: ChartDataPoint[];
  casesByType: ChartDataPoint[];
  riskTrend: TrendDataPoint[];
  analysisVolume: TrendDataPoint[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  performedBy: User;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

// --- Search ---
export interface SearchRequest {
  query: string;
  searchType: 'semantic' | 'keyword' | 'hybrid';
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

export interface SearchFilters {
  caseId?: string;
  documentTypes?: string[];
  dateFrom?: string;
  dateTo?: string;
  riskLevel?: RiskSeverity[];
  entityTypes?: EntityType[];
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  resultType: 'document' | 'case' | 'law' | 'judgment' | 'clause';
  relevanceScore: number;
  highlightedExcerpt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  searchTime: number;
}

// --- Pagination ---
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Alias for naming-convention compliance. PagedResult is the canonical,
 *  actively-used name across cases/documents/reports/notifications/saul
 *  services — this alias exists only so code written against the
 *  "PaginatedResponse" convention also compiles. Do not duplicate logic;
 *  always import PagedResult in new code. */
export type PaginatedResponse<T> = PagedResult<T>;

// --- API Response ---
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// --- File Upload ---
export interface UploadProgress {
  documentId?: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// --- Analytics ---
export interface AnalyticsData {
  period: string;
  casesOpened: number;
  casesClosed: number;
  documentsProcessed: number;
  aiQueriesCount: number;
  averageRiskScore: number;
  topRiskCategories: ChartDataPoint[];
  contractTypes: ChartDataPoint[];
}

// ============================================================
// Auth API Contracts — strongly-typed request/response DTOs
// ============================================================

// -- Register -------------------------------------------------------


export interface RegisterResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
  user:         UserDto;
}

// -- Login ----------------------------------------------------------
export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
  user:         UserDto;
  rememberMe:   boolean;
}

// -- Forgot Password ------------------------------------------------
export interface ForgotPasswordRequest  { email: string; }
export interface ForgotPasswordResponse { message: string; expiresAt: string; }

// -- Verify OTP -----------------------------------------------------
export interface VerifyOtpRequest  { email: string; otp: string; purpose: OtpPurpose; }
export interface VerifyOtpResponse { verified: boolean; resetToken?: string; expiresAt?: string; }

export type OtpPurpose = 'reset_password' | 'verify_email' | 'two_factor';

// -- Reset Password -------------------------------------------------
export interface ResetPasswordRequest  { resetToken: string; password: string; confirmPassword: string; }
export interface ResetPasswordResponse { success: boolean; message: string; }

// -- Refresh Token --------------------------------------------------
export interface RefreshTokenRequest  { refreshToken: string; }
export interface RefreshTokenResponse { accessToken: string; refreshToken: string; expiresIn: number; }

// -- Logout ---------------------------------------------------------
export interface LogoutRequest  { refreshToken?: string; allDevices?: boolean; }
export interface LogoutResponse { success: boolean; }

// -- User DTOs ------------------------------------------------------
export interface UserDto {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  role:             UserRole;
  organizationName?: string;
  avatarUrl?:       string;
  isActive:         boolean;
  isVerified?:      boolean;
  createdAt:        string;
  lastLoginAt?:     string;
  preferences:      UserPreferences;
}

export interface RoleDto {
  id:          string;
  name:        UserRole;
  displayName: string;
  permissions: string[];
  description: string;
}

export interface PermissionDto {
  id:          string;
  key:         string;
  displayName: string;
  category:    string;
  description: string;
}

export interface AuthUser extends UserDto {
  accessToken:   string;
  refreshToken?: string;
  expiresAt:     string;
  permissions:   string[];
}

export interface CurrentUserResponse {
  user:        UserDto;
  permissions: string[];
  role:        RoleDto;
}

// -- Device ---------------------------------------------------------
export interface DeviceInfo {
  deviceId:   string;
  userAgent:  string;
  platform:   string;
  language:   string;
  timezone:   string;
  screenSize: string;
}

// -- Google Authentication (future) ---------------------------------
/**
 * Sent to the backend after the user completes the Google consent flow.
 * The frontend passes the Google ID token; the backend validates it with
 * Google and exchanges it for an AegisLex session (standard LoginResponse).
 * The frontend NEVER stores or transmits the Google client secret.
 */
export interface GoogleAuthRequest {
  /** Google ID token obtained from the Google Identity Services JS SDK. */
  idToken:    string;
  /** Optional: device metadata for session fingerprinting. */
  deviceId?:  string;
}

// -- Session --------------------------------------------------------
export interface SessionInfo {
  sessionId:    string;
  deviceId:     string;
  ipAddress?:   string;
  userAgent:    string;
  lastActivity: string;
  createdAt:    string;
  isCurrent:    boolean;
  isTrusted:    boolean;
}

// -- Account Lockout ------------------------------------------------
export interface LockoutInfo {
  isLocked:           boolean;
  lockedUntil?:       string;   // ISO timestamp
  remainingSeconds?:  number;
  failedAttempts:     number;
  maxAttempts:        number;
}

// -- OTP State (frontend only) --------------------------------------
export interface OtpFlowState {
  email:        string;
  purpose:      OtpPurpose;
  sentAt:       number;       // timestamp ms
  expiresAt:    number;       // timestamp ms
  attempts:     number;
  maxAttempts:  number;
  resetToken?:  string;       // populated after successful verify
}

// -- Registration Draft (frontend only, persisted safely) -----------
export interface RegDraft {
  firstName:        string;
  lastName:         string;
  email:            string;
  organizationName: string;
  role:             string;
  agreeTerms:       boolean;
  savedAt:          number;
}

// ── DTO type aliases (for backend contract naming convention) ──────────────
// These point to the existing interfaces so there is no duplication.
// Use either name — they are identical at the type level.
export type DeviceInfoDto   = DeviceInfo;
export type SessionInfoDto  = SessionInfo;
export type LockoutInfoDto  = LockoutInfo;
