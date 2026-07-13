FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g npm@10.9.2

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g npm@10.9.2

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server ./server

EXPOSE 5000
CMD ["node", "server/index.js"]
