
# Base image
FROM mtiller/omnode

# Install yarn
# N.B. - We don't use the preferred method because it has to be implemented 
# differently on different platforms (depending on whether sudo is preset)
RUN npm install --global yarn

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ARG NPM_TOKEN
RUN echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc

COPY . /usr/src/app

# Install dependencies using Yarn
RUN yarn install 

# Now get rid of the embedded "secret" used to access private repositories
RUN rm -f .npmrc

# Environment variables that can be set via 'docker run -e ...'
ENV REDIS_SERVER_HOST localhost
ENV REDIS_SERVER_PORT 6379

# No ports are exposed by this image


# NPM Scripts to run *during build*
RUN npm run test

CMD [ "npm", "run", "start" ]
