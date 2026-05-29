import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { adminProductService } from '../services/adminProductService'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMActionButton from '../shared/CRMActionButton'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import CRMProductForm, {
  buildProductPayload,
  buildVariantPayload,
  isVariantEmpty,
  validateProductForm,
  validateVariant,
} from './CRMProductForm'
import { useAdminAuth } from '../auth/AdminAuthContext'

// ─── palette tokens ────────────────────────────────────────────────────────
// #76CDD6  teal accent
// #1E1D22  dark text
// #EFF8FE  light blue bg
// #ffffff  card surface

function normalizeCategoryRow(c) {
  return { category_id: String(c.category_id), name: c.name }
}

function normalizeBrandRow(b) {
  return { brand_id: String(b.brand_id), name: b.name }
}

function productToFormValues(p) {
  const specs = p?.specifications || {}
  return {
    name: p?.name || '',
    price: p?.price?.toString?.() ? p.price.toString() : String(p?.price || ''),
    category_id: p?.categories?.category_id?.toString?.() ? p.categories.category_id.toString() : String(p?.category_id || ''),
    brand_id: p?.brands?.brand_id?.toString?.() ? p.brands.brand_id.toString() : String(p?.brand_id || ''),
    description: p?.description || '',
    compare_price: p?.compare_price?.toString?.() ? p.compare_price.toString() : (p?.compare_price ? String(p.compare_price) : ''),
    gender: p?.gender || '',
    material: specs.material || p?.material || '',
    frame_shape: specs.frame_shape || p?.frame_shape || '',
    face_shape: specs.face_shape || p?.face_shape || '',
    lens_width: specs.lens_width ?? p?.lens_width ?? '',
    bridge_width: specs.bridge_width ?? p?.bridge_width ?? '',
    temple_length: specs.temple_length ?? p?.temple_length ?? '',
    diameter: specs.diameter ?? p?.diameter ?? '',
    base_curve: specs.base_curve ?? p?.base_curve ?? '',
    water_content: specs.water_content ?? p?.water_content ?? '',
    lenses_per_pack: specs.lenses_per_pack ?? p?.lenses_per_pack ?? '',
    blue_light_protection: specs.blue_light_protection ?? p?.blue_light_protection ?? false,
    is_active: p?.is_active !== undefined ? !!p.is_active : true,
    duration: specs.duration ?? p?.duration ?? '',
    prescription_applies: specs.prescription_applies ?? p?.prescription_applies ?? true,
    thumbnail: p?.thumbnail || '',
  }
}

// shared input style
const inputStyle = {
  width: '100%',
  border: '1px solid rgba(118,205,214,0.30)',
  borderRadius: '4px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  background: '#ffffff',
  color: '#1E1D22',
  transition: 'border-color 0.16s ease',
}
const handleFocus = e => e.target.style.borderColor = '#76CDD6'
const handleBlur  = e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'

function PaletteInput({ value, onChange, inputMode }) {
  return (
    <input
      value={value}
      onChange={onChange}
      inputMode={inputMode}
      style={inputStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}

function PaletteBtn({ onClick, disabled, children, variant = 'primary' }) {
  const isPrimary = variant === 'primary'
  const isDanger  = variant === 'danger'
  const base = isDanger
    ? { background: 'linear-gradient(135deg,#e05555,#c0392b)', color: '#fff', border: 'none' }
    : isPrimary
      ? { background: '#76CDD6', color: '#fff', border: '1px solid #76CDD6' }
      : { background: 'transparent', color: '#76CDD6', border: '1.5px solid #76CDD6' }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 transition-all duration-200 disabled:opacity-50"
      style={{ borderRadius: '4px', ...base }}
      onMouseEnter={e => {
        if (disabled) return
        if (isDanger) e.currentTarget.style.opacity = '0.85'
        else if (isPrimary) e.currentTarget.style.background = '#5bb8c2'
        else { e.currentTarget.style.background = '#76CDD6'; e.currentTarget.style.color = '#fff' }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = '1'
        if (isDanger) return
        if (isPrimary) e.currentTarget.style.background = '#76CDD6'
        else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#76CDD6' }
      }}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }) {
  return (
    <label
      className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
      style={{ color: 'rgba(30,29,34,0.50)' }}
    >
      {children}
    </label>
  )
}

function SectionDivider({ title }) {
  return (
    <div
      className="pt-6 mt-6"
      style={{ borderTop: '1px solid rgba(118,205,214,0.20)' }}
    >
      <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>{title}</div>
    </div>
  )
}

function PillMuted({ children, purple }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 text-xs max-w-full"
      style={{
        background: purple ? 'rgba(147,51,234,0.06)' : '#EFF8FE',
        border: `1px solid ${purple ? 'rgba(147,51,234,0.20)' : 'rgba(118,205,214,0.25)'}`,
        borderRadius: '4px',
        color: '#1E1D22',
      }}
    >
      {children}
    </span>
  )
}

export default function CRMProductEditor({ mode }) {
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.id

  const isEdit = mode === 'edit'
  const { admin } = useAdminAuth()
  const role = admin?.role === 'admin' ? 'staff_admin' : admin?.role
  const isSuper = role === 'super_admin'

  const [options, setOptions] = useState({ loading: true, error: null, categories: [], brands: [] })
  const [product, setProduct] = useState({ loading: isEdit, error: null, data: null })
  const [saving, setSaving] = useState(false)
  const [serverMessage, setServerMessage] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadedImagePaths, setUploadedImagePaths] = useState([])
  const [uploadedTryOnImagePaths, setUploadedTryOnImagePaths] = useState([])
  const [newBrandName, setNewBrandName] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  const [defaultVariant, setDefaultVariant] = useState({
    sku: '', stock_quantity: '', low_stock_alert: '', color_name: '', color_hex: '', size: '', price_adjustment: '',
  })
  const [defaultVariantErrors, setDefaultVariantErrors] = useState({})

  const [variantsState, setVariantsState] = useState({ loading: false, error: null, rows: [] })
  const [variantBusyId, setVariantBusyId] = useState(null)
  const [variantConfirmDeleteId, setVariantConfirmDeleteId] = useState(null)
  const [variantDrafts, setVariantDrafts] = useState({})
  const [variantNew, setVariantNew] = useState({
    sku: '', stock_quantity: '', low_stock_alert: '', color_name: '', color_hex: '', size: '', price_adjustment: '', images: [],
  })
  const [variantNewImages, setVariantNewImages] = useState([])
  const [variantNewUploadedPaths, setVariantNewUploadedPaths] = useState([])
  const [variantNewTryOnImages, setVariantNewTryOnImages] = useState([])
  const [variantNewUploadedTryOnPaths, setVariantNewUploadedTryOnPaths] = useState([])
  const [variantNewError, setVariantNewError] = useState(null)

  const [values, setValues] = useState(() =>
    isEdit
      ? productToFormValues(null)
      : { name: '', price: '', category_id: '', brand_id: '', description: '', compare_price: '', gender: '', material: '', frame_shape: '', face_shape: '', is_active: true, thumbnail: '' }
  )
  const [errors, setErrors] = useState({})

  const loadOptions = useCallback(async () => {
    setOptions({ loading: true, error: null, categories: [], brands: [] })
    try {
      const [cats, brands] = await Promise.all([
        adminProductService.listCategories(),
        adminProductService.listBrands(),
      ])
      setOptions({
        loading: false, error: null,
        categories: (cats.data || []).map(normalizeCategoryRow),
        brands: (brands.data || []).map(normalizeBrandRow),
      })
    } catch (e) {
      setOptions({ loading: false, error: e?.message || e?.error || 'Failed to load categories/brands', categories: [], brands: [] })
    }
  }, [])

  const loadProduct = useCallback(async () => {
    if (!isEdit) return
    setProduct({ loading: true, error: null, data: null })
    try {
      const res = await adminProductService.getAdminProduct(productId)
      setProduct({ loading: false, error: null, data: res.data })
      setValues(productToFormValues(res.data))
      const raw = res.data?.product_variants?.[0]?.images?.[0]
      if (raw) setThumbnailUrl(resolveImageUrl(raw))
    } catch (e) {
      setProduct({ loading: false, error: e?.message || e?.error || 'Failed to load product', data: null })
    }
  }, [isEdit, productId])

  useEffect(() => { loadOptions() }, [loadOptions])
  useEffect(() => { loadProduct() }, [loadProduct])

  const allVariantImages = useMemo(() => {
    if (!product.data) return []
    return product.data.product_variants?.flatMap(v =>
      (v.images || []).map(img => ({ url: img, variantId: v.variant_id, color: v.color_name }))
    ) || []
  }, [product.data])

  const loadVariants = useCallback(async () => {
    if (!isEdit || !productId) return
    setVariantsState({ loading: true, error: null, rows: [] })
    try {
      const res = await adminProductService.listProductVariants(productId)
      setVariantsState({ loading: false, error: null, rows: res.data || [] })
    } catch (e) {
      setVariantsState({ loading: false, error: e?.message || e?.error || 'Failed to load variants', rows: [] })
    }
  }, [isEdit, productId])

  useEffect(() => { loadVariants() }, [loadVariants])

  const handleAddBrand = async (name) => {
    try {
      const res = await adminProductService.createBrand(name)
      const brand = res?.data?.brand_id
        ? { brand_id: res.data.brand_id.toString(), name }
        : { brand_id: res?.data?.id?.toString(), name }
      setOptions(prev => ({ ...prev, brands: [...prev.brands, brand] }))
      setValues(prev => ({ ...prev, brand_id: brand.brand_id }))
      setNewBrandName('')
    } catch (err) {
      setUploadError(err?.message || 'Failed to create brand')
    }
  }

  if (isEdit && !productId) return <Navigate to="/admin/products" replace />
  if (product.loading) return <CRMLoadingState label="Loading product…" />
  if (product.error) return <CRMErrorState message={product.error} onRetry={loadProduct} />
  if (isEdit && !product.data) return <CRMEmptyState title="Product not found" message="This product may have been deleted." />

  return (
    <div className="space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#76CDD6' }}>
          {isEdit ? 'Edit' : 'Create'}
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="text-sm mt-1 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          {isEdit ? `Editing product #${productId}` : 'Create a new product using real backend APIs.'}
        </p>
      </div>

      {options.error ? <CRMErrorState title="Failed to load form options" message={options.error} onRetry={loadOptions} /> : null}

      {/* Product Form — untouched, just wrapped in white card */}
      <div
        className="p-6 sm:p-8"
        style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
      >
        <CRMProductForm
          mode={isEdit ? 'edit' : 'create'}
          values={values}
          errors={errors}
          onChange={(patch) => {
            setServerMessage(null)
            setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
            setValues((v) => ({ ...v, ...patch }))
          }}
          onCancel={() => navigate('/admin/products')}
          onSubmit={async () => {
            console.log('VALUES:', JSON.stringify(values, null, 2))
            console.log('THUMBNAIL:', values.thumbnail)
            setServerMessage(null)
            setUploadError(null)
            const nextErrors = validateProductForm(values)
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0) return
            if (options.loading || options.error) return

            setSaving(true)
            try {
              const payload = buildProductPayload(values)
              payload.thumbnail = values.thumbnail
              if (isEdit) {
                const res = await adminProductService.update(productId, payload)
                setServerMessage(res?.message || 'Product updated successfully.')
                setProduct((p) => ({ ...p, data: res?.data || p.data }))
              } else {
                let uploadedPaths = []
                if (selectedImages.length) {
                  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
                  for (const it of selectedImages) {
                    const f = it.file
                    if (!allowed.includes(f.type)) { setUploadError('Invalid file type. Allowed: jpeg, png, webp, svg.'); setSaving(false); return }
                    if (f.size > 5 * 1024 * 1024) { setUploadError('File too large. Max 5MB per file.'); setSaving(false); return }
                  }
                  const needsSku = true
                  const vErr = validateVariant(defaultVariant, { requireSku: needsSku })
                  setDefaultVariantErrors(vErr)
                  if (Object.keys(vErr).length) { setSaving(false); return }
                  const up = await adminProductService.uploadProductImages(selectedImages.map((it) => it.file))
                  uploadedPaths = up?.data?.paths || []
                  setUploadedImagePaths(uploadedPaths)
                }
                const res = await adminProductService.create(payload)
                const newId = res?.data?.product_id
                const newIdStr = newId?.toString?.() ? newId.toString() : String(newId || '')
                const shouldCreateVariant = !isVariantEmpty(defaultVariant, selectedImages.length, uploadedPaths.length) || uploadedPaths.length > 0
                if (shouldCreateVariant) {
                  const requireSku = uploadedPaths.length > 0
                  const vErr = validateVariant(defaultVariant, { requireSku })
                  setDefaultVariantErrors(vErr)
                  if (Object.keys(vErr).length) { setSaving(false); return }
                  try {
                    const variantPayload = buildVariantPayload(defaultVariant, uploadedPaths, uploadedTryOnImagePaths)
                    await adminProductService.createProductVariant(newIdStr, variantPayload)
                  } catch (e) {
                    const msg = e?.message || e?.error || 'Variant creation failed'
                    setServerMessage(`Product created, but variant failed: ${msg}`)
                    navigate(`/admin/products/${newIdStr}/edit`, { replace: true })
                    return
                  }
                }
                setServerMessage(res?.message || 'Product created successfully.')
                navigate(`/admin/products/${newIdStr}/edit`, { replace: true })
              }
            } catch (e) {
              setServerMessage(e?.message || e?.error || 'Save failed')
            } finally {
              setSaving(false)
            }
          }}
          saving={saving}
          categories={options.categories}
          brands={options.brands}
          optionsLoading={options.loading}
          optionsError={options.error}
          thumbnailUrl={thumbnailUrl}
          allVariantImages={allVariantImages}
          onThumbnailChange={(resolvedUrl) => {
            setThumbnailUrl(resolvedUrl)
            const img = allVariantImages.find(v => resolveImageUrl(v.url) === resolvedUrl)
            if (img) setValues(prev => ({ ...prev, thumbnail: img.url }))
          }}
          defaultVariant={defaultVariant}
          defaultVariantErrors={defaultVariantErrors}
          onDefaultVariantChange={(patch) => {
            setDefaultVariantErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, null])) }))
            setDefaultVariant((v) => ({ ...v, ...patch }))
          }}
          selectedImages={selectedImages}
          onSelectImages={(files) => {
            setUploadError(null)
            setSelectedImages((prev) => {
              for (const it of prev) URL.revokeObjectURL(it.url)
              return (files || []).map((f) => ({ file: f, url: URL.createObjectURL(f) }))
            })
          }}
          onRemoveSelectedImage={(idx) => {
            setSelectedImages((arr) => {
              const target = arr[idx]
              if (target?.url) URL.revokeObjectURL(target.url)
              return arr.filter((_, i) => i !== idx)
            })
          }}
          uploadedImagePaths={uploadedImagePaths}
          onRemoveUploadedImagePath={(p) => setUploadedImagePaths((arr) => arr.filter((x) => x !== p))}
          uploadError={uploadError}
          serverMessage={serverMessage}
          newBrandName={newBrandName}
          setNewBrandName={setNewBrandName}
          onAddBrand={handleAddBrand}
        />
      </div>

      {/* Variants Section */}
      {isEdit ? (
        <div
          className="p-6 sm:p-8"
          style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
        >
          {/* Variants header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#1E1D22' }}>Variants</h2>
              <p className="text-[10px] mt-1" style={{ color: '#76CDD6' }}>
                Create and manage product variants (SKU, stock, images).
              </p>
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.08em] px-3 py-1.5"
              style={{
                borderRadius: '4px',
                background: isSuper ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(30,29,34,0.08)',
                color: isSuper ? '#fff' : 'rgba(30,29,34,0.55)',
              }}
            >
              {isSuper ? 'Super Admin' : 'Staff Admin'}
            </span>
          </div>

          {variantsState.loading ? <CRMLoadingState label="Loading variants…" /> : null}
          {!variantsState.loading && variantsState.error ? <CRMErrorState message={variantsState.error} onRetry={loadVariants} /> : null}
          {!variantsState.loading && !variantsState.error && variantsState.rows.length === 0 ? (
            <CRMEmptyState title="No variants yet" message="Create a variant to add SKU, stock, and images." />
          ) : null}

          {!variantsState.loading && !variantsState.error && variantsState.rows.length > 0 ? (
            <div className="space-y-4">
              {variantsState.rows.map((v) => {
                const draft = variantDrafts[v.variant_id] || {}
                const current = { ...v, ...draft }
                const images = Array.isArray(current.images) ? current.images : []
                const tryOnImages = Array.isArray(current.tryon_images) ? current.tryon_images : []

                return (
                  <div
                    key={v.variant_id}
                    className="p-4 sm:p-5"
                    style={{
                      background: '#EFF8FE',
                      border: '1px solid rgba(118,205,214,0.20)',
                      borderRadius: '4px',
                    }}
                  >
                    {/* Variant header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>
                          Variant #{v.variant_id}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(30,29,34,0.45)' }}>
                          SKU required · Images stored as /uploads/products/…
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PaletteBtn
                          variant="secondary"
                          disabled={variantBusyId === v.variant_id}
                          onClick={async () => {
                            setVariantBusyId(v.variant_id)
                            try {
                              const payload = buildVariantPayload(current, images, tryOnImages)
                              await adminProductService.updateProductVariant(v.variant_id, payload)
                              setVariantDrafts((m) => { const next = { ...m }; delete next[v.variant_id]; return next })
                              await loadVariants()
                            } catch (e) {
                              setVariantsState((s) => ({ ...s, error: e?.message || e?.error || 'Failed to update variant' }))
                            } finally { setVariantBusyId(null) }
                          }}
                        >
                          {variantBusyId === v.variant_id ? 'Saving…' : 'Save'}
                        </PaletteBtn>
                        <PaletteBtn
                          variant="danger"
                          disabled={!isSuper || variantBusyId === v.variant_id}
                          title={!isSuper ? 'Super Admin only' : variantConfirmDeleteId === v.variant_id ? 'Click again to confirm' : 'Delete variant'}
                          onClick={async () => {
                            if (!isSuper) return
                            if (variantConfirmDeleteId !== v.variant_id) {
                              setVariantConfirmDeleteId(v.variant_id)
                              window.setTimeout(() => setVariantConfirmDeleteId(null), 4000)
                              return
                            }
                            setVariantBusyId(v.variant_id)
                            try {
                              await adminProductService.deleteProductVariant(v.variant_id)
                              setVariantConfirmDeleteId(null)
                              await loadVariants()
                            } catch (e) {
                              setVariantsState((s) => ({ ...s, error: e?.message || e?.error || 'Failed to delete variant' }))
                            } finally { setVariantBusyId(null) }
                          }}
                        >
                          {variantConfirmDeleteId === v.variant_id ? 'Confirm?' : 'Delete'}
                        </PaletteBtn>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {['sku', 'color_name', 'color_hex', 'size'].map((k) => (
                        <div key={k}>
                          <FieldLabel>{k}</FieldLabel>
                          <PaletteInput
                            value={current[k] ?? ''}
                            onChange={(e) => setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), [k]: e.target.value } }))}
                          />
                        </div>
                      ))}
                      {['stock_quantity', 'low_stock_alert', 'price_adjustment'].map((k) => (
                        <div key={k}>
                          <FieldLabel>{k}</FieldLabel>
                          <PaletteInput
                            value={current[k] ?? ''}
                            onChange={(e) => setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), [k]: e.target.value } }))}
                            inputMode={k === 'price_adjustment' ? 'decimal' : 'numeric'}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Images */}
                    <div className="mt-5">
                      <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>Images</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {images.length ? images.map((p) => (
                          <PillMuted key={p}>
                            <span className="truncate max-w-[240px]">{p}</span>
                            <button
                              type="button"
                              className="font-medium transition-colors"
                              style={{ color: '#e05555', flexShrink: 0 }}
                              onClick={() => {
                                const next = images.filter((x) => x !== p)
                                setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), images: next } }))
                              }}
                            >
                              Remove
                            </button>
                          </PillMuted>
                        )) : <span className="text-sm" style={{ color: 'rgba(30,29,34,0.40)' }}>No images</span>}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || [])
                            if (!files.length) return
                            setVariantBusyId(v.variant_id)
                            try {
                              const up = await adminProductService.uploadProductImages(files)
                              const paths = up?.data?.paths || []
                              const merged = Array.from(new Set([...images, ...paths]))
                              setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), images: merged } }))
                            } catch (err) {
                              setVariantsState((s) => ({ ...s, error: err?.message || err?.error || 'Upload failed' }))
                            } finally { setVariantBusyId(null); e.target.value = '' }
                          }}
                          className="block w-full sm:w-auto min-w-0 text-sm"
                          style={{ color: 'rgba(30,29,34,0.55)' }}
                        />
                        <span className="text-xs" style={{ color: 'rgba(30,29,34,0.40)' }}>
                          Uploads return /uploads/... paths
                        </span>
                      </div>
                      {images.length ? (
                        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                          {images.slice(0, 6).map((p) => (
                            <img
                              key={p}
                              src={resolveImageUrl(p) || ''}
                              alt=""
                              className="w-full aspect-square object-cover"
                              style={{ borderRadius: '4px', border: '1px solid rgba(118,205,214,0.25)', background: '#EFF8FE' }}
                              loading="lazy"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Try-On Images */}
                    <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(118,205,214,0.18)' }}>
                      <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>
                        Try-On Images <span style={{ color: 'rgba(147,51,234,0.70)', fontSize: '11px' }}>(transparent background)</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tryOnImages.length ? tryOnImages.map((p) => (
                          <PillMuted key={p} purple>
                            <span className="truncate max-w-[240px]">{p}</span>
                            <button
                              type="button"
                              className="font-medium"
                              style={{ color: '#e05555', flexShrink: 0 }}
                              onClick={() => {
                                const next = tryOnImages.filter((x) => x !== p)
                                setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), tryon_images: next } }))
                              }}
                            >
                              Remove
                            </button>
                          </PillMuted>
                        )) : <span className="text-sm" style={{ color: 'rgba(30,29,34,0.40)' }}>No try-on images</span>}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <input
                          type="file"
                          accept="image/png"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || [])
                            if (!files.length) return
                            setVariantBusyId(v.variant_id)
                            try {
                              const up = await adminProductService.uploadProductImages(files)
                              const paths = up?.data?.paths || []
                              const merged = Array.from(new Set([...tryOnImages, ...paths]))
                              setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), tryon_images: merged } }))
                            } catch (err) {
                              setVariantsState((s) => ({ ...s, error: err?.message || err?.error || 'Upload failed' }))
                            } finally { setVariantBusyId(null); e.target.value = '' }
                          }}
                          className="block w-full sm:w-auto min-w-0 text-sm"
                          style={{ color: 'rgba(147,51,234,0.70)' }}
                        />
                        <span className="text-xs" style={{ color: 'rgba(147,51,234,0.60)' }}>
                          Upload PNGs with transparent background for virtual try-on
                        </span>
                      </div>
                      {tryOnImages.length ? (
                        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                          {tryOnImages.slice(0, 6).map((p) => (
                            <img
                              key={p}
                              src={resolveImageUrl(p) || ''}
                              alt=""
                              className="w-full aspect-square object-cover"
                              style={{ borderRadius: '4px', border: '1px solid rgba(147,51,234,0.20)', background: 'rgba(147,51,234,0.04)' }}
                              loading="lazy"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {/* Create new variant */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(118,205,214,0.20)' }}>
            <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>Create new variant</div>
            <div className="text-[11px] mt-1" style={{ color: 'rgba(30,29,34,0.45)' }}>
              Staff can create/update. Only Super Admin can delete.
            </div>

            {variantNewError ? (
              <div
                className="mt-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ border: '1px solid #e05555', color: '#e05555', background: 'rgba(224,85,85,0.05)', borderRadius: '4px' }}
              >
                {variantNewError}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['sku', 'color_name', 'color_hex', 'size'].map((k) => (
                <div key={k}>
                  <FieldLabel>{k}</FieldLabel>
                  <PaletteInput value={variantNew[k] ?? ''} onChange={(e) => setVariantNew((v) => ({ ...v, [k]: e.target.value }))} />
                </div>
              ))}
              {['stock_quantity', 'low_stock_alert', 'price_adjustment'].map((k) => (
                <div key={k}>
                  <FieldLabel>{k}</FieldLabel>
                  <PaletteInput
                    value={variantNew[k] ?? ''}
                    onChange={(e) => setVariantNew((v) => ({ ...v, [k]: e.target.value }))}
                    inputMode={k === 'price_adjustment' ? 'decimal' : 'numeric'}
                  />
                </div>
              ))}
            </div>

            {/* New variant images */}
            <div className="mt-4">
              <FieldLabel>Images</FieldLabel>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                multiple
                onChange={(e) => setVariantNewImages(Array.from(e.target.files || []))}
                className="block w-full max-w-full text-sm"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              />
              {variantNewUploadedPaths.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {variantNewUploadedPaths.map((p) => (
                    <PillMuted key={p}>
                      <span className="truncate max-w-[240px]">{p}</span>
                      <button type="button" style={{ color: '#e05555', flexShrink: 0 }}
                        onClick={() => setVariantNewUploadedPaths((arr) => arr.filter((x) => x !== p))}>
                        Remove
                      </button>
                    </PillMuted>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <PaletteBtn
                  variant="secondary"
                  disabled={variantBusyId === 'new' || variantNewImages.length === 0}
                  onClick={async () => {
                    setVariantNewError(null)
                    setVariantBusyId('new')
                    try {
                      const up = await adminProductService.uploadProductImages(variantNewImages)
                      const paths = up?.data?.paths || []
                      setVariantNewUploadedPaths((arr) => Array.from(new Set([...arr, ...paths])))
                      setVariantNewImages([])
                    } catch (e) {
                      setVariantNewError(e?.message || e?.error || 'Upload failed')
                    } finally { setVariantBusyId(null) }
                  }}
                >
                  Upload images
                </PaletteBtn>
              </div>
            </div>

            {/* New variant try-on images */}
            <div className="mt-4">
              <FieldLabel>Try-On Images (transparent PNG)</FieldLabel>
              <input
                type="file"
                accept="image/png"
                multiple
                onChange={(e) => setVariantNewTryOnImages(Array.from(e.target.files || []))}
                className="block w-full max-w-full text-sm"
                style={{ color: 'rgba(147,51,234,0.70)' }}
              />
              {variantNewUploadedTryOnPaths.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {variantNewUploadedTryOnPaths.map((p) => (
                    <PillMuted key={p} purple>
                      <span className="truncate max-w-[240px]">{p}</span>
                      <button type="button" style={{ color: '#e05555', flexShrink: 0 }}
                        onClick={() => setVariantNewUploadedTryOnPaths((arr) => arr.filter((x) => x !== p))}>
                        Remove
                      </button>
                    </PillMuted>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PaletteBtn
                  variant="secondary"
                  disabled={variantBusyId === 'new' || variantNewTryOnImages.length === 0}
                  onClick={async () => {
                    setVariantNewError(null)
                    setVariantBusyId('new')
                    try {
                      const up = await adminProductService.uploadProductImages(variantNewTryOnImages)
                      const paths = up?.data?.paths || []
                      setVariantNewUploadedTryOnPaths((arr) => Array.from(new Set([...arr, ...paths])))
                      setVariantNewTryOnImages([])
                    } catch (e) {
                      setVariantNewError(e?.message || e?.error || 'Upload failed')
                    } finally { setVariantBusyId(null) }
                  }}
                >
                  Upload try-on images
                </PaletteBtn>

                <PaletteBtn
                  disabled={variantBusyId === 'new'}
                  onClick={async () => {
                    setVariantNewError(null)
                    if (!variantNew.sku?.trim()) { setVariantNewError('SKU is required'); return }
                    const ve = validateVariant(variantNew, { requireSku: variantNewUploadedPaths.length > 0 })
                    if (Object.keys(ve).length) { setVariantNewError(Object.values(ve)[0]); return }
                    setVariantBusyId('new')
                    try {
                      const payload = buildVariantPayload(variantNew, variantNewUploadedPaths, variantNewUploadedTryOnPaths)
                      await adminProductService.createProductVariant(productId, payload)
                      setVariantNew({ sku: '', stock_quantity: '', low_stock_alert: '', color_name: '', color_hex: '', size: '', price_adjustment: '', images: [] })
                      setVariantNewUploadedPaths([])
                      setVariantNewUploadedTryOnPaths([])
                      await loadVariants()
                    } catch (e) {
                      setVariantNewError(e?.message || e?.error || 'Failed to create variant')
                    } finally { setVariantBusyId(null) }
                  }}
                >
                  Create variant
                </PaletteBtn>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}