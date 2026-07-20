import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';
import { LegalRelationship } from '@core/models';
import cytoscape from 'cytoscape';

interface GraphNode { id: string; label: string; type: string; }
interface LayoutOption { value: 'cose'|'circle'|'grid'|'breadthfirst'; label: string; icon: string; }

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') graphContainerRef!: ElementRef<HTMLDivElement>;
  private readonly mockService = inject(MockService);
  private readonly ngZone = inject(NgZone);
  readonly lang = inject(LanguageService);
  private cy: any = null;
  private initTimeout?: ReturnType<typeof setTimeout>;
  private buildFrame?: number;
  private resizeObserver?: ResizeObserver;
  private resizeDebounce?: ReturnType<typeof setTimeout>;

  loading = signal(true);
  selectedNode = signal<GraphNode | null>(null);
  selectedEdge = signal<{label:string;strength:number}|null>(null);
  nodeCount = signal(0);
  edgeCount = signal(0);
  layout = signal<'cose'|'circle'|'grid'|'breadthfirst'>('cose');

  readonly nodeTypeColors: Record<string,string> = {
    person:'#4e4eeb', organization:'#10b981', date:'#f59e0b', money:'#22c55e',
    location:'#8b5cf6', law:'#ef4444', case:'#0ea5e9', clause:'#f97316',
  };
  nodeTypes = Object.keys(this.nodeTypeColors);
  readonly layouts: LayoutOption[] = [
    {value:'cose',label:'graph.layout.force',icon:'hub'},
    {value:'circle',label:'graph.layout.circle',icon:'circle'},
    {value:'grid',label:'graph.layout.grid',icon:'grid_view'},
    {value:'breadthfirst',label:'graph.layout.hierarchical',icon:'account_tree'},
  ];

  private relationships: LegalRelationship[] = [];

  ngOnInit(): void {
    this.mockService.getDocumentAnalysis('doc-001').subscribe({
      next: (res: any) => { this.relationships = res.data.relationships || []; },
    });
  }

  ngAfterViewInit(): void {
    this.initTimeout = setTimeout(() => {
      // Flip the loading flag FIRST so the stats bar and controls panels
      // (each gated by `*ngIf="!loading()"`) are inserted into the DOM and
      // the `.graph-wrapper` flex layout settles to its final height.
      // Only then measure the container and build Cytoscape — otherwise
      // Cytoscape sizes its canvas and computes the initial layout against
      // the container's pre-settlement (taller) dimensions, and the graph
      // renders incorrectly sized/positioned until a later resize event
      // happens to fire.
      this.loading.set(false);
      this.buildFrame = requestAnimationFrame(() => {
        this.buildGraph();
        this.attachResizeObserver();
      });
    }, 800);
  }

  ngOnDestroy(): void {
    if (this.initTimeout) clearTimeout(this.initTimeout);
    if (this.buildFrame !== undefined) cancelAnimationFrame(this.buildFrame);
    if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
    if (this.resizeObserver) { this.resizeObserver.disconnect(); this.resizeObserver = undefined; }
    if (this.cy) { this.cy.destroy(); this.cy = null; }
  }

  /**
   * Attach a ResizeObserver to the cytoscape container element.
   * Whenever its dimensions change (viewport resize, sidebar toggle, etc.)
   * we notify cytoscape and re-fit — without re-running the layout so node
   * positions are preserved.  Debounced at 80 ms to avoid thrashing.
   */
  private attachResizeObserver(): void {
    const container = this.graphContainerRef?.nativeElement;
    if (!container || typeof ResizeObserver === 'undefined') return;

    // Run outside Angular's zone to avoid triggering unnecessary CD cycles.
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
        this.resizeDebounce = setTimeout(() => {
          if (this.cy) {
            this.cy.resize();   // recalculate internal canvas dimensions
            this.cy.fit(undefined, 40); // re-fit nodes with 40px padding
          }
        }, 80);
      });
      this.resizeObserver.observe(container);
    });
  }

  private buildGraph(): void {
    const container = this.graphContainerRef?.nativeElement;
    if (!container) return;
    const nodes = new Map<string, string>();
    const edges: any[] = [];
    this.relationships.forEach(rel => {
      if (!nodes.has(rel.sourceEntity)) nodes.set(rel.sourceEntity, this.inferType(rel.sourceEntity));
      if (!nodes.has(rel.targetEntity)) nodes.set(rel.targetEntity, this.inferType(rel.targetEntity));
      edges.push({ data: { id:`e-${edges.length}`, source:rel.sourceEntity, target:rel.targetEntity, label:rel.relationshipType, strength:rel.strength } });
    });
    this.nodeCount.set(nodes.size); this.edgeCount.set(edges.length);
    const isDark = document.documentElement.classList.contains('dark');
    const isRTL = this.lang.isRTL();
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const edgeColor = isDark ? '#334155' : '#cbd5e1';
    // Cytoscape renders to <canvas>, so it cannot read CSS custom properties —
    // the Arabic/English font choice has to be resolved here explicitly.
    const graphFontFamily = isRTL
      ? 'ThamanyaSans, IBM Plex Sans Arabic, Noto Sans Arabic, Segoe UI, Tahoma, sans-serif'
      : 'DM Sans, system-ui, sans-serif';
    this.cy = cytoscape({
      container,
      elements: [
        ...Array.from(nodes.entries()).map(([id,type]) => ({ data: { id, label: id.length>18?id.substring(0,16)+'…':id, fullLabel:id, type, color:this.nodeTypeColors[type]||'#64748b' } })),
        ...edges,
      ],
      style: [
        { selector:'node', style:{ 'background-color':'data(color)', label:'data(label)', color:textColor, 'font-size':'11px', 'font-family':graphFontFamily, 'font-weight':600 as any, 'text-valign':'bottom', 'text-halign':'center', 'text-margin-y':6, width:44, height:44, 'border-width':3, 'border-color':'#ffffff', 'border-opacity':0.3 } },
        { selector:'node:selected', style:{ 'border-width':4, 'border-opacity':0.9, width:56, height:56 } },
        { selector:'edge', style:{ width:2, 'line-color':edgeColor, 'target-arrow-color':edgeColor, 'target-arrow-shape':'triangle', 'curve-style':'bezier', label:'data(label)', 'font-size':'10px', color:isDark?'#94a3b8':'#64748b', 'font-family':graphFontFamily, 'text-rotation':'autorotate', 'text-background-color':isDark?'#1e293b':'#f8fafc', 'text-background-opacity':0.8, 'text-background-padding':'3px' } },
      ],
      layout: { name: this.layout() } as any,
      minZoom: 0.2, maxZoom: 3, wheelSensitivity: 0.3,
    });
    this.cy.on('tap','node',(evt: any) => { const n=evt.target; this.selectedNode.set({id:n.id(),label:n.data('fullLabel'),type:n.data('type')}); this.selectedEdge.set(null); });
    this.cy.on('tap','edge',(evt: any) => { const e=evt.target; this.selectedEdge.set({label:e.data('label'),strength:e.data('strength')}); this.selectedNode.set(null); });
    this.cy.on('tap',(evt: any) => { if(evt.target===this.cy){this.selectedNode.set(null);this.selectedEdge.set(null);} });
  }

  changeLayout(l: 'cose'|'circle'|'grid'|'breadthfirst'): void { this.layout.set(l); this.cy?.layout({name:l,animate:true,animationDuration:600}).run(); }
  fitGraph(): void { this.cy?.fit(undefined,40); }
  zoomIn(): void { if(this.cy) this.cy.zoom({level:(this.cy.zoom()||1)*1.3}); }
  zoomOut(): void { if(this.cy) this.cy.zoom({level:(this.cy.zoom()||1)*0.7}); }

  private inferType(name: string): string {
    if (/ltd|inc|corp|llc|group|authority|bank|solutions|industries|capital/i.test(name)) return 'organization';
    if (/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec.*\d{4}|\d{4}/i.test(name)&&name.length<25) return 'date';
    if (/^\$[\d,]+/.test(name)||/USD/.test(name)) return 'money';
    if (/clause|section|article/i.test(name)) return 'clause';
    if (/law|act|regulation|statute/i.test(name)) return 'law';
    if (/risk|critical|exposure/i.test(name)) return 'case';
    return 'person';
  }

  getNodeTypeLabel(t: string): string {
    const keyMap: Record<string,string> = {
      person:'graph.node_type.person', organization:'graph.node_type.organization',
      date:'graph.node_type.date', money:'graph.node_type.money',
      location:'graph.node_type.location', law:'graph.node_type.law',
      case:'graph.node_type.case', clause:'graph.node_type.clause',
    };
    return this.lang.t(keyMap[t] ?? t);
  }
  replaceUnderscores(s: string): string { return s.replace(/_/g,' '); }
  capitalize(s: string): string { return s?s.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '):s; }
}
