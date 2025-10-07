/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker.
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = 'c5f7f8e1660494a7415f3cad'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !self.clients) {
    return
  }

  const client = await self.clients.get(clientId)

  if (!client) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(client, {
        type: 'KEEPALIVE_RESPONSE',
      })
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(client, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(client, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

      // Unregister itself when there are no more clients
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event

  // Bypass navigation requests.
  if (request.mode === 'navigate') {
    return
  }

  // Opening the DevTools triggers the "only-if-cached" request
  // that cannot be handled by the worker. Bypass such requests.
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  // Bypass all requests when there are no active clients.
  // Prevents the self-unregistered worked from handling requests
  // after it's been deleted (still remains active until the next reload).
  if (activeClientIds.size === 0) {
    return
  }

  // Generate unique request ID.
  const requestId = crypto.randomUUID()

  event.respondWith(
    handleRequest(event, requestId).catch((error) => {
      if (error.name === 'NetworkError') {
        console.warn(
          '[MSW] Successfully emulated a network error for the "%s %s" request.',
          request.method,
          request.url,
        )
        return
      }

      // At this point, any exception indicates an issue with the original request/response.
      console.error(
        `\
[MSW] Caught an exception from the "%s %s" request (%s). This is probably not a problem with Mock Service Worker. There is likely an additional logging output above.`,
        request.method,
        request.url,
        `${error.name}: ${error.message}`,
      )
    }),
  )
})

async function handleRequest(event, requestId) {
  const client = await event.target.clients.get(event.clientId)

  if (!client) {
    return passthrough(event.request)
  }

  if (!activeClientIds.has(client.id)) {
    return passthrough(event.request)
  }

  const requestClone = event.request.clone()

  sendToClient(
    client,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        url: requestClone.url,
        method: requestClone.method,
        headers: Object.fromEntries(requestClone.headers.entries()),
        cache: requestClone.cache,
        mode: requestClone.mode,
        credentials: requestClone.credentials,
        destination: requestClone.destination,
        integrity: requestClone.integrity,
        redirect: requestClone.redirect,
        referrer: requestClone.referrer,
        referrerPolicy: requestClone.referrerPolicy,
        body: await requestClone.text(),
        keepalive: requestClone.keepalive,
      },
    },
    [requestClone.body],
  )

  const responsePromise = new Promise((resolve, reject) => {
    messageHandlers.set(client.id + requestId, { resolve, reject })
  })

  return await responsePromise
}

async function passthrough(request) {
  const requestClone = request.clone()
  return fetch(requestClone)
}

function sendToClient(client, message, transferables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    client.postMessage(
      message,
      [channel.port2].concat(transferables.filter(Boolean)),
    )
  })
}

const messageHandlers = new Map()

function createResponse(clientId, requestId, response) {
  const key = clientId + requestId
  const handler = messageHandlers.get(key)
  messageHandlers.delete(key)

  const responseInit = {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  }

  responseInit.headers.set('x-powered-by', 'msw')

  if (response.body === null) {
    return handler.resolve(new Response(null, responseInit))
  }

  const responseBodyOrStream =
    typeof response.body === 'object' &&
    response.body !== null &&
    'type' in response.body &&
    typeof response.body.type === 'string' &&
    response.body.type !== 'text'
      ? bufferToStream(base64ToBuffer(response.body.data))
      : response.body

  const responseInstance = new Response(responseBodyOrStream, responseInit)

  Object.defineProperty(responseInstance, IS_MOCKED_RESPONSE, {
    value: true,
    enumerable: true,
  })

  return handler.resolve(responseInstance)
}

function bufferToStream(buffer) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(buffer)
      controller.close()
    },
  })

  return stream
}

function base64ToBuffer(base64) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

self.addEventListener('message', async function (event) {
  const clientId = event.source.id
  const { type, payload } = event.data

  if (type === 'MOCK_RESPONSE') {
    createResponse(clientId, payload.requestId, payload)
    return
  }
})
