// ISN (Inspection Support Network) API client
// Two-API system: Admin API resolves the ISN URL, then ISN API handles data
//
// To activate: set ISN_INTEGRATION_USER + ISN_INTEGRATION_PASS in env (from ISN ops team)
// and NEXT_PUBLIC_ISN_ENABLED=true

const ISN_ADMIN_API = 'https://isnadmin.com/rest'

function basicAuth(user: string, pass: string) {
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
}

// Use InspectIQ's integration credentials (issued by ISN to us as a vendor)
function getIntegrationAuth() {
  const user = process.env.ISN_INTEGRATION_USER
  const pass = process.env.ISN_INTEGRATION_PASS
  if (!user || !pass) throw new Error('ISN integration credentials not configured — add ISN_INTEGRATION_USER and ISN_INTEGRATION_PASS to your environment')
  return basicAuth(user, pass)
}

// Call the Admin API to resolve which URL this inspector's ISN lives at
export async function getIsnUrl(companyKey: string): Promise<string> {
  const auth = getIntegrationAuth()
  const res = await fetch(`${ISN_ADMIN_API}/isn/url?companykey=${encodeURIComponent(companyKey)}`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error(`Admin API returned ${res.status} — check your integration credentials`)
  const data = await res.json()
  if (data.status !== 'ok') throw new Error(data.message ?? 'Failed to look up ISN URL')
  return data.url as string
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
    // Verify that the inspector's credentials are valid
    me: () => request('/me'),

    // Fetch pending inspection orders
    orders: (limit = 50) => request(`/orders?limit=${limit}`),

    // Get full details for a single order
    order: (id: string | number) => request(`/order/${id}`),

    // Upload a PDF and associate it with an order
    uploadAttachment: async (orderId: string, pdfBlob: Blob, filename: string) => {
      const form = new FormData()
      form.append('file', pdfBlob, filename)
      form.append('orderid', orderId)
      form.append('name', filename)

      const res = await fetch(`${baseUrl}/attachmentupload`, {
        method: 'PUT',
        headers: { Authorization: auth },
        body: form,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(`ISN upload failed ${res.status}: ${text}`)
      }
      return res.json()
    },
  }
}

// One-shot helper: verify credentials and return the resolved ISN URL
export async function verifyIsnCredentials(companyKey: string, username: string, password: string) {
  const isnUrl = await getIsnUrl(companyKey)
  const client = createIsnClient(isnUrl, username, password)
  const me = await client.me()
  return { isnUrl, me }
}
