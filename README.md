# Covid19 Simple Graphs

Available at [https://covid-19-spreading.alessandrodistefano.eu](https://covid-19-spreading.alessandrodistefano.eu)

The lack of comparative and quantitative information by the news media in Italy brought 
me to this simple project.
It allows to draw charts about the spreading of Covid19: 
absolute data, rapidity of spread, and acceleration.
It can also be used to compare data between countries/state.
These charts could absoletely lack any scientific meaning: 
I'm not an epidemiology expert, but I would have them to compare Italy's outbreak crisis
with other countries 
and to have spreading velocity which is not currently announced by news media.
Initially, I started to draw them manually through 
[Octave](https://www.gnu.org/software/octave/).
Based on the data-set available at
[CSSEGISAndData](https://github.com/CSSEGISandData/COVID-19), 
I just developed this simple front-end in a few hours with the hope it 
can be useful for someone else during this COVID-19 outbreak, in Italy and in the world.
However, I'm not a front-end developer and I'm sorry for some hacky 
tricks and bugs: contributions are welcome :).


The project is based on Angular 9, with Material, papaparse and canvasJs 
and it is distributed under the terms of 
[GPLv3](https://github.com/aleskandro/covid19-charts-spreading-rapidity/blob/master/LICENSE) license.

## Covid-19 data-set limitations

As already stated, comparing covid-19 spreading between countries could lack
scientific meaning, especially with the current dataset.

Infact, with the current outbreak dataset we have only `confirmed`,`recovered` and `deaths` cases per country/state;
it would be better to also have the number of performed tests. 

Other considerations about limitations of these data can be made both from a stastical 
and from a medical point of view.

I hope reasearch will start publishing about modeling of this epidemic as soon as a possible,
with all the tools we have today like Complex networks and so on.

If you want to contribute, please feel free of starting a new issue or forking and continuing development. 
If I will have time, I will try to improve the code and the available features.

## Docker for develepment

Use the docker image if you do not want to deploy Angular and other dependencies of this project in your host.

```bash
docker-compose up
```

Or you can build the Dockerfile and run it exposing your preferred port.

The repository also contains a Dockerfile.production that provide a multi-stage build for deploying via nginx the application.

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
