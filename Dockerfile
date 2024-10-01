FROM node:16-alpine as base
RUN apk update && apk add bash yarn>=1.22.4
WORKDIR /app
COPY package.json tsconfig.json yarn.lock  ./
RUN yarn --frozen-lockfile

FROM base as vue
COPY . .
WORKDIR /app/vue
RUN yarn

FROM vue as builder
WORKDIR /app
COPY . .
RUN yarn run build

