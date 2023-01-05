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
# regardless of order the typescript isnt parsed as part of the strapi build. The addition of the
# page via webpack is a Hack.
WORKDIR /opt/app/src/admin/components
RUN tsc HomeTTT.tsx --module 'es2020' --esModuleInterop true --jsx react --moduleResolution node
WORKDIR /opt/app
RUN yarn build
# this should be port 9229 but it is taken
# also sometimes so is 9230 and the debug happens on 9231
# this is unstable at this commit
# idk if exposing 9230 here really does anything
# unclear as of this git commit
EXPOSE 1337 9230
# https://blog.risingstack.com/how-to-debug-a-node-js-app-in-a-docker-container/
# CMD ["sleep","3600"]
CMD ["yarn", "develop:debug"]