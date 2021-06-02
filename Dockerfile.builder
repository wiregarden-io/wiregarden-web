FROM buildkite/puppeteer
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update \
    && apt-get install -y wget curl git ca-certificates gnupg \
    xvfb libgtk2.0-0 libxtst6 libxss1 libgconf-2-4 libnss3 libasound2
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn
