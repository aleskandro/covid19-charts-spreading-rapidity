#
# Covid19-Simple-Graphs
# Copyright (C) 2020 aleskandro
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
FROM node:10.15.3
WORKDIR /code
ENV PATH /usr/src/app/node_modules/.bin:$PATH
RUN npm install -g yarn @angular/cli
COPY package.json ./package.json
RUN yarn install
CMD ng serve --host 0.0.0.0 --disable-host-check

