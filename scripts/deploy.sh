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
  --memory=2G
