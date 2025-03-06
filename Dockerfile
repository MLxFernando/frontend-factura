# Imagen base de Node.js
FROM node:18 as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos y dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el código y construir la aplicación
COPY . .
RUN npm run build

# Servir la aplicación con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80 para servir el frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
