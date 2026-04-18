# Use the official Node.js image as our base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your service's source code
COPY . .

# Expose the port that the doctor service runs on (usually 5006)
EXPOSE 5006

# Start the application
CMD ["npm", "start"]
