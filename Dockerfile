FROM ubuntu:latest
LABEL maintainer="EM Lee <100mgml@gmail.com>"
ENV DEBIAN_FRONTEND=noninteractive

# Set up working directory
WORKDIR /nestjs-booksearch

# Update, Install curl and Node.js, and clean up in one RUN step to reduce image size
RUN apt-get update && \
    apt-get install -y curl gnupg lsb-release wget && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs postgresql postgresql-contrib && \
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

# PostgreSQL setup: 복사하고 권한 설정 후 스크립트 실행
RUN chmod +x ./setup_postgres.sh && \
    ./setup_postgres.sh

# Prisma migration
RUN service postgresql start && \
    npx prisma migrate dev --name init-docker

# Command to run the application
CMD service postgresql start && npm run start
