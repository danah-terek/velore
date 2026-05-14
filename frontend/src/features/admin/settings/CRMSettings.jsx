import CRMPageHeader from '../shared/CRMPageHeader'
import CRMUnavailableState from '../shared/CRMUnavailableState'

export default function CRMSettings() {
  return (
    <div className="space-y-6">
      <CRMPageHeader title="Settings" subtitle="Super Admin only." />
      <CRMUnavailableState
        title="Settings are not implemented"
        message="There is no backend settings endpoint yet. This page will become functional once a settings API is added."
        details={['Missing: /api/v1/admin/settings (or similar)'].join('\n')}
      />
    </div>
  )
}

