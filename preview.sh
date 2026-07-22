#!/usr/bin/env bash
# Lance la prévisualisation locale du wiki (rechargement à chaud).
set -euo pipefail
cd "$(dirname "$0")"

# Filet de sécurité : installe les dépendances si elles manquent (ex. conteneur neuf).
if [ ! -d node_modules ]; then
  echo "Première utilisation, installation des dépendances (npm ci)…"
  npm ci
fi

echo ""
echo "  ┌──────────────────────────────────────────"
echo "  │  Prévisualisation du wiki"
echo "  │"
echo "  │  Ouvre dans ton navigateur :"
echo "  │      http://localhost:8080"
echo "  │"
echo "  │  Les modifs des .md apparaissent en direct."
echo "  │  Ctrl+C pour arrêter."
echo "  └──────────────────────────────────────────"
echo ""

exec npx quartz build --serve
