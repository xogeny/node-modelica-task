# Start with an image that has OpenModelica installed
FROM mclab/openmodelica

# Now, install Node.js
USER root
RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo
RUN apt-get update
RUN apt-get install -y sudo
RUN echo 'docker ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
RUN mkdir -p /usr/src/app
RUN chown -R docker /usr/src/app
USER docker
RUN sudo apt-get install -y apt-utils
RUN sudo apt-get install -y build-essential
RUN sudo apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y git
#RUN sudo apt-get install -y npm 

# Create app directory
WORKDIR /usr/src/app

ARG NPM_TOKEN
# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install -d

# Bundle app source
COPY . /usr/src/app

RUN sudo chown -R docker /usr/src/app

#EXPOSE 8080
RUN npm test
CMD [ "npm", "start" ]
