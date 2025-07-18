FROM node:22-alpine3.19

WORKDIR /app

COPY . .

RUN npm install --force

RUN npm run build

CMD ["npm", "run", "start"]