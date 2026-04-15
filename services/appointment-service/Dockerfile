FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY src ./src

EXPOSE 5002

CMD ["node", "src/server.js"]
