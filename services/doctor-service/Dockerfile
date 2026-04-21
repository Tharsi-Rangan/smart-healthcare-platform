FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for `npm run dev`)
RUN npm install

# Copy application source
COPY . .

# Create uploads directory for file storage
RUN mkdir -p uploads

# Expose port
EXPOSE 5006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
	CMD node -e "require('http').get('http://localhost:5006/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["npm", "run", "dev"]
