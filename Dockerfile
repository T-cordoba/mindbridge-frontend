FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG BACKEND_INTERNAL_URL=http://localhost:4000
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
