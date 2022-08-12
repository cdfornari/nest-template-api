<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# FornariShop API

1. Clonar proyecto
2. Instalar dependencias
```
npm install
```
3. Renombrar ```.env.template``` a ```.env``` y llenar las variables de entorno
4. Levantar DB
```
docker-compose up -d
```
5. Levantar API
```
npm run start:dev
```
6. Ejecutar seed
```
GET http://localhost:3000/api/seed
```