#BUILD STAGE USING NODE
FROM node:18.16
WORKDIR /
COPY package*.json ./

RUN npm install prettier -g
RUN npm install

COPY ./ ./
# Build
RUN npm run build

#RUN APP STAGE USING NODE
CMD ["npm", "start"]

