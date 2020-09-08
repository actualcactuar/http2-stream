const input = document.getElementById('input');
const output = document.getElementById('output');
const close = document.getElementById('close');
const queryParams = new URLSearchParams(location.search)
const token = queryParams.has('token') ? queryParams.get('token') : (Math.random() * 100).toString(32).replace('.', '')

const stream = new ReadableStream({
    start(controller) {
        input.addEventListener('input', (event) => {
            event.preventDefault();
            controller.enqueue(input.value);
            input.value = ""
        });

        close.addEventListener('click', () => controller.close());
    }
}).pipeThrough(new TextEncoderStream());


// Write to server
fetch('/node/'.concat(token), {
    method: 'POST', body: stream,
    headers: { 'Content-Type': 'application/octet-stream' },
    body: stream,
})

// read from server
fetch('/node/'.concat(token),
    { headers: { 'Content-Type': 'application/octet-stream' } }).then(res => {

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()

        reader.read().then(function read({ done, value }) {
            console.log({ value, done })

            if (done) {
                return;
            }

            output.insertAdjacentText("beforeend", value)

            reader.read().then(read);
        })
    })

