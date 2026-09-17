# Step 1: Build React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy React build into Nginx HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set proper permissions
RUN chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose Nginx port
EXPOSE 8080

# Use dumb-init and run Nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
