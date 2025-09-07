import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  mensaje: string = 'Ha ocurrido un error.';

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params['msg']) {
        this.mensaje = params['msg'];
      }
    });
  }
}
