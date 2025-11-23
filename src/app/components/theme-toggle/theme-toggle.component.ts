import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent implements AfterViewInit {

  theme = this.themeService.theme$.value;
  accent = this.themeService.accent$.value;

  @ViewChild('themePanel') themePanel!: ElementRef;

  constructor(private themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme = this.themeService.theme$.value;
  }

  changeAccent(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input?.value || '#007bff';
    this.themeService.setAccent(color);
    this.accent = color;
  }

  // ✅ DRAGGABLE PANEL LOGIC
  ngAfterViewInit(): void {
    const panel = this.themePanel.nativeElement;
    const handle = panel.querySelector('.drag-handle');

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      offsetY = e.clientY - panel.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;

      panel.style.left = `${e.clientX - offsetX}px`;
      panel.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
}
