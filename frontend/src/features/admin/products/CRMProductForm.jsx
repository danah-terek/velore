import { useMemo } from 'react'

import CRMActionButton from '../shared/CRMActionButton'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'

function isNumericString(v) {
  if (v === null || v === undefined) return false
  const s = String(v).trim()
  if (!s) return false
  return !Number.isNaN(Number(s))
}

function isIntLike(v) {
  if (v === null || v === undefined || v === '') return false
  const n = Number(v)
  return Number.isInteger(n)
}

function normalizeGender(v) {
  if (!v) return ''
  if (v === 'male' || v === 'female' || v === 'unisex') return v
  return ''
}

export function validateProductForm(values) {
  const errors = {}

  if (!values.name?.trim()) errors.name = 'Name is required.'
  if (!values.price || !isNumericString(values.price)) errors.price = 'Price is required and must be a number.'
  if (!values.category_id) errors.category_id = 'Category is required.'
  if (!values.brand_id) errors.brand_id = 'Brand is required.'

  if (values.compare_price && !isNumericString(values.compare_price)) {
    errors.compare_price = 'Compare price must be a number.'
  }

  const gender = normalizeGender(values.gender)
  if (values.gender && !gender) {
    errors.gender = 'Gender must be male, female, or unisex.'
  }

  return errors
}

export function buildProductPayload(values) {
  const payload = {
    name: values.name.trim(),
    price: String(values.price).trim(),
    category_id: Number(values.category_id),
    brand_id: Number(values.brand_id),
  }

  if (values.description?.trim()) payload.description = values.description.trim()
  if (values.compare_price !== '' && values.compare_price !== null && values.compare_price !== undefined) {
    const cp = String(values.compare_price).trim()
    if (cp) payload.compare_price = cp
  }

    const specs = {}
  if (values.frame_shape?.trim()) specs.frame_shape = values.frame_shape.trim()
  if (values.face_shape?.trim()) specs.face_shape = values.face_shape.trim()
  if (values.material?.trim()) specs.material = values.material.trim()
  if (values.lens_width !== '' && values.lens_width !== null && values.lens_width !== undefined) specs.lens_width = parseFloat(values.lens_width)
  if (values.bridge_width !== '' && values.bridge_width !== null && values.bridge_width !== undefined) specs.bridge_width = parseFloat(values.bridge_width)
  if (values.temple_length !== '' && values.temple_length !== null && values.temple_length !== undefined) specs.temple_length = parseFloat(values.temple_length)
  if (values.diameter !== '' && values.diameter !== null && values.diameter !== undefined) specs.diameter = parseFloat(values.diameter)
  if (values.base_curve !== '' && values.base_curve !== null && values.base_curve !== undefined) specs.base_curve = parseFloat(values.base_curve)
  if (values.water_content !== '' && values.water_content !== null && values.water_content !== undefined) specs.water_content = parseFloat(values.water_content)
  if (values.lenses_per_pack !== '' && values.lenses_per_pack !== null && values.lenses_per_pack !== undefined) specs.lenses_per_pack = parseInt(values.lenses_per_pack)
  if (typeof values.blue_light_protection === 'boolean') specs.blue_light_protection = values.blue_light_protection
  if (values.duration) specs.duration = values.duration
  if (typeof values.prescription_applies === 'boolean') specs.prescription_applies = values.prescription_applies
  if (Object.keys(specs).length > 0) payload.specifications = specs
  if (values.gender) payload.gender = normalizeGender(values.gender) || undefined
  if (typeof values.is_active === 'boolean') payload.is_active = values.is_active
  if (values.thumbnail) payload.thumbnail = values.thumbnail

  return payload
}

export function isVariantEmpty(values, localFilesCount = 0, existingImageCount = 0) {
  const hasAny =
    !!values.sku?.trim() ||
    values.stock_quantity !== '' ||
    values.low_stock_alert !== '' ||
    values.color_name?.trim() ||
    values.color_hex?.trim() ||
    values.size?.trim() ||
    values.price_adjustment !== '' ||
    localFilesCount > 0 ||
    existingImageCount > 0
  return !hasAny
}

export function validateVariant(values, { requireSku } = {}) {
  const errors = {}

  if (requireSku && (!values.sku || !values.sku.trim())) {
    errors.sku = 'SKU is required when creating a variant with images.'
  }

  if (values.sku !== undefined && values.sku !== null && values.sku !== '' && !String(values.sku).trim()) {
    errors.sku = 'SKU cannot be empty.'
  }

  if (values.stock_quantity !== '' && values.stock_quantity !== null && values.stock_quantity !== undefined) {
    if (!isIntLike(values.stock_quantity) || Number(values.stock_quantity) < 0) {
      errors.stock_quantity = 'Stock must be an integer ≥ 0.'
    }
  }

  if (values.low_stock_alert !== '' && values.low_stock_alert !== null && values.low_stock_alert !== undefined) {
    if (!isIntLike(values.low_stock_alert) || Number(values.low_stock_alert) < 0) {
      errors.low_stock_alert = 'Low stock alert must be an integer ≥ 0.'
    }
  }

  if (values.price_adjustment !== '' && values.price_adjustment !== null && values.price_adjustment !== undefined) {
    if (!isNumericString(values.price_adjustment)) {
      errors.price_adjustment = 'Price adjustment must be numeric.'
    }
  }

  return errors
}

export function buildVariantPayload(values, imagePaths, tryOnImagePaths = []) {
  const payload = {
    sku: values.sku?.trim(),
    color_name: values.color_name?.trim() ? values.color_name.trim() : undefined,
    color_hex: values.color_hex?.trim() ? values.color_hex.trim() : undefined,
    size: values.size?.trim() ? values.size.trim() : undefined,
    price_adjustment: values.price_adjustment !== '' ? String(values.price_adjustment).trim() : undefined,
    stock_quantity: values.stock_quantity !== '' ? Number(values.stock_quantity) : undefined,
    low_stock_alert: values.low_stock_alert !== '' ? Number(values.low_stock_alert) : undefined,
    images: Array.isArray(imagePaths) ? imagePaths : [],
    tryon_images: Array.isArray(tryOnImagePaths) ? tryOnImagePaths : [],
  }

  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])
  return payload
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(var(--velore-fg),0.52)] mb-2">
        {label}
      </label>
      {children}
      {error ? <div className="mt-1.5 text-xs text-rose-700 font-medium">{error}</div> : null}
    </div>
  )
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="crm-panel-solid p-5 sm:p-6 space-y-5">
      <div className="border-b border-[rgba(var(--velore-border-soft),0.85)] pb-3">
        <h3 className="text-sm font-semibold text-[rgb(var(--velore-fg))] tracking-tight">{title}</h3>
        {subtitle ? <p className="text-xs text-[rgba(var(--velore-fg),0.55)] mt-1 leading-relaxed">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  )
}

export default function CRMProductForm({
  mode,
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  saving,
  categories,
  brands,
  optionsLoading,
  optionsError,
  readOnlyImageUrl,
  defaultVariant,
  defaultVariantErrors,
  onDefaultVariantChange,
  selectedImages,
  onSelectImages,
  onRemoveSelectedImage,
  uploadedImagePaths,
  onRemoveUploadedImagePath,
  uploadError,
  serverMessage,
  newBrandName,
  setNewBrandName,
  onAddBrand,
  thumbnailUrl,
  allVariantImages,
  onThumbnailChange,
}) {
  const genderOptions = useMemo(() => ['', 'male', 'female', 'unisex'], [])
  const serverWarn =
    typeof serverMessage === 'string' &&
    (/variant failed/i.test(serverMessage) || /partial/i.test(serverMessage))

  const catId = values.category_id
  const isGlasses = catId === '1' || catId === '2'
  const isLenses = catId === '3'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-6"
    >
      {serverMessage ? (
        <div
          role="status"
          className={[
            'rounded-[1.15rem] border px-4 py-3.5 text-sm leading-relaxed',
            serverWarn
              ? 'border-amber-200/95 bg-amber-50/90 text-amber-950'
              : 'border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.95)] text-[rgba(var(--velore-fg),0.85)]',
          ].join(' ')}
        >
          {serverMessage}
        </div>
      ) : null}

      <FormSection title="Product basics" subtitle="Core naming and narrative shown on the storefront.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            <input
              value={values.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="crm-input"
              placeholder="Product name"
              autoFocus
            />
          </Field>
        </div>
        <Field label="Description (optional)" error={errors.description}>
          <textarea
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="crm-textarea min-h-[108px]"
            placeholder="Short product description…"
          />
        </Field>
      </FormSection>

      <FormSection title="Pricing" subtitle="Base price and optional compare-at value.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={errors.price}>
            <input
              value={values.price}
              onChange={(e) => onChange({ price: e.target.value })}
              className="crm-input tabular-nums"
              placeholder="129.00"
              inputMode="decimal"
            />
          </Field>
          <Field label="Compare price (optional)" error={errors.compare_price}>
            <input
              value={values.compare_price}
              onChange={(e) => onChange({ compare_price: e.target.value })}
              className="crm-input tabular-nums"
              placeholder="159.00"
              inputMode="decimal"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Classification" subtitle="Catalog structure and merchandising metadata.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.category_id}>
            <select
              value={values.category_id}
              onChange={(e) => onChange({ category_id: e.target.value })}
              className="crm-select"
              disabled={optionsLoading || !!optionsError}
            >
              <option value="">
                {optionsLoading ? 'Loading categories…' : optionsError ? 'Failed to load categories' : 'Select category'}
              </option>
              {categories
                .filter(c => ['Sunglasses', 'Optical Glasses', 'Lenses'].includes(c.name))
                .map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Brand" error={errors.brand_id}>
            <select
              value={values.brand_id}
              onChange={(e) => onChange({ brand_id: e.target.value })}
              className="crm-select"
              disabled={optionsLoading || !!optionsError}
            >
              <option value="">
                {optionsLoading ? 'Loading brands…' : optionsError ? 'Failed to load brands' : 'Select brand'}
              </option>
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Quick add brand */}
            <div className="flex gap-2 items-end mt-2">
              <input
                placeholder="New brand name"
                value={newBrandName || ''}
                onChange={(e) => setNewBrandName?.(e.target.value)}
                className="crm-input flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  const name = newBrandName?.trim()
                  if (!name) return
                  onAddBrand?.(name)
                }}
                className="crm-btn-secondary text-sm whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </Field>

          <Field label="Gender (optional)" error={errors.gender}>
            <select
              value={values.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
              className="crm-select"
            >
              {genderOptions.map((g) => (
                <option key={g || 'empty'} value={g}>
                  {g ? g : '—'}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Frame shape (optional)" error={errors.frame_shape}>
            <input
              value={values.frame_shape}
              onChange={(e) => onChange({ frame_shape: e.target.value })}
              className="crm-input"
              placeholder="square / round / aviator…"
            />
          </Field>

          <Field label="Face shape (optional)" error={errors.face_shape}>
            <input
              value={values.face_shape}
              onChange={(e) => onChange({ face_shape: e.target.value })}
              className="crm-input"
              placeholder="oval / square / heart…"
            />
          </Field>

          <Field label="Material (optional)" error={errors.material}>
            <input
              value={values.material}
              onChange={(e) => onChange({ material: e.target.value })}
              className="crm-input"
              placeholder="acetate / metal / titanium…"
            />
          </Field>

          {isGlasses && (
            <>
              <Field label="Lens Width (mm)">
                <input
                  value={values.lens_width || ''}
                  onChange={(e) => onChange({ lens_width: e.target.value })}
                  className="crm-input"
                  placeholder="52"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Bridge Width (mm)">
                <input
                  value={values.bridge_width || ''}
                  onChange={(e) => onChange({ bridge_width: e.target.value })}
                  className="crm-input"
                  placeholder="18"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Temple Length (mm)">
                <input
                  value={values.temple_length || ''}
                  onChange={(e) => onChange({ temple_length: e.target.value })}
                  className="crm-input"
                  placeholder="140"
                  inputMode="decimal"
                />
              </Field>
            </>
          )}

          {isLenses && (
            <>
              <Field label="Diameter (mm)">
                <input
                  value={values.diameter || ''}
                  onChange={(e) => onChange({ diameter: e.target.value })}
                  className="crm-input"
                  placeholder="14.2"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Base Curve (mm)">
                <input
                  value={values.base_curve || ''}
                  onChange={(e) => onChange({ base_curve: e.target.value })}
                  className="crm-input"
                  placeholder="8.6"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Water Content (%)">
                <input
                  value={values.water_content || ''}
                  onChange={(e) => onChange({ water_content: e.target.value })}
                  className="crm-input"
                  placeholder="55"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Lenses Per Pack">
                <input
                  value={values.lenses_per_pack || ''}
                  onChange={(e) => onChange({ lenses_per_pack: e.target.value })}
                  className="crm-input"
                  placeholder="1"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Blue Light Protection">
                <div className="flex items-center gap-3 min-h-[42px] px-3 py-2 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.85)]">
                  <input
                    type="checkbox"
                    checked={!!values.blue_light_protection}
                    onChange={(e) => onChange({ blue_light_protection: e.target.checked })}
                    className="w-4 h-4 rounded border-[rgba(var(--velore-border-soft),0.95)]"
                  />
                  <label className="text-sm">Has blue light filter</label>
                </div>
              </Field>
              <Field label="Duration">
                <select
                  value={values.duration || ''}
                  onChange={(e) => onChange({ duration: e.target.value })}
                  className="crm-select"
                >
                  <option value="">Select duration</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
              <Field label="Prescription Applies">
                <div className="flex items-center gap-3 min-h-[42px] px-3 py-2 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.85)]">
                  <input
                    type="checkbox"
                    checked={values.prescription_applies !== false}
                    onChange={(e) => onChange({ prescription_applies: e.target.checked })}
                    className="w-4 h-4 rounded border-[rgba(var(--velore-border-soft),0.95)]"
                  />
                  <label className="text-sm">Prescription lenses available</label>
                </div>
              </Field>
            </>
          )}

          <Field label="Active" error={errors.is_active}>
            <div className="flex items-center gap-3 min-h-[42px] px-3 py-2 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.85)]">
              <input
                id="is_active"
                type="checkbox"
                checked={!!values.is_active}
                onChange={(e) => onChange({ is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[rgba(var(--velore-border-soft),0.95)] text-[rgb(var(--velore-accent))] focus:ring-[rgba(var(--velore-ring),0.35)]"
              />
              <label htmlFor="is_active" className="text-sm text-[rgba(var(--velore-fg),0.78)]">
                Visible in storefront
              </label>
            </div>
          </Field>
        </div>
      </FormSection>

      {mode === 'create' ? (
        <CRMSectionCard
          title="Default variant (optional)"
          subtitle="Variants hold SKU, stock, pricing adjustment, and images. Create a default variant now or add variants after creating the product."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="SKU" error={defaultVariantErrors?.sku}>
              <input
                value={defaultVariant.sku}
                onChange={(e) => onDefaultVariantChange({ sku: e.target.value })}
                className="crm-input"
                placeholder="VL-SKU-123"
              />
            </Field>
            <Field label="Stock quantity" error={defaultVariantErrors?.stock_quantity}>
              <input
                value={defaultVariant.stock_quantity}
                onChange={(e) => onDefaultVariantChange({ stock_quantity: e.target.value })}
                className="crm-input"
                inputMode="numeric"
                placeholder="0"
              />
            </Field>
            <Field label="Low stock alert" error={defaultVariantErrors?.low_stock_alert}>
              <input
                value={defaultVariant.low_stock_alert}
                onChange={(e) => onDefaultVariantChange({ low_stock_alert: e.target.value })}
                className="crm-input"
                inputMode="numeric"
                placeholder="5"
              />
            </Field>
            <Field label="Color name" error={defaultVariantErrors?.color_name}>
              <input
                value={defaultVariant.color_name}
                onChange={(e) => onDefaultVariantChange({ color_name: e.target.value })}
                className="crm-input"
                placeholder="Matte Black"
              />
            </Field>
            <Field label="Color hex" error={defaultVariantErrors?.color_hex}>
              <input
                value={defaultVariant.color_hex}
                onChange={(e) => onDefaultVariantChange({ color_hex: e.target.value })}
                className="crm-input"
                placeholder="#111111"
              />
            </Field>
            <Field label="Size" error={defaultVariantErrors?.size}>
              <input
                value={defaultVariant.size}
                onChange={(e) => onDefaultVariantChange({ size: e.target.value })}
                className="crm-input"
                placeholder="M"
              />
            </Field>
            <Field label="Price adjustment" error={defaultVariantErrors?.price_adjustment}>
              <input
                value={defaultVariant.price_adjustment}
                onChange={(e) => onDefaultVariantChange({ price_adjustment: e.target.value })}
                className="crm-input"
                placeholder="0"
                inputMode="decimal"
              />
            </Field>
          </div>

          <div className="mt-6 rounded-[1.1rem] border border-dashed border-[rgba(var(--velore-border),0.55)] bg-[rgba(var(--velore-pearl),0.65)] p-4 sm:p-5">
            <div className="text-sm font-semibold text-[rgb(var(--velore-fg))]">Images (optional)</div>
            <div className="mt-1 text-sm text-[rgba(var(--velore-fg),0.58)] leading-relaxed">
              Images are uploaded to the backend and stored as `/uploads/...` paths on the variant.
            </div>

            {uploadError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {uploadError}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="variant_images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  multiple
                  onChange={(e) => onSelectImages(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-[rgba(var(--velore-fg),0.75)] file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[rgba(var(--velore-fg),0.92)] file:text-white file:cursor-pointer hover:file:bg-[rgba(var(--velore-fg),0.85)]"
                />
              </div>

              {selectedImages?.length ? (
                <div>
                  <div className="text-xs text-slate-600 mb-2">Selected files (local preview)</div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {selectedImages.map((f, idx) => (
                      <div
                        key={`${f.file?.name || 'file'}-${idx}`}
                        className="rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.95)] overflow-hidden crm-hover-lift"
                      >
                        <div className="aspect-square bg-[rgba(var(--velore-accent),0.04)] flex items-center justify-center">
                          <img
                            src={f.url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-600 truncate">{f.file?.name || 'image'}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveSelectedImage(idx)}
                            className="text-[11px] text-rose-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {uploadedImagePaths?.length ? (
                <div className="mt-2">
                  <div className="text-xs text-slate-600 mb-2">Uploaded paths (will be saved on variant)</div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImagePaths.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.95)] px-3 py-1 text-[11px] text-[rgba(var(--velore-fg),0.78)]"
                      >
                        <span className="truncate max-w-[240px]">{p}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveUploadedImagePath(p)}
                          className="text-rose-700 hover:underline"
                        >
                          Remove
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {uploadedImagePaths?.length ? (
                <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  {uploadedImagePaths.map((p) => (
                    <div
                      key={p}
                      className="rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.95)] overflow-hidden"
                    >
                      <div className="aspect-square bg-[rgba(var(--velore-accent),0.04)] flex items-center justify-center">
                        <img src={resolveImageUrl(p) || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <CRMStatusBadge tone="success">Uploaded</CRMStatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CRMSectionCard>
      ) : null}

      {mode === 'edit' ? (
        <FormSection title="Primary thumbnail" subtitle="Select which image appears as the product thumbnail.">
          <div className="flex gap-4">
            <div className="w-40 h-40 rounded-2xl border border-[rgba(var(--velore-border-soft),0.95)] overflow-hidden bg-[rgba(var(--velore-accent),0.05)] flex-shrink-0">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-[rgba(var(--velore-fg),0.55)]">No image</div>
              )}
            </div>
            <div className="flex-1">
              <select
                value={thumbnailUrl || ''}
                onChange={(e) => {
                  const img = allVariantImages.find(v => resolveImageUrl(v.url) === e.target.value)
                  if (img) onThumbnailChange?.(e.target.value)
                }}
                className="crm-select"
              >
                <option value="">Select thumbnail</option>
                {allVariantImages.map((img, i) => (
                  <option key={i} value={resolveImageUrl(img.url)}>
                    {img.color ? `${img.color} — ` : ''}{img.url.split('/').pop()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FormSection>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <CRMActionButton tone="secondary" disabled={saving} onClick={onCancel}>
          Cancel
        </CRMActionButton>
        <CRMActionButton type="submit" disabled={saving || optionsLoading || !!optionsError}>
          {saving ? (mode === 'create' ? 'Creating…' : 'Saving…') : mode === 'create' ? 'Create product' : 'Save changes'}
        </CRMActionButton>
      </div>
    </form>
  )
}