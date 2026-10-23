# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# Stage 2: Serve with lightweight web server (serve)
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]