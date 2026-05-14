// Inventory endpoints are not implemented on the backend yet.
// This service exists so the CRM UI can show a professional unavailable state.
export const adminInventoryService = {
  async list() {
    const err = new Error('Inventory endpoints are not available yet.')
    err.code = 'CRM_ENDPOINT_MISSING'
    throw err
  },
}

