import type { FormEvent } from 'react'
import {
  type FieldConfig,
  type ResourceConfig,
  type ResourceCreateDefaults,
  type ResourceItem,
  type ResourceMode,
  type Resources,
} from '../models/resourceConfig'
import { resourceValue, resourceLabel } from '../utils/dashboardUtils'

type FormModalProps = Readonly<{
  busy: boolean
  config: ResourceConfig
  item?: ResourceItem | null
  mode: ResourceMode
  resources?: Partial<Resources>
  defaultValues?: ResourceCreateDefaults
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}>

function formControlValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : ''
}

function defaultFieldValue(defaultValues: ResourceCreateDefaults | undefined, fieldName: FieldConfig['name']) {
  if (fieldName === 'supplierId' || fieldName === 'contractId') return defaultValues?.[fieldName]
  return undefined
}

function renderFieldControl(
  field: FieldConfig,
  item: ResourceItem | null | undefined,
  resources: Partial<Resources> = {},
  defaultValues?: ResourceCreateDefaults,
) {
  if (field.type === 'select') {
    const options = field.options ?? []
    const itemValue = item ? resourceValue(item, field.name) : undefined
    const value = itemValue === undefined ? options[0] : String(itemValue)
    return (
      <select name={field.name} required={field.required} defaultValue={value}>
        {options.map((opt) => (
          <option value={opt} key={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'resourceSelect' && field.resourceTarget) {
    const resourceTarget = field.resourceTarget
    const defaultValue = formControlValue(defaultFieldValue(defaultValues, field.name) ?? (item ? resourceValue(item, field.name) : undefined))
    const isLocked = !item && defaultValues && field.name in defaultValues && defaultValue !== ''

    if (isLocked) {
      const resItem = resources[resourceTarget]?.find((res) => res.id === Number(defaultValue))
      return (
        <>
          <select disabled defaultValue={defaultValue}>
            <option value={defaultValue}>{resourceLabel(resourceTarget, resItem)}</option>
          </select>
          <input type="hidden" name={field.name} value={defaultValue} />
        </>
      )
    }

    return (
      <select name={field.name} required={field.required} defaultValue={defaultValue}>
        <option value="" disabled={field.required}>
          {field.required ? `Select ${(field.label ?? field.name).toLowerCase()}` : 'Unassigned'}
        </option>
        {resources[resourceTarget]?.map((resItem) => (
          <option value={resItem.id} key={resItem.id}>
            {resourceLabel(resourceTarget, resItem)}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      name={field.name}
      type={field.type ?? 'text'}
      required={field.required}
      defaultValue={formControlValue(item ? resourceValue(item, field.name) : '')}
    />
  )
}

export function FormModal({ busy, config, item, mode, resources, defaultValues, onClose, onSubmit }: Readonly<FormModalProps>) {
  const title = mode === 'create' ? `Create ${config.singular}` : `Update ${config.singular}`

  return (
    <div className="modal-backdrop">
      <dialog className="modal-dialog" aria-modal="true" open>
        <div className="modal-header">
          <div>
            <p className="kicker">{mode === 'create' ? 'New record' : `Editing #${item?.id}`}</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="link-action modal-close" onClick={onClose}>
            Close
          </button>
        </div>
        <form className="resource-form" onSubmit={onSubmit}>
          {config.fields
            .filter((f) => !(mode === 'edit' && f.createOnly))
            .map((field) => (
              <label key={field.name}>
                <span>{field.label ?? field.name}</span>
                {renderFieldControl(field, item, resources, defaultValues)}
              </label>
            ))}
          <div className="form-actions">
            <button type="submit" className="primary-action" disabled={busy}>
              {busy ? 'Working...' : title}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
