# Circles Chat

Chat app for Circles users.

## Prerequisites

- Node.js 20+
- npm

## Local development

```bash
npm install
cp .env.example .env   # sets MYLOCALHOST=1 for local API env vars
gcloud auth application-default login   # Datastore access for project circles-chat-22
```

Run the API server and Vite dev server (two terminals):

```bash
npm run dev:api   # http://localhost:8080 — Datastore-backed /api/chat
npm run dev       # http://localhost:5173 — proxies /api to :8080
```

Open the dev server URL (typically `http://localhost:5173`).

### Test inside the Circles host

1. Start the dev server.
2. Go to [Circles Playground](https://circles.gnosis.io/playground).
3. Paste your localhost URL to load the app in the host iframe.
4. Connect a wallet in the host; the app should show your checksummed address.

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Preview production build locally

```bash
npm run build
npm start
```

Visit `http://localhost:8080`.

## Deploy to Google App Engine

### How to set up Google App Engine & Cloud Build

- Create App Engine app
  - Select region (e.g. europe-west).
  - This will also automatically create a Datastore database (it may take a few minutes).
- Enable the following APIs:
  - Cloud Build API
  - Cloud Tasks API
  - App Engine Admin API
  - Cloud Scheduler API
  - Secret Manager API 
- Go to IAM:
  - Check the `Include Google-provided role grants` checkbox
  - Then give the `Cloud Scheduler Admin` role to:
    - the Cloud Build service account
    - the Default App Engine service account 
- Connect your GitHub repo with Google Cloud Repositories:
  - Go to repositories: https://console.cloud.google.com/cloud-build/repositories/2nd-gen 
  - Click on "Create host connection" and connect your GitHub (org or personal account)
  - Click on "Link repositories" and select your repo on GitHub
- Open the Cloud Build Permissions page:
  - choose the service account **without** numbers, and set it as **preferred service account**
  - set the status of the App Engine Admin role to Enabled 
  - set the status of the Service Account User role to Enabled
- Then go to the "Triggers" page:
  - click on "Create trigger"
  - Give it a name `Commit`, select 2nd Gen and select your repo
  - In the **branch** input, make sure to select the correct branch (e.g. `^main$`)
  - Run the trigger and check its logs in History
  - If you get an error, add the appropriate user to IAM
- Go to Cloud Tasks:
  - Create the `default` queue
  - Make sure the region is the same as you selected for your GAE app (e.g. europe-west1)
  - Leave everything else the default
