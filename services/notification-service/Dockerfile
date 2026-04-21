FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for npm run dev)
RUN npm install

# Copy application source
COPY . .

EXPOSE 5008

CMD ["npm", "run", "dev"]
