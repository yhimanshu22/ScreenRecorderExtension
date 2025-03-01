let mediaRecorder;
let recordedChunks = [];

document.getElementById("start").addEventListener("click", async () => {
    try {
        // Request permissions explicitly
        const hasScreenPermission = await navigator.permissions.query({ name: "display-capture" }).catch(() => null);
        const hasMicPermission = await navigator.permissions.query({ name: "microphone" }).catch(() => null);

        // Check if permissions are granted
        if (hasScreenPermission?.state === "denied" || hasMicPermission?.state === "denied") {
            alert("Permission denied. Please allow screen & microphone access.");
            return;
        }

        // Get screen recording
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        // Get microphone audio
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Merge streams
        const combinedStream = new MediaStream([...displayStream.getVideoTracks(), ...micStream.getAudioTracks()]);

        // Initialize MediaRecorder
        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "video/webm;codecs=vp8,opus" });

        // Collect the recorded data
        mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);

        // Save the recording when stopped
        mediaRecorder.onstop = saveRecording;

        // Start recording
        mediaRecorder.start();

        // Disable start button and enable stop button
        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = false;

    } catch (error) {
        console.error("Recording Error:", error);
        alert("Recording failed. Please check permissions and try again.");
    }
});

document.getElementById("stop").addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        document.getElementById("start").disabled = false;
        document.getElementById("stop").disabled = true;
    }
});

// Function to save the recorded file as .webm
function saveRecording() {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    // Create a download link for the recorded video
    const a = document.createElement("a");
    a.href = url;
    a.download = "screen-recording.webm"; // Save as .webm
    a.click();

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
}
