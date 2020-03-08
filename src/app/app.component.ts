import { Component } from '@angular/core';
import { CsvPollerService } from './csv-poller.service';
import {FormControl} from '@angular/forms';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
    globalData = new FormControl(false);
    generatorFormGroup : FormGroup;
    initializer = () => {
        if (!this.svc.initialized)
            setTimeout(this.initializer, 500);
        console.log("init");
        this.initialized = true;
        console.log(this.generatorFormGroup.get('firstDisplacement'));
    };

    ngOnInit() {
        this.generatorFormGroup = this._formBuilder.group({
            firstCountry: ['Mainland China', Validators.required],
            firstState: ['', Validators.required],
            firstAllStates: [false],
            firstWorld: [false],
            firstDisplacement: [0],
            secondCountry: ['Mainland China', Validators.required],
            secondState: ['', Validators.required],
            secondAllStates: [false],
            secondWorld: [false],
            secondDisplacement: [0]
        });
    }

    constructor(public svc: CsvPollerService, private _formBuilder: FormBuilder) {
        setTimeout(this.initializer, 500)
    }


    _get(formData, n) {
        if (formData.get(n + 'World').value)
            console.log(this.svc.getWorldData(formData.get(n + 'Displacement').value));
        else {
            if (this.svc.getStatesOfCountry(formData.get(n + 'Country').value).length > 0 
                  && !formData.get(n + 'AllStates').value) {
                    console.log(this.svc.getStateData(formData.get(n + 'Country').value, 
                                                      formData.get(n + 'State').value, 
                                                      formData.get(n + 'Displacement').value));
            } else
                console.log(this.svc.getCountryData(formData.get(n + 'Country').value,
                           formData.get(n + 'Displacement').value));
        }
    }

    // TODO Some delay produce bugs sometimes
    // Add button
    generate(formData) {
        if (!formData.valid) {
            console.log("Form is not valid");
            return;
        }
        this._get(formData, 'first');
        this._get(formData, 'second');
    }

    setStateValidator(fg : FormGroup, n : string) {
        if (!fg.get(n + 'AllStates').value) { // Going to true
            fg.get(n + 'State').clearValidators();
            fg.get(n + 'State').disable();
        } else { 
            fg.get(n + 'State').setValidators(Validators.required);
            fg.get(n + 'State').enable();
        }
        fg.get(n + 'State').updateValueAndValidity();
    }

    setWorldValidator(fg : FormGroup, n : string) {
        if (!fg.get(n + 'World').value) { // Going to true
            fg.get(n + 'Country').clearValidators();
            fg.get(n + 'Country').disable();
            fg.get(n + 'State').clearValidators();
            fg.get(n + 'AllStates').disable();
            fg.get(n + 'State').disable();
        } else {
            fg.get(n + 'Country').setValidators(Validators.required);
            fg.get(n + 'Country').enable();
            fg.get(n + 'State').setValidators(Validators.required);
            fg.get(n + 'AllStates').enable();
            fg.get(n + 'State').enable();
        }
        fg.get(n + 'State').updateValueAndValidity();
        fg.get(n + 'AllStates').updateValueAndValidity();
        fg.get(n + 'Country').updateValueAndValidity();
    }

}
