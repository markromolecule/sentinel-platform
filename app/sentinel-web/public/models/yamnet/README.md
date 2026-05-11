This directory stores the local TensorFlow.js build of the official YAMNet v1 model.

Only the browser-loadable TF.js runtime assets should live here. Do not keep the
raw TensorFlow SavedModel export in this directory once conversion is complete.

Expected generated assets:

- `model.json`
- `group*-shard*.bin`
- `yamnet_class_map.csv`

Generate or refresh the bundle from the repository root:

```bash
pnpm run model:yamnet
```

The conversion script uses the official TensorFlow Hub YAMNet handle and the
upstream class map from `tensorflow/models`.

The raw TensorFlow SavedModel source bundle is intentionally not kept in this
directory after conversion.
