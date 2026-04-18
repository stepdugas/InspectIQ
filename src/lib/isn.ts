// ISN (Inspection Support Network) API client
//
// URL pattern: https://{domain}/{companyKey}/rest
// Default domain: inspectionsupport.net (most common)
// Custom domains (e.g. 4isn.com) are supported via the optional domain field.
//
// Auth: username/password (basic auth) — ISN also supports Access Key / Secret Key
// for 3rd party apps (recommended for production, add later).

function basicAuth(user: string, pass: string) {
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
}

// Construct the REST endpoint URL from domain + company key
export function buildIsnUrl(companyKey: string, domain = 'inspectionsupport.net'): string {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return `https://${cleanDomain}/${companyKey}/rest`
}

// Build an ISN API client for a specific inspector using their credentials
export function createIsnClient(baseUrl: string, username: string, password: string) {
  const auth = basicAuth(username, password)

  async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`ISN API ${res.status}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  return {
    // Verify credentials are valid
    me: () => request('/me'),

    // Fetch upcoming inspection footprints (stubs of upcoming jobs)
    // Footprints must be deleted after reading — they are queued notifications
    footprints: () => request<{ footprints?: unknown[] } | unknown[]>('/orders/footprints'),

    // Delete a footprint after it has been imported
    deleteFootprint: (id: string | number) =>
      request(`/orders/footprints`, { method: 'DELETE', body: JSON.stringify({ id }) }),

    // Fetch all orders (broader list, use footprints for upcoming jobs)
    orders: (limit = 50) => request(`/orders?limit=${limit}`),

    // Get full details for a single order
    order: (id: string | number) => request(`/order/${id}`),

    // Upload report PDF to an ISN order
    uploadReport: async (orderId: string, pdfBlob: Blob, filename: string) => {
      const form = new FormData()
      form.append('file', pdfBlob, filename)
      form.append('orderid', orderId)

      const res = await fetch(`${baseUrl}/orders/uploadreport`, {
        method: 'PUT',
        headers: { Authorization: auth },
        body: form,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(`ISN report upload failed ${res.status}: ${text}`)
      }
      return res.json()
    },

    // Add a web URL (e.g. InspectIQ share link) to an ISN order
    addReportUrl: (orderId: string, url: string) =>
      request('/orders/addreporturl', {
        method: 'PUT',
        body: JSON.stringify({ orderid: orderId, url }),
      }),
  }
}

// One-shot helper: verify credentials and return the resolved ISN URL
export async function verifyIsnCredentials(companyKey: string, username: string, password: string, domain?: string) {
  const isnUrl = buildIsnUrl(companyKey, domain)
  const client = createIsnClient(isnUrl, username, password)
  const me = await client.me()
  return { isnUrl, me }
}
