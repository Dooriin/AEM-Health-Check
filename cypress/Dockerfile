FROM jenkins/jenkins:lts
USER root
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
USER jenkins
RUN jenkins-plugin-cli --plugins "slack blueocean nodejs"

