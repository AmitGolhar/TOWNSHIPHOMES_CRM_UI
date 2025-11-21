import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-crm-layout',
  templateUrl: './crm-layout.component.html',
  styleUrls: ['./crm-layout.component.css']
})
export class CrmLayoutComponent {
  menuOpen = false;
  userRole: string = '';   



  
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    if (window.innerWidth < 992) {
      this.menuOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.menuOpen = true;  // Keep sidebar visible on desktop
    } else {
      this.menuOpen = false; // Hide it on mobile
    }
  }

  ngOnInit(): void {
    this.menuOpen = window.innerWidth >= 992;
        this.userRole = sessionStorage.getItem('role') || '';

  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase().includes('ADMIN');
  }
}
