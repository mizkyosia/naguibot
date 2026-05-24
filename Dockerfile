FROM node:alpine
WORKDIR /bot
COPY package.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js"]