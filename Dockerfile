FROM ubuntu:latest
LABEL maintainer="EM Lee <100mgml@gmail.com>"
ENV DEBIAN_FRONTEND=noninteractive

# Set up working directory
WORKDIR /nestjs-booksearch

# Update, Install curl and Node.js, and clean up in one RUN step to reduce image size
RUN apt-get update && \
    apt-get install -y curl gnupg lsb-release wget && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Global install NestJS CLI
RUN npm i -g @nestjs/cli

# Copy package.json and package-lock.json for efficient caching
COPY package*.json ./

# Install NestJS project dependencies
RUN npm install

# Copy everything from host to container filesystem
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD npx prisma generate && npm run build && npm run start:prod
