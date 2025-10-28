# ---- Build stage ----
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:stable-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html/dist
COPY --from=build /app/index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
