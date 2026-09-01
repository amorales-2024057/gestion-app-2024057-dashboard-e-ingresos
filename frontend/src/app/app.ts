import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalSesionExpirada } from './shared/modal-sesion-expirada/modal-sesion-expirada';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalSesionExpirada],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
