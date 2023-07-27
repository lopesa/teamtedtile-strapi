# Team Ted Tile Strapi cms

This project is a not much modified version of `yarn create strapi-app my-project` inside of a Docker container.

To create the Docker container I used the unofficial official instructions [here](https://docs.strapi.io/dev-docs/installation/cli#creating-a-strapi-project) as well as a few others that are the obvious ones that come up under a Google search

Not a whole lot has been modified from the original Strapi create command, but a review of the few commits would show installation of some common Strapi plugins, etc.

This repo could be taken as an example but not as boilerplate in its own right, the recommended process at that link is more to create a strapi app and then wrap it in the Docker image, and in that process you create the db passwords etc, which you would be missing from this instance.

The strapi run commands are in the two Docker files. I am starting/stopping the app simply then with `docker-compose up/down`

---

### Note for myself, for using this for TTT.

workflow for changing Strapi code and building a new docker image has been to build the Docker image locally and then push it to my Digital Ocean image repo. Building on the remote server swamped that server. The command look like this:

```
docker build --no-cache --platform linux/amd64 -t teamtedtile-cms-api:latest -f Dockerfile.prod .
docker tag teamtedtile-cms-api <remote container registry>/<folder-in-remote-repo>/teamtedtile-cms-api
docker push <remote container registry>/<folder-in-remote-repo>/teamtedtile-cms-api
```
