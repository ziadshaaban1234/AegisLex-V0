import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScaleOfJusticeComponent } from '@shared/components/scale-of-justice/scale-of-justice.component';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ScaleOfJusticeComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  readonly lang = inject(LanguageService);

  readonly features = computed(() => [
    {
      icon: 'smart_toy',
      title: this.lang.t('landing.features.item1.title'),
      description: this.lang.t('landing.features.item1.desc'),
      color: '#4e4eeb',
    },
    {
      icon: 'document_scanner',
      title: this.lang.t('landing.features.item2.title'),
      description: this.lang.t('landing.features.item2.desc'),
      color: '#0ea5e9',
    },
    {
      icon: 'analytics',
      title: this.lang.t('landing.features.item3.title'),
      description: this.lang.t('landing.features.item3.desc'),
      color: '#f59e0b',
    },
    {
      icon: 'hub',
      title: this.lang.t('landing.features.item4.title'),
      description: this.lang.t('landing.features.item4.desc'),
      color: '#10b981',
    },
    {
      icon: 'timeline',
      title: this.lang.t('landing.features.item5.title'),
      description: this.lang.t('landing.features.item5.desc'),
      color: '#8b5cf6',
    },
    {
      icon: 'search',
      title: this.lang.t('landing.features.item6.title'),
      description: this.lang.t('landing.features.item6.desc'),
      color: '#ec4899',
    },
  ]);

  readonly stats = computed(() => [
    { value: '10M+',  label: this.lang.t('landing.hero.stat.documents') },
    { value: '98.5%', label: this.lang.t('landing.hero.stat.ocr_accuracy') },
    { value: '3.2s',  label: this.lang.t('landing.hero.stat.avg_time') },
    { value: '50+',   label: this.lang.t('landing.hero.stat.jurisdictions') },
  ]);

  readonly testimonials = computed(() => [
    {
      quote:  this.lang.t('landing.testimonials.item1.quote'),
      author: 'Ziad Shaaban',
      role:   this.lang.t('landing.testimonials.item1.role'),
      avatar: 'ZS',
    },
    {
      quote:  this.lang.t('landing.testimonials.item2.quote'),
      author: 'James Chen',
      role:   this.lang.t('landing.testimonials.item2.role'),
      avatar: 'JC',
    },
    {
      quote:  this.lang.t('landing.testimonials.item3.quote'),
      author: 'Dr. Ahmed Khalil',
      role:   this.lang.t('landing.testimonials.item3.role'),
      avatar: 'AK',
    },
  ]);
}
