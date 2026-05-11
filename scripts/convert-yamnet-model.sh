#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${REPO_ROOT}/app/sentinel-web/public/models/yamnet"
DOCKER_IMAGE="python:3.11-slim"
TF_HUB_HANDLE="https://tfhub.dev/google/yamnet/1"
CLASS_MAP_URL="https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv"
TENSORFLOW_VERSION="2.15.1"
TF_KERAS_VERSION="2.15.1"
TENSORFLOW_HUB_VERSION="0.16.1"
TENSORFLOWJS_VERSION="4.22.0"

if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required to build the local YAMNet TF.js bundle." >&2
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "docker is installed but the daemon is not running." >&2
    echo "Start Docker Desktop, then rerun this script." >&2
    exit 1
fi

mkdir -p "${TARGET_DIR}"
rm -f "${TARGET_DIR}"/group*-shard*.bin
rm -f "${TARGET_DIR}/model.json" "${TARGET_DIR}/yamnet_class_map.csv"

TMP_DIR="$(mktemp -d)"
CONTAINER_SCRIPT="${TMP_DIR}/container-convert-yamnet.sh"
cleanup() {
    rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

cat > "${CONTAINER_SCRIPT}" <<'EOF'
#!/usr/bin/env bash

set -euo pipefail

# Install the smallest toolchain that can convert the official TF Hub
# YAMNet SavedModel into a browser-loadable TF.js GraphModel.
apt-get update
apt-get install -y --no-install-recommends curl
rm -rf /var/lib/apt/lists/*

python -m pip install --no-cache-dir --upgrade pip
python -m pip install --no-cache-dir \
    "tensorflow==${TENSORFLOW_VERSION}" \
    "tf-keras==${TF_KERAS_VERSION}" \
    "tensorflow-hub==${TENSORFLOW_HUB_VERSION}" \
    "packaging==23.2" \
    "protobuf<5"
python -m pip install --no-cache-dir --no-deps \
    "tensorflowjs==${TENSORFLOWJS_VERSION}"

# `tensorflowjs_converter` imports optional packages eagerly. Stub the ones
# that are irrelevant to YAMNet so conversion can run in a smaller container.
rm -rf /tmp/tfjs-converter-stubs
mkdir -p /tmp/tfjs-converter-stubs/tensorflow_decision_forests
printf '%s\n' \
    '"""Stub module for tensorflow_decision_forests during TF.js conversion.' \
    '' \
    'The tensorflowjs converter imports tensorflow_decision_forests eagerly even' \
    'when the conversion target does not depend on it.' \
    '"""' \
    > /tmp/tfjs-converter-stubs/tensorflow_decision_forests/__init__.py

mkdir -p /tmp/tfjs-converter-stubs/jax/experimental
printf '%s\n' \
    '"""Stub jax package for tensorflowjs_converter import-time compatibility."""' \
    > /tmp/tfjs-converter-stubs/jax/__init__.py
printf '%s\n' \
    '"""Stub jax.experimental package for tensorflowjs_converter import-time compatibility."""' \
    > /tmp/tfjs-converter-stubs/jax/experimental/__init__.py
printf '%s\n' \
    '"""Stub jax.experimental.jax2tf module for tensorflowjs_converter import-time compatibility."""' \
    > /tmp/tfjs-converter-stubs/jax/experimental/jax2tf.py

rm -rf /tmp/yamnet-tfjs
mkdir -p /tmp/yamnet-tfjs

# The YAMNet TF Hub module exposes `serving_default`, not the converter's
# default `default` signature.
PYTHONPATH=/tmp/tfjs-converter-stubs tensorflowjs_converter \
    --input_format=tf_hub \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    "${TF_HUB_HANDLE}" \
    /tmp/yamnet-tfjs

cp -f /tmp/yamnet-tfjs/* /out/
curl -L "${CLASS_MAP_URL}" -o /out/yamnet_class_map.csv
EOF

chmod +x "${CONTAINER_SCRIPT}"

docker run --rm \
    -e TENSORFLOW_VERSION="${TENSORFLOW_VERSION}" \
    -e TF_KERAS_VERSION="${TF_KERAS_VERSION}" \
    -e TENSORFLOW_HUB_VERSION="${TENSORFLOW_HUB_VERSION}" \
    -e TENSORFLOWJS_VERSION="${TENSORFLOWJS_VERSION}" \
    -e TF_HUB_HANDLE="${TF_HUB_HANDLE}" \
    -e CLASS_MAP_URL="${CLASS_MAP_URL}" \
    -v "${TARGET_DIR}:/out" \
    -v "${CONTAINER_SCRIPT}:/tmp/container-convert-yamnet.sh:ro" \
    "${DOCKER_IMAGE}" \
    bash /tmp/container-convert-yamnet.sh

echo "YAMNet TF.js assets generated in ${TARGET_DIR}"
echo "Expected runtime URL: /models/yamnet/model.json"
