#!/bin/bash
gcloud alpha functions deploy dm4 \
  --runtime nodejs20 \
  --source . \
  --gen2 \
  --trigger-http \
  --no-allow-unauthenticated \
  --entry-point entry \
  --env-vars-file env.yaml \
  --timeout=3600 \
  --region=us-central1 \
  --max-instances=1000 \
  --min-instances=0 \
  --concurrency=1 \
  --memory=4G
