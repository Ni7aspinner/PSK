import type { FormEvent } from 'react'
import {
  resourceConfig,
  type FieldConfig,
  type ResourceConfig,
  type ResourceItem,
  type ResourceMode,
  type Resources,
} from '../models/resourceConfig'
import { resourceValue } from '../utils/dashboardUtils'

type FormModalProps = Readonly<{
  busy: boolean
  config: ResourceConfig
  item?: ResourceItem | null
  mode: ResourceMode
  resources?: Partial<Resources>
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}>

function renderFieldControl(
  field: FieldConfig,
  item: ResourceItem | null | undefined,
  resources: Partial<Resources> = {},
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
    const itemValue = item ? resourceValue(item, field.name) : undefined
    return (
      <select name={field.name} required={field.required} defaultValue={String(itemValue ?? '')}>
        <option value="" disabled={field.required}>
          {field.required ? `Select ${(field.label ?? field.name).toLowerCase()}` : 'Unassigned'}
        </option>
        {resources[resourceTarget]?.map((resItem) => {
          const targetConfig = resourceConfig[resourceTarget]
          const label = String(
            resourceValue(resItem, 'title') ?? resourceValue(resItem, targetConfig.primaryField) ?? `#${resItem.id}`,
          )
          return (
            <option value={resItem.id} key={resItem.id}>
              {label}
            </option>
          )
        })}
      </select>
    )
  }

  return (
    <input
      name={field.name}
      type={field.type ?? 'text'}
      required={field.required}
      defaultValue={String(item ? (resourceValue(item, field.name) ?? '') : '')}
    />
  )
}

export function FormModal({ busy, config, item, mode, resources, onClose, onSubmit }: Readonly<FormModalProps>) {
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
                {renderFieldControl(field, item, resources)}
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
