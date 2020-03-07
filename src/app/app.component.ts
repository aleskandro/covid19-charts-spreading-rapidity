import { Component } from '@angular/core';
import { CsvPollerService } from './csv-poller.service';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CsvPollerService],
})
export class AppComponent {
    title = 'a9-covid-graphs';
    initialized = false;
    selectedFirstCountry = "Mainland China";
    selectedFirstState;
    selectedSecondState;
    selectedSecondCountry = "Mainland China";
    allStatesFirst = new FormControl(false);
    allStatesSecond = new FormControl(false);
    initializer = () => {
        if (!this.svc.initialized)
            setTimeout(this.initializer, 500);
        console.log("init");
        this.initialized = true;
    };

    constructor(public svc: CsvPollerService) {
        setTimeout(this.initializer, 500)
    }

    // TODO state cannot be empty
    // Some delay produce bugs sometimes
    //
    generate() {
        if (this.svc.getStatesOfCountry(this.selectedFirstCountry).length > 0) {
            if (this.allStatesFirst.value) {
                console.log(this.svc.getCountryData(this.selectedFirstCountry));
            } else {
                console.log(this.svc.getStateData(this.selectedFirstCountry, this.selectedFirstState));
            }
        } else
            console.log(this.svc.getCountryData(this.selectedFirstCountry));
        if (this.svc.getStatesOfCountry(this.selectedSecondCountry).length > 0) {
            if (this.allStatesSecond.value) {
                console.log(this.svc.getCountryData(this.selectedSecondCountry));
            } else {
                console.log(this.svc.getStateData(this.selectedSecondCountry, this.selectedSecondState));
            }
        } else
            console.log(this.svc.getCountryData(this.selectedSecondCountry));
    }

}
