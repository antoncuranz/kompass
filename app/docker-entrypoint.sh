#!/bin/sh
ROOT_DIR=/usr/share/nginx/html

# Replace env vars in files served by NGINX
for file in $ROOT_DIR/assets/*.js* $ROOT_DIR/index.html;
do
  sed -i 's|VITE_MAPLIBRE_STYLE_URL_PLACEHOLDER|'${MAPLIBRE_STYLE_URL}'|g' $file
done