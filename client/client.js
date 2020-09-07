const input = document.getElementById('input');
const output = document.getElementById('output');
const close = document.getElementById('close');
const token = (Math.random() * 100).toString(32).replace('.', '-')

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

// const reader = readable.getReader()

// reader.read().then(function read({ done, value }) {
//     console.log({ value, done })

//     if (done) {
//         return;
//     }

//     // output.insertAdjacentText("beforeend", value)

//     reader.read().then(read);
// })


fetch('/node/'.concat(token), {
    method: 'POST', body: stream,
    headers: { 'Content-Type': 'application/octet-stream' },
    body: stream,
}).then(res => {
    console.log('POST CLOSED')
    console.log(res)
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()

    reader.read().then(function read({ done, value }) {
        console.log({ value, done })

        if (done) {
            return;
        }

        // output.insertAdjacentText("beforeend", value)

        reader.read().then(read);
    })
})


// setTimeout(() => {
//     fetch('/node/'.concat(token),
//         { headers: { 'Content-Type': 'text/plain' } }).then(res => {

//             const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()

//             reader.read().then(function read({ done, value }) {
//                 console.log({ value, done })

//                 if (done) {
//                     return;
//                 }

//                 // output.insertAdjacentText("beforeend", value)

//                 reader.read().then(read);
//             })
//         })
// }, 3000)

