#!/bin/bash
SERVER_HOST=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
export SERVER_HOST
echo "SERVER_HOST=$SERVER_HOST" >> envs/prod.env
npx prisma generate && npm run build && npm run start:prod 
