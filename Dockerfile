FROM node:18
# Installing libvips-dev for sharp Compatability
# NOTE: DO NOT BUILD WITH LOCAL NODE MODULES
# introduces a 'sharp' problem related to my m1 chip vs the docker image
RUN apt-get update && apt-get install libvips-dev -y

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}


WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install
WORKDIR /opt/app
COPY ./ .

# convert the custom Home Page tsx to js as it gets slotted in after the webpack build, I believe
# regardless of order the typescript isnt parsed as part of the strapi build. The following addition of the
# page via webpack is a Hack.
# WORKDIR /opt/app/src/admin/components
# RUN tsc HomeTTT.tsx --module 'es2020' --esModuleInterop true --jsx react --moduleResolution node
# WORKDIR /opt/app

ARG STRAPI_ADMIN_BACKEND_URL=http://localhost:1337
ENV STRAPI_ADMIN_BACKEND_URL=${STRAPI_ADMIN_BACKEND_URL}

RUN yarn build
# 25 onward in the following is for mail. Probably don't need them all
EXPOSE 1337 9229 9230 25 465 587 2525
# https://blog.risingstack.com/how-to-debug-a-node-js-app-in-a-docker-container/
# CMD ["sleep","3600"]
CMD ["yarn", "develop:debug"]
# CMD ["yarn", "develop"]