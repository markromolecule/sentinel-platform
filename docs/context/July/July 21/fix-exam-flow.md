# To fix minor bugs during the exam flow and attemp page

1. The student are not being set on the [waiting] at the instructor lobby page. Whereas, student is [automatically] accepted even if the I set the exam rules as a [required] for instructor admit

2. The student are not redirected back to the lobby page when the student reload, exit, close the browser or internet connection is interrupted. We need to redirect it to the lobby page to impose a [reconnection] and ensure that the answers are still being stored locally.
    2.1 Ensure also occurs during the recon whereas the audio is took too long to initialize so its continuing without the audio. With the abovementioned issue, we can assure that when the student reconnects and on the lobby we can now ensure that the mediapipe and audio / microphone are working before navigating back to the attempt page

3. Ensure that the exam flow from the privacy page up to configuring the camera and microphone are stable and flawless for any circumstances / use case that will possibly happen during the examination

4. Ensure that the sidebar layout properly renders the sidebar items / links
    4.1 Issue right now is that when the instructor navigates to the summary or actions page it renders that one on the [history] not on the [attempt page]