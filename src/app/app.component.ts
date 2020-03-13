/* 
 *  Covid19-Simple-Graphs
 *  Copyright (C) 2020 aleskandro
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Component } from '@angular/core';
import { CsvPollerService } from './csv-poller.service';
import {FormControl} from '@angular/forms';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as CanvasJS from './canvasjs.min';
import {PackedData} from './models/packed-data';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CsvPollerService],
})
export class AppComponent {
    initialized = false;
    generatorFormGroup : FormGroup;
    dataPoints : Array<PackedData>;
    dataPointsRapidity : Array<PackedData>;
    dataPointsAccel : Array<PackedData>;
    hideCharts = true;
    disabledSubmit = false;
    selectedTab : number;
    absoluteHtml;
    rapidityHtml;
    accelHtml;
    breakpoint = 2;
    step = 0;

    onResize(event) {
        if (event.target.innerWidth <= 800) {
            this.breakpoint = 1;
        } else {
            this.setBreakpoint();
        }
    }

    reset() {
        this.dataPoints = new Array<PackedData>();
        this.dataPointsRapidity = new Array<PackedData>();
        this.dataPointsAccel = new Array<PackedData>();
        this.absoluteHtml = "";
        this.accelHtml = "";
        this.rapidityHtml = "";
    }

    _get(formData, n) {
        if (formData.get(n + 'World').value)
            this.dataPoints.push(this.svc.getWorldData(formData.get(n + 'Displacement').value));
        else {
            if (this.svc.getStatesOfCountry(formData.get(n + 'Country').value).length > 0 
                  && !formData.get(n + 'AllStates').value) {
                    this.dataPoints.push(this.svc.getStateData(formData.get(n + 'Country').value, 
                                                      formData.get(n + 'State').value, 
                                                      formData.get(n + 'Displacement').value));
            } else
                this.dataPoints.push(this.svc.getCountryData(formData.get(n + 'Country').value,
                           formData.get(n + 'Displacement').value));
        }
    }

    generate(formData) {
        if (!formData.valid) {
            return;
        }
        this.disabledSubmit = true;
        this._get(formData, 'first');
        this.setStep(2);
        this.generatorFormGroup.get('firstDisplacement').setValue(0);
        this.countryChanged(this.generatorFormGroup.get('firstCountry'))
        this.redraw();
    }

    redraw() {
        this.setDiff();
        setTimeout(() => {this.disabledSubmit = false;}, 500);
        let absoluteHtml = "";
        let rapidityHtml = "";
        let accelHtml = "";
        this.hideCharts = false;
        this.dataPoints.forEach((p,i) => {
            absoluteHtml += '<div id="absoluteChart'+i+'" style="height: 370px; width: 100%;"></div>';
            rapidityHtml += '<div id="rapidityChart'+i+'" style="height: 370px; width: 100%;"></div>';
            accelHtml += '<div id="accelChart'+i+'" style="height: 370px; width: 100%;"></div>';
        });

        this.absoluteHtml = this.sanitized.bypassSecurityTrustHtml(absoluteHtml);
        this.rapidityHtml = this.sanitized.bypassSecurityTrustHtml(rapidityHtml);
        this.accelHtml = this.sanitized.bypassSecurityTrustHtml(accelHtml);

        this.selectedTabChanged(this.selectedTab);
        this.setBreakpoint();
    }

    remove(i) {
        this.dataPoints.splice(i,1);
        this.redraw();
    }
    setBreakpoint() {
        if (this.dataPoints.length > 4)
            this.breakpoint = 4;
        else
            this.breakpoint = this.dataPoints.length;
    }

    setStep(s) {
        this.step = s;
    }

    differentiate(points) {
        points.forEach( (p) => {
            // single Packed Data (contry + state)
            ["confirmed", "deaths", "recovered"].forEach((t) => {
                let dp = [];
                let prev = 0;
                p.time.forEach((x, i) => {
                    dp.push(p[t].data[i] - prev);
                    prev = p[t].data[i]
                });
                p[t].data = dp;
            });
        });
    }

    setDiff() {
        this.dataPointsRapidity = JSON.parse(JSON.stringify(this.dataPoints));
        this.differentiate(this.dataPointsRapidity);
        this.dataPointsAccel = JSON.parse(JSON.stringify(this.dataPointsRapidity));
        this.differentiate(this.dataPointsAccel);
    }

    mapData(points) {
        let data = [];
        points.forEach( (p) => {
            // single Packed Data (contry + state)
            ["confirmed", "deaths", "recovered"].forEach((t) => {
                let d = {
                    name: p[t].country + (p[t].state != null ? 
                              " | " + p[t].state : "")
                            + " (" + t + ")",
                    type: "line",
                    yValueFormatString: "#.##",
                    showInLegend: true,
                };
                let dp = [];
                let lastDate = undefined;
                p.time.forEach((x, i) => {
                    lastDate = this.getDate(x);
                    dp.push({ x: lastDate, y: p[t].data[i]});
                });
                // Italy can be one day ahead
                if (p.time.length < p[t].data.length) {
                    lastDate = new Date(lastDate);
                    dp.push({
                        x: new Date(lastDate.
                                    setDate(
                                        lastDate.getDate() 
                                        + 1
                        )),
                        y: p[t].data[p[t].data.length - 1]
                    });
                }
                d["dataPoints"] = dp;
                data.push(d);
            });
        });
        return data;
    }

    getDate(t : string) {
        let y = parseInt(t.slice(0,4));
        let m = parseInt(t.slice(4,6))-1;
        let d = parseInt(t.slice(6,8));
        return new Date(y,m,d);
    }
    initializer = () => {
        if (!this.svc.initialized) {
            setTimeout(this.initializer, 500);
            return;
        }
        console.log("init");
        this.initialized = true;
        this.generate(this.generatorFormGroup);
        this.dataPoints.push(this.svc.getStateData("Italy", "Sicilia", 0));
        this.dataPoints.push(this.svc.getWorldData(0));
        this.redraw();
        this.setBreakpoint();
        this.setStep(0);
    }

    ngOnInit() {
        this.generatorFormGroup = this._formBuilder.group({
            firstCountry: [{value: 'Italy', disabled: false}, Validators.required],
            firstState: [{value: '', disabled: true}],
            firstAllStates: [{value: true, disabled: false}],
            firstWorld: [false],
            firstDisplacement: [0]
        });
    }

    constructor(public svc: CsvPollerService, private _formBuilder: FormBuilder, private sanitized: DomSanitizer) {
        setTimeout(this.initializer, 500); // TODO hacky, to be solved
        this.selectedTab = 0;
        this.absoluteHtml = '';
        this.rapidityHtml = "";
        this.accelHtml = '';
        this.reset();
    }

    selectedTabChanged(e) {
        this.selectedTab = e;
        if (e == 0) // Table
            return;
        let charts = [
            { id: "absoluteChart", title: "Absolute", ytitle: "People", points: this.dataPoints },
            { id: "rapidityChart", title: "Rapidity", ytitle: "+ People/Day", points: this.dataPointsRapidity },
            { id: "accelChart", title: "Acceleration", ytitle: "+ People/(Day^2)", points: this.dataPointsAccel}
        ];
        this.dataPoints.forEach( (p,i) => {
            setTimeout(() => {
                this.render(charts[e-1].points, charts[e-1].id, "", charts[e-1].ytitle, i);
            }, 5);
        });
    }

    render(points, container, title, ytitle, i) {
        var chart = new CanvasJS.Chart(container+i, {
            animationEnabled: true,
            title:{
                text: title
            },
            axisX: {
                valueFormatString: "YYYY/MM/DD"
            },
            axisY: {
                title: ytitle,
                includeZero: true,
                suffix: ""
            },
            legend:{
                cursor: "pointer",
                fontSize: 16,
                verticalAlign: "top",
                horizontalAlign: "center"
            },
            toolTip:{
                shared: true
            },
            data: this.mapData(points).slice(i*3,3+i*3)
        });
        chart.render();
    }

    resetUI() {
        this.reset();
        this.disabledSubmit = false;
        this.hideCharts = true;

    }

    setStateValidator(fg : FormGroup) {
        if (!fg.get('firstAllStates').value) { // Going to true
            fg.get('firstState').clearValidators();
            fg.get('firstState').disable();
        } else { 
            fg.get('firstState').setValidators(Validators.required);
            fg.get('firstState').enable();
        }
        fg.get('firstState').updateValueAndValidity();
    }

    countryChanged(e) {
        let fg = this.generatorFormGroup;
        let newCountry = e.value;
        this.generatorFormGroup.get('firstAllStates').setValue(false);
        this.generatorFormGroup.get('firstWorld').setValue(true);
        this.setWorldValidator(this.generatorFormGroup);
        this.generatorFormGroup.get('firstWorld').setValue(false);
        if (this.svc.getStatesOfCountry(newCountry).length > 0) {
            console.log("Enabling validators");
            fg.get("firstState").setValidators(Validators.required);
            fg.get("firstState").enable();
            fg.get("firstAllStates").enable();
        } else {
            console.log("Disabling validators");
            fg.get("firstState").clearValidators();
            fg.get("firstState").disable();
            fg.get("firstAllStates").disable();
        }
        fg.get("firstState").updateValueAndValidity();
        fg.get("firstCountry").updateValueAndValidity();
        fg.get("firstAllStates").updateValueAndValidity();


    }

    setWorldValidator(fg : FormGroup) {
        if (!fg.get('firstWorld').value) { // Going to true
            fg.get('firstCountry').clearValidators();
            fg.get('firstCountry').disable();
            fg.get('firstState').clearValidators();
            fg.get('firstAllStates').disable();
            fg.get('firstState').disable();
        } else {
            fg.get('firstCountry').setValidators(Validators.required);
            fg.get('firstCountry').enable();
            if (this.svc.getStatesOfCountry(fg.get('firstCountry').value).length > 0) {
                fg.get('firstState').setValidators(Validators.required);
                fg.get('firstState').enable();
                fg.get('firstAllStates').enable();
            }
        }
        fg.get('firstState').updateValueAndValidity();
        fg.get('firstAllStates').updateValueAndValidity();
        fg.get('firstCountry').updateValueAndValidity();

    }

}
