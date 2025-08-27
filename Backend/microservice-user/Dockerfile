FROM node:20-alpine

WORKDIR /usr/scr/app

COPY package*.json ./

RUN npm install
#añadir las dependencias acá
RUN npm install class-validator 

COPY . .

EXPOSE 4444

CMD ["npm", "run", "start:dev"]