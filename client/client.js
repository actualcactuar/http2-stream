const close = document.getElementById('close');
const queryParams = new URLSearchParams(location.search)
const start = document.getElementById('start');
const streamview = document.getElementById('streamview');
const token = queryParams.has('token') ? queryParams.get('token') : (Math.random() * 100).toString(32).replace('.', '')

const broadcastSrc = new MediaSource();
const broadcastUrl = URL.createObjectURL(broadcastSrc);
streamview.src = broadcastUrl;
let sourceBuffer;

let updated = true;
let chunks = [];

broadcastSrc.addEventListener("sourceopen", () => {
    sourceBuffer = broadcastSrc.addSourceBuffer('video/webm;codecs="vp9"');
    sourceBuffer.onupdateend = async () => {

        if (chunks.length) {
            const buffer = Uint8Array.from(...chunks);
            console.log({ chunks, buffer })
            chunks = []
            try {
                sourceBuffer.appendBuffer(buffer);
            } catch (err) {
                console.warn(err)
            }
            updated = true;
        } else {
            updated = true;
        }
    };
});


const sendMedia = async () => {

    const media = await navigator.mediaDevices.getUserMedia({ video: true });
    const recorder = new MediaRecorder(media, { mimeType: 'video/webm;codecs="vp9"' });

    const readable = new ReadableStream({
        start(controller) {
            recorder.start(100);
            recorder.ondataavailable = async ({ data }) => {
                const buffer = await data.arrayBuffer()
                const uint8 = new Uint8Array(buffer)
                controller.enqueue(uint8);
            }

            close.addEventListener('click', () => {
                recorder.stop();
                controller.close()
                for (const track of media.getTracks()) {
                    track.stop();
                }
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

// read from server
fetch('/node/'.concat(token),
    { headers: { 'Content-Type': 'application/octet-stream' } }).then(async res => {

        const reader = res.body.getReader()
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                broadcastSrc.endOfStream();
                break;
            }

            if (!updated) {
                chunks.push(value);
            } else {
                sourceBuffer.appendBuffer(value);
                updated = false;
            }
        }
    })

