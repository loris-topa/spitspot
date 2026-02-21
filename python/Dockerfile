# syntax=docker/dockerfile:1.4
FROM python:3.8 AS builder

FROM builder as dev-envs

WORKDIR /home
ADD requirements.txt .
ADD manage.py .
ADD start-dev-server.sh .

# install Docker tools (cli, buildx, compose)
# COPY --from=gloursdocker/docker / /
RUN pip3 install -r requirements.txt --no-cache-dir

EXPOSE 8000
CMD /usr/local/bin/uwsgi --ini uwsgi.ini

