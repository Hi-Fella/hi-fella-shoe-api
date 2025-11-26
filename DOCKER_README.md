# Docker Setup for hi-fella-shoe-api

This document explains how to use the Docker configuration for the hi-fella-shoe-api project.

## Files Created

1. **Dockerfile** - Multi-stage optimized Dockerfile for production builds
2. **docker-compose.yml** - Docker Compose configuration for deployment to docker registry
3. **.dockerignore** - To ignore files to be built within docker

## Deployment to Docker Registry and Server

### Building Docker Image and pushing to Docker Registry

1. Now we're using GitLab as Docker Registry, so log in to the GitLab Registry:

   ```bash
   docker login registry.gitlab.com
   ```

2. Set `DOCKER_REGISTRY_PATH` variable in your env, for example:

   ```bash
   DOCKER_REGISTRY_PATH=registry.gitlab.com/<username>/<repository>
   ```

3. Make sure `DOCKER_REGISTRY_PATH` variable has been set in your env, then build the Docker image:

   ```bash
   docker compose build
   ```

4. Push the image to Registry:
   ```bash
   docker compose push
   ```

### Deploying to Server from Docker Registry

To deploy the image from the Docker Registry:

1. ssh to your server, and then make empty folder anywhere you want and enter the folder, for example:

   ```bash
   mkdir hi-fella-shoe-api && cd hi-fella-shoe-api
   ```

2. Log in to docker registry (currently using GitLab), for example:

   ```bash
   docker login registry.gitlab.com
   ```

3. Create `.env` file based on `.env.example`, make sure all variable is filled including `DOCKER_REGISTRY_PATH`

   ```bash
   nano .env
   ```

4. Create `docker-compose.yml` file based on `docker-compose-vps.yml`, and then pull the image from registry

   ```bash
   # create docker-compose.yml
   nano docker-compose.yml

   # pull the docker image from registry
   docker compose pull
   ```

5. Create volume folder (change permission to nestjs:nodejs to those folder when got permission denied when start the container)

   ```bash
   mkdir logs && mkdir redis_data
   ```

6. Place file `.hi-fella-google.json` inside your folder

7. Run the container:
   ```bash
   docker compose up -d
   ```
8. Last, go to your http server config, and proxy the http request into current running container's `<ip>:<port>`, you can run `docker network ls` and also `docker inspect <network id>` to check the `ip`.

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Port on which the application runs (default: 8000)
- `DOCKER_REGISTRY_PATH` - Registry path for storing docker image

## Troubleshooting

1. If the container fails to start, check the logs:

   ```bash
   docker compose logs api -f
   ```

2. Ensure your `.env` file is properly configured

3. For deployment issues, check the container logs and ensure you're using the correct registry path
