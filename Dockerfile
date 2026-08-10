FROM node:22-alpine AS build
WORKDIR /app

# ---- build stage: Vite Build ----
COPY package*.json ./
RUN npm ci
COPY . . 
RUN npm run build

# ---- serve stage: ship only the build output with nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80


