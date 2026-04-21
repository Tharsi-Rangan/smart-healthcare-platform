FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy application source
COPY . .

# Expose port (Vite dev server)
EXPOSE 5173

# Start Vite dev server with host flag so it's reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
