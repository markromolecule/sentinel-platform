# Goal is to fix

1. Role page - appears to have a duplicates permission for

- institution
- user & account governance - it has users and user

2. Role assignemts - investigate the [josephdump6@gmail.com] user because it appears to be have a [multiple] role which is superadmin and admin, apparently this account should be [admin] only

3. Move the [audio_calibration] page to the [telemetry_page] under the [mediapipe] sandbox

4. Fix the layout of the [Identity & Access] page in sentinel-support. It should follow a similar layout from the telemetry and access-control page where they used a layout that has a sidebar. Then remove the [sub-item] on the sidebar in the @app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx because the sub-item will be handle by the new layout similarly on the access-control and telemetry page

5. Move the calendar - item sidebar under the overview and then make sure that the UI of the calendar page in the sentinel-support should be exactly the same on the calendar ui on the sentinel-core
