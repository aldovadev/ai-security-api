#BUILD STAGE USING NODE
FROM node:18.18
WORKDIR /app
COPY ./package*.json ./

RUN npm install
COPY ./ ./

#RUN APP STAGE USING NGINX
CMD node app.js