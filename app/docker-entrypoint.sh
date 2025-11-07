#!/bin/sh

# substitute environment variables
find /app/.next -type f -name "*.js" -print0 | while read -d $'\0' file
do
  sed -i "s|VITE_MAPLIBRE_STYLE_URL_PLACEHOLDER|${MAPLIBRE_STYLE_URL}|g" $file
  sed -i "s|VITE_TRANSPORTATION_API_URL_PLACEHOLDER|${TRANSPORTATION_API_URL}|g" $file # not in use
done

# docker-node entrypoint
set -e

# Run command with node if the first argument contains a "-" or is not a system command. The last
# part inside the "{}" is a workaround for the following bug in ash/dash:
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=874264
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ] || { [ -f "${1}" ] && ! [ -x "${1}" ]; }; then
  set -- node "$@"
fi

exec "$@"