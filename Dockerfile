#BUILD STAGE USING NODE
FROM node:18.16
WORKDIR /
COPY package*.json ./

RUN npm install

COPY ./ ./

EXPOSE ${APP_PORT}

#RUN APP STAGE USING NODE
CMD ["npm", "start"]