![Parabible header image](./header.png)

# Parabible Server

This is the Parabible backend. It is written in typescript for the Deno runtime.

It implements the Parabible API documented [here](https://github.com/parabible/parabible-server-2/wiki) (WIP).

This version of Parabible is currently **still under development**. It is mostly implemented, but there are a number of things remaining to be done (in no particular order):

 - [X] Implement **/health** endpoint (checks access to db and returns 200 "OK")
 - [X] Implement **/module** endpoint (lists modules—eventually, will supply additional details given a moduleId)
 - [X] Implement **/word** endpoint (returns data on individual words [by moduleId])
 - [X] Implement **/text** endpoint (returns bible text with reference(s) and module(s))
 - [X] Implement **/termSearch** endpoint (return matching verses given search terms)
 - [X] Implement **/highlight** endpoint (chapter highlights)
   - Still need to write tests for highlight
 - [ ] Figure out how to handle embedded notes (all kinds: text critical [SBLGNT], commentary [NET], general footnotes [e.g., ESV])
 - [ ] Consider a termSearchCount endpoint (for suggesting changes to search filters)
 - [ ] Finish documenting the [API](https://github.com/parabible/parabible-server-2/wiki)
 - [ ] Standardize error codes (include in the API)
 - [ ] Handle cases where incorrect parameters being supplied (refactor + break out require/allow code for parameters)
 - [ ] Render to html/json? (based on request headers)
 - [ ] Clean up typescript
 - [ ] Limit execution time of requests
    - There also seems to be a random spike in time taken for some CH queries. We should track that down and fix...
 - [ ] Get to 100% test coverage (it's not a big codebase)
 - [ ] Figure out how to serve extra resources (like dictionaries)
 - [ ] Figure out how to handle more complicated search concepts:
    - Semantic domain subqueries (allow search on any level of the semantic domain)
    - Participant awareness (i.e. understanding of antecedents of relative pronouns [data is available!])
 
There's also tons of other work on the data pipeline and the client:
 - Data Pipline (this is probably the easiest area to get involved in and have meaningful impact):
   - Enriching data to parity with prod
   - Doing an initial import of the apostolic fathers(!)
   - Splitting out into a meaningful structure on github
 - Client:
   - The old client has just been hacked onto the new backend so it's got lots of issues to deal with...
   - Consider supporting natural language queries...

## Running on Docker

In order to run the server, you will need to have access to the *Parabible database* (TODO). The easiest way to run the entire stack is to use the docker-compose file supplied *here* (TODO).

To build and run the image:

```
$ docker build .
$ docker run -e PORT=3000 \
             -e CLICKHOUSE_USER=admin \
             -e CLICKHOUSE_PASSWORD=password \
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

Optional variables:

| Variable Name | Description |
|---------------|-------------|
| `MAX_EXECUTION_TIME` | Maximum time to wait for a response from the API (**5s**) |
