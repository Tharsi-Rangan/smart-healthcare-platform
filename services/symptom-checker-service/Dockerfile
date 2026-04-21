FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY src ./src

EXPOSE 5007

CMD ["npm", "run", "dev"]
