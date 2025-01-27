# Use the official Node.js image as the base
FROM node:22-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose the development server port
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
