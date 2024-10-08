# syntax = docker/dockerfile:1.10

FROM python:3.12 AS build

WORKDIR /home/revue/recognition

COPY recognition/requirements.txt ./requirements.txt
COPY recognition/pyproject.toml ./pyproject.toml
COPY recognition/poetry.lock ./poetry.lock
COPY recognition/poetry.toml ./poetry.toml

# Install yolov3 neural network weights
RUN wget -N -P app/resources/yolov3/ -c "https://pjreddie.com/media/files/yolov3.weights" --header "Referer: pjreddie.com"

ENV POETRY_CACHE_DIR=/tmp/poetry_cache

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN --mount=type=cache,target=$POETRY_CACHE_DIR poetry install --without dev --no-root


FROM python:3.12 AS production

# removes the configurations to delete cached files after a successful install
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

RUN apt-get update && apt-get install -y libglib2.0-0 libxext6 ffmpeg libsm6

ENV VIRTUAL_ENV="/home/revue/recognition/.venv"

WORKDIR /home/revue/recognition

COPY .env /home/revue/.env
COPY recognition/app app
COPY --from=build /home/revue/recognition/app/resources/yolov3 app/resources/yolov3
COPY --from=build /home/revue/recognition/requirements.txt ./requirements.txt
COPY --from=build /home/revue/recognition/pyproject.toml ./pyproject.toml

RUN chmod 400 app/resources/yolov3/yolov3.weights
RUN chmod 400 app/resources/yolov3/yolov3.cfg
RUN chmod 400 app/resources/yolov3/coco.names

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=build ${VIRTUAL_ENV} ${VIRTUAL_ENV}

CMD ["sh", "-c", "poe serve --port $RECOGNITION_PORT"]
