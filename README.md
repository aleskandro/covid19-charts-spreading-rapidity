# Covid19 Simple Graphs

Avilable (no ssl currently) at [http://covid-19-spreading.alessandrodistefano.eu](http://covid-19-spreading.alessandrodistefano.eu)

The lack of comparative and useful information by the news media in Italy brought me to this simple front-end project.
It allows to draw charts about the spreading of Covid19: absolute data, rapidity of spread, and acceleration. It also permits to compare data between countries/state.
These charts could absoletely lack scientific meaning: I'm not an epidemiology expert. But I would have them in these days and, initially, I started to make them manually through Octave. Based on the data-set available from [CSSEGISAndData](https://github.com/CSSEGISandData/COVID-19) repository, I just developed this simple front-end in a few hours.
Moreover, I'm not a front-end developer, so I'm sorry for some hacky tricks and bugs, contributions are welcome :).

The project is based on Angular 9, with Material, papaparse and canvasJs and it is distributed under the terms of [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.



## Docker for develepment

Use the docker image if you do not want to deploy Angular and other dependencies of this project in your host.

```bash
docker-compose up
```

It will expose the angular development server through `http://localhost:4200`.

## License
```
    Covid19-Simple-Graphs
    Copyright (C) 2020 aleskandro

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
