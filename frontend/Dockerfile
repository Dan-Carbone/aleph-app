# Frontend Dockerfile for Aleph-App (React 18 + Vite)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package manifest and install dependencies inside the container
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code (including index.html and vite.config.js)
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite development server exposed to the Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]