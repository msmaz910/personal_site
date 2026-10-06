import { type IncomingMessage, type ServerResponse, createServer } from 'node:http'
import { ANSWER, FAKE_MODEL, FAKE_PORT, REASONING } from './constants.ts'

/** Stands in for OpenRouter: answers chat completions and records each request body. */
const received: unknown[] = []

function completion(content: string) {
  return {
    id: 'chatcmpl-e2e',
    object: 'chat.completion',
    created: 0,
    model: FAKE_MODEL,
    choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content } }],
  }
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString())
}

function reply(response: ServerResponse, body: unknown) {
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/v1/chat/completions') {
    received.push(await readJson(request))
    return reply(response, completion(`<think>${REASONING}</think>${ANSWER}`))
  }
  if (request.method === 'GET' && request.url === '/requests') return reply(response, received)
  response.writeHead(404).end()
}).listen(FAKE_PORT)
