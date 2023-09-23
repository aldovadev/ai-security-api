#BUILD STAGE USING NODE
FROM node:18.16
WORKDIR /
COPY package*.json ./

RUN npm install
RUN npm install pg

ENV APP_PORT = 8080
ENV DB_NAME = demoasadb
ENV DB_USER = asaserver
ENV DB_PASS = ukpjjpusat09
ENV DB_HOST = 	10.68.176.3

COPY ./ ./

EXPOSE 8080

#RUN APP STAGE USING NODE
CMD ["npm", "start"]