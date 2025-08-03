import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aviso-privacidad',
  templateUrl: './aviso-privacidad.component.html',
  styleUrls: ['./aviso-privacidad.component.css']
})
export class AvisoPrivacidadComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    // Oculta header y sidebar solo en esta ruta
    document.body.classList.add('hide-header-sidebar');
  }
  ngOnDestroy() {
    document.body.classList.remove('hide-header-sidebar');
  }
}
