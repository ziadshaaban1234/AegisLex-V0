import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotificationsService } from '@core/services/notifications.service';
import { StorageService } from '@core/services/storage.service';
import { Store } from '@ngrx/store';
import { NotificationsActions } from '../../store/notifications/notifications.reducer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly notificationsService = inject(NotificationsService);
  private readonly storageSvc = inject(StorageService);
  private readonly store = inject(Store);
  private subscriptions = new Subscription();

  sidebarCollapsed = signal(true);

  ngOnInit(): void {
    this.store.dispatch(NotificationsActions.loadNotifications());
    this.notificationsService.getUnreadCount().subscribe();
    this.restoreSidebarState();
  }

  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }

  toggleSidebar(): void {
    const newState = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(newState);
    this.storageSvc.setString('sidebar_collapsed', String(newState));
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 1024) {
      this.sidebarCollapsed.set(true);
      this.storageSvc.setString('sidebar_collapsed', 'true');
    }
  }

  private restoreSidebarState(): void {
    const stored = this.storageSvc.getString('sidebar_collapsed');
    // On mobile, default to collapsed (hidden)
    if (window.innerWidth <= 1024) {
      this.sidebarCollapsed.set(true);
    } else if (stored !== null) {
      this.sidebarCollapsed.set(stored === 'true');
    } else {
      this.sidebarCollapsed.set(false);
    }
  }
}
