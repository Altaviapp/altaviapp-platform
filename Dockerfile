# Altaviapp Platform - Docker Development Environment
# Node.js 20 Alpine for smaller image size

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for native modules (if needed)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
# Use --legacy-peer-deps if there are peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy application source
COPY . .

# Expose Next.js port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Health check for Next.js server
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start development server (only Next.js - Convex dev requires interactive auth)
CMD ["npm", "run", "dev:mobile"]
