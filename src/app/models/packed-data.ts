import { Line } from "./line";

export class PackedData {
    confirmed: Line;
    recovered: Line;
    deaths: Line;
    time: string[];

    constructor(confirmed: Line, recovered: Line, deaths: Line, time: string[]) {
        this.confirmed = confirmed;
        this.recovered = recovered;
        this.deaths = deaths;
        this.time = time;
    }
}
