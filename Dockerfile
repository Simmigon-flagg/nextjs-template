# Use an official Node.js LTS image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build Next.js
RUN npm run build

# Expose the Next.js port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "dev"]
