import { Component } from '@angular/core';
import { CsvPollerService } from './csv-poller.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CsvPollerService],
})
export class AppComponent {
    title = 'a9-covid-graphs';
    constructor(private svc: CsvPollerService) {
    }


}
