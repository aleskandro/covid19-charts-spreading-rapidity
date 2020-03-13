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

import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { Line } from './models/line';
import { PackedData } from './models/packed-data';
import { LocationModel } from './models/location';

const confirmedUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";

const deathsUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";

const recoveredUrl ="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";

const italyPcUrl = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv"

@Injectable({
  providedIn: 'root'
})
export class CsvPollerService {
    time : string[];
    confirmed: Line[];
    deaths: Line[];
    recovered: Line[];
    statesCountries: Map<string,string[]>;
    initialized = false;
    initCounter = 2;

    constructor() {
        this.time = new Array<string>();
        this.confirmed = new Array<Line>();
        this.deaths = new Array<Line>();
        this.recovered = new Array<Line>();
        this.parse(confirmedUrl, "confirmed");
        this.parse(recoveredUrl, "recovered");
        this.parse(deathsUrl, "deaths");
    }

    parseItaly() {
        let stateMapsConf = new Map<string, Line>();
        let stateMapsDeaths = new Map<string, Line>();
        let stateMapsRec = new Map<string, Line>();
        let raw = new Map<string, any>();
        let comparator = (a,b) => {
            if (a.t < b.t)
                return -1;
            if (a.t > b.t)
                return 1;
            return 0;
        }
        let f = (v,i,a) => v.country != "Italy";

        Papa.parse(italyPcUrl, {
            header: true,
            skipEmptyLines: true,
            download: true,
            dynamicTyping: true,
            complete: (result) => {
                result.data.forEach((e) => {
                    let state = e.denominazione_regione;
                    if (!raw.has(state)) {
                        raw.set(state, []);
                        stateMapsConf.set(state, new Line(
                            "Italy", state, 0,0, 
                            new Array(33).fill(0)));
                        stateMapsRec.set(state, new Line(
                            "Italy", state, 0,0, 
                            new Array(33).fill(0)));
                        stateMapsDeaths.set(state, new Line(
                            "Italy", state, 0,0, 
                            new Array(33).fill(0)));
                    }
                    raw.get(state).push({
                        t: e.data,
                        confirmed: e.totale_casi,
                        deaths: e.deceduti,
                        recovered: e.dimessi_guariti
                    });
                });
                this.confirmed = this.confirmed.filter(f);
                this.deaths = this.deaths.filter(f);
                this.recovered = this.recovered.filter(f);

                Array.from(raw.keys()).forEach(k => {
                    raw.get(k).sort(comparator);
                    raw.get(k).forEach((e, i) => {
                        stateMapsConf.get(k)
                            .data.push(e.confirmed);
                        stateMapsDeaths.get(k)
                            .data.push(e.deaths);
                        stateMapsRec.get(k)
                            .data.push(e.recovered);
                    });
                    this.confirmed.push(stateMapsConf.get(k));
                    this.deaths.push(stateMapsDeaths.get(k));
                    this.recovered.push(stateMapsRec.get(k));
                });
                this._setStatesCountries();
                this.initialized = true;
            }
        });
    }
    parse(url : string, key : string) {
        Papa.parse(url, {
            header: true,
            skipEmptyLines: true,
            download: true,
            dynamicTyping: true,
            complete: (result) => {
                let time = result.meta.fields.slice(4);
                result.data.forEach((e) => {
                    var ts = [];
                    time.forEach((t) => {
                        ts.push(e[t]);
                    });
                    this[key].push(new Line(
                        e.country, e.state,
                        e.lat, e.long,
                        ts
                    ));
                });
                if (!this.initialized) {
                    if (this.initCounter <= 0) {
                        this.time = time;
                        this.parseItaly();
                    } else {
                        this.initCounter--;
                    }
                }
            },
            transformHeader: (header) => {
                if (header === "Province/State")
                    return "state";
                if (header === "Country/Region")
                    return "country";
                if (header.split("/").length == 3) {
                    var t = header.split("/"); 
                    return "20" + t[2] + 
                        ("0" + t[0]).slice(-2) +
                        ("0" + t[1]).slice(-2);
                }
                return header;
            }
        });
    }
    
    noopReducer =  o => true;
    sumReducer = (cur, ret) => {
        for (let i = 0; i < ret.data.length; i++) {
            ret.data[i] += cur.data[i];
        }
        return ret;
    };


    getStateData(country : string, state : string, displacement : number) {
        let filter = o => o.state == state && o.country == country;
        return this._getData(country, state, filter, this.noopReducer, displacement);
    }

    getCountryData(country: String, displacement : number) {
        let filter = o => o.country == country;
        return this._getData(country, null, filter, this.sumReducer, displacement);
    }

    getWorldData(displacement : number) {
        return this._getData("World", null, this.noopReducer, this.sumReducer, displacement);
    }
    _getData(country: String, state: String, filter, reducer, displacement : number) {
        let c = JSON.parse(JSON.stringify(this.confirmed)).filter(filter).reduce(reducer);
        let d = JSON.parse(JSON.stringify(this.deaths)).filter(filter).reduce(reducer);
        let r = JSON.parse(JSON.stringify(this.recovered)).filter(filter).reduce(reducer);
        c.country = country;
        c.state = state;
        c.data = this._displace(c.data, displacement);
        d.country = country;
        d.state = state;
        d.data = this._displace(d.data, displacement);
        r.country = country;
        r.state = state;
        r.data = this._displace(r.data, displacement);
        this._filterNaN(c.data);
        this._filterNaN(d.data);
        this._filterNaN(r.data);
        let ret = new PackedData(c, r, d, this.time);
        return ret;
    }

    _filterNaN(a) {
        if (isNaN(a[a.length - 1]))
            a.splice(-1);
    }

    _displace(a, displacement) {
        if (displacement > 0) {
            let d = displacement
            return (new Array(d).fill(0)).concat(a).slice(0,-d);
        } else {
            let d = -displacement;
            return a.concat((new Array(d).fill(a[a.length-1]))).slice(d);
        }
    }

    _setStatesCountries() {
        let hmap = new Map<string, string[]>();

        this.confirmed
            .forEach(
                (e) => {
                    if (e.state === null && !hmap.has(e.country)) {
                        hmap.set(e.country, []);
                    } else {
                        if (hmap.has(e.country))
                            hmap.get(e.country).push(e.state);
                        else
                            hmap.set(e.country, [e.state]);
                    }
                }
            );
        this.statesCountries = hmap;
    }

    getCountries() {
        return Array.from(this.statesCountries.keys());
    }

    getStatesOfCountry(country: string) {
        return this.statesCountries.get(country);
    }

}
