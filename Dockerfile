FROM node:16.15.1-alpine
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm install --only=production && npm cache clean --force
COPY . /app
ENV IN_DOCKER="true"
EXPOSE 3001
CMD npm start