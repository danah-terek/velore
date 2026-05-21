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
    is_active: p?.is_active !== undefined ? !!p.is_active : true,
  }
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
  const [selectedImages, setSelectedImages] = useState([]) // { file: File, url: string }[]
  const [uploadedImagePaths, setUploadedImagePaths] = useState([]) // string[]

  const [defaultVariant, setDefaultVariant] = useState({
    sku: '',
    stock_quantity: '',
    low_stock_alert: '',
    color_name: '',
    color_hex: '',
    size: '',
    price_adjustment: '',
  })
  const [defaultVariantErrors, setDefaultVariantErrors] = useState({})

  const [variantsState, setVariantsState] = useState({ loading: false, error: null, rows: [] })
  const [variantBusyId, setVariantBusyId] = useState(null)
  const [variantConfirmDeleteId, setVariantConfirmDeleteId] = useState(null)
  const [variantDrafts, setVariantDrafts] = useState({}) // { [variantId]: partial }
  const [variantNew, setVariantNew] = useState({
    sku: '',
    stock_quantity: '',
    low_stock_alert: '',
    color_name: '',
    color_hex: '',
    size: '',
    price_adjustment: '',
    images: [],
  })
  const [variantNewImages, setVariantNewImages] = useState([]) // File[]
  const [variantNewUploadedPaths, setVariantNewUploadedPaths] = useState([]) // string[]
  const [variantNewError, setVariantNewError] = useState(null)

  const [values, setValues] = useState(() =>
    isEdit
      ? productToFormValues(null)
      : {
          name: '',
          price: '',
          category_id: '',
          brand_id: '',
          description: '',
          compare_price: '',
          gender: '',
          material: '',
          frame_shape: '',
          face_shape: '',
          is_active: true,
        }
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
        loading: false,
        error: null,
        categories: (cats.data || []).map(normalizeCategoryRow),
        brands: (brands.data || []).map(normalizeBrandRow),
      })
    } catch (e) {
      setOptions({
        loading: false,
        error: e?.message || e?.error || 'Failed to load categories/brands',
        categories: [],
        brands: [],
      })
    }
  }, [])

  const loadProduct = useCallback(async () => {
    if (!isEdit) return
    setProduct({ loading: true, error: null, data: null })
    try {
      const res = await adminProductService.getAdminProduct(productId)
      setProduct({ loading: false, error: null, data: res.data })
      setValues(productToFormValues(res.data))
    } catch (e) {
      setProduct({ loading: false, error: e?.message || e?.error || 'Failed to load product', data: null })
    }
  }, [isEdit, productId])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const readOnlyImageUrl = useMemo(() => {
    const p = product.data
    const raw = p?.product_variants?.[0]?.images?.[0]
    return resolveImageUrl(raw)
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

  useEffect(() => {
    loadVariants()
  }, [loadVariants])

  if (isEdit && !productId) return <Navigate to="/admin/products" replace />
  if (product.loading) return <CRMLoadingState label="Loading product…" />
  if (product.error) return <CRMErrorState message={product.error} onRetry={loadProduct} />
  if (isEdit && !product.data) return <CRMEmptyState title="Product not found" message="This product may have been deleted." />

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title={isEdit ? 'Edit product' : 'Add product'}
        subtitle={isEdit ? `Editing product #${productId}` : 'Create a new product using real backend APIs.'}
      />

      {options.error ? <CRMErrorState title="Failed to load form options" message={options.error} onRetry={loadOptions} /> : null}

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
          setServerMessage(null)
          setUploadError(null)
          const nextErrors = validateProductForm(values)
          setErrors(nextErrors)
          if (Object.keys(nextErrors).length > 0) return
          if (options.loading || options.error) return

          setSaving(true)
          try {
            const payload = buildProductPayload(values)
            if (isEdit) {
              const res = await adminProductService.update(productId, payload)
              setServerMessage(res?.message || 'Product updated successfully.')
              // Refresh local product state
              setProduct((p) => ({ ...p, data: res?.data || p.data }))
            } else {
              // 1) upload images first (if selected)
              let uploadedPaths = []
              if (selectedImages.length) {
                // front validation (type/size)
                const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
                for (const it of selectedImages) {
                  const f = it.file
                  if (!allowed.includes(f.type)) {
                    setUploadError('Invalid file type. Allowed: jpeg, png, webp, svg.')
                    setSaving(false)
                    return
                  }
                  if (f.size > 5 * 1024 * 1024) {
                    setUploadError('File too large. Max 5MB per file.')
                    setSaving(false)
                    return
                  }
                }

                const needsSku = true
                const vErr = validateVariant(defaultVariant, { requireSku: needsSku })
                setDefaultVariantErrors(vErr)
                if (Object.keys(vErr).length) {
                  setSaving(false)
                  return
                }

                const up = await adminProductService.uploadProductImages(selectedImages.map((it) => it.file))
                uploadedPaths = up?.data?.paths || []
                setUploadedImagePaths(uploadedPaths)
              }

              // 2) create product
              const res = await adminProductService.create(payload)
              const newId = res?.data?.product_id
              const newIdStr = newId?.toString?.() ? newId.toString() : String(newId || '')

              // 3) create default variant if provided or images uploaded
              const shouldCreateVariant =
                !isVariantEmpty(defaultVariant, selectedImages.length, uploadedPaths.length) || uploadedPaths.length > 0

              if (shouldCreateVariant) {
                const requireSku = uploadedPaths.length > 0
                const vErr = validateVariant(defaultVariant, { requireSku })
                setDefaultVariantErrors(vErr)
                if (Object.keys(vErr).length) {
                  setSaving(false)
                  return
                }

                try {
                  const variantPayload = buildVariantPayload(defaultVariant, uploadedPaths)
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
            const msg = e?.message || e?.error || 'Save failed'
            setServerMessage(msg)
          } finally {
            setSaving(false)
          }
        }}
        saving={saving}
        categories={options.categories}
        brands={options.brands}
        optionsLoading={options.loading}
        optionsError={options.error}
        readOnlyImageUrl={readOnlyImageUrl}
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
            // revoke previous urls
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
      />

      {isEdit ? (
        <CRMSectionCard
          title="Variants"
          subtitle="Create and manage product variants (SKU, stock, images)."
          right={<CRMStatusBadge tone={isSuper ? 'warning' : 'neutral'}>{isSuper ? 'Super Admin' : 'Staff Admin'}</CRMStatusBadge>}
        >
          {variantsState.loading ? <CRMLoadingState label="Loading variants…" /> : null}
          {!variantsState.loading && variantsState.error ? (
            <CRMErrorState message={variantsState.error} onRetry={loadVariants} />
          ) : null}

          {!variantsState.loading && !variantsState.error && variantsState.rows.length === 0 ? (
            <CRMEmptyState title="No variants yet" message="Create a variant to add SKU, stock, and images." />
          ) : null}

          {!variantsState.loading && !variantsState.error && variantsState.rows.length > 0 ? (
            <div className="space-y-4">
              {variantsState.rows.map((v) => {
                const draft = variantDrafts[v.variant_id] || {}
                const current = { ...v, ...draft }
                const images = Array.isArray(current.images) ? current.images : []

                return (
                  <div key={v.variant_id} className="crm-panel-solid crm-hover-lift p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold tracking-tight text-[rgb(var(--velore-fg))]">
                          Variant #{v.variant_id}
                        </div>
                        <div className="text-xs text-[rgba(var(--velore-fg),0.52)] mt-0.5">
                          SKU required · Images stored as /uploads/products/…
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CRMActionButton
                          tone="secondary"
                          disabled={variantBusyId === v.variant_id}
                          onClick={async () => {
                            setVariantBusyId(v.variant_id)
                            try {
                              const payload = buildVariantPayload(current, images)
                              await adminProductService.updateProductVariant(v.variant_id, payload)
                              setVariantDrafts((m) => {
                                const next = { ...m }
                                delete next[v.variant_id]
                                return next
                              })
                              await loadVariants()
                            } catch (e) {
                              setVariantsState((s) => ({ ...s, error: e?.message || e?.error || 'Failed to update variant' }))
                            } finally {
                              setVariantBusyId(null)
                            }
                          }}
                        >
                          {variantBusyId === v.variant_id ? 'Saving…' : 'Save'}
                        </CRMActionButton>

                        <CRMActionButton
                          tone="danger"
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
                            } finally {
                              setVariantBusyId(null)
                            }
                          }}
                        >
                          {variantConfirmDeleteId === v.variant_id ? 'Confirm' : 'Delete'}
                        </CRMActionButton>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {['sku', 'color_name', 'color_hex', 'size'].map((k) => (
                        <div key={k}>
                          <label className="crm-field-label">{k}</label>
                          <input
                            value={current[k] ?? ''}
                            onChange={(e) => setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), [k]: e.target.value } }))}
                            className="crm-input"
                          />
                        </div>
                      ))}
                      {['stock_quantity', 'low_stock_alert', 'price_adjustment'].map((k) => (
                        <div key={k}>
                          <label className="crm-field-label">{k}</label>
                          <input
                            value={current[k] ?? ''}
                            onChange={(e) => setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), [k]: e.target.value } }))}
                            className="crm-input"
                            inputMode={k === 'price_adjustment' ? 'decimal' : 'numeric'}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <div className="text-sm font-semibold tracking-tight text-[rgb(var(--velore-fg))]">Images</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {images.length ? images.map((p) => (
                          <span key={p} className="crm-pill-muted max-w-full">
                            <span className="truncate max-w-[240px]">{p}</span>
                            <button
                              type="button"
                              className="text-rose-700 hover:underline shrink-0 font-medium"
                              onClick={() => {
                                const next = images.filter((x) => x !== p)
                                setVariantDrafts((m) => ({ ...m, [v.variant_id]: { ...(m[v.variant_id] || {}), images: next } }))
                              }}
                            >
                              Remove
                            </button>
                          </span>
                        )) : <span className="text-sm text-[rgba(var(--velore-fg),0.52)]">No images</span>}
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
                            } finally {
                              setVariantBusyId(null)
                              e.target.value = ''
                            }
                          }}
                          className="crm-file-trigger block w-full sm:w-auto min-w-0"
                        />
                        <span className="text-xs text-[rgba(var(--velore-fg),0.52)]">Uploads return /uploads/... paths</span>
                      </div>

                      {images.length ? (
                        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                          {images.slice(0, 6).map((p) => (
                            <img
                              key={p}
                              src={resolveImageUrl(p) || ''}
                              alt=""
                              className="w-full aspect-square rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] object-cover bg-[rgba(var(--velore-accent),0.05)] ring-1 ring-[rgba(var(--velore-border-soft),0.45)]"
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

          <div className="mt-6 border-t border-[rgba(var(--velore-border-soft),0.9)] pt-6">
            <div className="text-sm font-semibold tracking-tight text-[rgb(var(--velore-fg))]">Create new variant</div>
            <div className="mt-1 text-sm text-[rgba(var(--velore-fg),0.62)]">
              Staff can create/update. Only Super Admin can delete.
            </div>
            {variantNewError ? (
              <div className="mt-3 rounded-[1.05rem] border border-rose-200/90 bg-rose-50/95 px-4 py-3 text-sm text-rose-900 shadow-sm">
                {variantNewError}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['sku', 'color_name', 'color_hex', 'size'].map((k) => (
                <div key={k}>
                  <label className="crm-field-label">{k}</label>
                  <input
                    value={variantNew[k] ?? ''}
                    onChange={(e) => setVariantNew((v) => ({ ...v, [k]: e.target.value }))}
                    className="crm-input"
                  />
                </div>
              ))}
              {['stock_quantity', 'low_stock_alert', 'price_adjustment'].map((k) => (
                <div key={k}>
                  <label className="crm-field-label">{k}</label>
                  <input
                    value={variantNew[k] ?? ''}
                    onChange={(e) => setVariantNew((v) => ({ ...v, [k]: e.target.value }))}
                    className="crm-input"
                    inputMode={k === 'price_adjustment' ? 'decimal' : 'numeric'}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="crm-field-label">Images</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                multiple
                onChange={(e) => setVariantNewImages(Array.from(e.target.files || []))}
                className="crm-file-trigger block w-full max-w-full"
              />
              {variantNewUploadedPaths.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {variantNewUploadedPaths.map((p) => (
                    <span key={p} className="crm-pill-muted max-w-full">
                      <span className="truncate max-w-[240px]">{p}</span>
                      <button
                        type="button"
                        className="text-rose-700 hover:underline shrink-0 font-medium"
                        onClick={() => setVariantNewUploadedPaths((arr) => arr.filter((x) => x !== p))}
                      >
                        Remove
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <CRMActionButton
                  tone="secondary"
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
                    } finally {
                      setVariantBusyId(null)
                    }
                  }}
                >
                  Upload images
                </CRMActionButton>
                <CRMActionButton
                  disabled={variantBusyId === 'new'}
                  onClick={async () => {
                    setVariantNewError(null)
                    if (!variantNew.sku?.trim()) {
                      setVariantNewError('SKU is required')
                      return
                    }
                    const ve = validateVariant(variantNew, { requireSku: variantNewUploadedPaths.length > 0 })
                    if (Object.keys(ve).length) {
                      setVariantNewError(Object.values(ve)[0])
                      return
                    }
                    setVariantBusyId('new')
                    try {
                      const payload = buildVariantPayload(variantNew, variantNewUploadedPaths)
                      await adminProductService.createProductVariant(productId, payload)
                      setVariantNew({
                        sku: '',
                        stock_quantity: '',
                        low_stock_alert: '',
                        color_name: '',
                        color_hex: '',
                        size: '',
                        price_adjustment: '',
                        images: [],
                      })
                      setVariantNewUploadedPaths([])
                      await loadVariants()
                    } catch (e) {
                      setVariantNewError(e?.message || e?.error || 'Failed to create variant')
                    } finally {
                      setVariantBusyId(null)
                    }
                  }}
                >
                  Create variant
                </CRMActionButton>
              </div>
            </div>
          </div>
        </CRMSectionCard>
      ) : null}
    </div>
  )
}

