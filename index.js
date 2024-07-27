'use strict'

const path = require('node:path')
const fastify = require('fastify')
const fastifyFormBody = require('@fastify/formbody')
const fastifyStatic = require('@fastify/static')

const app = fastify({
	logger: {
		level: 'debug'
	}
})

app.register(fastifyFormBody, {
	bodyLimit: 104857600000000
})

app.post('/', (request, reply) => {
	const formResponses = request.body
	// console.log(formResponses)
	reply.code(200)
	reply.header('Content-Type', 'text/html; charset=utf-8')
	reply.type('text/html')
	let replyHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Clubside Web Components Test Suite</title>
	<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
	<link rel="manifest" href="site.webmanifest">
	<link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
	<meta name="msapplication-TileColor" content="#da532c">
	<meta name="theme-color" content="#ffffff">
	<link rel="stylesheet" href="css/the-new-css-reset.css" type="text/css">
	<link rel="stylesheet" href="css/style.css" type="text/css">
	<style>
		p {
			margin-block: 1rem;
			word-break: break-word;
		}
	</style>
</head>

<body>
`
	replyHtml += '\t<h1>Form Responses</h1>\n'
	for (const [key, value] of Object.entries(formResponses)) {
		// console.log(`${key}: ${value}`)
		switch (key) {
			case 'avatar':
				replyHtml += `\t<p>avatar =<br><img src="${value}"></p>\n`
				break
			case 'sample-file': {
				const endOfFilename = value.indexOf(';')
				const endOfType = value.indexOf(';', endOfFilename + 1)
				const type = value.substring(endOfFilename + 6, endOfType)
				replyHtml += `\t<p>sample-file filename = <strong>${value.substring(0, endOfFilename)}</strong>, type = <strong>${type}</strong>, data = ${value.substring(endOfType + 1)}</p>\n`
				break
			}
			default:
				replyHtml += `\t<p>${key} = <strong>${value}</strong></p>\n`
		}
	}
	replyHtml += `</body>

</html>`
	reply.send(replyHtml)
})

// static file server
app.register(fastifyStatic, {
	root: path.join(__dirname, 'src')
})

app.listen({ port: 3600 }, (err, address) => {
	if (err) throw err
})
