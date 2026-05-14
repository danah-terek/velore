export function isMissingEndpointError(err) {
  return err?.code === 'CRM_ENDPOINT_MISSING'
}

