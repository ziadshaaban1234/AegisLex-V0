import { Injectable, signal, effect } from '@angular/core';
export type Language = 'en' | 'ar';

// ── Translation dictionary ──────────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.dashboard':       { en: 'Dashboard',        ar: 'لوحة التحكم' },
  'nav.chat':            { en: 'Saul AI Chat',      ar: 'محادثة سول الذكية' },
  'nav.workspace':       { en: 'Workspace',         ar: 'مساحة العمل' },
  'nav.cases':           { en: 'Cases',             ar: 'القضايا' },
  'nav.upload':          { en: 'Upload Documents',  ar: 'رفع المستندات' },
  'nav.analysis':        { en: 'Analysis',          ar: 'التحليل' },
  'nav.reports':         { en: 'Reports',           ar: 'التقارير' },
  'nav.timeline':        { en: 'Timeline',          ar: 'الجدول الزمني' },
  'nav.graph':           { en: 'Legal Graph',       ar: 'الرسم البياني القانوني' },
  'nav.search':          { en: 'Search',            ar: 'البحث' },
  'nav.similar_cases':   { en: 'Similar Cases',     ar: 'قضايا مشابهة' },
  'nav.recommendations': { en: 'Recommendations',   ar: 'التوصيات' },
  'nav.insights':        { en: 'Insights',          ar: 'الرؤى' },
  'nav.notifications':   { en: 'Notifications',     ar: 'الإشعارات' },
  'nav.settings':        { en: 'Settings',          ar: 'الإعدادات' },
  // Common
  'common.new_case':     { en: 'New Case',          ar: 'قضية جديدة' },
  'common.save':         { en: 'Save',              ar: 'حفظ' },
  'common.cancel':       { en: 'Cancel',            ar: 'إلغاء' },
  'common.delete':       { en: 'Delete',            ar: 'حذف' },
  'common.edit':         { en: 'Edit',              ar: 'تعديل' },
  'common.view':         { en: 'View',              ar: 'عرض' },
  'common.search':       { en: 'Search',            ar: 'بحث' },
  'common.filter':       { en: 'Filter',            ar: 'تصفية' },
  'common.export':       { en: 'Export',            ar: 'تصدير' },
  'common.loading':      { en: 'Loading…',          ar: 'جاري التحميل…' },
  'common.no_results':   { en: 'No results found',  ar: 'لا توجد نتائج' },
  'common.see_all':      { en: 'See all',           ar: 'عرض الكل' },
  'common.risk':         { en: 'Risk',              ar: 'المخاطر' },
  'common.status':       { en: 'Status',            ar: 'الحالة' },
  'common.date':         { en: 'Date',              ar: 'التاريخ' },
  'common.client':       { en: 'Client',            ar: 'العميل' },
  'common.type':         { en: 'Type',              ar: 'النوع' },
  'common.priority':     { en: 'Priority',          ar: 'الأولوية' },
  'common.actions':      { en: 'Actions',           ar: 'الإجراءات' },
  'common.generate':     { en: 'Generate',          ar: 'إنشاء' },
  'common.submit':       { en: 'Submit',            ar: 'إرسال' },
  'common.back':         { en: 'Back',              ar: 'رجوع' },
  'common.close':        { en: 'Close',             ar: 'إغلاق' },
  'common.confirm':      { en: 'Confirm',           ar: 'تأكيد' },
  'common.yes':          { en: 'Yes',               ar: 'نعم' },
  'common.no':           { en: 'No',                ar: 'لا' },
  // Dashboard
  'dashboard.title':     { en: 'Dashboard',         ar: 'لوحة التحكم' },
  'dashboard.welcome':   { en: 'Welcome back',      ar: 'مرحباً بعودتك' },
  'dashboard.subtitle':  { en: 'Here\'s your legal intelligence overview', ar: 'نظرة عامة على استخباراتك القانونية' },
  'dashboard.recent_cases': { en: 'Recent Cases',   ar: 'القضايا الأخيرة' },
  'dashboard.activity':  { en: 'Recent Activity',   ar: 'النشاط الأخير' },
  'dashboard.ask_saul':  { en: 'Ask Saul',          ar: 'اسأل سول' },
  'dashboard.quick_upload': { en: 'Quick Upload',   ar: 'رفع سريع' },
  // ── PHASE 3: DASHBOARD LOCALIZATION ──────────────────────────────────────────

  // -- Dashboard header --
  'dashboard.greeting.morning':      { en: 'Good morning',                         ar: 'صباح الخير' },
  'dashboard.greeting.afternoon':    { en: 'Good afternoon',                        ar: 'مساء الخير' },
  'dashboard.greeting.evening':      { en: 'Good evening',                          ar: 'مساء النور' },
  'dashboard.header_subtitle':       { en: "Here's what's happening in your legal workspace today.", ar: 'إليك ما يجري في مساحة عملك القانونية اليوم.' },
  'dashboard.upload_document':       { en: 'Upload Document',                       ar: 'رفع مستند' },

  // -- Stat cards --
  'dashboard.stat.total_cases':      { en: 'Total Cases',                           ar: 'إجمالي القضايا' },
  'dashboard.stat.active_cases':     { en: 'Active Cases',                          ar: 'القضايا النشطة' },
  'dashboard.stat.docs_analyzed':    { en: 'Docs Analyzed',                         ar: 'المستندات المُحللة' },
  'dashboard.stat.risks_detected':   { en: 'Risks Detected',                        ar: 'المخاطر المكتشفة' },
  'dashboard.stat.reports_generated':{ en: 'Reports Generated',                     ar: 'التقارير المُنشأة' },
  'dashboard.stat.pending_tasks':    { en: 'Pending Tasks',                         ar: 'المهام المعلقة' },

  // -- Saul card --
  'dashboard.saul.desc':             { en: 'AI Legal Copilot — Ready to assist',    ar: 'المساعد القانوني الذكي — جاهز للمساعدة' },
  'dashboard.saul.start_chat':       { en: 'Start Chat',                            ar: 'ابدأ محادثة' },
  'dashboard.saul.quick_actions':    { en: 'Quick actions',                         ar: 'إجراءات سريعة' },
  'dashboard.saul.analyze_contract': { en: 'Analyze contract',                      ar: 'تحليل عقد' },
  'dashboard.saul.find_similar':     { en: 'Find similar cases',                    ar: 'ابحث عن قضايا مشابهة' },
  'dashboard.saul.generate_report':  { en: 'Generate report',                       ar: 'إنشاء تقرير' },
  'dashboard.saul.detect_risks':     { en: 'Detect risks',                          ar: 'اكتشاف المخاطر' },
  'dashboard.saul.start_chat_aria':  { en: 'Start chat with Saul AI',               ar: 'ابدأ محادثة مع سول الذكي' },

  // -- Recent cases card --
  'dashboard.cases.subtitle':        { en: 'Your latest active matters',            ar: 'آخر قضاياك النشطة' },
  'dashboard.cases.view_all':        { en: 'View all',                              ar: 'عرض الكل' },
  'dashboard.cases.empty':           { en: 'No cases yet.',                         ar: 'لا توجد قضايا بعد.' },
  'dashboard.cases.create_first':    { en: 'Create your first case',                ar: 'أنشئ قضيتك الأولى' },

  // -- Chart titles --
  'dashboard.chart.cases_by_status': { en: 'Cases by Status',                       ar: 'القضايا حسب الحالة' },
  'dashboard.chart.cases_by_type':   { en: 'Cases by Type',                         ar: 'القضايا حسب النوع' },
  'dashboard.chart.total_label':     { en: 'Total',                                 ar: 'الإجمالي' },

  // -- Quick Upload --
  'dashboard.upload.subtitle':       { en: 'Drag & drop or click to analyze a document', ar: 'اسحب وأفلت أو انقر لتحليل مستند' },
  'dashboard.upload.cta':            { en: 'Upload PDF, Word, or Image',            ar: 'رفع ملف PDF أو Word أو صورة' },
  'dashboard.upload.hint':           { en: 'Arabic & English supported · Max 50MB', ar: 'يدعم العربية والإنجليزية · الحد الأقصى 50 ميغابايت' },

  // -- Activity feed --
  'dashboard.activity.live_badge':   { en: 'Live',                                  ar: 'مباشر' },

  // -- Case status badge labels (displayed in UI, not mock data content) --
  'dashboard.status.active':         { en: 'active',                                ar: 'نشطة' },
  'dashboard.status.pending':        { en: 'pending',                               ar: 'معلقة' },
  'dashboard.status.review':         { en: 'review',                                ar: 'قيد المراجعة' },
  'dashboard.status.closed':         { en: 'closed',                                ar: 'مغلقة' },
  'dashboard.status.archived':       { en: 'archived',                              ar: 'مؤرشفة' },

  // -- Relative date labels --
  'dashboard.date.today':            { en: 'Today',                                 ar: 'اليوم' },
  'dashboard.date.yesterday':        { en: 'Yesterday',                             ar: 'أمس' },
  'dashboard.date.days_ago':         { en: '{0}d ago',                              ar: 'منذ {0} أيام' },

  // ── PHASE 4: CASES + DOCUMENTS LOCALIZATION ──────────────────────────────────

  // -- Cases List page --
  'cases.title':                    { en: 'Cases',                                    ar: 'القضايا' },
  'cases.subtitle':                 { en: '{0} total cases · {1} shown',              ar: '{0} قضية بالإجمالي · يُعرض {1}' },
  'cases.new_case':                 { en: 'New Case',                                 ar: 'قضية جديدة' },
  'cases.search_placeholder':       { en: 'Search cases by title, number, client...', ar: 'ابحث بالعنوان أو الرقم أو العميل...' },
  'cases.search_aria':              { en: 'Search cases',                             ar: 'ابحث في القضايا' },
  'cases.filter_status_aria':       { en: 'Filter by status',                         ar: 'تصفية حسب الحالة' },
  'cases.filter_type_aria':         { en: 'Filter by type',                           ar: 'تصفية حسب النوع' },
  'cases.filter_priority_aria':     { en: 'Filter by priority',                       ar: 'تصفية حسب الأولوية' },
  'cases.view_list_aria':           { en: 'List view',                                ar: 'عرض القائمة' },
  'cases.view_grid_aria':           { en: 'Grid view',                                ar: 'عرض الشبكة' },

  // -- Cases filter option labels --
  'cases.filter.all_statuses':      { en: 'All Statuses',                             ar: 'جميع الحالات' },
  'cases.filter.all_types':         { en: 'All Types',                                ar: 'جميع الأنواع' },
  'cases.filter.all_priorities':    { en: 'All Priorities',                           ar: 'جميع الأولويات' },

  // -- Case status labels --
  'cases.status.active':            { en: 'Active',                                   ar: 'نشطة' },
  'cases.status.pending':           { en: 'Pending',                                  ar: 'معلقة' },
  'cases.status.review':            { en: 'Review',                                   ar: 'قيد المراجعة' },
  'cases.status.closed':            { en: 'Closed',                                   ar: 'مغلقة' },
  'cases.status.archived':          { en: 'Archived',                                 ar: 'مؤرشفة' },
  'cases.status.under_review':      { en: 'Under Review',                             ar: 'قيد المراجعة' },

  // -- Case priority labels --
  'cases.priority.critical':        { en: 'Critical',                                 ar: 'حرجة' },
  'cases.priority.high':            { en: 'High',                                     ar: 'عالية' },
  'cases.priority.medium':          { en: 'Medium',                                   ar: 'متوسطة' },
  'cases.priority.low':             { en: 'Low',                                      ar: 'منخفضة' },

  // -- Case type labels --
  'cases.type.contract':            { en: 'Contract',                                 ar: 'عقد' },
  'cases.type.litigation':          { en: 'Litigation',                               ar: 'تقاضٍ' },
  'cases.type.compliance':          { en: 'Compliance',                               ar: 'امتثال' },
  'cases.type.investigation':       { en: 'Investigation',                            ar: 'تحقيق' },
  'cases.type.advisory':            { en: 'Advisory',                                 ar: 'استشارة' },
  'cases.type.other':               { en: 'Other',                                    ar: 'أخرى' },

  // -- Cases table headers --
  'cases.table.case':               { en: 'Case',                                     ar: 'القضية' },
  'cases.table.type':               { en: 'Type',                                     ar: 'النوع' },
  'cases.table.client':             { en: 'Client',                                   ar: 'العميل' },
  'cases.table.priority':           { en: 'Priority',                                 ar: 'الأولوية' },
  'cases.table.status':             { en: 'Status',                                   ar: 'الحالة' },
  'cases.table.risk':               { en: 'Risk',                                     ar: 'المخاطر' },
  'cases.table.updated':            { en: 'Updated',                                  ar: 'آخر تحديث' },

  // -- Cases empty states --
  'cases.empty.title':              { en: 'No cases found',                           ar: 'لا توجد قضايا' },
  'cases.empty.filter_hint':        { en: 'Try adjusting your filters',               ar: 'حاول تعديل عوامل التصفية' },
  'cases.empty.create_hint':        { en: 'Create your first case to get started',    ar: 'أنشئ أول قضية للبدء' },

  // -- Cases grid card --
  'cases.card.risk_score':          { en: 'Risk Score',                               ar: 'درجة المخاطر' },

  // -- Cases action tooltips --
  'cases.action.view':              { en: 'View',                                     ar: 'عرض' },
  'cases.action.chat':              { en: 'Chat with Saul',                           ar: 'تحدث مع سول' },
  'cases.action.delete_aria':       { en: 'Delete case',                              ar: 'حذف القضية' },

  // -- Delete confirm dialog --
  'cases.delete.title':             { en: 'Delete Case?',                             ar: 'حذف القضية؟' },
  'cases.delete.body':              { en: 'This action cannot be undone. All documents and analyses associated with this case will be permanently deleted.', ar: 'لا يمكن التراجع عن هذا الإجراء. ستُحذف جميع المستندات والتحليلات المرتبطة بهذه القضية نهائياً.' },
  'cases.delete.cancel':            { en: 'Cancel',                                   ar: 'إلغاء' },
  'cases.delete.confirm':           { en: 'Delete Case',                              ar: 'حذف القضية' },

  // -- Pagination --
  'cases.pagination.page_of':       { en: 'Page {0} of {1}',                         ar: 'الصفحة {0} من {1}' },
  'cases.pagination.prev_aria':     { en: 'Previous page',                            ar: 'الصفحة السابقة' },
  'cases.pagination.next_aria':     { en: 'Next page',                                ar: 'الصفحة التالية' },

  // -- Toast messages --
  'cases.toast.deleted':            { en: 'Case deleted successfully',                ar: 'تم حذف القضية بنجاح' },
  'cases.toast.archived':           { en: 'Case archived',                            ar: 'تمت أرشفة القضية' },
  'cases.toast.closed':             { en: 'Case closed',                              ar: 'تم إغلاق القضية' },
  'cases.toast.created':            { en: 'Case created',                             ar: 'تم إنشاء القضية' },

  // -- Case Detail page --
  'case_detail.back':               { en: 'Cases',                                    ar: 'القضايا' },
  'case_detail.ask_saul':           { en: 'Ask Saul',                                 ar: 'اسأل سول' },
  'case_detail.upload':             { en: 'Upload',                                   ar: 'رفع' },
  'case_detail.analyze_all':        { en: 'Analyze All',                              ar: 'تحليل الكل' },
  'case_detail.risk_score':         { en: 'Risk Score',                               ar: 'درجة المخاطر' },
  'case_detail.view_analysis':      { en: 'View Analysis',                            ar: 'عرض التحليل' },
  'case_detail.created':            { en: 'Created',                                  ar: 'أُنشئت' },
  'case_detail.doc_plural':         { en: 'documents',                                ar: 'مستندات' },
  'case_detail.doc_singular':       { en: 'document',                                 ar: 'مستند' },

  // -- Risk banner descriptions --
  'case_detail.risk.high_desc':     { en: 'High risk — review required',              ar: 'مخاطر عالية — مراجعة مطلوبة' },
  'case_detail.risk.medium_desc':   { en: 'Medium risk — some concerns',              ar: 'مخاطر متوسطة — بعض المخاوف' },
  'case_detail.risk.low_desc':      { en: 'Low risk — looks good',                    ar: 'مخاطر منخفضة — يبدو جيداً' },

  // -- Case Detail tabs --
  'case_detail.tab.overview':       { en: 'Overview',                                 ar: 'نظرة عامة' },
  'case_detail.tab.documents':      { en: 'Documents',                                ar: 'المستندات' },
  'case_detail.tab.analysis':       { en: 'Analysis',                                 ar: 'التحليل' },
  'case_detail.tab.timeline':       { en: 'Timeline',                                 ar: 'الجدول الزمني' },
  'case_detail.tab.graph':          { en: 'Graph',                                    ar: 'الرسم البياني' },

  // -- Case Overview info card --
  'case_detail.overview.title':     { en: 'Case Details',                             ar: 'تفاصيل القضية' },
  'case_detail.overview.type':      { en: 'Type',                                     ar: 'النوع' },
  'case_detail.overview.priority':  { en: 'Priority',                                 ar: 'الأولوية' },
  'case_detail.overview.status':    { en: 'Status',                                   ar: 'الحالة' },
  'case_detail.overview.client':    { en: 'Client',                                   ar: 'العميل' },
  'case_detail.overview.created':   { en: 'Created',                                  ar: 'تاريخ الإنشاء' },
  'case_detail.overview.updated':   { en: 'Updated',                                  ar: 'تاريخ التحديث' },
  'case_detail.overview.desc':      { en: 'Description',                              ar: 'الوصف' },
  'case_detail.overview.tags':      { en: 'Tags',                                     ar: 'الوسوم' },

  // -- Quick actions card --
  'case_detail.quick.title':        { en: 'Quick Actions',                            ar: 'إجراءات سريعة' },
  'case_detail.quick.report':       { en: 'Generate Report',                          ar: 'إنشاء تقرير' },
  'case_detail.quick.report_desc':  { en: 'Create an AI legal report',                ar: 'إنشاء تقرير قانوني بالذكاء الاصطناعي' },
  'case_detail.quick.timeline':     { en: 'View Timeline',                            ar: 'عرض الجدول الزمني' },
  'case_detail.quick.timeline_desc':{ en: 'Chronological event analysis',             ar: 'تحليل زمني للأحداث' },
  'case_detail.quick.graph':        { en: 'Legal Graph',                              ar: 'الرسم البياني القانوني' },
  'case_detail.quick.graph_desc':   { en: 'Entity relationship map',                  ar: 'خريطة علاقات الكيانات' },
  'case_detail.quick.similar':      { en: 'Similar Cases',                            ar: 'قضايا مشابهة' },
  'case_detail.quick.similar_desc': { en: 'Find related precedents',                  ar: 'ابحث عن سوابق ذات صلة' },

  // -- Documents tab --
  'case_detail.docs.header':        { en: 'Documents ({0})',                          ar: 'المستندات ({0})' },
  'case_detail.docs.add':           { en: 'Add Document',                             ar: 'إضافة مستند' },
  'case_detail.docs.empty':         { en: 'No documents yet',                         ar: 'لا توجد مستندات بعد' },
  'case_detail.docs.upload_first':  { en: 'Upload First Document',                    ar: 'رفع أول مستند' },
  'case_detail.docs.uploaded':      { en: 'Uploaded',                                 ar: 'تاريخ الرفع' },

  // -- Analysis tab --
  'case_detail.analysis.title':     { en: 'AI Analysis',                              ar: 'تحليل الذكاء الاصطناعي' },
  'case_detail.analysis.run':       { en: 'Run Analysis',                             ar: 'تشغيل التحليل' },
  'case_detail.analysis.empty':     { en: 'Upload documents first to run AI analysis', ar: 'ارفع مستندات أولاً لتشغيل التحليل الذكي' },
  'case_detail.analysis.toast_start': { en: 'Analysis started',                       ar: 'بدأ التحليل' },
  'case_detail.analysis.processing':{ en: 'Processing {0} documents',                 ar: 'جاري معالجة {0} مستندات' },

  // -- Timeline tab redirect --
  'case_detail.timeline.title':     { en: 'Timeline Visualization',                   ar: 'تصور الجدول الزمني' },
  'case_detail.timeline.desc':      { en: 'View a chronological reconstruction of all events in this case', ar: 'عرض إعادة بناء زمنية لجميع أحداث هذه القضية' },
  'case_detail.timeline.open':      { en: 'Open Full Timeline',                       ar: 'فتح الجدول الزمني كاملاً' },

  // -- Graph tab redirect --
  'case_detail.graph.title':        { en: 'Legal Knowledge Graph',                    ar: 'الرسم البياني للمعرفة القانونية' },
  'case_detail.graph.desc':         { en: 'Visualize entities, relationships, and legal connections from your case', ar: 'تصور الكيانات والعلاقات والروابط القانونية من قضيتك' },
  'case_detail.graph.open':         { en: 'Open Full Graph',                          ar: 'فتح الرسم البياني كاملاً' },

  // -- Case Form --
  'case_form.title':                { en: 'Create New Case',                          ar: 'إنشاء قضية جديدة' },
  'case_form.subtitle':             { en: 'Open a new legal matter and start adding documents', ar: 'افتح قضية قانونية جديدة وابدأ بإضافة المستندات' },
  'case_form.back':                 { en: 'Back to Cases',                            ar: 'العودة إلى القضايا' },
  'case_form.label.title':          { en: 'Case Title',                               ar: 'عنوان القضية' },
  'case_form.label.title_required': { en: 'Case Title *',                             ar: 'عنوان القضية *' },
  'case_form.placeholder.title':    { en: 'e.g. NDA Review — Acme Corporation Q4 2024', ar: 'مثال: مراجعة اتفاقية السرية — شركة أكمي 2024' },
  'case_form.hint.title':           { en: 'Provide a clear, descriptive title for this legal matter', ar: 'أدخل عنواناً واضحاً ووصفياً لهذه القضية القانونية' },
  'case_form.label.desc':           { en: 'Description',                              ar: 'الوصف' },
  'case_form.placeholder.desc':     { en: 'Brief summary of the case, key parties, and context...', ar: 'ملخص موجز للقضية والأطراف الرئيسية والسياق...' },
  'case_form.label.type':           { en: 'Case Type',                                ar: 'نوع القضية' },
  'case_form.label.priority':       { en: 'Priority',                                 ar: 'الأولوية' },
  'case_form.label.client':         { en: 'Client Name',                              ar: 'اسم العميل' },
  'case_form.placeholder.client':   { en: 'Client or organization name',              ar: 'اسم العميل أو الجهة' },
  'case_form.label.tags':           { en: 'Tags',                                     ar: 'الوسوم' },
  'case_form.placeholder.tags':     { en: 'Add tags (Enter or comma)...',             ar: 'أضف وسوماً (Enter أو فاصلة)...' },
  'case_form.hint.tags':            { en: 'Press Enter or comma to add a tag. Maximum 10 tags.', ar: 'اضغط Enter أو فاصلة لإضافة وسم. الحد الأقصى 10 وسوم.' },
  'case_form.tag.remove_aria':      { en: 'Remove tag {0}',                           ar: 'إزالة الوسم {0}' },
  'case_form.tag.add_aria':         { en: 'Add tag',                                  ar: 'إضافة وسم' },
  'case_form.cancel':               { en: 'Cancel',                                   ar: 'إلغاء' },
  'case_form.submit.creating':      { en: 'Creating...',                              ar: 'جارٍ الإنشاء...' },
  'case_form.submit.create':        { en: 'Create Case',                              ar: 'إنشاء القضية' },
  'case_form.error.required':       { en: 'This field is required',                   ar: 'هذا الحقل مطلوب' },
  'case_form.error.minlength':      { en: 'Minimum {0} characters',                   ar: 'الحد الأدنى {0} أحرف' },

  // -- Case Form tips panel --
  'case_form.tips.title':           { en: 'Getting Started',                          ar: 'كيف تبدأ' },
  'case_form.tips.step1':           { en: 'Create the case',                          ar: 'أنشئ القضية' },
  'case_form.tips.step1_desc':      { en: 'Define the legal matter and set its priority level', ar: 'حدد القضية القانونية واضبط مستوى أولويتها' },
  'case_form.tips.step2':           { en: 'Upload documents',                         ar: 'ارفع المستندات' },
  'case_form.tips.step2_desc':      { en: 'Add contracts, evidence, or any relevant legal documents', ar: 'أضف العقود أو الأدلة أو أي مستندات قانونية ذات صلة' },
  'case_form.tips.step3':           { en: 'Ask Saul',                                 ar: 'اسأل سول' },
  'case_form.tips.step3_desc':      { en: 'Chat with the AI copilot to analyze, summarize, and get recommendations', ar: 'تحدث مع المساعد الذكي لتحليل القضية وتلخيصها والحصول على توصيات' },
  'case_form.tips.step4':           { en: 'Generate reports',                         ar: 'أنشئ التقارير' },
  'case_form.tips.step4_desc':      { en: 'Export comprehensive AI-generated legal reports in PDF or Word format', ar: 'صدِّر تقارير قانونية شاملة بالذكاء الاصطناعي بصيغة PDF أو Word' },

  // -- Upload page --
  'upload.title':                   { en: 'Upload Documents',                         ar: 'رفع المستندات' },
  'upload.subtitle':                { en: 'Upload PDFs, images, and documents for AI analysis', ar: 'ارفع ملفات PDF والصور والمستندات للتحليل الذكي' },
  'upload.view_cases':              { en: 'View Cases',                               ar: 'عرض القضايا' },
  'upload.case_label':              { en: 'Assign to Case',                           ar: 'تعيين لقضية' },
  'upload.case_optional':           { en: '(optional)',                               ar: '(اختياري)' },
  'upload.no_case':                 { en: 'No case — upload to library',              ar: 'بدون قضية — رفع للمكتبة' },
  'upload.auto_analyze_label':      { en: 'Auto-analyze with Saul',                   ar: 'تحليل تلقائي مع سول' },
  'upload.auto_analyze_desc':       { en: 'Run AI analysis immediately after upload', ar: 'تشغيل التحليل الذكي فور اكتمال الرفع' },
  'upload.dropzone.drag':           { en: 'Drag & drop documents here',               ar: 'اسحب المستندات وأفلتها هنا' },
  'upload.dropzone.release':        { en: 'Release to upload',                        ar: 'أفلت لبدء الرفع' },
  'upload.dropzone.browse':         { en: 'or click to browse your files',            ar: 'أو انقر لاستعراض ملفاتك' },
  'upload.dropzone.limit':          { en: 'Maximum file size: {0}MB per document',    ar: 'الحجم الأقصى: {0} ميغابايت للمستند' },
  'upload.dropzone.ocr':            { en: 'Arabic & English OCR supported for scanned documents', ar: 'يدعم النص العربي والإنجليزي في المستندات الممسوحة ضوئياً' },
  'upload.queue.title':             { en: 'Uploading {0} file',                       ar: 'جارٍ رفع {0} ملف' },
  'upload.queue.title_plural':      { en: 'Uploading {0} files',                      ar: 'جارٍ رفع {0} ملفات' },
  'upload.queue.clear':             { en: 'Clear completed',                          ar: 'مسح المكتملة' },
  'upload.status.uploading':        { en: '{0}%',                                     ar: '{0}٪' },
  'upload.status.processing':       { en: 'Analyzing...',                             ar: 'جارٍ التحليل...' },
  'upload.status.complete':         { en: 'Complete',                                 ar: 'مكتمل' },
  'upload.status.failed':           { en: 'Failed',                                   ar: 'فشل' },
  'upload.item.view_aria':          { en: 'View document',                            ar: 'عرض المستند' },
  'upload.item.retry_aria':         { en: 'Retry upload',                             ar: 'إعادة الرفع' },
  'upload.item.remove_aria':        { en: 'Remove file',                              ar: 'إزالة الملف' },
  'upload.done.title':              { en: 'All uploads complete!',                    ar: 'اكتملت جميع عمليات الرفع!' },
  'upload.done.desc':               { en: 'Your documents are ready for analysis.',   ar: 'مستنداتك جاهزة للتحليل.' },
  'upload.done.chat':               { en: 'Chat with Saul',                           ar: 'تحدث مع سول' },
  'upload.done.cases':              { en: 'View Cases',                               ar: 'عرض القضايا' },
  'upload.info.pdf_title':          { en: 'PDF Documents',                            ar: 'مستندات PDF' },
  'upload.info.pdf_desc':           { en: 'Digital and scanned PDFs, contracts, court documents, agreements', ar: 'ملفات PDF الرقمية والممسوحة ضوئياً، العقود، وثائق المحكمة، الاتفاقيات' },
  'upload.info.img_title':          { en: 'Images & Scans',                           ar: 'الصور والمسوحات الضوئية' },
  'upload.info.img_desc':           { en: 'PNG, JPG, TIFF — OCR extracts text from scanned and photographed documents', ar: 'PNG وJPG وTIFF — يستخرج OCR النص من المستندات الممسوحة ضوئياً والمصورة' },
  'upload.info.word_title':         { en: 'Word Documents',                           ar: 'مستندات Word' },
  'upload.info.word_desc':          { en: 'DOC and DOCX files — contracts, letters, memorandums, and legal briefs', ar: 'ملفات DOC وDOCX — العقود والرسائل والمذكرات والمستندات القانونية' },
  'upload.info.ocr_title':          { en: 'Arabic & English',                         ar: 'العربية والإنجليزية' },
  'upload.info.ocr_desc':           { en: 'Fully multilingual OCR with PaddleOCR for Arabic-script and Latin documents', ar: 'OCR متعدد اللغات بالكامل باستخدام PaddleOCR للمستندات العربية واللاتينية' },
  'upload.toast.too_large':         { en: 'File too large',                           ar: 'الملف كبير جداً' },
  'upload.toast.complete':          { en: 'Upload complete',                          ar: 'اكتمل الرفع' },

  // -- Timeline page --
  'timeline.title':                 { en: 'Legal Timeline',                           ar: 'الجدول الزمني القانوني' },
  'timeline.subtitle':              { en: 'Chronological reconstruction of case events', ar: 'إعادة بناء زمنية لأحداث القضية' },
  'timeline.filter.all':            { en: 'All Events',                               ar: 'جميع الأحداث' },
  'timeline.filter.contracts':      { en: 'Contracts',                                ar: 'العقود' },
  'timeline.filter.legal_actions':  { en: 'Legal Actions',                            ar: 'الإجراءات القانونية' },
  'timeline.filter.payments':       { en: 'Payments',                                 ar: 'المدفوعات' },
  'timeline.filter.deadlines':      { en: 'Deadlines',                                ar: 'المواعيد النهائية' },
  'timeline.filter.amendments':     { en: 'Amendments',                               ar: 'التعديلات' },
  'timeline.filter.terminations':   { en: 'Terminations',                             ar: 'الإنهاءات' },
  'timeline.back_aria':             { en: 'Cases',                                    ar: 'القضايا' },
  'timeline.empty.title':           { en: 'No timeline events found',                 ar: 'لا توجد أحداث في الجدول الزمني' },
  'timeline.empty.desc':            { en: 'Upload and analyze case documents to extract chronological events automatically', ar: 'ارفع مستندات القضية وحللها لاستخراج الأحداث الزمنية تلقائياً' },
  'timeline.event.parties':         { en: 'Parties Involved',                         ar: 'الأطراف المعنية' },
  'timeline.event.doc_ref':         { en: 'Referenced Document',                      ar: 'المستند المرجعي' },
  'timeline.event.details':         { en: 'Details',                                  ar: 'التفاصيل' },
  'timeline.event.less':            { en: 'Less',                                     ar: 'أقل' },

  // -- Document Viewer (contract-viewer) --
  'viewer.back':                    { en: 'Cases',                                    ar: 'القضايا' },
  'viewer.zoom_out_aria':           { en: 'Zoom out',                                 ar: 'تصغير' },
  'viewer.zoom_reset_aria':         { en: 'Reset zoom to 100%',                       ar: 'إعادة التكبير إلى 100٪' },
  'viewer.zoom_in_aria':            { en: 'Zoom in',                                  ar: 'تكبير' },
  'viewer.prev_page_aria':          { en: 'Previous page',                            ar: 'الصفحة السابقة' },
  'viewer.next_page_aria':          { en: 'Next page',                                ar: 'الصفحة التالية' },
  'viewer.page_aria':               { en: 'Page {0} of {1}',                          ar: 'الصفحة {0} من {1}' },
  'viewer.analyze_btn':             { en: 'Analyze',                                  ar: 'تحليل' },
  'viewer.analyzing_btn':           { en: 'Analyzing...',                             ar: 'جارٍ التحليل...' },
  'viewer.download_aria':           { en: 'Download document',                        ar: 'تنزيل المستند' },
  'viewer.full_analysis':           { en: 'Full Analysis',                            ar: 'التحليل الكامل' },
  'viewer.language_label':          { en: 'Language',                                 ar: 'اللغة' },
  'viewer.panel.text':              { en: 'Extracted Text',                           ar: 'النص المستخرج' },
  'viewer.panel.analysis':          { en: 'AI Analysis',                              ar: 'تحليل الذكاء الاصطناعي' },
  'viewer.panel.risks':             { en: 'Risks',                                    ar: 'المخاطر' },
  'viewer.panel.entities':          { en: 'Entities',                                 ar: 'الكيانات' },
  'viewer.risk.score':              { en: 'Risk Score',                               ar: 'درجة المخاطر' },
  'viewer.risk.high':               { en: 'High risk — review required',              ar: 'مخاطر عالية — مراجعة مطلوبة' },
  'viewer.risk.medium':             { en: 'Medium risk — some concerns',              ar: 'مخاطر متوسطة — بعض المخاوف' },
  'viewer.risk.low':                { en: 'Low risk — looks good',                    ar: 'مخاطر منخفضة — يبدو جيداً' },
  'viewer.saul_analyzing':          { en: 'Saul is analyzing...',                     ar: 'سول يحلل...' },
  'viewer.analysis.risks_label':    { en: 'Risks',                                    ar: 'المخاطر' },
  'viewer.analysis.entities_label': { en: 'Entities',                                 ar: 'الكيانات' },
  'viewer.analysis.clauses_label':  { en: 'Clauses',                                  ar: 'البنود' },
  'viewer.run_analysis':            { en: 'Run Analysis',                             ar: 'تشغيل التحليل' },
  'viewer.no_risks':                { en: 'No risks detected',                        ar: 'لا توجد مخاطر مكتشفة' },
  'viewer.no_entities':             { en: 'Run analysis to extract entities',         ar: 'شغِّل التحليل لاستخراج الكيانات' },
  'viewer.toast.analyzed':          { en: 'Analysis complete',                        ar: 'اكتمل التحليل' },
  'viewer.toast.download':          { en: 'Download started',                         ar: 'بدأ التنزيل' },


  // Cases
  'cases.new':           { en: 'New Case',          ar: 'قضية جديدة' },
  'cases.active':        { en: 'Active',            ar: 'نشطة' },
  'cases.pending':       { en: 'Pending',           ar: 'معلقة' },
  'cases.closed':        { en: 'Closed',            ar: 'مغلقة' },
  'cases.review':        { en: 'Under Review',      ar: 'قيد المراجعة' },
  'cases.archived':      { en: 'Archived',          ar: 'مؤرشفة' },
  // Settings
  'settings.title':      { en: 'Settings',          ar: 'الإعدادات' },
  'settings.language':   { en: 'Language',          ar: 'اللغة' },
  'settings.theme':      { en: 'Theme',             ar: 'المظهر' },
  'settings.appearance': { en: 'Appearance',        ar: 'المظهر' },
  'settings.security':   { en: 'Security',          ar: 'الأمان' },
  'settings.account':    { en: 'Account',           ar: 'الحساب' },
  'settings.save_changes': { en: 'Save Changes',    ar: 'حفظ التغييرات' },
  // Search
  'search.placeholder':  { en: 'Search cases, documents, laws…', ar: 'ابحث في القضايا والمستندات والقوانين…' },
  'search.title':        { en: 'Semantic Legal Search', ar: 'البحث القانوني الدلالي' },
  'search.no_results':   { en: 'No results found', ar: 'لا توجد نتائج' },

  // ── PHASE 5: SEARCH + REPORTS + NOTIFICATIONS LOCALIZATION ───────────────

  // -- Search page --
  'search.page_title':          { en: 'Legal Search',                                         ar: 'البحث القانوني' },
  'search.page_subtitle':       { en: 'Search documents, laws, cases, and legal precedents using AI', ar: 'ابحث في المستندات والقوانين والقضايا والسوابق القانونية باستخدام الذكاء الاصطناعي' },
  'search.input_placeholder':   { en: 'Search for laws, cases, clauses, legal concepts...', ar: 'ابحث عن قوانين أو قضايا أو بنود أو مفاهيم قانونية...' },
  'search.input_aria':          { en: 'Search legal documents, laws, and cases',             ar: 'ابحث في المستندات القانونية والقوانين والقضايا' },
  'search.btn_searching':       { en: 'Searching',                                            ar: 'جارٍ البحث' },
  'search.btn_search':          { en: 'Search',                                               ar: 'بحث' },
  'search.type.hybrid':         { en: 'Hybrid',                                               ar: 'مدمج' },
  'search.type.semantic':       { en: 'Semantic AI',                                          ar: 'ذكاء اصطناعي دلالي' },
  'search.type.keyword':        { en: 'Keyword',                                              ar: 'كلمات مفتاحية' },
  'search.meta_results':        { en: '{0} results for',                                      ar: '{0} نتيجة عن' },
  'search.welcome_title':       { en: 'Semantic Legal Search',                                ar: 'البحث القانوني الدلالي' },
  'search.welcome_desc':        { en: 'Search across your documents, applicable laws, court judgments, and legal precedents using AI-powered semantic understanding.', ar: 'ابحث في مستنداتك والقوانين المنطبقة وأحكام المحاكم والسوابق القانونية باستخدام الفهم الدلالي المدعوم بالذكاء الاصطناعي.' },
  'search.relevance':           { en: 'Relevance',                                            ar: 'الصلة' },
  'search.no_results_title':    { en: 'No results found',                                     ar: 'لا توجد نتائج' },
  'search.no_results_desc':     { en: 'Try different keywords or switch to semantic search mode', ar: 'جرب كلمات مفتاحية مختلفة أو انتقل إلى وضع البحث الدلالي' },

  // -- Reports list page --
  'reports.page_title':         { en: 'Reports',                                              ar: 'التقارير' },
  'reports.page_subtitle':      { en: 'AI-generated legal reports and analysis documents',    ar: 'تقارير قانونية وتحليلات مستندات مُنشأة بالذكاء الاصطناعي' },
  'reports.generate_btn':       { en: 'Generate Report',                                      ar: 'إنشاء تقرير' },
  'reports.empty_title':        { en: 'No reports yet',                                       ar: 'لا توجد تقارير بعد' },
  'reports.empty_desc':         { en: 'Generate your first AI legal report from any case or document', ar: 'أنشئ أول تقرير قانوني بالذكاء الاصطناعي من أي قضية أو مستند' },
  'reports.card.generated':     { en: 'Generated',                                            ar: 'تم إنشاؤه' },
  'reports.card.view':          { en: 'View',                                                 ar: 'عرض' },
  'reports.card.pdf':           { en: 'PDF',                                                  ar: 'PDF' },
  'reports.card.word':          { en: 'Word',                                                 ar: 'Word' },
  'reports.card.download_pdf_aria':  { en: 'Download PDF',                                   ar: 'تنزيل PDF' },
  'reports.card.download_word_aria': { en: 'Download Word document',                         ar: 'تنزيل مستند Word' },
  'reports.card.delete_aria':   { en: 'Delete report',                                        ar: 'حذف التقرير' },

  // -- Generate report modal --
  'reports.modal.title':        { en: 'Generate AI Report',                                   ar: 'إنشاء تقرير بالذكاء الاصطناعي' },
  'reports.modal.close_aria':   { en: 'Close dialog',                                         ar: 'إغلاق مربع الحوار' },
  'reports.modal.type_label':   { en: 'Report Type',                                          ar: 'نوع التقرير' },
  'reports.modal.case_label':   { en: 'Case (optional)',                                       ar: 'القضية (اختياري)' },
  'reports.modal.no_case':      { en: 'No specific case',                                     ar: 'بدون قضية محددة' },
  'reports.modal.title_label':  { en: 'Report Title (optional)',                              ar: 'عنوان التقرير (اختياري)' },
  'reports.modal.title_ph':     { en: 'Auto-generated if left blank',                        ar: 'يُنشأ تلقائياً إذا تُرك فارغاً' },
  'reports.modal.sections_label': { en: 'Include Sections',                                  ar: 'تضمين الأقسام' },
  'reports.modal.risk_analysis':  { en: 'Risk Analysis',                                     ar: 'تحليل المخاطر' },
  'reports.modal.timeline':       { en: 'Timeline',                                           ar: 'الجدول الزمني' },
  'reports.modal.recommendations':{ en: 'Recommendations',                                   ar: 'التوصيات' },
  'reports.modal.similar_cases':  { en: 'Similar Cases',                                     ar: 'قضايا مشابهة' },
  'reports.modal.cancel':         { en: 'Cancel',                                             ar: 'إلغاء' },
  'reports.modal.generating':     { en: 'Generating...',                                      ar: 'جارٍ الإنشاء...' },
  'reports.modal.generate':       { en: 'Generate Report',                                    ar: 'إنشاء تقرير' },

  // -- Report type labels --
  'reports.type.contract_analysis': { en: 'Contract Analysis',                               ar: 'تحليل العقد' },
  'reports.type.risk_assessment':   { en: 'Risk Assessment',                                  ar: 'تقييم المخاطر' },
  'reports.type.legal_summary':     { en: 'Legal Summary',                                    ar: 'ملخص قانوني' },
  'reports.type.due_diligence':     { en: 'Due Diligence',                                    ar: 'العناية الواجبة' },
  'reports.type.case_report':       { en: 'Case Report',                                      ar: 'تقرير القضية' },

  // -- Report viewer --
  'reports.viewer.back':            { en: 'Reports',                                          ar: 'التقارير' },
  'reports.viewer.download_word':   { en: 'Word',                                             ar: 'Word' },
  'reports.viewer.downloading':     { en: 'Downloading...',                                   ar: 'جارٍ التنزيل...' },
  'reports.viewer.download_pdf':    { en: 'Download PDF',                                     ar: 'تنزيل PDF' },
  'reports.viewer.generated_by':    { en: 'Generated by Saul AI',                             ar: 'مُنشأ بواسطة سول الذكي' },
  'reports.viewer.ai_verified':     { en: 'AI-Verified Analysis',                             ar: 'تحليل موثَّق بالذكاء الاصطناعي' },
  'reports.viewer.toc':             { en: 'Table of Contents',                                ar: 'جدول المحتويات' },
  'reports.viewer.footer_disclaimer': { en: 'This report was generated by AegisLex AI Legal Platform using Saul, the AI Legal Copilot. The analysis is based on the provided documents and should be reviewed by a qualified legal professional before taking legal action. AegisLex does not constitute legal advice.', ar: 'تم إنشاء هذا التقرير بواسطة منصة AegisLex للذكاء الاصطناعي القانوني باستخدام سول، المساعد القانوني الذكي. يستند التحليل إلى المستندات المقدمة ويجب مراجعته من قِبل متخصص قانوني مؤهل قبل اتخاذ أي إجراء قانوني. لا تُعدّ AegisLex مشورة قانونية.' },
  'reports.viewer.footer_confidential': { en: 'Confidential',                                ar: 'سري' },
  'reports.viewer.footer_ai_report':    { en: 'AI-Generated Report',                         ar: 'تقرير مُنشأ بالذكاء الاصطناعي' },
  'reports.toast.generated':            { en: 'Report generated',                            ar: 'تم إنشاء التقرير' },
  'reports.toast.deleted':              { en: 'Report deleted',                              ar: 'تم حذف التقرير' },
  // Analysis
  'analysis.title':      { en: 'Document Analysis',  ar: 'تحليل المستند' },
  'analysis.run':        { en: 'Start Analysis',      ar: 'بدء التحليل' },
  'analysis.risks':      { en: 'Risk Factors',        ar: 'عوامل المخاطر' },
  'analysis.clauses':    { en: 'Contract Clauses',    ar: 'بنود العقد' },
  'analysis.entities':   { en: 'Named Entities',      ar: 'الكيانات المسماة' },
  'analysis.summary':    { en: 'Summary',             ar: 'ملخص' },
  // Reports
  'reports.title':       { en: 'Reports',             ar: 'التقارير' },
  'reports.generate':    { en: 'Generate Report',     ar: 'إنشاء تقرير' },
  'reports.download':    { en: 'Download',            ar: 'تنزيل' },
  // Notifications
  'notifications.title': { en: 'Notifications',       ar: 'الإشعارات' },
  'notifications.mark_all': { en: 'Mark all read',    ar: 'تعيين الكل كمقروء' },
  'notifications.empty': { en: 'All caught up! No notifications.', ar: 'لا توجد إشعارات جديدة.' },
  // Insights
  'insights.title':      { en: 'Analytics & Insights', ar: 'التحليلات والرؤى' },
  // Profile
  'profile.title':       { en: 'My Profile',          ar: 'ملفي الشخصي' },
  'profile.save':        { en: 'Save Changes',        ar: 'حفظ التغييرات' },

  // ── PHASE 1: AUTH + SETTINGS LOCALIZATION ──────────────────────────────────

  // -- Shared auth chrome (theme toggle, brand panel) --
  'auth.theme.switch_to_light':  { en: 'Switch to Light Mode', ar: 'التبديل إلى الوضع الفاتح' },
  'auth.theme.switch_to_dark':   { en: 'Switch to Dark Mode',  ar: 'التبديل إلى الوضع الداكن' },
  'auth.brand.tagline':          { en: 'Where Intelligence Meets Justice.', ar: 'حيث يلتقي الذكاء بالعدالة.' },
  'auth.brand.feature.research':     { en: 'AI-Powered Legal Research',        ar: 'بحث قانوني مدعوم بالذكاء الاصطناعي' },
  'auth.brand.feature.analysis':     { en: 'Intelligent Contract Analysis',    ar: 'تحليل ذكي للعقود' },
  'auth.brand.feature.risk':         { en: 'Legal Risk Detection',             ar: 'رصد المخاطر القانونية' },
  'auth.brand.feature.timeline':     { en: 'Case Timeline Visualization',      ar: 'تصور الجدول الزمني للقضايا' },
  'auth.brand.feature.graph':        { en: 'Knowledge Graph Insights',         ar: 'رؤى الرسم البياني المعرفي' },
  'auth.brand.feature.recommend':    { en: 'Smart Legal Recommendations',      ar: 'توصيات قانونية ذكية' },
  'auth.brand.feature.security':     { en: 'Secure Document Management',       ar: 'إدارة آمنة للمستندات' },
  'auth.brand.feature.saul':         { en: 'Powered by Saul Legal Assistant',  ar: 'مدعوم بمساعد سول القانوني' },

  // -- Common auth form labels / placeholders / actions --
  'auth.form.email_label':       { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'auth.form.password_label':    { en: 'Password', ar: 'كلمة المرور' },
  'auth.form.show_password':     { en: 'Show password', ar: 'إظهار كلمة المرور' },
  'auth.form.hide_password':     { en: 'Hide password', ar: 'إخفاء كلمة المرور' },
  'auth.form.remember_me':       { en: 'Remember me', ar: 'تذكرني' },
  'auth.form.forgot_password':   { en: 'Forgot password?', ar: 'هل نسيت كلمة المرور؟' },
  'auth.form.or':                { en: 'or', ar: 'أو' },
  'auth.form.back':              { en: 'Back', ar: 'رجوع' },
  'auth.form.example_prefix':    { en: 'e.g.', ar: 'مثال:' },

  // -- Login --
  'login.demo_mode.title':       { en: 'Static Demo Mode', ar: 'وضع العرض التجريبي الثابت' },
  'login.demo_mode.body':        { en: 'Use any credentials or click "Enter Demo" below', ar: 'استخدم أي بيانات اعتماد أو اضغط على "دخول تجريبي" أدناه' },
  'login.session_expired':       { en: 'Your session has expired. Please sign in again.', ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.' },
  'login.account_locked_title':  { en: 'Account Temporarily Locked', ar: 'الحساب مقفل مؤقتاً' },
  'login.account_disabled_title':{ en: 'Account Disabled', ar: 'الحساب معطل' },
  'login.welcome_back':          { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  'login.subtitle':              { en: 'Sign in to your AegisLex account', ar: 'سجّل الدخول إلى حسابك في AegisLex' },
  'login.password_placeholder':  { en: 'Enter your password', ar: 'أدخل كلمة المرور' },
  'login.signing_in':            { en: 'Signing In...', ar: 'جارٍ تسجيل الدخول...' },
  'login.sign_in':                { en: 'Sign In', ar: 'تسجيل الدخول' },
  'login.enter_demo':            { en: 'Enter Demo (Ziad Shaaban)', ar: 'دخول تجريبي (زياد شعبان)' },
  'login.no_account':            { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  'login.create_one':            { en: 'Create one free', ar: 'أنشئ حساباً مجاناً' },
  'login.error.invalid_credentials': { en: 'Invalid email or password.', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
  'login.error.account_disabled':    { en: 'Your account is disabled. Please contact support.', ar: 'حسابك معطل. يرجى التواصل مع الدعم.' },
  'login.error.account_locked':      { en: 'Your account is temporarily locked. Please try again later.', ar: 'حسابك مقفل مؤقتاً. يرجى المحاولة مرة أخرى لاحقاً.' },
  'login.error.generic':             { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },

  // -- Register --
  'register.step1.label':        { en: 'Account', ar: 'الحساب' },
  'register.step2.label':        { en: 'Security', ar: 'الأمان' },
  'register.draft_restored':     { en: 'Your previous progress has been restored.', ar: 'تمت استعادة تقدّمك السابق.' },
  'register.title.step1':        { en: 'Create your account', ar: 'أنشئ حسابك' },
  'register.title.step2':        { en: 'Secure your account', ar: 'أمّن حسابك' },
  'register.subtitle.step1':     { en: 'Fill in your details to get started', ar: 'أدخل بياناتك للبدء' },
  'register.subtitle.step2':     { en: 'Set a strong password to protect your data', ar: 'اختر كلمة مرور قوية لحماية بياناتك' },
  'register.first_name_label':   { en: 'First Name', ar: 'الاسم الأول' },
  'register.first_name_ph':      { en: 'Ahmed', ar: 'أحمد' },
  'register.last_name_label':    { en: 'Last Name', ar: 'اسم العائلة' },
  'register.last_name_ph':       { en: 'Al-Mansouri', ar: 'المنصوري' },
  'register.org_label':          { en: 'Organization', ar: 'المؤسسة' },
  'register.org_optional':       { en: '(optional)', ar: '(اختياري)' },
  'register.org_ph':             { en: 'Law Firm or Company Name', ar: 'اسم مكتب المحاماة أو الشركة' },
  'register.role_label':         { en: 'Your Role', ar: 'دورك الوظيفي' },
  'register.role.lawyer':        { en: 'Lawyer / Attorney', ar: 'محامٍ' },
  'register.role.analyst':       { en: 'Legal Analyst', ar: 'محلل قانوني' },
  'register.role.admin':         { en: 'Admin / Manager', ar: 'مدير / مسؤول' },
  'register.role.viewer':        { en: 'Read-only Viewer', ar: 'مشاهد فقط' },
  'register.continue':           { en: 'Continue', ar: 'متابعة' },
  'register.password_label':     { en: 'Password', ar: 'كلمة المرور' },
  'register.password_ph':        { en: 'Create a strong password', ar: 'اختر كلمة مرور قوية' },
  'register.confirm_password_label': { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  'register.confirm_password_ph':    { en: 'Repeat your password', ar: 'أعد كتابة كلمة المرور' },
  'register.passwords_match':    { en: 'Passwords match', ar: 'كلمتا المرور متطابقتان' },
  'register.terms_prefix':       { en: 'I agree to the', ar: 'أوافق على' },
  'register.terms_and':          { en: 'and', ar: 'و' },
  'register.terms_of_service':   { en: 'Terms of Service', ar: 'شروط الخدمة' },
  'register.privacy_policy':     { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  'register.creating_account':   { en: 'Creating Account...', ar: 'جارٍ إنشاء الحساب...' },
  'register.create_account':     { en: 'Create Account', ar: 'إنشاء حساب' },
  'register.already_have_account': { en: 'Already have an account?', ar: 'هل لديك حساب بالفعل؟' },
  'register.sign_in':            { en: 'Sign in', ar: 'تسجيل الدخول' },
  'register.error.required.first_name':  { en: 'First name is required.', ar: 'الاسم الأول مطلوب.' },
  'register.error.too_short.first_name': { en: 'First name must contain at least 3 characters.', ar: 'يجب أن يحتوي الاسم الأول على 3 أحرف على الأقل.' },
  'register.error.too_long.first_name':  { en: 'First name cannot exceed 50 characters.', ar: 'يجب ألا يتجاوز الاسم الأول 50 حرفاً.' },
  'register.error.required.last_name':   { en: 'Last name is required.', ar: 'اسم العائلة مطلوب.' },
  'register.error.too_short.last_name':  { en: 'Last name must contain at least 3 characters.', ar: 'يجب أن يحتوي اسم العائلة على 3 أحرف على الأقل.' },
  'register.error.too_long.last_name':   { en: 'Last name cannot exceed 50 characters.', ar: 'يجب ألا يتجاوز اسم العائلة 50 حرفاً.' },
  'register.error.org_too_short':        { en: 'Organization must contain at least 2 characters.', ar: 'يجب أن يحتوي اسم المؤسسة على حرفين على الأقل.' },
  'register.error.org_too_long':         { en: 'Organization cannot exceed 100 characters.', ar: 'يجب ألا يتجاوز اسم المؤسسة 100 حرف.' },
  'register.error.confirm_required':     { en: 'Confirm password is required.', ar: 'تأكيد كلمة المرور مطلوب.' },
  'register.error.passwords_mismatch':   { en: 'Passwords do not match.', ar: 'كلمتا المرور غير متطابقتين.' },

  // ── GOOGLE AUTHENTICATION ─────────────────────────────────────────────────
  'auth.google.sign_in_with_google':  { en: 'Sign in with Google',     ar: 'تسجيل الدخول بحساب Google' },
  'auth.google.sign_up_with_google':  { en: 'Sign up with Google',     ar: 'إنشاء حساب بـ Google' },
  'auth.google.signing_in':           { en: 'Signing in with Google…', ar: 'جارٍ تسجيل الدخول بـ Google…' },
  'auth.google.error.generic':        { en: 'Google sign-in failed. Please try again.', ar: 'فشل تسجيل الدخول بـ Google. يرجى المحاولة مرة أخرى.' },
  'auth.google.error.popup_closed':   { en: 'Sign-in cancelled. Please try again.', ar: 'تم إلغاء تسجيل الدخول. يرجى المحاولة مرة أخرى.' },

  // -- Shared email/password validation messages (login, register, forgot, reset, profile) --
  'val.email.required':          { en: 'Email is required.', ar: 'البريد الإلكتروني مطلوب.' },
  'val.email.too_long':          { en: 'Email cannot exceed 254 characters.', ar: 'يجب ألا يتجاوز البريد الإلكتروني 254 حرفاً.' },
  'val.email.missing_at':        { en: 'Missing @ symbol.', ar: 'علامة @ غير موجودة.' },
  'val.email.multiple_at':       { en: 'Multiple @ symbols detected.', ar: 'تم رصد أكثر من علامة @ واحدة.' },
  'val.email.starts_with_dot':   { en: 'Email cannot start with a dot.', ar: 'لا يمكن أن يبدأ البريد الإلكتروني بنقطة.' },
  'val.email.ends_with_dot':     { en: 'Email cannot end with a dot before @.', ar: 'لا يمكن أن ينتهي البريد الإلكتروني بنقطة قبل @.' },
  'val.email.missing_domain':    { en: 'Missing domain after @.', ar: 'النطاق مفقود بعد @.' },
  'val.email.missing_tld_dot':   { en: 'Missing dot before TLD (e.g. gmail.com).', ar: 'النقطة قبل امتداد النطاق مفقودة (مثل gmail.com).' },
  'val.email.consecutive_dots':  { en: 'Consecutive dots detected.', ar: 'تم رصد نقاط متتالية.' },
  'val.email.invalid_tld':       { en: 'Invalid or missing TLD (e.g. .com, .ae).', ar: 'امتداد النطاق غير صالح أو مفقود (مثل .com، .ae).' },
  'val.email.invalid_generic':   { en: 'Please enter a valid email address.', ar: 'يرجى إدخال بريد إلكتروني صالح.' },
  'val.password.required':       { en: 'Password is required.', ar: 'كلمة المرور مطلوبة.' },
  'val.password.too_short':      { en: 'Password must contain at least 8 characters.', ar: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.' },
  'val.password.too_long':       { en: 'Password cannot exceed 64 characters.', ar: 'يجب ألا تتجاوز كلمة المرور 64 حرفاً.' },
  'val.password.no_upper':       { en: 'Password must contain at least one uppercase letter.', ar: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.' },
  'val.password.no_lower':       { en: 'Password must contain at least one lowercase letter.', ar: 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل.' },
  'val.password.no_number':      { en: 'Password must contain at least one number.', ar: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.' },
  'val.password.no_special':     { en: 'Password must contain at least one special character.', ar: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.' },

  // -- Password strength widget --
  'pw_strength.very_weak':       { en: 'Very Weak', ar: 'ضعيفة جداً' },
  'pw_strength.weak':            { en: 'Weak', ar: 'ضعيفة' },
  'pw_strength.medium':          { en: 'Medium', ar: 'متوسطة' },
  'pw_strength.strong':          { en: 'Strong', ar: 'قوية' },
  'pw_strength.very_strong':     { en: 'Very Strong', ar: 'قوية جداً' },
  'pw_strength.keep_going':      { en: '— keep going', ar: '— تابع' },
  'pw_strength.great':           { en: '— great!', ar: '— ممتاز!' },

  // -- Password requirements widget --
  'pw_reqs.aria_label':          { en: 'Password requirements', ar: 'متطلبات كلمة المرور' },
  'pw_reqs.title':               { en: 'Password must include:', ar: 'يجب أن تتضمن كلمة المرور:' },
  'pw_reqs.length':              { en: 'At least 8 characters', ar: '8 أحرف على الأقل' },
  'pw_reqs.upper':               { en: 'One uppercase letter', ar: 'حرف كبير واحد' },
  'pw_reqs.lower':               { en: 'One lowercase letter', ar: 'حرف صغير واحد' },
  'pw_reqs.number':              { en: 'One number', ar: 'رقم واحد' },
  'pw_reqs.special':             { en: 'One special character', ar: 'رمز خاص واحد' },

  // -- Forgot Password --
  'forgot.back_to_signin':       { en: 'Back to Sign In', ar: 'العودة لتسجيل الدخول' },
  'forgot.info.secure_title':    { en: 'Secure Reset', ar: 'إعادة تعيين آمنة' },
  'forgot.info.secure_body':     { en: 'We send a time-limited code to your registered email.', ar: 'نرسل رمزاً محدود الصلاحية إلى بريدك الإلكتروني المسجل.' },
  'forgot.info.expiry_title':    { en: 'Code Expires in 15 Minutes', ar: 'تنتهي صلاحية الرمز في 15 دقيقة' },
  'forgot.info.expiry_body':     { en: 'For your security, reset codes expire quickly.', ar: 'لحمايتك، تنتهي صلاحية رموز إعادة التعيين بسرعة.' },
  'forgot.info.one_time_title':  { en: 'One-Time Use', ar: 'استخدام واحد فقط' },
  'forgot.info.one_time_body':   { en: 'Each code can only be used once to reset your password.', ar: 'يمكن استخدام كل رمز مرة واحدة فقط لإعادة تعيين كلمة المرور.' },
  'forgot.success.title':        { en: 'Check your inbox', ar: 'تحقق من بريدك الوارد' },
  'forgot.success.sent_to':      { en: "We've sent a verification code to", ar: 'أرسلنا رمز التحقق إلى' },
  'forgot.success.no_email':     { en: "Didn't receive it? Check your spam folder or", ar: 'لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها أو' },
  'forgot.success.resend':       { en: 'send again.', ar: 'أعد الإرسال.' },
  'forgot.success.enter_code':   { en: 'Enter Verification Code', ar: 'أدخل رمز التحقق' },
  'forgot.title':                { en: 'Forgot your password?', ar: 'هل نسيت كلمة المرور؟' },
  'forgot.subtitle':             { en: "Enter your email address and we'll send you a verification code to reset your password.", ar: 'أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.' },
  'forgot.sending':              { en: 'Sending...', ar: 'جارٍ الإرسال...' },
  'forgot.send_code':            { en: 'Send Verification Code', ar: 'إرسال رمز التحقق' },
  'forgot.remember_password':    { en: 'Remember your password?', ar: 'تتذكر كلمة المرور؟' },
  'forgot.sign_in':              { en: 'Sign in', ar: 'تسجيل الدخول' },
  'forgot.error.user_not_found': { en: 'User not found.', ar: 'المستخدم غير موجود.' },
  'forgot.error.account_disabled': { en: 'Account disabled.', ar: 'الحساب معطل.' },
  'forgot.error.otp_rate_limit': { en: 'OTP rate limit exceeded.', ar: 'تم تجاوز الحد المسموح من طلبات الرمز.' },
  'forgot.error.generic':        { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },

  // -- Reset Password --
  'reset.pw_tips_title':         { en: 'Strong Password Tips', ar: 'نصائح لكلمة مرور قوية' },
  'reset.tip.mixed_case':        { en: 'Use a mix of upper and lowercase', ar: 'استخدم مزيجاً من الأحرف الكبيرة والصغيرة' },
  'reset.tip.numbers_symbols':   { en: 'Include numbers and symbols', ar: 'أضف أرقاماً ورموزاً' },
  'reset.tip.min_length':        { en: 'At least 8 characters long', ar: '8 أحرف على الأقل' },
  'reset.tip.avoid_personal':    { en: 'Avoid personal information', ar: 'تجنب المعلومات الشخصية' },
  'reset.tip.no_reuse':          { en: "Don't reuse old passwords", ar: 'لا تعِد استخدام كلمات مرور سابقة' },
  'reset.success.title':         { en: 'Password Reset!', ar: 'تمت إعادة تعيين كلمة المرور!' },
  'reset.success.body':          { en: 'Your password has been successfully updated.<br>You can now sign in with your new password.', ar: 'تم تحديث كلمة المرور بنجاح.<br>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' },
  'reset.success.sign_in_now':   { en: 'Sign In Now', ar: 'تسجيل الدخول الآن' },
  'reset.title':                 { en: 'Set new password', ar: 'تعيين كلمة مرور جديدة' },
  'reset.subtitle':              { en: 'Create a strong password for your AegisLex account.', ar: 'اختر كلمة مرور قوية لحسابك في AegisLex.' },
  'reset.new_password_label':    { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  'reset.confirm_new_password_label': { en: 'Confirm New Password', ar: 'تأكيد كلمة المرور الجديدة' },
  'reset.updating':              { en: 'Updating Password...', ar: 'جارٍ تحديث كلمة المرور...' },
  'reset.reset_password':        { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور' },
  'reset.back_to_signin':        { en: 'Back to Sign In', ar: 'العودة لتسجيل الدخول' },
  'reset.error.weak_password':   { en: 'Weak password.', ar: 'كلمة المرور ضعيفة.' },
  'reset.error.token_invalid':   { en: 'Invalid reset session.', ar: 'جلسة إعادة التعيين غير صالحة.' },
  'reset.error.token_expired':   { en: 'Reset session expired.', ar: 'انتهت صلاحية جلسة إعادة التعيين.' },
  'reset.error.generic':         { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },

  // -- Verify OTP --
  'otp.demo_mode.title':         { en: 'Demo Mode', ar: 'وضع العرض التجريبي' },
  'otp.demo_mode.body_prefix':   { en: 'Enter', ar: 'أدخل' },
  'otp.demo_mode.body_suffix':   { en: 'to proceed with the reset flow.', ar: 'للمتابعة في عملية إعادة التعيين.' },
  'otp.tips_title':              { en: 'Tips:', ar: 'نصائح:' },
  'otp.tip.spam':                { en: 'Check your spam folder', ar: 'تحقق من مجلد الرسائل غير المرغوب فيها' },
  'otp.tip.expiry':              { en: 'Code expires in 15 minutes', ar: 'تنتهي صلاحية الرمز في 15 دقيقة' },
  'otp.tip.paste':               { en: 'You can paste the code directly', ar: 'يمكنك لصق الرمز مباشرة' },
  'otp.back':                    { en: 'Back', ar: 'رجوع' },
  'otp.success.title':           { en: 'Code Verified!', ar: 'تم التحقق من الرمز!' },
  'otp.success.body':            { en: 'Redirecting you to reset your password...', ar: 'يتم تحويلك لإعادة تعيين كلمة المرور...' },
  'otp.title':                   { en: 'Enter verification code', ar: 'أدخل رمز التحقق' },
  'otp.subtitle_prefix':         { en: 'We sent a 6-digit code to', ar: 'أرسلنا رمزاً مكوناً من 6 أرقام إلى' },
  'otp.your_email_fallback':     { en: 'your email', ar: 'بريدك الإلكتروني' },
  'otp.digit_aria':              { en: 'Digit {0} of {1}', ar: 'الرقم {0} من {1}' },
  'otp.verifying':                { en: 'Verifying...', ar: 'جارٍ التحقق...' },
  'otp.resend_in':                { en: 'Resend code in', ar: 'إعادة الإرسال خلال' },
  'otp.resend_action':            { en: 'Resend verification code', ar: 'إعادة إرسال رمز التحقق' },
  'otp.error.max_attempts':       { en: 'Maximum attempts exceeded.', ar: 'تم تجاوز الحد الأقصى للمحاولات.' },
  'otp.error.invalid':            { en: 'Invalid OTP.', ar: 'رمز التحقق غير صحيح.' },

  // -- Profile --
  'profile.change_photo':        { en: 'Change photo', ar: 'تغيير الصورة' },
  'profile.stats.cases_created': { en: 'Cases Created', ar: 'القضايا المُنشأة' },
  'profile.stats.docs_analyzed': { en: 'Documents Analyzed', ar: 'المستندات المُحلَّلة' },
  'profile.stats.reports_generated': { en: 'Reports Generated', ar: 'التقارير المُنشأة' },
  'profile.stats.ai_queries':     { en: 'AI Queries', ar: 'استعلامات الذكاء الاصطناعي' },
  'profile.personal_info':       { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  'profile.first_name_ph':       { en: 'Ahmed', ar: 'أحمد' },
  'profile.last_name_ph':        { en: 'Al-Mansouri', ar: 'المنصوري' },
  'profile.org_ph':              { en: 'Your law firm or company', ar: 'مكتب المحاماة أو الشركة الخاصة بك' },
  'profile.saving':              { en: 'Saving...', ar: 'جارٍ الحفظ...' },
  'profile.save_changes':        { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'profile.password_security':   { en: 'Password & Security', ar: 'كلمة المرور والأمان' },
  'profile.hide':                { en: 'Hide', ar: 'إخفاء' },
  'profile.change_password':     { en: 'Change Password', ar: 'تغيير كلمة المرور' },
  'profile.password_protected':  { en: 'Password protected', ar: 'محمي بكلمة مرور' },
  'profile.password_protected_body': { en: 'Your account is secured with a strong password', ar: 'حسابك محمي بكلمة مرور قوية' },
  'profile.current_password_label': { en: 'Current Password', ar: 'كلمة المرور الحالية' },
  'profile.current_password_ph':    { en: 'Enter current password', ar: 'أدخل كلمة المرور الحالية' },
  'profile.new_password_label':     { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  'profile.new_password_ph':        { en: 'Create a strong password', ar: 'اختر كلمة مرور قوية' },
  'profile.confirm_password_label': { en: 'Confirm New Password', ar: 'تأكيد كلمة المرور الجديدة' },
  'profile.confirm_password_ph':    { en: 'Repeat your new password', ar: 'أعد كتابة كلمة المرور الجديدة' },
  'profile.lock_hint':              { en: 'Enter your current password first', ar: 'أدخل كلمة المرور الحالية أولاً' },
  'profile.passwords_match':        { en: 'Passwords match', ar: 'كلمتا المرور متطابقتان' },
  'profile.updating':               { en: 'Updating...', ar: 'جارٍ التحديث...' },
  'profile.update_password':        { en: 'Update Password', ar: 'تحديث كلمة المرور' },
  'profile.account_info':           { en: 'Account Information', ar: 'معلومات الحساب' },
  'profile.account_id':             { en: 'Account ID', ar: 'رقم الحساب' },
  'profile.role':                   { en: 'Role', ar: 'الدور' },
  'profile.member_since':           { en: 'Member Since', ar: 'عضو منذ' },
  'profile.last_login':             { en: 'Last Login', ar: 'آخر تسجيل دخول' },
  'profile.status':                 { en: 'Status', ar: 'الحالة' },
  'profile.status_active':          { en: 'Active', ar: 'نشط' },
  'profile.error.first_name_required':  { en: 'First name is required.', ar: 'الاسم الأول مطلوب.' },
  'profile.error.first_name_short':     { en: 'First name must contain at least 3 characters.', ar: 'يجب أن يحتوي الاسم الأول على 3 أحرف على الأقل.' },
  'profile.error.first_name_long':      { en: 'First name cannot exceed 50 characters.', ar: 'يجب ألا يتجاوز الاسم الأول 50 حرفاً.' },
  'profile.error.last_name_required':   { en: 'Last name is required.', ar: 'اسم العائلة مطلوب.' },
  'profile.error.last_name_short':      { en: 'Last name must contain at least 3 characters.', ar: 'يجب أن يحتوي اسم العائلة على 3 أحرف على الأقل.' },
  'profile.error.last_name_long':       { en: 'Last name cannot exceed 50 characters.', ar: 'يجب ألا يتجاوز اسم العائلة 50 حرفاً.' },
  'profile.error.org_short':            { en: 'Organization must contain at least 2 characters.', ar: 'يجب أن يحتوي اسم المؤسسة على حرفين على الأقل.' },
  'profile.error.org_long':             { en: 'Organization cannot exceed 100 characters.', ar: 'يجب ألا يتجاوز اسم المؤسسة 100 حرف.' },
  'profile.error.current_pw_required':  { en: 'Current password is required.', ar: 'كلمة المرور الحالية مطلوبة.' },
  'profile.error.current_pw_incorrect': { en: 'Current password is incorrect.', ar: 'كلمة المرور الحالية غير صحيحة.' },
  'profile.error.confirm_required':     { en: 'Confirm password is required.', ar: 'تأكيد كلمة المرور مطلوب.' },
  'profile.error.passwords_mismatch':   { en: 'Passwords do not match.', ar: 'كلمتا المرور غير متطابقتين.' },
  'profile.toast.profile_updated':      { en: 'Profile updated successfully', ar: 'تم تحديث الملف الشخصي بنجاح' },
  'profile.toast.password_changed':     { en: 'Password changed successfully', ar: 'تم تغيير كلمة المرور بنجاح' },
  'profile.toast.passwords_mismatch':   { en: 'Passwords do not match', ar: 'كلمتا المرور غير متطابقتين' },
  'profile.role_badge.admin':           { en: 'Admin', ar: 'مسؤول' },
  'profile.role_badge.lawyer':          { en: 'Lawyer', ar: 'محامٍ' },
  'profile.role_badge.analyst':         { en: 'Legal Analyst', ar: 'محلل قانوني' },
  'profile.role_badge.viewer':          { en: 'Viewer', ar: 'مشاهد' },

  // ── PHASE 2: LAYOUT + NAVIGATION LOCALIZATION ──────────────────────────────

  // -- Navbar --
  'navbar.open_sidebar':         { en: 'Open sidebar',             ar: 'فتح القائمة الجانبية' },
  'navbar.close_sidebar':        { en: 'Close sidebar',            ar: 'إغلاق القائمة الجانبية' },
  'navbar.search_placeholder':   { en: 'Search cases, documents, laws…', ar: 'ابحث في القضايا والمستندات والقوانين…' },
  'navbar.search_aria':          { en: 'Search cases, documents, and laws', ar: 'ابحث في القضايا والمستندات والقوانين' },
  'navbar.theme_light':          { en: 'Switch to Light Mode',     ar: 'التبديل إلى الوضع الفاتح' },
  'navbar.theme_dark':           { en: 'Switch to Dark Mode',      ar: 'التبديل إلى الوضع الداكن' },
  'navbar.notifications':        { en: 'Notifications',            ar: 'الإشعارات' },
  'navbar.unread_notifications': { en: '{0} unread notifications', ar: '{0} إشعار غير مقروء' },
  'navbar.switch_to_arabic':     { en: 'Switch to Arabic',         ar: 'التبديل إلى العربية' },
  'navbar.switch_to_english':    { en: 'Switch to English',        ar: 'التبديل إلى الإنجليزية' },

  // -- 404 Not Found --
  'not_found.title':             { en: 'Page Not Found',              ar: 'الصفحة غير موجودة' },
  'not_found.desc':              { en: "The page you're looking for doesn't exist or has been moved.", ar: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' },
  'not_found.return':            { en: 'Return to Dashboard',         ar: 'العودة إلى لوحة التحكم' },

  // -- Sidebar --
  'sidebar.expand':              { en: 'Expand',                   ar: 'توسيع' },
  'sidebar.collapse':            { en: 'Collapse',                 ar: 'طي' },
  'sidebar.expand_aria':         { en: 'Expand sidebar',           ar: 'توسيع القائمة الجانبية' },
  'sidebar.collapse_aria':       { en: 'Collapse sidebar',         ar: 'طي القائمة الجانبية' },
  'sidebar.tagline':             { en: 'AI Legal Platform',        ar: 'منصة قانونية بالذكاء الاصطناعي' },
  'sidebar.ai_copilot':          { en: 'AI Copilot Active',        ar: 'المساعد الذكي نشط' },
  'sidebar.sign_out':            { en: 'Sign Out',                 ar: 'تسجيل الخروج' },
  'sidebar.sign_out_aria':       { en: 'Sign out',                 ar: 'تسجيل الخروج' },

  // -- Notifications page --
  'notifications.page_subtitle': { en: '{0} unread notifications', ar: '{0} إشعار غير مقروء' },
  'notifications.just_now':      { en: 'Just now',                 ar: 'الآن' },
  'notifications.minutes_ago':   { en: '{0}m ago',                 ar: 'منذ {0} د' },
  'notifications.hours_ago':     { en: '{0}h ago',                 ar: 'منذ {0} س' },

  // -- Settings --
  'settings.subtitle':           { en: 'Manage your AegisLex preferences', ar: 'إدارة تفضيلاتك في AegisLex' },
  'settings.nav.appearance':     { en: 'Appearance', ar: 'المظهر' },
  'settings.nav.notifications':  { en: 'Notifications', ar: 'الإشعارات' },
  'settings.nav.ai':             { en: 'AI Settings', ar: 'إعدادات الذكاء الاصطناعي' },
  'settings.nav.security':       { en: 'Security', ar: 'الأمان' },
  'settings.nav.api':            { en: 'API & Integrations', ar: 'واجهة البرمجة والتكاملات' },
  'settings.theme_desc':         { en: 'Choose your preferred color scheme', ar: 'اختر نظام الألوان المفضل لديك' },
  'settings.theme.light':        { en: 'Light', ar: 'فاتح' },
  'settings.theme.dark':         { en: 'Dark', ar: 'داكن' },
  'settings.theme.system':       { en: 'System', ar: 'النظام' },
  'settings.language_desc':      { en: 'Interface display language', ar: 'لغة عرض الواجهة' },
  'settings.lang.english':       { en: 'English', ar: 'الإنجليزية' },
  'settings.lang.arabic':        { en: 'العربية (Arabic)', ar: 'العربية' },
  'settings.notif.email_label':  { en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' },
  'settings.notif.email_desc':   { en: 'Receive updates via email', ar: 'تلقي التحديثات عبر البريد الإلكتروني' },
  'settings.notif.push_label':   { en: 'Push Notifications', ar: 'الإشعارات الفورية' },
  'settings.notif.push_desc':    { en: 'Browser push notifications', ar: 'إشعارات فورية من المتصفح' },
  'settings.notif.analysis_label': { en: 'Analysis Complete', ar: 'اكتمال التحليل' },
  'settings.notif.analysis_desc':  { en: 'Notify when AI analysis finishes', ar: 'التنبيه عند اكتمال تحليل الذكاء الاصطناعي' },
  'settings.notif.report_label':   { en: 'Report Ready', ar: 'التقرير جاهز' },
  'settings.notif.report_desc':    { en: 'Notify when a report is generated', ar: 'التنبيه عند إنشاء تقرير' },
  'settings.ai.model_label':     { en: 'AI Model', ar: 'نموذج الذكاء الاصطناعي' },
  'settings.ai.model_desc':      { en: 'Model used by Saul for analysis and reasoning', ar: 'النموذج الذي يستخدمه سول للتحليل والاستدلال' },
  'settings.ai.model_recommended': { en: 'GPT-4o (Recommended)', ar: 'GPT-4o (مُوصى به)' },
  'settings.ai.model_faster':       { en: 'GPT-4o Mini (Faster)', ar: 'GPT-4o Mini (أسرع)' },
  'settings.ai.auto_analyze_label': { en: 'Auto-Analyze on Upload', ar: 'تحليل تلقائي عند الرفع' },
  'settings.ai.auto_analyze_desc':  { en: 'Run analysis automatically after upload', ar: 'تشغيل التحليل تلقائياً بعد الرفع' },
  'settings.ai.streaming_label':    { en: 'Streaming Responses', ar: 'استجابات متدفقة' },
  'settings.ai.streaming_desc':     { en: "Show Saul's responses as they are generated", ar: 'إظهار ردود سول أثناء توليدها' },
  'settings.ai.explanations_label': { en: 'Include Explanations', ar: 'تضمين التفسيرات' },
  'settings.ai.explanations_desc':  { en: 'Saul explains its reasoning in detail', ar: 'يشرح سول استدلاله بالتفصيل' },
  'settings.security.protected_title': { en: 'Account Protected', ar: 'الحساب محمي' },
  'settings.security.protected_body':  { en: 'Your account is secured with JWT authentication', ar: 'حسابك محمي بمصادقة JWT' },
  'settings.security.change_password_desc': { en: 'Update your account password', ar: 'تحديث كلمة مرور حسابك' },
  'settings.security.change':          { en: 'Change', ar: 'تغيير' },
  'settings.api.base_url_label':       { en: 'API Base URL', ar: 'عنوان واجهة البرمجة الأساسي' },
  'settings.api.copy':                 { en: 'Copy API URL', ar: 'نسخ عنوان واجهة البرمجة' },
  'settings.api.copied':               { en: 'Copied!', ar: 'تم النسخ!' },
  'settings.saving':                   { en: 'Saving...', ar: 'جارٍ الحفظ...' },
  'settings.save_settings':            { en: 'Save Settings', ar: 'حفظ الإعدادات' },
  'settings.toast.saved':              { en: 'Settings saved', ar: 'تم حفظ الإعدادات' },

  // ── PHASE 6: AI FEATURES LOCALIZATION ────────────────────────────────────

  // -- Chat sidebar --
  'chat.sidebar.title':              { en: 'Conversations',                       ar: 'المحادثات' },
  'chat.sidebar.new_chat':           { en: 'New Chat',                            ar: 'محادثة جديدة' },
  'chat.sidebar.new_chat_aria':      { en: 'New chat',                            ar: 'محادثة جديدة' },
  'chat.sidebar.close_aria':         { en: 'Close conversations sidebar',         ar: 'إغلاق قائمة المحادثات' },
  'chat.sidebar.search_placeholder': { en: 'Search conversations...',             ar: 'ابحث في المحادثات...' },
  'chat.sidebar.search_aria':        { en: 'Search conversations',                ar: 'ابحث في المحادثات' },
  'chat.sidebar.empty_title':        { en: 'No conversations yet',                ar: 'لا توجد محادثات بعد' },
  'chat.sidebar.empty_subtitle':     { en: 'Start chatting with Saul',            ar: 'ابدأ محادثة مع سول' },
  'chat.sidebar.delete_aria':        { en: 'Delete conversation',                 ar: 'حذف المحادثة' },
  'chat.sidebar.toggle_aria':        { en: 'Toggle conversations sidebar',        ar: 'تبديل قائمة المحادثات' },

  // -- Chat navbar --
  'chat.navbar.status':              { en: 'AI Legal Copilot · Online',           ar: 'المساعد القانوني الذكي · متصل' },
  'chat.navbar.new_chat_aria':       { en: 'New chat',                            ar: 'محادثة جديدة' },
  'chat.navbar.docs_badge_singular': { en: 'doc',                                 ar: 'مستند' },
  'chat.navbar.docs_badge_plural':   { en: 'docs',                                ar: 'مستندات' },

  // -- Chat attachments bar --
  'chat.attachments.label':          { en: 'Attached:',                           ar: 'المرفقات:' },
  'chat.attachments.remove_aria':    { en: 'Remove attached document',            ar: 'إزالة المستند المرفق' },

  // -- Chat welcome --
  'chat.welcome.title':              { en: "Hello, I'm Saul",                     ar: 'مرحباً، أنا سول' },
  'chat.welcome.subtitle':           { en: 'Your AI Legal Copilot. I can analyze contracts, detect risks, find similar cases, generate reports, and help with all your legal intelligence needs.', ar: 'مساعدك القانوني الذكي. يمكنني تحليل العقود، واكتشاف المخاطر، والعثور على قضايا مشابهة، وإنشاء التقارير، والمساعدة في جميع احتياجاتك القانونية.' },
  'chat.welcome.prompts_label':      { en: 'Try asking me:',                      ar: 'جرب أن تسألني:' },
  'chat.prompt.analyze_nda':         { en: 'Analyze this NDA for risks and missing clauses',              ar: 'حلّل هذه الاتفاقية لاكتشاف المخاطر والبنود الناقصة' },
  'chat.prompt.liability_issues':    { en: 'What are the main liability issues in this contract?',        ar: 'ما هي أبرز مسائل المسؤولية في هذا العقد؟' },
  'chat.prompt.similar_cases':       { en: 'Find similar cases where unlimited liability was challenged', ar: 'ابحث عن قضايا مشابهة طُعن فيها في شرط المسؤولية غير المحدودة' },
  'chat.prompt.summarize_obligations':{ en: 'Summarize the key obligations for each party',             ar: 'لخّص الالتزامات الرئيسية لكل طرف' },
  'chat.prompt.create_timeline':     { en: 'Create a timeline of all important dates',                   ar: 'أنشئ جدولاً زمنياً لجميع التواريخ المهمة' },
  'chat.prompt.risk_assessment':     { en: 'Generate a comprehensive risk assessment report',            ar: 'أنشئ تقريراً شاملاً لتقييم المخاطر' },
  'chat.prompt.contradictions':      { en: 'Check for contradictions within the document',              ar: 'تحقق من التناقضات في المستند' },
  'chat.prompt.legal_options':       { en: 'What are my legal options based on this agreement?',        ar: 'ما هي خياراتي القانونية بناءً على هذه الاتفاقية؟' },

  // -- Chat messages --
  'chat.msg.thinking':               { en: 'Saul is thinking...',                 ar: 'سول يفكر...' },
  'chat.msg.new_conversation':       { en: 'New Conversation',                    ar: 'محادثة جديدة' },
  'chat.msg.today':                  { en: 'Today',                               ar: 'اليوم' },
  'chat.msg.yesterday':              { en: 'Yesterday',                           ar: 'أمس' },

  // -- Chat document picker --
  'chat.doc_picker.title':           { en: 'Attach Documents',                    ar: 'إرفاق المستندات' },
  'chat.doc_picker.close_aria':      { en: 'Close document picker',               ar: 'إغلاق منتقي المستندات' },
  'chat.doc_picker.empty':           { en: 'No documents yet.',                   ar: 'لا توجد مستندات بعد.' },
  'chat.doc_picker.upload_link':     { en: 'Upload one first',                    ar: 'ارفع مستنداً أولاً' },

  // -- Chat input --
  'chat.input.placeholder':          { en: 'Ask Saul anything about your legal documents...', ar: 'اسأل سول أي شيء عن مستنداتك القانونية...' },
  'chat.input.aria':                 { en: 'Message to Saul',                     ar: 'رسالة إلى سول' },
  'chat.input.attach_aria':          { en: 'Attach documents',                    ar: 'إرفاق مستندات' },
  'chat.input.stop_aria':            { en: 'Stop streaming',                      ar: 'إيقاف البث' },
  'chat.input.send_aria':            { en: 'Send message',                        ar: 'إرسال الرسالة' },
  'chat.input.hint':                 { en: 'Saul uses OCR, legal search, and GPT-4o to analyze your documents. Press Enter to send, Shift+Enter for new line.', ar: 'يستخدم سول OCR والبحث القانوني وGPT-4o لتحليل مستنداتك. اضغط Enter للإرسال، وShift+Enter لسطر جديد.' },

  // -- Chat toasts --
  'chat.toast.deleted':              { en: 'Conversation deleted',                ar: 'تم حذف المحادثة' },
  'chat.toast.error':                { en: 'Saul encountered an error',           ar: 'واجه سول خطأً' },
  'chat.toast.error_detail':         { en: 'Please try again',                    ar: 'يرجى المحاولة مرة أخرى' },

  // -- Analysis page --
  'analysis.page.back':              { en: 'Back',                                ar: 'رجوع' },
  'analysis.page.title':             { en: 'AI Analysis Results',                 ar: 'نتائج تحليل الذكاء الاصطناعي' },
  'analysis.page.subtitle':          { en: 'Powered by Saul — AI Legal Copilot', ar: 'مدعوم بسول — المساعد القانوني الذكي' },
  'analysis.page.re_analyze':        { en: 'Re-analyze',                          ar: 'إعادة التحليل' },
  'analysis.page.analyzing':         { en: 'Analyzing...',                        ar: 'جارٍ التحليل...' },
  'analysis.page.generate_report':   { en: 'Generate Report',                     ar: 'إنشاء تقرير' },
  'analysis.page.empty_title':       { en: 'No Analysis Available',               ar: 'لا يوجد تحليل متاح' },
  'analysis.page.empty_desc':        { en: 'Run an AI analysis to detect risks, extract entities, and get legal recommendations.', ar: 'شغِّل تحليل الذكاء الاصطناعي لاكتشاف المخاطر واستخراج الكيانات والحصول على توصيات قانونية.' },
  'analysis.page.start_analysis':    { en: 'Start Analysis',                      ar: 'بدء التحليل' },

  // -- Analysis overview cards --
  'analysis.overview.risk_score':    { en: 'Overall Risk Score',                  ar: 'درجة المخاطر الإجمالية' },
  'analysis.overview.critical':      { en: 'Critical Risks',                      ar: 'المخاطر الحرجة' },
  'analysis.overview.high':          { en: 'High Risks',                          ar: 'المخاطر العالية' },
  'analysis.overview.contradictions':{ en: 'Contradictions',                      ar: 'التناقضات' },
  'analysis.overview.recommendations':{ en: 'Recommendations',                    ar: 'التوصيات' },
  'analysis.overview.entities':      { en: 'Entities Found',                      ar: 'الكيانات المكتشفة' },
  'analysis.overview.high_risk':     { en: 'High Risk',                           ar: 'مخاطر عالية' },
  'analysis.overview.medium_risk':   { en: 'Medium Risk',                         ar: 'مخاطر متوسطة' },
  'analysis.overview.low_risk':      { en: 'Low Risk',                            ar: 'مخاطر منخفضة' },

  // -- Analysis tabs --
  'analysis.tab.summary':            { en: 'Summary',                             ar: 'الملخص' },
  'analysis.tab.risks':              { en: 'Risks',                               ar: 'المخاطر' },
  'analysis.tab.clauses':            { en: 'Clauses',                             ar: 'البنود' },
  'analysis.tab.entities':           { en: 'Entities',                            ar: 'الكيانات' },
  'analysis.tab.contradictions':     { en: 'Contradictions',                      ar: 'التناقضات' },
  'analysis.tab.recommendations':    { en: 'Recommendations',                     ar: 'التوصيات' },
  'analysis.tabs.aria':              { en: 'Analysis sections',                   ar: 'أقسام التحليل' },

  // -- Analysis summary tab --
  'analysis.summary.saul_badge':     { en: "Saul's Analysis",                     ar: 'تحليل سول' },
  'analysis.summary.generated_by':   { en: 'Generated by Saul AI',                ar: 'مُنشأ بواسطة سول الذكي' },
  'analysis.summary.key_findings':   { en: 'Key Findings',                        ar: 'النتائج الرئيسية' },

  // -- Analysis risks tab --
  'analysis.risks.empty':            { en: 'No risks detected — document appears to be well-structured.', ar: 'لا توجد مخاطر مكتشفة — يبدو المستند منظماً بشكل جيد.' },
  'analysis.risks.affects':          { en: 'Affects:',                            ar: 'يؤثر على:' },
  'analysis.risks.confidence':       { en: '{0}% confidence',                     ar: '{0}٪ ثقة' },
  'analysis.risks.recommendation':   { en: 'Recommendation',                      ar: 'التوصية' },

  // -- Analysis clauses tab --
  'analysis.clauses.risks_singular': { en: 'risk',                                ar: 'خطر' },
  'analysis.clauses.risks_plural':   { en: 'risks',                               ar: 'مخاطر' },

  // -- Analysis entities tab --
  'analysis.entities.mentions_singular': { en: 'mention',                         ar: 'إشارة' },
  'analysis.entities.mentions_plural':   { en: 'mentions',                        ar: 'إشارات' },

  // -- Analysis contradictions tab --
  'analysis.contradictions.empty':   { en: 'No contradictions detected in this document.', ar: 'لا توجد تناقضات في هذا المستند.' },

  // -- Analysis recommendations tab (re-uses common) --
  'analysis.rec.action_items':       { en: 'Action Items:',                       ar: 'إجراءات مطلوبة:' },

  // -- Analysis toasts --
  'analysis.toast.complete':         { en: 'Analysis complete',                   ar: 'اكتمل التحليل' },

  // -- Recommendations page --
  'rec.page.title':                  { en: 'AI Recommendations',                  ar: 'توصيات الذكاء الاصطناعي' },
  'rec.page.subtitle':               { en: 'Actionable legal recommendations from Saul based on your cases and documents', ar: 'توصيات قانونية قابلة للتنفيذ من سول بناءً على قضاياك ومستنداتك' },
  'rec.page.ask_saul':               { en: 'Ask Saul',                            ar: 'اسأل سول' },
  'rec.page.empty':                  { en: 'No recommendations for this priority level', ar: 'لا توجد توصيات لهذا المستوى من الأولوية' },
  'rec.priority.all':                { en: 'All',                                 ar: 'الكل' },
  'rec.priority.urgent':             { en: 'Urgent',                              ar: 'عاجلة' },
  'rec.priority.high':               { en: 'High',                                ar: 'عالية' },
  'rec.priority.medium':             { en: 'Medium',                              ar: 'متوسطة' },
  'rec.priority.low':                { en: 'Low',                                 ar: 'منخفضة' },

  // -- Similar Cases page --
  'similar.page.title':              { en: 'Similar Cases',                       ar: 'قضايا مشابهة' },
  'similar.page.subtitle':           { en: 'AI-powered retrieval of relevant legal precedents and judgments', ar: 'استرجاع السوابق القانونية وأحكام المحاكم ذات الصلة بالذكاء الاصطناعي' },
  'similar.search.placeholder':      { en: 'Describe your legal situation to find similar cases...', ar: 'صف وضعك القانوني للعثور على قضايا مشابهة...' },
  'similar.search.aria':             { en: 'Search similar cases',                ar: 'ابحث في القضايا المشابهة' },
  'similar.search.btn':              { en: 'Find Similar',                        ar: 'ابحث عن مشابه' },
  'similar.card.outcome':            { en: 'Outcome',                             ar: 'النتيجة' },
  'similar.card.match':              { en: 'Match',                               ar: 'تطابق' },
  'similar.empty.title':             { en: 'No similar cases found',              ar: 'لا توجد قضايا مشابهة' },
  'similar.empty.desc':              { en: 'Try describing your legal situation in more detail', ar: 'جرب وصف وضعك القانوني بمزيد من التفاصيل' },

  // -- Insights page --
  'insights.page.title':             { en: 'Legal Insights',                      ar: 'الرؤى القانونية' },
  'insights.page.subtitle':          { en: 'Analytics and trends across your legal matters', ar: 'التحليلات والاتجاهات عبر قضاياك القانونية' },
  'insights.period.7d':              { en: 'Last 7 days',                         ar: 'آخر 7 أيام' },
  'insights.period.30d':             { en: 'Last 30 days',                        ar: 'آخر 30 يوماً' },
  'insights.period.90d':             { en: 'Last 90 days',                        ar: 'آخر 90 يوماً' },
  'insights.period.1y':              { en: 'Last year',                           ar: 'السنة الماضية' },
  'insights.kpi.avg_analysis_time':  { en: 'Avg Analysis Time',                   ar: 'متوسط وقت التحليل' },
  'insights.kpi.risk_detection':     { en: 'Risk Detection Rate',                 ar: 'معدل اكتشاف المخاطر' },
  'insights.kpi.doc_coverage':       { en: 'Document Coverage',                   ar: 'تغطية المستندات' },
  'insights.kpi.avg_risk_score':     { en: 'Avg Risk Score',                      ar: 'متوسط درجة المخاطر' },
  'insights.chart.activity':         { en: 'Activity Overview',                   ar: 'نظرة عامة على النشاط' },
  'insights.chart.cases_opened':     { en: 'Cases Opened',                        ar: 'القضايا المفتوحة' },
  'insights.chart.cases_closed':     { en: 'Cases Closed',                        ar: 'القضايا المغلقة' },
  'insights.chart.docs_processed':   { en: 'Docs Processed',                      ar: 'المستندات المعالجة' },
  'insights.chart.ai_queries':       { en: 'AI Queries',                          ar: 'استعلامات الذكاء الاصطناعي' },
  'insights.chart.top_risk':         { en: 'Top Risk Categories',                 ar: 'أبرز فئات المخاطر' },
  'insights.chart.contract_types':   { en: 'Contract Types Analyzed',             ar: 'أنواع العقود المحللة' },
  'insights.chart.avg_risk':         { en: 'Average Risk Score',                  ar: 'متوسط درجة المخاطر' },
  'insights.risk.low':               { en: '● Low',                               ar: '● منخفضة' },
  'insights.risk.medium':            { en: '● Medium',                            ar: '● متوسطة' },
  'insights.risk.high':              { en: '● High',                              ar: '● عالية' },
  'insights.risk.avg_label':         { en: 'avg risk score',                      ar: 'متوسط درجة المخاطر' },

  // -- Workspace page --
  'workspace.hero.title':            { en: 'Investigation Workspace',             ar: 'مساحة عمل التحقيق' },
  'workspace.hero.subtitle':         { en: 'Your centralized hub for legal research, analysis, and AI-powered investigation tools.', ar: 'مركزك الموحد للبحث القانوني والتحليل وأدوات التحقيق المدعومة بالذكاء الاصطناعي.' },
  'workspace.stat.tool_uses':        { en: 'Tool Uses',                           ar: 'استخدامات الأدوات' },
  'workspace.stat.quick_actions':    { en: 'Quick Actions',                       ar: 'إجراءات سريعة' },
  'workspace.stat.ai_capabilities':  { en: 'AI Capabilities',                     ar: 'قدرات الذكاء الاصطناعي' },
  'workspace.section.quick_actions': { en: 'Quick Actions',                       ar: 'إجراءات سريعة' },
  'workspace.section.saul_ai':       { en: 'Saul AI Capabilities',                ar: 'قدرات سول الذكي' },
  'workspace.section.recent_tools':  { en: 'Recently Used Tools',                 ar: 'الأدوات المستخدمة مؤخراً' },
  'workspace.section.ai_activity':   { en: 'AI Activity Overview',                ar: 'نظرة عامة على نشاط الذكاء الاصطناعي' },
  'workspace.status.title':          { en: 'Saul AI — Online',                    ar: 'سول الذكي — متصل' },
  'workspace.status.body':           { en: 'All AI systems operational. GPT-4o model active.', ar: 'جميع أنظمة الذكاء الاصطناعي تعمل. نموذج GPT-4o نشط.' },
  'workspace.status.start':          { en: 'Start Investigation',                 ar: 'بدء التحقيق' },

  // -- Workspace quick links --
  'workspace.link.upload':           { en: 'Upload Document',                     ar: 'رفع مستند' },
  'workspace.link.upload_desc':      { en: 'Add a new document for AI analysis',  ar: 'أضف مستنداً جديداً لتحليل الذكاء الاصطناعي' },
  'workspace.link.chat':             { en: 'Ask Saul',                            ar: 'اسأل سول' },
  'workspace.link.chat_desc':        { en: 'Chat with your AI legal copilot',     ar: 'تحدث مع مساعدك القانوني الذكي' },
  'workspace.link.new_case':         { en: 'New Case',                            ar: 'قضية جديدة' },
  'workspace.link.new_case_desc':    { en: 'Open a new legal matter',             ar: 'افتح قضية قانونية جديدة' },
  'workspace.link.search':           { en: 'Search Laws',                         ar: 'البحث القانوني' },
  'workspace.link.search_desc':      { en: 'Find relevant legal references',      ar: 'ابحث عن المراجع القانونية ذات الصلة' },
  'workspace.link.reports':          { en: 'Generate Report',                     ar: 'إنشاء تقرير' },
  'workspace.link.reports_desc':     { en: 'Create an AI legal report',           ar: 'أنشئ تقريراً قانونياً بالذكاء الاصطناعي' },
  'workspace.link.timeline':         { en: 'View Timeline',                       ar: 'عرض الجدول الزمني' },
  'workspace.link.timeline_desc':    { en: 'Visualize case chronology',           ar: 'تصور التسلسل الزمني للقضية' },

  // -- Workspace recent tools --
  'workspace.tool.contract_analyzer':  { en: 'Contract Analyzer',                 ar: 'محلل العقود' },
  'workspace.tool.risk_detector':      { en: 'Risk Detector',                     ar: 'كاشف المخاطر' },
  'workspace.tool.legal_search':       { en: 'Legal Search',                      ar: 'البحث القانوني' },
  'workspace.tool.report_generator':   { en: 'Report Generator',                  ar: 'مُنشئ التقارير' },
  'workspace.tool.2h_ago':            { en: '2 hours ago',                        ar: 'منذ ساعتين' },
  'workspace.tool.yesterday':         { en: 'Yesterday',                          ar: 'أمس' },
  'workspace.tool.30min_ago':         { en: '30 minutes ago',                     ar: 'منذ 30 دقيقة' },
  'workspace.tool.3d_ago':            { en: '3 days ago',                         ar: 'منذ 3 أيام' },

  // -- Workspace activity items --
  'workspace.activity.analyses':      { en: 'Contract Analyses',                  ar: 'تحليلات العقود' },
  'workspace.activity.searches':      { en: 'Legal Searches',                     ar: 'عمليات البحث القانوني' },
  'workspace.activity.reports':       { en: 'Reports Generated',                  ar: 'التقارير المُنشأة' },
  'workspace.activity.timelines':     { en: 'Timelines Built',                    ar: 'الجداول الزمنية المُنشأة' },
  'workspace.activity.graph':         { en: 'Graph Queries',                      ar: 'استعلامات الرسم البياني' },

  // ── PHASE 7: KNOWLEDGE GRAPH LOCALIZATION ─────────────────────────────────

  // -- Graph page header --
  'graph.page.title':                { en: 'Legal Knowledge Graph',               ar: 'الرسم البياني للمعرفة القانونية' },
  'graph.page.subtitle':             { en: 'Entity relationships and legal connections', ar: 'علاقات الكيانات والروابط القانونية' },
  'graph.back':                      { en: 'Cases',                               ar: 'القضايا' },

  // -- Graph stats bar --
  'graph.stat.entities':             { en: 'Entities',                            ar: 'الكيانات' },
  'graph.stat.relationships':        { en: 'Relationships',                       ar: 'العلاقات' },

  // -- Graph controls --
  'graph.controls.layout':           { en: 'Layout',                              ar: 'التخطيط' },
  'graph.controls.zoom':             { en: 'Zoom',                                ar: 'التكبير' },
  'graph.controls.zoom_in':          { en: 'Zoom In',                             ar: 'تكبير' },
  'graph.controls.fit':              { en: 'Fit to Screen',                       ar: 'ملاءمة الشاشة' },
  'graph.controls.zoom_out':         { en: 'Zoom Out',                            ar: 'تصغير' },

  // -- Graph loading state --
  'graph.loading':                   { en: 'Building knowledge graph…',           ar: 'جارٍ بناء الرسم البياني المعرفي…' },

  // -- Graph info panel (node) --
  'graph.info.type':                 { en: 'Type',                                ar: 'النوع' },
  'graph.info.close_node':           { en: 'Close node details',                  ar: 'إغلاق تفاصيل العقدة' },

  // -- Graph info panel (edge) --
  'graph.info.relationship':         { en: 'Relationship',                        ar: 'العلاقة' },
  'graph.info.strength':             { en: 'Strength',                            ar: 'القوة' },
  'graph.info.close_edge':           { en: 'Close relationship details',          ar: 'إغلاق تفاصيل العلاقة' },

  // -- Graph layout labels --
  'graph.layout.force':              { en: 'Force-directed',                      ar: 'موجّه بالقوة' },
  'graph.layout.circle':             { en: 'Circle',                              ar: 'دائري' },
  'graph.layout.grid':               { en: 'Grid',                                ar: 'شبكي' },
  'graph.layout.hierarchical':       { en: 'Hierarchical',                        ar: 'هرمي' },

  // -- Graph node type labels --
  'graph.node_type.person':          { en: 'Person',                              ar: 'شخص' },
  'graph.node_type.organization':    { en: 'Organization',                        ar: 'مؤسسة' },
  'graph.node_type.date':            { en: 'Date',                                ar: 'تاريخ' },
  'graph.node_type.money':           { en: 'Financial',                           ar: 'مالي' },
  'graph.node_type.location':        { en: 'Location',                            ar: 'موقع' },
  'graph.node_type.law':             { en: 'Law/Statute',                         ar: 'قانون / تشريع' },
  'graph.node_type.case':            { en: 'Case',                                ar: 'قضية' },
  'graph.node_type.clause':          { en: 'Clause',                              ar: 'بند' },

  // -- Workspace Saul features --
  'workspace.feat.ocr':              { en: 'OCR Extraction',                      ar: 'استخراج النص (OCR)' },
  'workspace.feat.ocr_desc':         { en: 'Arabic & English text extraction from scanned documents and images', ar: 'استخراج النص العربي والإنجليزي من المستندات الممسوحة ضوئياً والصور' },
  'workspace.feat.contract':         { en: 'Contract Analysis',                   ar: 'تحليل العقود' },
  'workspace.feat.contract_desc':    { en: 'Automatic risk detection, clause analysis, and entity extraction', ar: 'اكتشاف المخاطر التلقائي وتحليل البنود واستخراج الكيانات' },
  'workspace.feat.search':           { en: 'Legal RAG Search',                    ar: 'البحث القانوني الدلالي' },
  'workspace.feat.search_desc':      { en: 'Semantic search across laws, judgments, and legal databases', ar: 'البحث الدلالي في القوانين والأحكام وقواعد البيانات القانونية' },
  'workspace.feat.timeline':         { en: 'Timeline Reconstruction',             ar: 'إعادة بناء الجدول الزمني' },
  'workspace.feat.timeline_desc':    { en: 'Automatic chronological event extraction from legal documents', ar: 'استخراج الأحداث الزمنية تلقائياً من المستندات القانونية' },
  'workspace.feat.graph':            { en: 'Knowledge Graph',                     ar: 'الرسم البياني المعرفي' },
  'workspace.feat.graph_desc':       { en: 'Visual entity relationship mapping for complex legal matters', ar: 'رسم خرائط العلاقات البصرية للكيانات في القضايا القانونية المعقدة' },
  'workspace.feat.report':           { en: 'Report Generation',                   ar: 'إنشاء التقارير' },
  'workspace.feat.report_desc':      { en: 'Comprehensive AI-generated legal reports in PDF or Word format', ar: 'تقارير قانونية شاملة مُنشأة بالذكاء الاصطناعي بصيغة PDF أو Word' },

  // ── PHASE 8: LANDING PAGE LOCALIZATION ──────────────────────────────────────

  // -- Nav --
  'landing.brand_tag':               { en: 'AI Legal Platform',                   ar: 'منصة قانونية بالذكاء الاصطناعي' },
  'landing.nav.features':            { en: 'Features',                            ar: 'الميزات' },
  'landing.nav.how_it_works':        { en: 'How It Works',                        ar: 'كيف يعمل' },
  'landing.nav.testimonials':        { en: 'Testimonials',                        ar: 'آراء العملاء' },
  'landing.nav.sign_in':             { en: 'Sign In',                             ar: 'تسجيل الدخول' },
  'landing.nav.get_started':         { en: 'Get Started Free',                    ar: 'ابدأ مجاناً' },

  // -- Hero --
  'landing.hero.badge':              { en: 'Powered by GPT-4o + Advanced Legal AI', ar: 'مدعوم بـ GPT-4o وذكاء اصطناعي قانوني متقدم' },
  'landing.hero.title_line1':        { en: 'Your Personal',                       ar: 'محاميك' },
  'landing.hero.title_gradient':     { en: 'AI Lawyer',                           ar: 'الشخصي بالذكاء الاصطناعي' },
  'landing.hero.subtitle':           { en: 'AegisLex is the enterprise AI legal intelligence platform that helps lawyers, companies, and legal teams analyze contracts, detect risks, retrieve laws, and generate comprehensive legal reports — in seconds.', ar: 'إيجيس ليكس هي منصة الذكاء الاصطناعي القانوني للمؤسسات التي تساعد المحامين والشركات والفرق القانونية على تحليل العقود واكتشاف المخاطر واسترجاع القوانين وإنشاء تقارير قانونية شاملة — في ثوانٍ.' },
  'landing.hero.cta_primary':        { en: 'Start for Free',                      ar: 'ابدأ مجاناً' },
  'landing.hero.cta_secondary':      { en: 'Watch Demo',                          ar: 'شاهد العرض التوضيحي' },
  'landing.hero.stat.documents':     { en: 'Documents Analyzed',                  ar: 'مستندات تم تحليلها' },
  'landing.hero.stat.ocr_accuracy':  { en: 'OCR Accuracy',                        ar: 'دقة استخراج النص' },
  'landing.hero.stat.avg_time':      { en: 'Avg Analysis Time',                   ar: 'متوسط وقت التحليل' },
  'landing.hero.stat.jurisdictions': { en: 'Legal Jurisdictions',                 ar: 'ولايات قضائية' },

  // -- Hero chat preview mockup --
  'landing.chat.status':             { en: 'AI Legal Copilot • Active',           ar: 'المساعد القانوني الذكي • نشط' },
  'landing.chat.user_msg_1':         { en: 'Analyze this NDA for potential risks', ar: 'حلل اتفاقية عدم الإفشاء هذه بحثاً عن المخاطر المحتملة' },
  'landing.chat.saul_intro':         { en: "I've analyzed the NDA and found",     ar: 'لقد حللت اتفاقية عدم الإفشاء ووجدت' },
  'landing.chat.risks_count':        { en: '3 critical risks',                    ar: '3 مخاطر حرجة' },
  'landing.chat.risk_item_1':        { en: '🔴 Overly broad confidentiality scope (Clause 2.1)', ar: '🔴 نطاق سرية واسع جداً (البند 2.1)' },
  'landing.chat.risk_item_2':        { en: '🟡 Unlimited liability exposure (Clause 8.3)', ar: '🟡 تعرّض غير محدود للمسؤولية (البند 8.3)' },
  'landing.chat.risk_item_3':        { en: '🟡 Missing dispute resolution mechanism', ar: '🟡 غياب آلية لحل النزاعات' },
  'landing.chat.user_msg_2':         { en: 'Generate a risk report',              ar: 'إنشاء تقرير مخاطر' },
  'landing.chat.saul_response_2':    { en: 'Generating comprehensive risk report... ✓ Report ready with 12 recommendations.', ar: 'جاري إنشاء تقرير مخاطر شامل... ✓ التقرير جاهز مع 12 توصية.' },
  'landing.risk_card.critical_title':{ en: 'Critical Risk Detected',              ar: 'تم اكتشاف خطر حرج' },
  'landing.risk_card.critical_desc': { en: 'Unlimited liability clause',          ar: 'بند مسؤولية غير محدودة' },
  'landing.risk_card.complete_title':{ en: 'Analysis Complete',                   ar: 'اكتمل التحليل' },
  'landing.risk_card.complete_desc':{ en: '47 clauses reviewed',                  ar: 'تمت مراجعة 47 بنداً' },

  // -- Features section --
  'landing.features.badge':          { en: 'Capabilities',                       ar: 'القدرات' },
  'landing.features.title_line1':    { en: 'Everything You Need for',            ar: 'كل ما تحتاجه من' },
  'landing.features.title_line2':    { en: 'Enterprise Legal Intelligence',      ar: 'ذكاء قانوني للمؤسسات' },
  'landing.features.subtitle':       { en: 'AegisLex combines cutting-edge AI with deep legal domain expertise to deliver a complete platform for modern legal teams.', ar: 'تجمع إيجيس ليكس بين الذكاء الاصطناعي المتطور والخبرة القانونية العميقة لتقديم منصة كاملة للفرق القانونية الحديثة.' },
  'landing.features.item1.title':    { en: 'Saul — AI Legal Copilot',            ar: 'سول — المساعد القانوني الذكي' },
  'landing.features.item1.desc':     { en: 'Your intelligent legal assistant powered by GPT-4o. Saul orchestrates all AI capabilities to provide expert legal reasoning, analysis, and recommendations.', ar: 'مساعدك القانوني الذكي المدعوم بـ GPT-4o. ينسّق سول جميع قدرات الذكاء الاصطناعي لتقديم تحليل واستدلال وتوصيات قانونية خبيرة.' },
  'landing.features.item2.title':    { en: 'OCR & Document Intelligence',        ar: 'استخراج النص وذكاء المستندات' },
  'landing.features.item2.desc':     { en: 'Extract text from scanned PDFs, images, and handwritten documents in Arabic and English with 99%+ accuracy using PaddleOCR and Tesseract.', ar: 'استخراج النص من ملفات PDF الممسوحة ضوئياً والصور والمستندات اليدوية بالعربية والإنجليزية بدقة تتجاوز 99% باستخدام PaddleOCR وTesseract.' },
  'landing.features.item3.title':    { en: 'Contract Risk Analysis',             ar: 'تحليل مخاطر العقود' },
  'landing.features.item3.desc':     { en: 'Automatically detect risks, contradictions, and unfavorable clauses in contracts. Get risk scores and actionable recommendations instantly.', ar: 'اكتشاف المخاطر والتناقضات والبنود غير المواتية في العقود تلقائياً. الحصول على درجات المخاطر وتوصيات قابلة للتنفيذ فوراً.' },
  'landing.features.item4.title':    { en: 'Legal Knowledge Graph',              ar: 'الرسم البياني المعرفي القانوني' },
  'landing.features.item4.desc':     { en: 'Visualize entities, relationships, and legal connections in an interactive graph. Understand complex legal networks at a glance.', ar: 'تصور الكيانات والعلاقات والروابط القانونية في رسم بياني تفاعلي. فهم الشبكات القانونية المعقدة بنظرة واحدة.' },
  'landing.features.item5.title':    { en: 'Timeline Reconstruction',            ar: 'إعادة بناء الجدول الزمني' },
  'landing.features.item5.desc':     { en: 'Automatically extract and reconstruct chronological event timelines from legal documents, contracts, and case files.', ar: 'استخراج وإعادة بناء الجدول الزمني للأحداث تلقائياً من المستندات القانونية والعقود وملفات القضايا.' },
  'landing.features.item6.title':    { en: 'Semantic Legal Search',              ar: 'البحث القانوني الدلالي' },
  'landing.features.item6.desc':     { en: 'Find similar cases, relevant laws, and legal precedents using advanced RAG and semantic search across your entire document library.', ar: 'إيجاد قضايا مشابهة وقوانين ذات صلة وسوابق قانونية باستخدام البحث الدلالي المتقدم (RAG) في مكتبة مستنداتك الكاملة.' },

  // -- How it works section --
  'landing.how.badge':               { en: 'Process',                            ar: 'العملية' },
  'landing.how.title_line1':         { en: 'From Document to Insight',           ar: 'من المستند إلى الرؤية' },
  'landing.how.title_line2':         { en: 'in 3 Simple Steps',                  ar: 'في 3 خطوات بسيطة' },
  'landing.how.step1.title':         { en: 'Upload Any Document',                ar: 'رفع أي مستند' },
  'landing.how.step1.desc':          { en: 'PDFs, scanned images, Word docs, or photos of documents in Arabic or English. Saul handles everything.', ar: 'ملفات PDF أو صور ممسوحة ضوئياً أو مستندات Word أو صور لمستندات بالعربية أو الإنجليزية. سول يتولى كل شيء.' },
  'landing.how.step2.title':         { en: 'AI Processes & Analyzes',            ar: 'الذكاء الاصطناعي يعالج ويحلل' },
  'landing.how.step2.desc':          { en: 'Saul orchestrates OCR, NLP, risk detection, entity extraction, and semantic search simultaneously.', ar: 'ينسّق سول استخراج النص ومعالجة اللغة واكتشاف المخاطر واستخراج الكيانات والبحث الدلالي في الوقت نفسه.' },
  'landing.how.step3.title':         { en: 'Get Actionable Intelligence',        ar: 'احصل على ذكاء قابل للتنفيذ' },
  'landing.how.step3.desc':          { en: 'Receive risk reports, timelines, legal graphs, recommendations, and chat with Saul about your documents.', ar: 'احصل على تقارير المخاطر والجداول الزمنية والرسوم البيانية القانونية والتوصيات، وتحدث مع سول حول مستنداتك.' },

  // -- Testimonials section --
  'landing.testimonials.badge':      { en: 'Testimonials',                       ar: 'آراء العملاء' },
  'landing.testimonials.title_line1':{ en: 'Trusted by Legal Professionals',     ar: 'موثوق به من قبل المتخصصين القانونيين' },
  'landing.testimonials.title_line2':{ en: 'Worldwide',                          ar: 'حول العالم' },
  'landing.testimonials.item1.quote':{ en: 'AegisLex transformed how our firm handles due diligence. What took weeks now takes hours.', ar: 'غيّرت إيجيس ليكس طريقة تعامل شركتنا مع الفحص النافي للجهالة. ما كان يستغرق أسابيع يستغرق الآن ساعات.' },
  'landing.testimonials.item1.role': { en: 'Senior Partner, Al-Mansouri & Associates', ar: 'شريك أول، المنصوري وشركاه' },
  'landing.testimonials.item2.quote':{ en: "Saul's contract analysis caught a critical clause our team missed. It paid for itself in the first week.", ar: 'اكتشف تحليل سول للعقود بنداً حرجاً فاته فريقنا. لقد عوّض تكلفته في الأسبوع الأول.' },
  'landing.testimonials.item2.role':{ en: 'General Counsel, TechVentures Corp',   ar: 'المستشار العام، تك فنتشرز كورب' },
  'landing.testimonials.item3.quote':{ en: 'The multilingual OCR for Arabic legal documents is exceptional. Finally a solution built for our market.', ar: 'استخراج النص متعدد اللغات للمستندات القانونية العربية استثنائي. أخيراً حل مصمم لسوقنا.' },
  'landing.testimonials.item3.role':{ en: 'Legal Director, Gulf Investment Authority', ar: 'المدير القانوني، هيئة الاستثمار الخليجية' },

  // -- CTA section --
  'landing.cta.title':               { en: 'Start Your Free Trial Today',         ar: 'ابدأ تجربتك المجانية اليوم' },
  'landing.cta.subtitle':            { en: "Join thousands of legal professionals who trust AegisLex to protect their clients' interests. No credit card required.", ar: 'انضم إلى آلاف المتخصصين القانونيين الذين يثقون بإيجيس ليكس لحماية مصالح عملائهم. لا حاجة لبطاقة ائتمان.' },
  'landing.cta.primary':             { en: 'Get Started Free',                   ar: 'ابدأ مجاناً' },
  'landing.cta.secondary':           { en: 'Sign In to Dashboard',               ar: 'تسجيل الدخول إلى لوحة التحكم' },

  // -- Footer --
  'landing.footer.copyright':        { en: '© 2024 AegisLex. Enterprise AI Legal Platform. All rights reserved.', ar: '© 2024 إيجيس ليكس. منصة قانونية للذكاء الاصطناعي للمؤسسات. جميع الحقوق محفوظة.' },
  'landing.footer.privacy':          { en: 'Privacy',                            ar: 'الخصوصية' },
  'landing.footer.terms':            { en: 'Terms',                              ar: 'الشروط' },
  'landing.footer.security':         { en: 'Security',                           ar: 'الأمان' },
  'landing.footer.contact':          { en: 'Contact',                            ar: 'التواصل' },

  // ── PHASE 8: GLOBAL ERROR INFRASTRUCTURE LOCALIZATION ───────────────────────
  // Used by ErrorMapper.toUserMessage() / ErrorService / GlobalErrorHandler —
  // these run outside component templates, so callers resolve these keys via
  // LanguageService.t() before passing text to ToastService.

  'error.toast.generic_title':       { en: 'Error',                              ar: 'خطأ' },
  'error.toast.unexpected_title':    { en: 'Unexpected Error',                   ar: 'خطأ غير متوقع' },
  'error.toast.refresh_message':     { en: 'Something went wrong. Please refresh the page.', ar: 'حدث خطأ ما. يرجى تحديث الصفحة.' },
  'error.toast.update_title':        { en: 'Update available',                   ar: 'يتوفر تحديث' },
  'error.toast.update_message':      { en: 'Please refresh the page.',           ar: 'يرجى تحديث الصفحة.' },

  'error.http.bad_request':          { en: 'Bad request.',                       ar: 'طلب غير صالح.' },
  'error.http.unauthorized':         { en: 'Authentication required.',           ar: 'المصادقة مطلوبة.' },
  'error.http.forbidden':            { en: 'You do not have permission.',        ar: 'لا تملك الصلاحية للقيام بذلك.' },
  'error.http.not_found':            { en: 'Resource not found.',                ar: 'المورد غير موجود.' },
  'error.http.validation_failed':    { en: 'Validation failed.',                 ar: 'فشل التحقق من صحة البيانات.' },
  'error.http.too_many_requests':    { en: 'Too many requests.',                 ar: 'طلبات كثيرة جداً.' },
  'error.http.server_error':         { en: 'Server error. Please try again.',    ar: 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' },
  'error.http.service_unavailable':  { en: 'Service unavailable.',               ar: 'الخدمة غير متوفرة.' },
  'error.http.unknown':              { en: 'An unexpected error occurred.',      ar: 'حدث خطأ غير متوقع.' },
  'error.http.no_connection':        { en: 'No internet connection.',            ar: 'لا يوجد اتصال بالإنترنت.' },

  'error.code.invalid_credentials':  { en: 'Invalid email or password.',                                ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
  'error.code.account_locked':       { en: 'Your account is temporarily locked. Please try again later.', ar: 'تم قفل حسابك مؤقتاً. يرجى المحاولة مرة أخرى لاحقاً.' },
  'error.code.account_disabled':     { en: 'Your account is disabled. Please contact support.',         ar: 'تم تعطيل حسابك. يرجى التواصل مع الدعم.' },
  'error.code.session_expired':      { en: 'Your session has expired. Please sign in again.',            ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.' },
  'error.code.network_error':        { en: 'A network error occurred. Please check your connection.',   ar: 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك.' },
  'error.code.too_many_requests':    { en: 'Too many attempts. Please wait a few minutes before trying again.', ar: 'محاولات كثيرة جداً. يرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى.' },
  'error.code.server_error':         { en: 'Something went wrong. Please try again.',                   ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },
  'error.code.service_unavailable':  { en: 'Service is temporarily unavailable. Please try again shortly.', ar: 'الخدمة غير متوفرة مؤقتاً. يرجى المحاولة مرة أخرى قريباً.' },
  'error.code.unexpected':           { en: 'An unexpected error occurred.',                              ar: 'حدث خطأ غير متوقع.' },

  // ── PHASE 8: MODAL / CONFIRM / ALERT DIALOG LOCALIZATION ────────────────────
  // ConfirmDialogService / AlertDialogService are currently unwired (no
  // template renders ModalService state yet), but are reviewed and localized
  // here per the "every component capable of displaying text" requirement.

  'modal.confirm':                   { en: 'Confirm',                            ar: 'تأكيد' },
  'modal.cancel':                    { en: 'Cancel',                             ar: 'إلغاء' },
  'modal.ok':                        { en: 'OK',                                 ar: 'حسناً' },
  'modal.stay':                      { en: 'Stay',                               ar: 'بقاء' },
  'modal.delete.title':              { en: 'Delete {0}?',                        ar: 'حذف {0}؟' },
  'modal.delete.message':            { en: 'This action cannot be undone. Are you sure you want to permanently delete this {0}?', ar: 'لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد أنك تريد حذف هذا {0} نهائياً؟' },
  'modal.delete.confirm_label':      { en: 'Delete',                             ar: 'حذف' },
  'modal.unsaved.title':             { en: 'Unsaved Changes',                    ar: 'تغييرات غير محفوظة' },
  'modal.unsaved.message':           { en: 'You have unsaved changes. Are you sure you want to leave this page?', ar: 'لديك تغييرات غير محفوظة. هل أنت متأكد أنك تريد ترك هذه الصفحة؟' },
  'modal.unsaved.confirm_label':     { en: 'Leave Page',                         ar: 'ترك الصفحة' },
  'modal.session_expired.title':     { en: 'Session Expired',                    ar: 'انتهت الجلسة' },
  'modal.session_expired.message':  { en: 'Your session has expired. Please sign in again.', ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.' },
  'modal.session_expired.confirm_label': { en: 'Sign In',                       ar: 'تسجيل الدخول' },
  'modal.permission_denied.title':  { en: 'Access Denied',                      ar: 'الوصول مرفوض' },
  'modal.permission_denied.message':{ en: 'You do not have permission to perform this action.', ar: 'لا تملك الصلاحية لتنفيذ هذا الإجراء.' },

  // -- Unsaved-changes browser-native confirm (used by unsavedChangesGuard) --
  'common.unsaved_changes_confirm':  { en: 'You have unsaved changes.\n\nAre you sure you want to leave this page?', ar: 'لديك تغييرات غير محفوظة.\n\nهل أنت متأكد أنك تريد ترك هذه الصفحة؟' },

  // -- Scale of Justice decorative SVG (brand icon, used across pages) --
  'common.scale_of_justice':         { en: 'Scale of Justice',                   ar: 'ميزان العدالة' },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly LANG_KEY = 'aegislex_language';

  private langSignal = signal<Language>(this.loadStoredLang());
  readonly currentLang = this.langSignal.asReadonly();
  readonly isRTL = () => this.langSignal() === 'ar';

  constructor() {
    this.applyLanguage(this.langSignal());

    effect(() => {
      this.applyLanguage(this.langSignal());
    });
  }

  setLanguage(lang: Language): void {
    this.langSignal.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  t(key: string, params?: Array<string | number>): string {
    const lang = this.langSignal();
    let str = TRANSLATIONS[key]?.[lang] ?? TRANSLATIONS[key]?.['en'] ?? key;
    if (params) {
      params.forEach((p, i) => { str = str.replace(`{${i}}`, String(p)); });
    }
    return str;
  }

  private applyLanguage(lang: Language): void {
    const html = document.documentElement;
    const isRTL = lang === 'ar';
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  }

  private loadStoredLang(): Language {
    try {
      const stored = localStorage.getItem(this.LANG_KEY) as Language | null;
      return stored === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
}
