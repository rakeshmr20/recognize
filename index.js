const app = require('fastify')({
    logger: true
})
const path = require('path')
global._host = ''

// Register static file handler
app.register(require('fastify-static'), {
    root: path.join(__dirname, 'static'),
    prefix: '/static/'
})

// Declare a routes
// HTML homepage
app.get('/', function (req, reply) {
    reply.sendFile('index.html')
})
app.get('/music-player', function (req, reply) {
    reply.sendFile('index.html')
})
app.get('/test', function (req, reply) {
    reply.sendFile('test.html')
})

app.get('/nopage', function (req, reply) {
    reply.send({})
})

// API routes
app.get('/api/static/:fileType/:fileName', (i, o) => {
    console.log(i.params.fileType)
    if (i.params.fileType && i.params.fileName) o.sendFile(`${i.params.fileName}`, path.join(__dirname, `/static/${i.params.fileType}/`))
})
app.get('/api/audio/:expression', (i, o) => {
    console.log(i.params.expression);
    if (i.params.expression) {
        // send a random song file path
        let LIST = require(`./static/json/${i.params.expression}.json`).list;
        let rand = Math.floor(Math.random() * (LIST.length - 0) + 0);
        console.log(LIST[rand])
        o.send(LIST[rand]);
    }
})


// Run the server!
app.listen(5700, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    _host = address
    app.log.info(`server listening on ${address}`)
})