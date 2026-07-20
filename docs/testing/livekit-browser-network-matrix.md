# LiveKit Browser and Network Matrix

Fill this matrix before enabling any real institution. Use synthetic accounts only.

| Browser / OS           | Network path | First frame | Video-only confirmed | Student indicator | Reconnect result | Cleanup duration | Failure code | Evidence link |
| ---------------------- | ------------ | ----------- | -------------------- | ----------------- | ---------------- | ---------------- | ------------ | ------------- |
| Chrome / macOS         | normal Wi-Fi | pending     | pending              | pending           | pending          | pending          | pending      | pending       |
| Firefox / macOS        | normal Wi-Fi | pending     | pending              | pending           | pending          | pending          | pending      | pending       |
| Safari / macOS         | normal Wi-Fi | pending     | pending              | pending           | pending          | pending          | pending      | pending       |
| Chromium / throttled   | 4G profile   | pending     | pending              | pending           | pending          | pending          | pending      | pending       |
| Chrome / TURN-required | blocked UDP  | pending     | pending              | pending           | pending          | pending          | pending      | pending       |

## Required scenario notes

- First frame must be measured from staff start click to `LIVE` video playback, not just token issuance.
- Viewer UI must remain `WAITING` or `CONNECTING` until the expected camera track emits playback.
- Audio tracks, screen-share tracks, thumbnails, screenshots, recordings, Egress, and raw media persistence must remain absent.
- Student answering/submission and MediaPipe must continue after stop, crash, refresh, and rollback drills.
- Every failed case needs one bounded failure code and a follow-up regression test or a documented browser/provider limitation.

## Capacity and cost evidence

| Scenario                             | Expected provider participants | Observed participants | Participant minutes | Downstream GB | Cleanup result | Notes                        |
| ------------------------------------ | -----------------------------: | --------------------: | ------------------: | ------------: | -------------- | ---------------------------- |
| 60 active attempts, zero inspections |                              0 |               pending |                   0 |             0 | pending        | proves no idle cost          |
| 1 inspection                         |                              2 |               pending |             pending |       pending | pending        | one publisher, one viewer    |
| 10 inspections across 10 exams       |                             20 |               pending |             pending |       pending | pending        | verifies `2N` maximum        |
| duplicate start on one attempt       |                          2 max |               pending |             pending |       pending | pending        | second lease rejected        |
| one viewer opens two students        |                          2 max |               pending |             pending |       pending | pending        | second viewer lease rejected |
| provider cap exhausted               |                   bounded fail |               pending |             pending |       pending | pending        | no exam data mutation        |
| institution cap exhausted            |                   bounded fail |               pending |             pending |       pending | pending        | no exam data mutation        |
