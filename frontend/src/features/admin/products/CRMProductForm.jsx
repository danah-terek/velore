import { useMemo } from 'react'

import CRMActionButton from '../shared/CRMActionButton'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'

// ─── all logic helpers untouched ──────────────────────────────────────────

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
  if (values.compare_price && !isNumericString(values.compare_price)) errors.compare_price = 'Compare price must be a number.'
  const gender = normalizeGender(values.gender)
  if (values.gender && !gender) errors.gender = 'Gender must be male, female, or unisex.'
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
  if (requireSku && (!values.sku || !values.sku.trim())) errors.sku = 'SKU is required when creating a variant with images.'
  if (values.sku !== undefined && values.sku !== null && values.sku !== '' && !String(values.sku).trim()) errors.sku = 'SKU cannot be empty.'
  if (values.stock_quantity !== '' && values.stock_quantity !== null && values.stock_quantity !== undefined) {
    if (!isIntLike(values.stock_quantity) || Number(values.stock_quantity) < 0) errors.stock_quantity = 'Stock must be an integer ≥ 0.'
  }
  if (values.low_stock_alert !== '' && values.low_stock_alert !== null && values.low_stock_alert !== undefined) {
    if (!isIntLike(values.low_stock_alert) || Number(values.low_stock_alert) < 0) errors.low_stock_alert = 'Low stock alert must be an integer ≥ 0.'
  }
  if (values.price_adjustment !== '' && values.price_adjustment !== null && values.price_adjustment !== undefined) {
    if (!isNumericString(values.price_adjustment)) errors.price_adjustment = 'Price adjustment must be numeric.'
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

// ─── palette design helpers ────────────────────────────────────────────────

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
const onFocus = e => e.target.style.borderColor = '#76CDD6'
const onBlur  = e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'

function PInput({ value, onChange, placeholder, inputMode, autoFocus, disabled }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputMode={inputMode}
      autoFocus={autoFocus}
      disabled={disabled}
      style={{ ...inputStyle, background: disabled ? '#EFF8FE' : '#ffffff' }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

function PTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...inputStyle, minHeight: '108px', resize: 'vertical' }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

function PSelect({ value, onChange, disabled, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ ...inputStyle, background: disabled ? '#EFF8FE' : '#ffffff', appearance: 'auto' }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </select>
  )
}

function PCheckbox({ id, checked, onChange, label }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        minHeight: '42px',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid rgba(118,205,214,0.25)',
        background: '#EFF8FE',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
        style={{ accentColor: '#76CDD6' }}
      />
      <label htmlFor={id} className="text-sm" style={{ color: 'rgba(30,29,34,0.70)' }}>{label}</label>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label
        className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: 'rgba(30,29,34,0.50)' }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <div className="mt-1.5 text-[10px] font-semibold" style={{ color: '#e05555' }}>{error}</div>
      ) : null}
    </div>
  )
}

function FormSection({ title, subtitle, children }) {
  return (
    <div
      className="p-5 sm:p-6 space-y-5"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(118,205,214,0.22)',
        borderRadius: '4px',
      }}
    >
      <div className="pb-3" style={{ borderBottom: '1px solid rgba(118,205,214,0.18)' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#1E1D22' }}>{title}</h3>
        {subtitle ? (
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(30,29,34,0.50)' }}>{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-5">

      {/* Server message */}
      {serverMessage ? (
        <div
          className="px-4 py-3.5 text-sm leading-relaxed"
          style={{
            borderRadius: '4px',
            border: serverWarn ? '1px solid rgba(245,158,11,0.40)' : '1px solid #76CDD6',
            background: serverWarn ? 'rgba(245,158,11,0.06)' : 'rgba(118,205,214,0.06)',
            color: serverWarn ? '#92660a' : '#76CDD6',
          }}
        >
          {serverMessage}
        </div>
      ) : null}

      {/* Product basics */}
      <FormSection title="Product Basics" subtitle="Core naming and narrative shown on the storefront.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            <PInput value={values.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Product name" autoFocus />
          </Field>
        </div>
        <Field label="Description (optional)" error={errors.description}>
          <PTextarea value={values.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Short product description…" />
        </Field>
      </FormSection>

      {/* Pricing */}
      <FormSection title="Pricing" subtitle="Base price and optional compare-at value.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={errors.price}>
            <PInput value={values.price} onChange={(e) => onChange({ price: e.target.value })} placeholder="129.00" inputMode="decimal" />
          </Field>
          <Field label="Compare Price (optional)" error={errors.compare_price}>
            <PInput value={values.compare_price} onChange={(e) => onChange({ compare_price: e.target.value })} placeholder="159.00" inputMode="decimal" />
          </Field>
        </div>
      </FormSection>

      {/* Classification */}
      <FormSection title="Classification" subtitle="Catalog structure and merchandising metadata.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.category_id}>
            <PSelect value={values.category_id} onChange={(e) => onChange({ category_id: e.target.value })} disabled={optionsLoading || !!optionsError}>
              <option value="">{optionsLoading ? 'Loading categories…' : optionsError ? 'Failed to load categories' : 'Select category'}</option>
              {categories
                .filter(c => ['Sunglasses', 'Optical Glasses', 'Lenses'].includes(c.name))
                .map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </PSelect>
          </Field>

          <Field label="Brand" error={errors.brand_id}>
            <PSelect value={values.brand_id} onChange={(e) => onChange({ brand_id: e.target.value })} disabled={optionsLoading || !!optionsError}>
              <option value="">{optionsLoading ? 'Loading brands…' : optionsError ? 'Failed to load brands' : 'Select brand'}</option>
              {brands.map((b) => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
            </PSelect>
            {/* Quick add brand */}
            <div className="flex gap-2 items-end mt-2">
              <PInput
                value={newBrandName || ''}
                onChange={(e) => setNewBrandName?.(e.target.value)}
                placeholder="New brand name"
              />
              <button
                type="button"
                onClick={() => { const name = newBrandName?.trim(); if (!name) return; onAddBrand?.(name) }}
                className="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 whitespace-nowrap transition-all duration-200"
                style={{ background: '#76CDD6', color: '#fff', border: '1px solid #76CDD6', borderRadius: '4px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5bb8c2'}
                onMouseLeave={e => e.currentTarget.style.background = '#76CDD6'}
              >
                Add
              </button>
            </div>
          </Field>

          <Field label="Gender (optional)" error={errors.gender}>
            <PSelect value={values.gender} onChange={(e) => onChange({ gender: e.target.value })}>
              {genderOptions.map((g) => <option key={g || 'empty'} value={g}>{g ? g : '—'}</option>)}
            </PSelect>
          </Field>

          <Field label="Frame Shape (optional)" error={errors.frame_shape}>
            <PInput value={values.frame_shape} onChange={(e) => onChange({ frame_shape: e.target.value })} placeholder="square / round / aviator…" />
          </Field>

          <Field label="Face Shape (optional)" error={errors.face_shape}>
            <PInput value={values.face_shape} onChange={(e) => onChange({ face_shape: e.target.value })} placeholder="oval / square / heart…" />
          </Field>

          <Field label="Material (optional)" error={errors.material}>
            <PInput value={values.material} onChange={(e) => onChange({ material: e.target.value })} placeholder="acetate / metal / titanium…" />
          </Field>

          {isGlasses && (<>
            <Field label="Lens Width (mm)">
              <PInput value={values.lens_width || ''} onChange={(e) => onChange({ lens_width: e.target.value })} placeholder="52" inputMode="decimal" />
            </Field>
            <Field label="Bridge Width (mm)">
              <PInput value={values.bridge_width || ''} onChange={(e) => onChange({ bridge_width: e.target.value })} placeholder="18" inputMode="decimal" />
            </Field>
            <Field label="Temple Length (mm)">
              <PInput value={values.temple_length || ''} onChange={(e) => onChange({ temple_length: e.target.value })} placeholder="140" inputMode="decimal" />
            </Field>
          </>)}

          {isLenses && (<>
            <Field label="Diameter (mm)">
              <PInput value={values.diameter || ''} onChange={(e) => onChange({ diameter: e.target.value })} placeholder="14.2" inputMode="decimal" />
            </Field>
            <Field label="Base Curve (mm)">
              <PInput value={values.base_curve || ''} onChange={(e) => onChange({ base_curve: e.target.value })} placeholder="8.6" inputMode="decimal" />
            </Field>
            <Field label="Water Content (%)">
              <PInput value={values.water_content || ''} onChange={(e) => onChange({ water_content: e.target.value })} placeholder="55" inputMode="numeric" />
            </Field>
            <Field label="Lenses Per Pack">
              <PInput value={values.lenses_per_pack || ''} onChange={(e) => onChange({ lenses_per_pack: e.target.value })} placeholder="1" inputMode="numeric" />
            </Field>
            <Field label="Blue Light Protection">
              <PCheckbox
                checked={!!values.blue_light_protection}
                onChange={(e) => onChange({ blue_light_protection: e.target.checked })}
                label="Has blue light filter"
              />
            </Field>
            <Field label="Duration">
              <PSelect value={values.duration || ''} onChange={(e) => onChange({ duration: e.target.value })}>
                <option value="">Select duration</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </PSelect>
            </Field>
            <Field label="Prescription Applies">
              <PCheckbox
                checked={values.prescription_applies !== false}
                onChange={(e) => onChange({ prescription_applies: e.target.checked })}
                label="Prescription lenses available"
              />
            </Field>
          </>)}

          <Field label="Active" error={errors.is_active}>
            <PCheckbox
              id="is_active"
              checked={!!values.is_active}
              onChange={(e) => onChange({ is_active: e.target.checked })}
              label="Visible in storefront"
            />
          </Field>
        </div>
      </FormSection>

      {/* Default variant (create mode) */}
      {mode === 'create' ? (
        <div
          className="p-5 sm:p-6 space-y-5"
          style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
        >
          <div className="pb-3" style={{ borderBottom: '1px solid rgba(118,205,214,0.18)' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#1E1D22' }}>Default Variant (optional)</h3>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(30,29,34,0.50)' }}>
              Variants hold SKU, stock, pricing adjustment, and images. Create a default variant now or add variants after creating the product.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="SKU" error={defaultVariantErrors?.sku}>
              <PInput value={defaultVariant.sku} onChange={(e) => onDefaultVariantChange({ sku: e.target.value })} placeholder="VL-SKU-123" />
            </Field>
            <Field label="Stock Quantity" error={defaultVariantErrors?.stock_quantity}>
              <PInput value={defaultVariant.stock_quantity} onChange={(e) => onDefaultVariantChange({ stock_quantity: e.target.value })} inputMode="numeric" placeholder="0" />
            </Field>
            <Field label="Low Stock Alert" error={defaultVariantErrors?.low_stock_alert}>
              <PInput value={defaultVariant.low_stock_alert} onChange={(e) => onDefaultVariantChange({ low_stock_alert: e.target.value })} inputMode="numeric" placeholder="5" />
            </Field>
            <Field label="Color Name" error={defaultVariantErrors?.color_name}>
              <PInput value={defaultVariant.color_name} onChange={(e) => onDefaultVariantChange({ color_name: e.target.value })} placeholder="Matte Black" />
            </Field>
            <Field label="Color Hex" error={defaultVariantErrors?.color_hex}>
              <PInput value={defaultVariant.color_hex} onChange={(e) => onDefaultVariantChange({ color_hex: e.target.value })} placeholder="#111111" />
            </Field>
            <Field label="Size" error={defaultVariantErrors?.size}>
              <PInput value={defaultVariant.size} onChange={(e) => onDefaultVariantChange({ size: e.target.value })} placeholder="M" />
            </Field>
            <Field label="Price Adjustment" error={defaultVariantErrors?.price_adjustment}>
              <PInput value={defaultVariant.price_adjustment} onChange={(e) => onDefaultVariantChange({ price_adjustment: e.target.value })} placeholder="0" inputMode="decimal" />
            </Field>
          </div>

          {/* Image upload area */}
          <div
            className="p-4 sm:p-5"
            style={{
              border: '1px dashed rgba(118,205,214,0.40)',
              borderRadius: '4px',
              background: '#EFF8FE',
            }}
          >
            <div className="text-sm font-semibold" style={{ color: '#1E1D22' }}>Images (optional)</div>
            <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(30,29,34,0.50)' }}>
              Images are uploaded to the backend and stored as `/uploads/...` paths on the variant.
            </div>

            {uploadError ? (
              <div
                className="mt-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ border: '1px solid #e05555', color: '#e05555', background: 'rgba(224,85,85,0.05)', borderRadius: '4px' }}
              >
                {uploadError}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3">
              <input
                id="variant_images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                multiple
                onChange={(e) => onSelectImages(Array.from(e.target.files || []))}
                className="block w-full text-sm"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              />

              {selectedImages?.length ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.45)' }}>
                    Selected files (local preview)
                  </div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {selectedImages.map((f, idx) => (
                      <div
                        key={`${f.file?.name || 'file'}-${idx}`}
                        className="overflow-hidden"
                        style={{ border: '1px solid rgba(118,205,214,0.25)', borderRadius: '4px', background: '#ffffff' }}
                      >
                        <div className="aspect-square" style={{ background: '#EFF8FE' }}>
                          <img src={f.url} alt="" className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] truncate" style={{ color: 'rgba(30,29,34,0.55)' }}>{f.file?.name || 'image'}</span>
                          <button type="button" onClick={() => onRemoveSelectedImage(idx)}
                            className="text-[10px] font-bold" style={{ color: '#e05555' }}>
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
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.45)' }}>
                    Uploaded paths (will be saved on variant)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImagePaths.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-2 px-3 py-1 text-[11px]"
                        style={{
                          border: '1px solid rgba(118,205,214,0.25)',
                          borderRadius: '4px',
                          background: '#ffffff',
                          color: '#1E1D22',
                        }}
                      >
                        <span className="truncate max-w-[240px]">{p}</span>
                        <button type="button" onClick={() => onRemoveUploadedImagePath(p)}
                          className="font-bold" style={{ color: '#e05555' }}>
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
                      className="overflow-hidden"
                      style={{ border: '1px solid rgba(118,205,214,0.25)', borderRadius: '4px' }}
                    >
                      <div className="aspect-square" style={{ background: '#EFF8FE' }}>
                        <img src={resolveImageUrl(p) || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-1"
                          style={{ background: 'linear-gradient(135deg,#22a55b,#1a8a4a)', color: '#fff', borderRadius: '4px' }}
                        >
                          Uploaded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Thumbnail (edit mode) */}
      {mode === 'edit' ? (
        <div
          className="p-5 sm:p-6 space-y-4"
          style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
        >
          <div className="pb-3" style={{ borderBottom: '1px solid rgba(118,205,214,0.18)' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#1E1D22' }}>Primary Thumbnail</h3>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(30,29,34,0.50)' }}>
              Select which image appears as the product thumbnail.
            </p>
          </div>
          <div className="flex gap-4">
            <div
              className="w-40 h-40 overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ border: '1px solid rgba(118,205,214,0.25)', borderRadius: '4px', background: '#EFF8FE' }}
            >
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm" style={{ color: 'rgba(30,29,34,0.40)' }}>No image</span>
              )}
            </div>
            <div className="flex-1">
              <PSelect
                value={thumbnailUrl || ''}
                onChange={(e) => {
                  const img = allVariantImages.find(v => resolveImageUrl(v.url) === e.target.value)
                  if (img) onThumbnailChange?.(e.target.value)
                }}
              >
                <option value="">Select thumbnail</option>
                {allVariantImages.map((img, i) => (
                  <option key={i} value={resolveImageUrl(img.url)}>
                    {img.color ? `${img.color} — ` : ''}{img.url.split('/').pop()}
                  </option>
                ))}
              </PSelect>
            </div>
          </div>
        </div>
      ) : null}

      {/* Form actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="text-[10px] font-bold uppercase tracking-[0.15em] px-6 py-3 transition-all duration-200 disabled:opacity-50"
          style={{ background: 'transparent', color: '#76CDD6', border: '1.5px solid #76CDD6', borderRadius: '4px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#76CDD6'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#76CDD6' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || optionsLoading || !!optionsError}
          className="text-[10px] font-bold uppercase tracking-[0.15em] px-6 py-3 transition-all duration-200 disabled:opacity-50"
          style={{ background: '#76CDD6', color: '#fff', border: '1px solid #76CDD6', borderRadius: '4px' }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5bb8c2' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#76CDD6' }}
        >
          {saving
            ? (mode === 'create' ? 'Creating…' : 'Saving…')
            : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}