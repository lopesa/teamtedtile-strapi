FROM node:16
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
RUN yarn build
# this should be port 9229 but it is taken
# also sometimes so is 9230 and the debug happens on 9231
# this is unstable at this commit
ENV NODE_OPTIONS=--inspect=0.0.0.0:9230
# idk if exposing 9230 here really does anything
# unclear as of this git commit
EXPOSE 1337 9230
# https://blog.risingstack.com/how-to-debug-a-node-js-app-in-a-docker-container/
CMD ["yarn", "develop"]