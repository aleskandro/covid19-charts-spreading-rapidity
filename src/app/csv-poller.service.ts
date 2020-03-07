import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { Line } from './models/line';
import { PackedData } from './models/packed-data';
import { LocationModel } from './models/location';

const confirmedUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";

const deathsUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";

const recoveredUrl ="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";


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

    constructor() {
        this.time = new Array<string>();
        this.confirmed = new Array<Line>();
        this.deaths = new Array<Line>();
        this.recovered = new Array<Line>();
        console.log(this);
        this.parse(confirmedUrl, "confirmed");
        this.parse(recoveredUrl, "recovered");
        this.parse(deathsUrl, "deaths");
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
                    time.slice(4).forEach((t) => {
                        ts.push(e[t]);
                    });
                    this[key].push(new Line(
                        e.country, e.state,
                        e.lat, e.long,
                        ts
                    ));
                });
                if (!this.initialized) {
                    this.time = time;
                    this._setStatesCountries();
                    this.initialized = true;
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

    getStateData(country : string, state : string) {
        let filter = o => o.state == state && o.country == country;
        let c = this.confirmed.find(filter);
        let d = this.recovered.find(filter);
        let r = this.deaths.find(filter);

        return new PackedData(c, r, d, this.time);
    }


    getCountryData(country: String) {
        let filter = o => o.country == country;

        let reducer = (cur, ret) => {
            for (let i = 0; i < ret.data.length; i++) {
                ret.data[i] += cur.data[i];
            }
            ret.state = null;
            return ret;
        };

        let c = this.confirmed.filter(filter).reduce(reducer);
        let d = this.deaths.filter(filter).reduce(reducer);
        let r = this.recovered.filter(filter).reduce(reducer);

        return new PackedData(c, r, d, this.time);
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

    // TODO ready 

}
