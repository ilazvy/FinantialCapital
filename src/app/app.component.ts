import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentRoute: string = '';
  isLoading$ = this.loadingService.isLoading$;
  loadingMessage$ = this.loadingService.loadingMessage$;

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de ruta para mostrar loading
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.loadingService.showNavigation();
      });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        // Ocultar loading después de un delay más largo para que se vea la animación
        setTimeout(() => {
          this.loadingService.hide();
        }, 2500); // Aumentado a 2.5 segundos
      });
  }

  shouldShowLayout(): boolean {
    // Rutas que NO deben mostrar el layout (header + sidebar)
    const noLayoutRoutes = ['/login', '/landing', '/aviso-privacidad'];
    return !noLayoutRoutes.includes(this.currentRoute);
  }
}
