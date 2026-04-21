FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY src ./src

# Expose port
EXPOSE 5007

CMD ["npm", "run", "dev"]
