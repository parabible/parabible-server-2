# Parabible Server

This is the Parabible backend. It is written in typescript for the Deno runtime.

It implements the Parabible API documented *here* (TODO).

This version of Parabible is currently **still under development**. It is mostly implemented, but there are a number of things remaining to be done (in no particular order):

 - [X] Minimum implementation
 - [ ] Implement chapter highlights endpoint
 - [ ] Publicly document the API
 - [ ] Handle cases where incorrect parameters being supplied (refactor + break out require/allow code for parameters)
 - [ ] Render to html/json? (based on request headers)
 - [ ] Consider a termSearchCount endpoint (for suggesting changes to search filters)
 - [ ] Clean up typescript
 - [ ] Get to 100% test coverage (it's not a big codebase)
 - [ ] Standardize error codes (include in the API)

## Running on Docker

In order to run the server, you will need to have access to the *Parabible database* (TODO). The easiest way to run the entire stack is to use the docker-compose file supplied *here* (TODO).

To build and run the image:

```
$ docker build .
$ docker run -e PORT=3000 \
             -e CLICKHOUSE_USER=admin \
             -e CLICKHOUSE_PASSWORD=toor \
             -e CLICKHOUSE_URL=http://localhost:8123 \
        image_hash
```

You will need to provide the container with the necessary environmental variables:

| Variable Name | Description |
|---------------|-------------|
| `PORT` | The port to listen on (**3000**) |
| `CLICKHOUSE_USER` | User to authenticate with on Clickhouse (**admin**) |
| `CLICKHOUSE_PASSWORD` | Password to authenticate with on Clickhouse (**toor**) |
| `CLICKHOUSE_URL` | URL and port where Clickhouse can be reached (**http://localhost:8123**) |
