FROM denoland/deno:latest
# deno compile --output=server --allow-net src/main.ts

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/main.ts

CMD ["run", "--allow-net", "--allow-env", "src/main.ts"]