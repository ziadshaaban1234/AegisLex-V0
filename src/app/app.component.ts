import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AnalyticsService } from './core/services/analytics.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `<router-outlet /><app-toast-container />`,
})
export class AppComponent implements OnInit {
  private readonly themeService    = inject(ThemeService);
  private readonly analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    // Theme initialized via ThemeService constructor effect
    this.analyticsService.init();
  }
}
