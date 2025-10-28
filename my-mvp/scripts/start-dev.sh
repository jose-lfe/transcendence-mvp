#!/usr/bin/env sh
# watchers: tsc --watch, tailwind --watch, puis serveur python pour servir la racine
trap 'kill $(jobs -p) 2>/dev/null' EXIT

mkdir -p dist

echo "Lancement : tsc --watch"
npx tsc --watch &
PID_TSC=$!

echo "Lancement : tailwind css --watch"
npx tailwindcss -i ./src/index.css -o ./dist/style.css --watch &
PID_TAILWIND=$!

# petit délai
sleep 1

echo "Démarrage du serveur statique (python http.server sur 0.0.0.0:5173)"
python3 -m http.server 5173 --bind 0.0.0.0
wait
