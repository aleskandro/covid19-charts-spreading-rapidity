export class Line {
    country: string;
    state: string;
    lat: number;
    long: number;
    data: number[];

    constructor(country : string, state : string, lat : number,
                long : number, data : number[]) {
        this.country = country;
        this.state = state;
        this.lat = lat;
        this.long = long;
        this.data = data;
    }
}
