## How the System Is Set Up

DigiForge is a multi-service cloud system orchestrated using Docker Compose, deployed on an 
Azure Virtual Machine (VM). Each team member is responsible for one logical component of the system, 
such as simulation, analytics, the knowledge graph, UI/UX, etc.

Each of these components should run in its own Docker container. Docker is a service which 
divides code into "containers" so that they are self-contained and do not rely on each other's 
dependencies. Docker Compose is used to wire each container together through an internal Docker 
network. This means services can communicate between each other more easily using service names 
(e.g.,`http://sim-service:5001`) instead of IP addresses.

There is CI/CD integration via GitHub Actions, so every push to the main branch triggers an automated 
deployment pipeline. This pipeline:
1. Builds your Docker container
2. Transfers it to the cloud VM
3. Runs it, replacing the old container

In essence, any code you push to GitHub will automatically be divided into containers and run on the 
Azure Virtual Machine. As such, you should never need to log into the VM manually to deploy your code as
this is all automated. The VM itself can be reached using this link: http://20.77.58.26:8080/

---

## Your Development Environment

For your part of the development process, you do not need to install dependencies globally or run 
Python scripts directly. Instead:

1. Each service lives in its own folder inside the repository (e.g., `/knowledge-graphs`, 
`/simulation-engine`, etc.)
2. Each folder contains:
   - A `Dockerfile` that describes how to build your container. 
   - A `requirements.txt` with your own dependencies - Docker needs this to be able to make and run
   a container from your code. This `requirements.txt` file is limited to your own Docker container
   so you should feel free to use whatever dependencies you want so long as your component works.
     - This means you can ignore each other's `requirements.txt` files altogether. 
   - Your application code. For this to be runnable by Docker, it needs a main entry point 
   (e.g., `app.py`). Keep this file up-to-date within the Dockerfile. 

Each service's folder has a template Dockerfile which is written for Python files. You should each use this as a
base and modify only if needed. For instance, a Node.js app would use a different base image. But for Python, 
this works great. Let me know if you need any help in changing or understanding it. 

You are responsible for making sure that:
- Your code starts a server or process when the container is run. 
- That server listens on a defined internal port (e.g., `5001`, `5002`) which matches what you 
declare within your Dockerfile. (These internal ports are not connected to the internet, they exist
only within the Docker Compose service for purposes of inter-container communication.)
- You define clear API endpoints (e.g., `/simulate`, `/alerts`) that other services can call.
  - It is up to you to decide what your part of the application will need from others' parts.
  - You will need to define communicable data formats and workable internal API endpoints 
  between services.


---

## Inter-Service Communication
All containers are networked together. If your service wants to call another, it can do so by service 
name defined in the `docker-compose.yml`. For example:
- If `alert-service` wants to get data from `sim-service`, it makes a request to 
`http://sim-service:5001/data`. This obviously requires sim-service to have defined a `/data` endpoint
and both services to agree on the data formats exchanged. 
  - Note that there is no need to use IPs or localhost. Docker facilitates this communication based on 
  the names given in `docker-compose.yml`.

Important: You should not hardcode Azure IPs or external URLs into your code. Always refer to other 
services using their Compose service names (e.g., `sim-service`, `kg-service`).

Again, you should coordinate with the person responsible for a service to know what endpoints are 
exposed and what the expected data format is. 

---

## Repository Structure
```
/digiforge-platform
├── docker-compose.yml
├── .github/
│ └── workflows/
│ └── deploy.yml
├── sim-service/
│ ├── Dockerfile
│ ├── requirements.txt
│ └── app.py
├── analysis-service/
│ └── ...
├── kg-service/
│ └── ...
├── ui-dashboard/
│ └── ...
└── ONBOARDING.md
```

Each service has its own folder with its own environment and app, and `docker-compose.yml` names/defines 
all services and the endpoints by which they connect. The `.github/workflows/deploy.yml` folder 
automates CI/CD deployment to the Azure VM. **You should not change anything about either without first
discussing it with me (Quinten).**

---

## Developing and Testing Locally

If you are using PyCharm IDE like I am, you can use its integrated Docker tool to run and test your code.
Here's how ChatGPT says to set it up and use:
1. Go to Settings > Build, Execution, Deployment > Docker. 
2. Click the + icon to add a Docker server. 
3. Select:
   - Docker for Windows (or Mac/Linux), if you're running Docker locally 
   - Make sure Docker Desktop is running in the background 
4. Click Apply.

Then go to Settings > Python Interpreter:
1. Click the gear icon → Add Interpreter 
2. Select Docker Compose 
3. Point to your docker-compose.yml and the service you’re working on 
4. Click OK — this will set your code to run inside the Docker container

Once set up you can run your main script (e.g. `app.py`) and PyCharm will build the Docker image and run it
inside the container, automatically mounting your project files.

To run the whole system:
1. Open a terminal in PyCharm (or use an external terminal).
2. From the repo root, run:
```bash
docker compose up --build
```
This will start all services and allow you to test inter-service communication. To run only your own service:
```bash
docker compose up <module-name>
```
Substitute `module-name` for whatever your service is called in `docker-compose.yml`. 

When you make tested changes, simply commit and push to the main branch. The pipeline will automatically 
rebuild and redeploy everything to the VM.

You can test API endpoints directly using tools like:
- PyCharm's built-in HTTP Client (use `.http` files to make sample requests). Example test file in PyCharm:
  - ```http request
    GET http://localhost:5001/data
    ```
- Postman
- curl

Important reminders:
- Your container must expose the port you are testing (e.g. 5001)
- Use `localhost:PORT` only when testing from your machine
- Use `http://<service-name>:PORT` when writing code to communicate between services inside Docker.

You should not test your service by calling the Azure VM's public IP except if you are working on the 
`ui-dashboard`. All backend services are only accessible within the internal Docker network and are not 
reachable from outside the VM. They are meant to interact only with each other via service names 
(e.g., `http://sim-service:5001`), not external tools or browsers.

If another service is not ready to provide you with data yet, I would try and make some mock endpoints using
minimal Flask apps or just static JSON files (or hardcoded data within your service!).

---

## My and your Responsibilities
Each team member is responsible for:
- Creating their own service within their dedicated folder. This is the code you are writing.
  - If you feel your assignment needs multiple services (containers) let me (Quinten) know and I will
  help you set it up.
- Adjusting their Dockerfile to properly containerize their app such that it can run on the cloud.
- Keeping a `requirements.txt` up to date with their dependencies. Not doing so will make Docker not work.

You should also ensure your service:
- Exposes an API (if applicable) so that other services may get information from it.
- Defines and communicates the API interface and expected data to other teammates. Arrange this among 
involved parties.
- The template Dockerfiles provided ensure that your containers do the following (you should maintain 
these principles if you were to make any changes):
  - Listen on a clear internal port (e.g. 5001, 5002, ... ). This is what allows other services to access 
  your service.
  - Use legible service names (like http://kg-service:5002) to interact with other containers 

You can develop, test, and run everything locally using Docker Compose. Once again, you should not be using the VM
to actually test anything; simply push your locally tested changes to GitHub and the VM will be updated accordingly.

Quinten (me) is responsible for defining and maintaining:
- The `docker-compose.yml` file which ensures the containers can communicate together.
- The CI/CD pipeline (`.github/workflows/deploy.yml`) which pushes the changes to the VM.

You should not change any of the two files above unless coordinated with me. 

If you have any issues/questions about Docker, the project structure or anything else that is relevant make sure to
contact me. 
