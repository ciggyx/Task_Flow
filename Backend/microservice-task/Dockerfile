FROM node:20-alpine

WORKDIR /usr/scr/app

COPY package*.json ./

RUN npm install
#añadir las dependencias acá
RUN npm install class-validator class-transformer

COPY . .

EXPOSE 5431

CMD ["npm", "run", "start:dev"]