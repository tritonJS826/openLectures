#!/bin/sh
# Deploy previews and branch deploys are exact copies of the site published on
# another hostname (e.g. https://<deploy>--openlectures.netlify.app/). Without a
# noindex header Google can index a preview instead of production, so every such
# deploy gets a generated _headers file. Production runs no build step at all,
# so this file never reaches the live site.
#
# Netlify cannot scope [[headers]] in netlify.toml by deploy context, hence this
# script: it writes the _headers file Netlify then reads from the publish dir.
set -eu

cat > _headers <<'EOF'
/*
  X-Robots-Tag: noindex, nofollow
EOF
