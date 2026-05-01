import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html'
})
export class MainLayout {
  isCollapsed = signal(false);

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
