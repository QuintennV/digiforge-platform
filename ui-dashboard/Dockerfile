FROM node:18-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app for production
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Remove default Nginx static files and replace with our build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for the UI
EXPOSE 8080

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]