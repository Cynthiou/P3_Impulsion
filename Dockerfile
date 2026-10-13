FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

COPY . .

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
