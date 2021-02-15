const close = document.getElementById('close');
const queryParams = new URLSearchParams(location.search)
const start = document.getElementById('start');
const mute = document.getElementById('mute')
const streamview = document.getElementById('streamview');
const token = queryParams.has('token') ? queryParams.get('token') : (Math.random() * 100).toString(32).replace('.', '')

const broadcastSrc = new MediaSource();
const broadcastUrl = URL.createObjectURL(broadcastSrc);
streamview.src = broadcastUrl;

const codec = 'video/webm;codecs="vp9,opus"';

const once = (eventName, eventTarget) => new Promise((resolve) => {
    eventTarget[eventName] = resolve;
})

broadcastSrc.addEventListener("sourceopen", async () => {
    const sourceBuffer = broadcastSrc.addSourceBuffer(codec);

    // read from server
    const response = await fetch(
        '/node/'.concat(token),
        {
            headers: { 'Content-Type': 'application/octet-stream' }
        })

    const reader = response.body.getReader()
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            broadcastSrc.endOfStream();
            break;
        }
        sourceBuffer.appendBuffer(value);
        await once('onupdateend', sourceBuffer);  
    }
});

mute.onclick = () => {
    streamview.muted = !streamview.muted
}

const sendMedia = async () => {

    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // sad hack to fix audio delay on mediastream
    await new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, 1000)
    })

    const recorder = new MediaRecorder(media, { mimeType: codec });

    const readable = new ReadableStream({
        start(controller) {
            recorder.start(100);
            recorder.ondataavailable = async ({ data }) => {
                const buffer = await data.arrayBuffer();
                const uint8Buffer = new Uint8Array(buffer);
                controller.enqueue(uint8Buffer);
                if(recorder.state === 'inactive'){
                    controller.close()
                    for (const track of media.getTracks()) {
                        track.stop();
                    }
                }
            }

            close.addEventListener('click', () => {
                recorder.stop();
                
            });
        }
    })

    // Write to server
    fetch('/node/'.concat(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: readable,
    })
}

start.onclick = sendMedia
