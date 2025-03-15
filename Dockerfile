FROM public.ecr.aws/lambda/nodejs:20

ARG APP_ENV

# CLI & npm related configurations
ENV CS_CLI_LOG_PATH=/tmp
ENV CS_CLI_CONFIG_PATH=/tmp/cli_token
ENV NPM_CONFIG_CACHE=/tmp/.npm

# App-related configurations
ENV STACK_DATA=https://github.com/hanoak/contentstack-starter-app-data/archive/refs/heads/master.zip
ENV EXTRACT_FOLDER=contentstack-starter-app-data-master/main
ENV APP_ENV=$APP_ENV

# RUN yum install hostname -y

WORKDIR ${LAMBDA_TASK_ROOT}

COPY package*.json ${LAMBDA_TASK_ROOT}/

RUN npm install --omit=dev

COPY . ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]
