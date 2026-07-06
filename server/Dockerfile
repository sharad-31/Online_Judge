FROM gcc:latest

RUN apt-get update && apt-get install -y \
    python3 \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m coderunner
USER coderunner

WORKDIR /code