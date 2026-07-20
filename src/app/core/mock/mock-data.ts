import {
  User, Case, Document, DocumentAnalysis, Report, ChatSession, ChatMessage,
  Notification, DashboardStats, SimilarCase, Recommendation, Risk
} from '@core/models';

// ─── CURRENT USER ─────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'usr-001',
  firstName: 'Ziad',
  lastName: 'Shaaban',
  email: 'sarah.almansouri@aegislex.com',
  role: 'lawyer',
  avatarUrl: undefined,
  organizationName: 'Al-Mansouri & Associates',
  isActive: true,
  createdAt: '2024-01-15T09:00:00Z',
  lastLoginAt: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: true, analysisComplete: true, reportReady: true },
  },
};

// ─── CASES ────────────────────────────────────────────────────────────────────
export const MOCK_CASES: Case[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE-2024-001',
    title: 'NDA Review — TechCorp Acquisition',
    description: 'Review and risk analysis of Non-Disclosure Agreement related to the pending acquisition of TechCorp Industries Ltd. by Nexus Capital Group. Includes IP protection clauses, liability caps, and dispute resolution mechanisms.',
    status: 'active',
    priority: 'high',
    caseType: 'contract',
    clientName: 'TechCorp Industries Ltd.',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['NDA', 'M&A', 'Acquisition', 'IP'],
    riskScore: 72,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'case-002',
    caseNumber: 'CASE-2024-002',
    title: 'Employment Contract Dispute — Apex Solutions',
    description: 'Dispute arising from alleged breach of employment contract, including non-compete clause enforcement and wrongful termination claims under UAE Labour Law.',
    status: 'pending',
    priority: 'medium',
    caseType: 'litigation',
    clientName: 'Apex Solutions Ltd.',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['Employment', 'Dispute', 'Non-Compete', 'UAE Labour Law'],
    riskScore: 45,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'case-003',
    caseNumber: 'CASE-2024-003',
    title: 'GDPR Compliance Audit — EuroBank Financial',
    description: 'Comprehensive GDPR compliance review of data processing agreements, privacy policies, and cross-border data transfer mechanisms for EuroBank Financial Services.',
    status: 'review',
    priority: 'critical',
    caseType: 'compliance',
    clientName: 'EuroBank Financial Services',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['GDPR', 'Compliance', 'Data Privacy', 'FinTech'],
    riskScore: 91,
    createdAt: '2024-01-12T09:30:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'case-004',
    caseNumber: 'CASE-2024-004',
    title: 'IP Licensing Agreement — InnovateTech',
    description: 'Negotiation and drafting of intellectual property licensing agreement covering software patents, trademarks, and trade secrets for InnovateTech LLC.',
    status: 'active',
    priority: 'low',
    caseType: 'contract',
    clientName: 'InnovateTech LLC',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['IP', 'Licensing', 'Patents', 'Software'],
    riskScore: 22,
    createdAt: '2023-12-20T11:00:00Z',
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'case-005',
    caseNumber: 'CASE-2024-005',
    title: 'Real Estate Purchase Agreement — Prime Properties',
    description: 'Review of commercial real estate purchase agreement for a 40,000 sqft office development in Dubai Business Bay. Includes title verification, encumbrances, and handover conditions.',
    status: 'active',
    priority: 'high',
    caseType: 'contract',
    clientName: 'Prime Properties Group',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['Real Estate', 'Commercial', 'Dubai', 'Property'],
    riskScore: 58,
    createdAt: '2024-01-08T16:00:00Z',
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'case-006',
    caseNumber: 'CASE-2024-006',
    title: 'Joint Venture Agreement — Gulf Partners',
    description: 'Structuring and negotiation of joint venture agreement between Gulf Investment Authority and Meridian Holdings for infrastructure development project worth USD 500M.',
    status: 'closed',
    priority: 'high',
    caseType: 'contract',
    clientName: 'Gulf Investment Authority',
    assignedTo: MOCK_USER,
    createdBy: MOCK_USER,
    documents: [],
    tags: ['JV', 'Infrastructure', 'Investment', 'Gulf'],
    riskScore: 38,
    createdAt: '2023-11-01T08:00:00Z',
    updatedAt: '2024-01-02T17:00:00Z',
    closedAt: '2024-01-02T17:00:00Z',
  },
];

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    caseId: 'case-001',
    fileName: 'nda_techcorp_2024_v3.pdf',
    originalName: 'NDA — TechCorp Acquisition 2024 v3.pdf',
    fileType: 'pdf',
    fileSize: 2457600,
    mimeType: 'application/pdf',
    storagePath: '/uploads/doc-001.pdf',
    status: 'processed',
    ocrStatus: 'completed',
    analysisStatus: 'completed',
    language: 'en',
    pageCount: 12,
    uploadedBy: MOCK_USER,
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
  },
  {
    id: 'doc-002',
    caseId: 'case-001',
    fileName: 'ip_schedule_a.pdf',
    originalName: 'IP Schedule A — Annexures.pdf',
    fileType: 'pdf',
    fileSize: 1234560,
    mimeType: 'application/pdf',
    storagePath: '/uploads/doc-002.pdf',
    status: 'processed',
    ocrStatus: 'completed',
    analysisStatus: 'completed',
    language: 'en',
    pageCount: 8,
    uploadedBy: MOCK_USER,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:30:00Z',
  },
  {
    id: 'doc-003',
    caseId: 'case-003',
    fileName: 'gdpr_dpa_eurobank.pdf',
    originalName: 'GDPR Data Processing Agreement — EuroBank.pdf',
    fileType: 'pdf',
    fileSize: 3145728,
    mimeType: 'application/pdf',
    storagePath: '/uploads/doc-003.pdf',
    status: 'processed',
    ocrStatus: 'completed',
    analysisStatus: 'completed',
    language: 'en',
    pageCount: 24,
    uploadedBy: MOCK_USER,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:45:00Z',
  },
  {
    id: 'doc-004',
    caseId: 'case-002',
    fileName: 'employment_contract_apex.docx',
    originalName: 'Employment Contract — James Chen (Apex).docx',
    fileType: 'docx',
    fileSize: 856320,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storagePath: '/uploads/doc-004.docx',
    status: 'processed',
    ocrStatus: 'not_needed',
    analysisStatus: 'completed',
    language: 'en',
    pageCount: 6,
    uploadedBy: MOCK_USER,
    createdAt: '2024-01-05T14:30:00Z',
    updatedAt: '2024-01-05T15:00:00Z',
  },
  {
    id: 'doc-005',
    caseId: 'case-005',
    fileName: 'property_purchase_agreement.pdf',
    originalName: 'Property Purchase Agreement — Business Bay Unit 4001.pdf',
    fileType: 'pdf',
    fileSize: 4194304,
    mimeType: 'application/pdf',
    storagePath: '/uploads/doc-005.pdf',
    status: 'processing',
    ocrStatus: 'processing',
    analysisStatus: 'pending',
    language: 'ar',
    pageCount: 32,
    uploadedBy: MOCK_USER,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
];

// ─── ANALYSIS ─────────────────────────────────────────────────────────────────
export const MOCK_ANALYSIS: DocumentAnalysis = {
  id: 'ana-001',
  documentId: 'doc-001',
  caseId: 'case-001',
  status: 'completed',
  overallRiskScore: 72,
  summary: `This Non-Disclosure Agreement between TechCorp Industries Ltd. and Nexus Capital Group presents a HIGH RISK profile with an overall score of 72/100. Saul identified 4 critical and high-severity issues requiring immediate attention prior to execution.

The agreement contains an unusually broad definition of Confidential Information (Clause 2.1) with no standard carve-outs for publicly available information, independently developed knowledge, or information received from third parties. Additionally, the agreement imposes unlimited liability without a cap (Clause 8.3), which is atypical for commercial NDAs in the MENA region and creates significant financial exposure.

The perpetual confidentiality obligation (Clause 5.1) without a sunset clause may be unenforceable under UAE law, which generally recognizes a 5-year maximum. The absence of a defined dispute resolution mechanism leaves both parties exposed to uncertain and costly litigation. Immediate renegotiation of these four provisions is strongly recommended before execution.`,

  risks: [
    {
      id: 'risk-001',
      severity: 'critical',
      category: 'Liability',
      title: 'Unlimited Liability Exposure',
      description: 'Clause 8.3 imposes unlimited financial liability on the Receiving Party with no cap, exclusion, or proportionality mechanism. This is a critical commercial risk that could expose the client to disproportionate damages in the event of an inadvertent disclosure.',
      affectedClauses: ['8.3', '8.4'],
      recommendation: 'Negotiate a mutual liability cap equal to the total contract value (USD 5,000,000). Include a waiver of consequential and indirect damages. Consider adding an insurance obligation clause.',
      confidence: 0.94,
    },
    {
      id: 'risk-002',
      severity: 'high',
      category: 'Confidentiality',
      title: 'Overly Broad Confidentiality Definition',
      description: 'The definition in Clause 2.1 captures all information disclosed regardless of whether it is publicly available, independently developed, or received from third-party sources. This is significantly broader than market standard and could inadvertently restrict legitimate business activities.',
      affectedClauses: ['2.1', '2.2', '2.3'],
      recommendation: 'Add the four standard carve-outs: (1) information already public, (2) independently developed, (3) received from third parties without restriction, and (4) required by law to disclose. Consider adding a marking requirement for oral disclosures.',
      confidence: 0.91,
    },
    {
      id: 'risk-003',
      severity: 'high',
      category: 'Duration',
      title: 'Perpetual Confidentiality Obligation',
      description: 'Clause 5.1 imposes a perpetual confidentiality obligation with no end date or sunset clause. UAE courts have historically held that obligations extending beyond 5 years may be considered unreasonable restraints of trade and therefore unenforceable.',
      affectedClauses: ['5.1'],
      recommendation: 'Limit general confidentiality obligations to 3 years post-disclosure. For trade secrets specifically, a 7-year term is defensible. Add a carve-out for trade secrets with an indefinite obligation separately defined.',
      confidence: 0.88,
    },
    {
      id: 'risk-004',
      severity: 'medium',
      category: 'Dispute Resolution',
      title: 'Absent Dispute Resolution Mechanism',
      description: 'The agreement does not specify how disputes will be resolved, which forum has jurisdiction, or which law governs. In a cross-border M&A context, this ambiguity could result in parallel proceedings in multiple jurisdictions.',
      affectedClauses: [],
      recommendation: 'Add an Article 9 covering: (1) ICC Arbitration with seat in Dubai DIFC, (2) three-arbitrator panel for disputes exceeding USD 500,000, (3) UAE law as governing law, (4) English as language of proceedings. Include a 30-day negotiation period prior to arbitration.',
      confidence: 0.85,
    },
  ],

  entities: [
    { id: 'ent-001', name: 'TechCorp Industries Ltd.', entityType: 'organization', mentions: [{ text: 'TechCorp Industries Ltd.', startIndex: 120, endIndex: 144, confidence: 0.99 }], attributes: { role: 'Disclosing Party', jurisdiction: 'UAE' } },
    { id: 'ent-002', name: 'Nexus Capital Group', entityType: 'organization', mentions: [{ text: 'Nexus Capital Group', startIndex: 200, endIndex: 220, confidence: 0.98 }], attributes: { role: 'Receiving Party', jurisdiction: 'UAE/UK' } },
    { id: 'ent-003', name: 'January 15, 2024', entityType: 'date', mentions: [{ text: 'January 15, 2024', startIndex: 50, endIndex: 66, confidence: 0.99 }], attributes: { type: 'Effective Date' } },
    { id: 'ent-004', name: 'USD 5,000,000', entityType: 'money', mentions: [{ text: 'USD 5,000,000', startIndex: 800, endIndex: 813, confidence: 0.97 }], attributes: { context: 'Transaction Value' } },
    { id: 'ent-005', name: 'Ahmed Al-Rashidi', entityType: 'person', mentions: [{ text: 'Ahmed Al-Rashidi', startIndex: 350, endIndex: 366, confidence: 0.96 }], attributes: { role: 'Authorized Signatory — TechCorp', title: 'CEO' } },
    { id: 'ent-006', name: 'UAE Federal Law No. 2 of 2015', entityType: 'law', mentions: [{ text: 'UAE Federal Law No. 2 of 2015', startIndex: 650, endIndex: 679, confidence: 0.93 }], attributes: { type: 'Commercial Companies Law' } },
  ],

  clauses: [
    { id: 'cl-001', clauseNumber: '1', title: 'Recitals & Background', content: 'WHEREAS the Disclosing Party possesses certain confidential and proprietary information relating to its business operations, technology, financial data, and strategic plans; and WHEREAS the Receiving Party desires to receive such information solely for the purpose of evaluating the Proposed Transaction...', clauseType: 'recitals', risks: [], summary: 'Standard recitals establishing purpose of agreement as evaluation of potential acquisition transaction.', pageNumber: 1 },
    { id: 'cl-002', clauseNumber: '2', title: 'Definition of Confidential Information', content: '"Confidential Information" means any and all information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, digitally, or by any other means, including but not limited to all business, financial, technical, operational, and strategic information...', clauseType: 'definitions', risks: [], summary: 'Overly broad definition capturing all information without standard exclusions. FLAGGED as high risk.', pageNumber: 2 },
    { id: 'cl-003', clauseNumber: '3', title: 'Obligations of Receiving Party', content: 'The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose any Confidential Information to any third party; (c) use Confidential Information solely for the Permitted Purpose; (d) protect Confidential Information using at least the same degree of care as it uses to protect its own confidential information...', clauseType: 'obligations', risks: [], summary: 'Standard confidentiality obligations. Degree of care standard is appropriate.', pageNumber: 3 },
    { id: 'cl-004', clauseNumber: '5', title: 'Term and Duration', content: 'This Agreement shall remain in full force and effect in perpetuity unless earlier terminated by mutual written agreement of the parties. The confidentiality obligations set forth herein shall survive termination of this Agreement indefinitely...', clauseType: 'term', risks: [], summary: 'Perpetual obligation — potentially unenforceable under UAE law. FLAGGED as high risk.', pageNumber: 5 },
    { id: 'cl-005', clauseNumber: '8', title: 'Liability and Remedies', content: 'In the event of any breach or threatened breach of this Agreement by the Receiving Party, the Disclosing Party shall be entitled to seek: (a) injunctive relief without the requirement to post bond; (b) specific performance; (c) all actual, consequential, indirect, and punitive damages without limitation...', clauseType: 'liability', risks: [], summary: 'Unlimited liability without cap. Includes consequential and punitive damages. CRITICAL RISK.', pageNumber: 8 },
  ],

  timeline: [
    { id: 'tl-001', date: '2023-10-01', title: 'Initial Acquisition Discussion', description: 'TechCorp and Nexus Capital held preliminary discussions regarding acquisition terms.', eventType: 'other', parties: ['TechCorp Industries', 'Nexus Capital Group'], importance: 'medium' },
    { id: 'tl-002', date: '2023-11-15', title: 'NDA Draft v1 Submitted', description: 'TechCorp legal team submitted first draft of NDA for review.', eventType: 'contract_signed', parties: ['TechCorp Industries'], documentRef: 'NDA_Draft_v1.pdf', importance: 'high' },
    { id: 'tl-003', date: '2023-12-10', title: 'Counter-Proposal — 22 Amendments', description: 'Nexus Capital returned draft with 22 redline amendments focusing on liability and term clauses.', eventType: 'amendment', parties: ['Nexus Capital Group'], importance: 'high' },
    { id: 'tl-004', date: '2024-01-05', title: 'Negotiation Meeting — DIFC Courts', description: 'Both parties met at DIFC Courts arbitration center. Liability cap and dispute resolution remained unresolved.', eventType: 'legal_action', parties: ['TechCorp Industries', 'Nexus Capital Group'], importance: 'high' },
    { id: 'tl-005', date: '2024-01-10', title: 'NDA v3 Filed for Review', description: 'Final draft (v3) submitted to Al-Mansouri & Associates for comprehensive risk analysis.', eventType: 'contract_signed', parties: ['TechCorp Industries'], documentRef: 'NDA_v3_Final.pdf', importance: 'high' },
    { id: 'tl-006', date: '2024-01-15', title: 'Execution Deadline', description: 'Contractual deadline for NDA execution as per acquisition timeline. Currently under legal review.', eventType: 'deadline', parties: ['TechCorp Industries', 'Nexus Capital Group'], importance: 'high' },
    { id: 'tl-007', date: '2024-02-28', title: 'Due Diligence Period Ends', description: 'End of exclusive due diligence period per acquisition LOI. All documents must be reviewed.', eventType: 'deadline', parties: ['TechCorp Industries', 'Nexus Capital Group'], importance: 'high' },
    { id: 'tl-008', date: '2024-06-30', title: 'Acquisition Closing Target', description: 'Target closing date for full acquisition transaction per Letter of Intent.', eventType: 'payment', parties: ['Nexus Capital Group'], importance: 'medium' },
  ],

  relationships: [
    { id: 'rel-001', sourceEntity: 'TechCorp Industries Ltd.', targetEntity: 'Nexus Capital Group', relationshipType: 'party_to', strength: 0.99 },
    { id: 'rel-002', sourceEntity: 'TechCorp Industries Ltd.', targetEntity: 'NDA Agreement 2024', relationshipType: 'signed', strength: 0.99 },
    { id: 'rel-003', sourceEntity: 'Nexus Capital Group', targetEntity: 'NDA Agreement 2024', relationshipType: 'signed', strength: 0.99 },
    { id: 'rel-004', sourceEntity: 'NDA Agreement 2024', targetEntity: 'Clause 8.3 — Unlimited Liability', relationshipType: 'contains', strength: 0.95 },
    { id: 'rel-005', sourceEntity: 'NDA Agreement 2024', targetEntity: 'Clause 2.1 — Confidentiality', relationshipType: 'contains', strength: 0.95 },
    { id: 'rel-006', sourceEntity: 'Ahmed Al-Rashidi', targetEntity: 'TechCorp Industries Ltd.', relationshipType: 'represents', strength: 0.90 },
    { id: 'rel-007', sourceEntity: 'Clause 8.3 — Unlimited Liability', targetEntity: 'CRITICAL RISK', relationshipType: 'creates', strength: 0.94 },
    { id: 'rel-008', sourceEntity: 'UAE Federal Law No. 2 of 2015', targetEntity: 'NDA Agreement 2024', relationshipType: 'governs', strength: 0.85 },
    { id: 'rel-009', sourceEntity: 'NDA Agreement 2024', targetEntity: 'USD 5,000,000', relationshipType: 'relates_to', strength: 0.80 },
    { id: 'rel-010', sourceEntity: 'Nexus Capital Group', targetEntity: 'CRITICAL RISK', relationshipType: 'affected_by', strength: 0.91 },
  ],

  contradictions: [
    {
      id: 'con-001',
      severity: 'moderate',
      description: 'Clause 3.2 grants an exception for information that enters the public domain, but Clause 3.4 contains a blanket override stating "all information received from Disclosing Party shall remain confidential regardless of public availability."',
      clause1: 'Clause 3.2 — Public Domain Exception',
      clause2: 'Clause 3.4 — Blanket Confidentiality Override',
      explanation: 'These two provisions directly contradict each other. Clause 3.4 effectively nullifies the exception granted in Clause 3.2, creating an unenforceable and inconsistent obligation.',
      suggestion: 'Delete Clause 3.4 entirely, or amend it to explicitly carve out the exceptions listed in Clause 3.2. Consider adding a hierarchy of clauses provision stating that specific exceptions prevail over general obligations.',
    },
    {
      id: 'con-002',
      severity: 'minor',
      description: 'Clause 6.1 states that notices shall be given within "5 business days" while Clause 6.3 references "5 calendar days" for the same notification requirement.',
      clause1: 'Clause 6.1 — Notice Period (Business Days)',
      clause2: 'Clause 6.3 — Notice Period (Calendar Days)',
      explanation: 'Inconsistent use of "business days" vs "calendar days" creates ambiguity about the applicable notice period.',
      suggestion: 'Standardize all time references throughout the agreement to use either business days or calendar days. Recommend business days as standard in commercial NDAs.',
    },
  ],

  recommendations: [
    {
      id: 'rec-001',
      priority: 'urgent',
      category: 'Liability',
      title: 'Negotiate Liability Cap Immediately',
      description: 'The unlimited liability clause poses the highest risk in this agreement. No commercial NDA should be executed without a defined liability cap. This single clause could expose TechCorp to claims exceeding the transaction value.',
      actionItems: [
        'Propose mutual liability cap of USD 5,000,000 (equal to transaction value)',
        'Exclude consequential, indirect, punitive, and exemplary damages',
        'Add carve-outs for gross negligence and willful misconduct',
        'Consider requiring professional indemnity insurance as condition of disclosure',
        'Set separate cap for IP breach at 150% of standard cap',
      ],
      relatedRisks: ['risk-001'],
    },
    {
      id: 'rec-002',
      priority: 'high',
      category: 'Confidentiality',
      title: 'Add Standard Carve-Outs to Definition',
      description: 'The current definition is market-abnormal. UAE courts and international arbitrators routinely strike down overly broad definitions that fail to exclude independently developed information.',
      actionItems: [
        'Add four-part standard exclusions (public domain, independent development, third party, legal requirement)',
        'Require written marking "CONFIDENTIAL" on all confidential documents',
        'Add 48-hour oral disclosure confirmation requirement',
        'Include a residuals clause for retained knowledge',
        'Define "Permitted Purpose" narrowly to scope of proposed transaction',
      ],
      relatedRisks: ['risk-002'],
    },
    {
      id: 'rec-003',
      priority: 'high',
      category: 'Dispute Resolution',
      title: 'Insert Comprehensive Dispute Resolution Article',
      description: 'A dispute resolution clause is non-negotiable for a cross-border M&A NDA. Without it, parties face jurisdictional uncertainty across UAE, UK, and potentially other courts.',
      actionItems: [
        'Insert Article 9: DIFC-LCIA Arbitration Rules',
        'Specify three-arbitrator panel for disputes above USD 100,000',
        'Seat of arbitration: Dubai International Financial Centre',
        'Governing law: Dubai International Financial Centre law',
        'Language: English',
        'Add 30-day good faith negotiation as mandatory pre-arbitration step',
      ],
      relatedRisks: ['risk-004'],
    },
  ],

  createdAt: '2024-01-10T11:00:00Z',
  completedAt: '2024-01-10T11:45:00Z',
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-001',
    caseId: 'case-001',
    documentId: 'doc-001',
    title: 'Contract Risk Analysis — NDA TechCorp Acquisition 2024',
    reportType: 'contract_analysis',
    status: 'completed',
    summary: 'Comprehensive AI-powered risk analysis of the NDA reveals 4 critical and high-severity issues requiring negotiation before execution. Overall risk score: 72/100 (HIGH).',
    htmlContent: `<h2>Executive Summary</h2>
<p>This report presents the findings of Saul AI\'s comprehensive analysis of the Non-Disclosure Agreement dated January 15, 2024 between <strong>TechCorp Industries Ltd.</strong> (Disclosing Party) and <strong>Nexus Capital Group</strong> (Receiving Party) in connection with the proposed acquisition transaction valued at USD 5,000,000.</p>
<h2>Overall Risk Assessment</h2>
<p>Overall Risk Score: <strong>72/100 — HIGH RISK</strong></p>
<p>The agreement presents significant commercial risk primarily driven by unlimited liability exposure (Clause 8.3) and an unusually broad confidentiality scope (Clause 2.1). Both provisions are outside normal market parameters for MENA-region commercial NDAs.</p>
<h2>Critical Findings</h2>
<ol>
  <li><strong>CRITICAL: Unlimited Liability (Clause 8.3)</strong> — No cap on financial exposure. Must be addressed before execution.</li>
  <li><strong>HIGH: Broad Confidentiality Definition (Clause 2.1)</strong> — Lacks standard carve-outs. Potentially unenforceable in current form.</li>
  <li><strong>HIGH: Perpetual Obligation (Clause 5.1)</strong> — No sunset clause. Likely unenforceable beyond 5 years under UAE law.</li>
  <li><strong>MEDIUM: No Dispute Resolution (Missing)</strong> — Critical omission for cross-border transaction.</li>
</ol>
<h2>Recommendations</h2>
<p>Al-Mansouri & Associates recommends the following immediate actions: (1) Refuse to execute the agreement in its current form; (2) Return a redline incorporating the amendments detailed in Section 4 of this report; (3) Set a deadline of 10 business days for Nexus Capital Group to respond; (4) Escalate to senior counsel if terms cannot be agreed.</p>
<h2>Comparable Precedents</h2>
<p>Similar unlimited liability clauses were challenged in <em>TechVentures LLC v. DataCorp (DIFC Courts, 2022)</em>, where the court reduced liability to contract value. The perpetual confidentiality issue mirrors <em>Al-Futtaim Group v. Nexus Digital (DIFC, 2021)</em> where the court imposed a 7-year maximum.</p>`,
    sections: [
      { id: 's-001', title: 'Executive Summary', content: '', order: 1, sectionType: 'summary' },
      { id: 's-002', title: 'Risk Analysis', content: '', order: 2, sectionType: 'risks' },
      { id: 's-003', title: 'Entity Extraction', content: '', order: 3, sectionType: 'entities' },
      { id: 's-004', title: 'Recommendations', content: '', order: 4, sectionType: 'recommendations' },
    ],
    createdBy: MOCK_USER,
    createdAt: '2024-01-10T12:00:00Z',
    completedAt: '2024-01-10T12:08:00Z',
  },
  {
    id: 'rep-002',
    caseId: 'case-003',
    title: 'GDPR Compliance Risk Assessment — EuroBank Financial',
    reportType: 'risk_assessment',
    status: 'completed',
    summary: 'EuroBank\'s data processing framework contains 6 GDPR Article 28 compliance gaps. Immediate remediation required before Q2 audit. Risk score: 91/100 (CRITICAL).',
    sections: [],
    createdBy: MOCK_USER,
    createdAt: '2024-01-12T14:00:00Z',
    completedAt: '2024-01-12T14:12:00Z',
  },
  {
    id: 'rep-003',
    caseId: 'case-002',
    title: 'Legal Summary — Employment Dispute Apex Solutions',
    reportType: 'legal_summary',
    status: 'completed',
    summary: 'Analysis of wrongful termination and non-compete enforceability under UAE Labour Law Federal Decree No. 33 of 2021. Client has strong defenses on 3 of 4 counts.',
    sections: [],
    createdBy: MOCK_USER,
    createdAt: '2024-01-06T09:00:00Z',
    completedAt: '2024-01-06T09:07:00Z',
  },
  {
    id: 'rep-004',
    caseId: 'case-005',
    title: 'Due Diligence Report — Business Bay Property',
    reportType: 'due_diligence',
    status: 'generating',
    sections: [],
    createdBy: MOCK_USER,
    createdAt: new Date().toISOString(),
  },
];

// ─── CHAT SESSIONS ────────────────────────────────────────────────────────────
export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 'ses-001',
    title: 'NDA TechCorp Risk Analysis',
    caseId: 'case-001',
    messages: [],
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:45:00Z',
    isActive: true,
  },
  {
    id: 'ses-002',
    title: 'GDPR Compliance Review Questions',
    caseId: 'case-003',
    messages: [],
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T10:30:00Z',
    isActive: true,
  },
  {
    id: 'ses-003',
    title: 'UAE Labour Law — Non-Compete Research',
    messages: [],
    createdAt: '2024-01-05T15:00:00Z',
    updatedAt: '2024-01-05T16:00:00Z',
    isActive: true,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001', sessionId: 'ses-001', role: 'user',
    content: 'Analyze the NDA document I uploaded for TechCorp and identify the main risks.',
    contentType: 'text', createdAt: '2024-01-10T11:00:00Z',
  },
  {
    id: 'msg-002', sessionId: 'ses-001', role: 'saul',
    content: `I've completed a comprehensive analysis of the **NDA — TechCorp Acquisition 2024 v3.pdf**. Here are the key findings:

## Overall Risk Score: 72/100 — HIGH RISK ⚠️

### Critical Issues Found

**1. 🔴 CRITICAL: Unlimited Liability (Clause 8.3)**
The agreement imposes unlimited financial liability on the Receiving Party with no cap, exclusions, or proportionality mechanism. This is the highest priority issue requiring immediate negotiation.

*Recommendation:* Negotiate a mutual liability cap equal to USD 5,000,000 (the transaction value). Include a consequential damages waiver.

**2. 🟠 HIGH: Overly Broad Confidentiality Definition (Clause 2.1)**
The definition captures all information disclosed without the four standard carve-outs required by UAE commercial practice. This could restrict legitimate business activities.

*Recommendation:* Add exclusions for: (1) public domain, (2) independently developed, (3) received from third parties, (4) required by law.

**3. 🟠 HIGH: Perpetual Confidentiality Obligation (Clause 5.1)**
The agreement imposes confidentiality obligations "in perpetuity" — this is likely unenforceable under UAE law beyond 5 years.

**4. 🟡 MEDIUM: Missing Dispute Resolution Clause**
No arbitration or jurisdiction clause exists. For a cross-border M&A transaction, this is a critical omission.

---

I've also extracted **6 key entities**, **5 important clauses**, and built a **timeline of 8 key dates** from this document.

Would you like me to generate a comprehensive risk report, or shall I draft the recommended amendments?`,
    contentType: 'markdown',
    toolsUsed: ['ocr_extraction', 'legal_rag_search', 'contract_analysis', 'risk_detection'],
    createdAt: '2024-01-10T11:02:00Z',
  },
  {
    id: 'msg-003', sessionId: 'ses-001', role: 'user',
    content: 'Find similar cases where unlimited liability clauses in NDAs were challenged in UAE courts.',
    contentType: 'text', createdAt: '2024-01-10T11:05:00Z',
  },
  {
    id: 'msg-004', sessionId: 'ses-001', role: 'saul',
    content: `I searched the legal database and found **3 highly relevant precedents** from UAE and DIFC courts:

## Similar Cases — Unlimited Liability in NDAs

### 1. TechVentures LLC v. DataCorp International (2022)
**Court:** DIFC Courts | **Relevance:** 94%
The court held that unlimited liability clauses in technology NDAs are enforceable in principle but subject to a judicial reasonableness test. The court reduced the claimed liability from unlimited to the value of the underlying contract (AED 15M). **Key takeaway:** Courts will likely cap unlimited liability at contract value.

### 2. Al-Futtaim Group v. Nexus Digital Services (2021)
**Court:** DIFC Courts | **Relevance:** 88%
Dispute over perpetual confidentiality in a joint venture NDA. Court held that perpetual obligations beyond 7 years are void as contrary to public policy. Court implied a 7-year maximum.

### 3. Meridian Holdings v. CloudTech Solutions (2022)
**Court:** English High Court (persuasive authority) | **Relevance:** 79%
Overly broad confidentiality definition was narrowed by the court to exclude publicly available information. Court rejected the argument that all information shared is confidential.

---

**Strategic Implication:** Based on these precedents, if TechCorp executes the NDA as-is and a dispute arises, a DIFC court would likely: (1) cap liability at USD 5M, (2) limit confidentiality to 7 years, and (3) narrow the definition to exclude public domain. However, the litigation risk and cost of reaching that outcome is significant. **Renegotiation is strongly preferable.**

Shall I draft the proposed amendments based on these precedents?`,
    contentType: 'markdown',
    toolsUsed: ['legal_rag_search', 'similar_cases_engine'],
    sources: [
      { id: 'src-001', title: 'TechVentures LLC v. DataCorp (DIFC, 2022)', sourceType: 'case', excerpt: 'Unlimited liability clauses subject to reasonableness review...', relevanceScore: 0.94 },
      { id: 'src-002', title: 'Al-Futtaim Group v. Nexus Digital (DIFC, 2021)', sourceType: 'case', excerpt: 'Perpetual confidentiality obligations beyond 7 years void as against public policy...', relevanceScore: 0.88 },
    ],
    createdAt: '2024-01-10T11:08:00Z',
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-001',
    title: 'Analysis Complete',
    message: 'Saul completed full risk analysis of NDA — TechCorp Acquisition 2024. 4 risks detected, overall score 72/100.',
    type: 'analysis_complete',
    isRead: false,
    actionUrl: '/app/analysis/doc-001',
    entityId: 'doc-001',
    entityType: 'document',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'not-002',
    title: 'Report Ready',
    message: 'Contract Risk Analysis Report for CASE-2024-001 is ready to view and download.',
    type: 'report_ready',
    isRead: false,
    actionUrl: '/app/reports/rep-001',
    entityId: 'rep-001',
    entityType: 'report',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'not-003',
    title: 'Critical Risk Detected',
    message: 'Saul flagged an unlimited liability clause in NDA v3 — TechCorp. Immediate review recommended.',
    type: 'warning',
    isRead: false,
    actionUrl: '/app/cases/case-001',
    entityId: 'case-001',
    entityType: 'case',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'not-004',
    title: 'Document OCR Complete',
    message: 'Property Purchase Agreement (Arabic) has been successfully processed. Text extraction achieved 99.2% accuracy.',
    type: 'success',
    isRead: true,
    entityId: 'doc-005',
    entityType: 'document',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'not-005',
    title: 'Case Status Updated',
    message: 'CASE-2024-003 (GDPR Compliance Audit) status changed to "Under Review" by system.',
    type: 'info',
    isRead: true,
    actionUrl: '/app/cases/case-003',
    entityId: 'case-003',
    entityType: 'case',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'not-006',
    title: 'Deadline Approaching',
    message: 'NDA execution deadline for CASE-2024-001 is in 5 days (January 15, 2024). Review pending.',
    type: 'warning',
    isRead: true,
    actionUrl: '/app/cases/case-001',
    entityId: 'case-001',
    entityType: 'case',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalCases: 142,
  activeCases: 38,
  documentsAnalyzed: 1247,
  reportsGenerated: 89,
  risksDetected: 324,
  pendingTasks: 12,
  recentActivity: [],
  casesByStatus: [
    { label: 'Active', value: 38, color: '#22c55e' },
    { label: 'Pending', value: 24, color: '#eab308' },
    { label: 'Review', value: 18, color: '#3b82f6' },
    { label: 'Closed', value: 62, color: '#64748b' },
  ],
  casesByType: [
    { label: 'Contract', value: 54, color: '#4e4eeb' },
    { label: 'Litigation', value: 31, color: '#8b5cf6' },
    { label: 'Compliance', value: 27, color: '#0ea5e9' },
    { label: 'Advisory', value: 30, color: '#10b981' },
  ],
  riskTrend: [],
  analysisVolume: [],
};

// ─── SIMILAR CASES ────────────────────────────────────────────────────────────
export const MOCK_SIMILAR_CASES: SimilarCase[] = [
  {
    id: 'sc-001',
    title: 'TechVentures LLC v. DataCorp International (2022)',
    caseNumber: 'CV-2022-4512',
    court: 'DIFC Courts',
    year: 2022,
    jurisdiction: 'DIFC, UAE',
    summary: 'Court held that unlimited liability clauses in technology NDAs are enforceable but subject to a judicial reasonableness test. Liability was ultimately capped at the value of the underlying contract (AED 15,000,000). The court applied a proportionality analysis consistent with DIFC Contract Law Article 88.',
    outcome: 'Plaintiff successful — liability capped at contract value (AED 15M)',
    relevanceScore: 0.94,
    matchingTopics: ['unlimited liability', 'NDA', 'technology', 'DIFC'],
  },
  {
    id: 'sc-002',
    title: 'Al-Futtaim Group v. Nexus Digital Services (2021)',
    caseNumber: 'CV-2021-1891',
    court: 'DIFC Courts',
    year: 2021,
    jurisdiction: 'DIFC, UAE',
    summary: 'Dispute over perpetual confidentiality obligations in a joint venture NDA. The DIFC Court of First Instance ruled that perpetual confidentiality obligations without a defined sunset provision are void as being contrary to public policy after a maximum of 7 years. The court severed the perpetual clause and implied a 7-year term.',
    outcome: 'Court struck perpetual clause — 7-year limitation implied',
    relevanceScore: 0.88,
    matchingTopics: ['perpetual confidentiality', 'NDA', 'joint venture', 'sunset clause'],
  },
  {
    id: 'sc-003',
    title: 'Axiom Ltd v. Gulf Innovation Partners (2023)',
    caseNumber: 'ARB-2023-0042',
    court: 'ICC International Arbitration',
    year: 2023,
    jurisdiction: 'International',
    summary: 'The arbitral tribunal found that the absence of a dispute resolution mechanism in a commercial NDA results in default national court jurisdiction. The parties faced parallel proceedings in three jurisdictions (UAE, UK, Singapore) before the tribunal asserted jurisdiction. Significant costs were incurred before resolution.',
    outcome: 'Arbitration jurisdiction established — parties bore USD 2.3M in preliminary proceedings',
    relevanceScore: 0.81,
    matchingTopics: ['dispute resolution', 'arbitration', 'NDA', 'jurisdiction'],
  },
  {
    id: 'sc-004',
    title: 'Meridian Holdings v. CloudTech Solutions (2022)',
    caseNumber: 'CV-2022-8823',
    court: 'English High Court (Commercial Division)',
    year: 2022,
    jurisdiction: 'England & Wales',
    summary: 'The English High Court found that an overly broad confidentiality definition which captured publicly available information was partially unenforceable. The court applied a blue-pencil severance, narrowing the definition to exclude public domain information. The court awarded damages for breach of the enforceable portion.',
    outcome: 'Confidentiality definition narrowed — GBP 800,000 damages awarded for enforced portion',
    relevanceScore: 0.78,
    matchingTopics: ['broad confidentiality', 'NDA', 'public domain', 'severance'],
  },
];

// ─── SEARCH RESULTS ───────────────────────────────────────────────────────────
export const MOCK_SEARCH_RESULTS = [
  {
    id: 'sr-001',
    title: 'NDA — TechCorp Acquisition 2024 v3.pdf',
    excerpt: 'Non-Disclosure Agreement between TechCorp Industries Ltd. and Nexus Capital Group. Includes unlimited liability clause (Clause 8.3) and perpetual confidentiality obligation (Clause 5.1) flagged as HIGH RISK.',
    resultType: 'document',
    relevanceScore: 0.97,
    createdAt: '2024-01-10T10:30:00Z',
  },
  {
    id: 'sr-002',
    title: 'UAE Federal Law No. 2 of 2015 — Commercial Companies Law',
    excerpt: 'Article 22 governs the obligations of parties to commercial contracts. Article 127 provides limitations on liability in commercial agreements. Applicable to NDA liability cap negotiations in UAE-governed contracts.',
    resultType: 'law',
    relevanceScore: 0.89,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'sr-003',
    title: 'TechVentures LLC v. DataCorp International (DIFC, 2022)',
    excerpt: 'Landmark DIFC judgment on unlimited liability clauses in technology NDAs. Court applied proportionality test and capped liability at contract value. Key precedent for current NDA negotiation.',
    resultType: 'judgment',
    relevanceScore: 0.94,
    createdAt: '2022-06-15T00:00:00Z',
  },
  {
    id: 'sr-004',
    title: 'GDPR Data Processing Agreement — EuroBank Financial',
    excerpt: 'Comprehensive DPA covering data processing activities, sub-processor obligations, breach notification procedures, and cross-border transfer mechanisms. 24-page agreement under comprehensive review.',
    resultType: 'document',
    relevanceScore: 0.82,
    createdAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'sr-005',
    title: 'DIFC Contract Law — Article 88: Reasonableness of Terms',
    excerpt: 'A term which has not been individually negotiated shall be regarded as unfair if, contrary to the requirement of good faith, it causes a significant imbalance in the parties\' rights and obligations...',
    resultType: 'law',
    relevanceScore: 0.76,
    createdAt: '2023-01-01T00:00:00Z',
  },
];
