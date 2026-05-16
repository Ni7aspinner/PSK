import PropTypes from 'prop-types'
import { resourceConfig } from '../models/resourceConfig'

export function FormModal({ busy, config, item, mode, resources, onClose, onSubmit }) {
  const title = mode === 'create' ? `Create ${config.singular}` : `Update ${config.singular}`

  return (
    <div className="modal-backdrop">
      <section className="modal-dialog" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="kicker">{mode === 'create' ? 'New record' : `Editing #${item.id}`}</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="link-action modal-close" onClick={onClose}>Close</button>
        </div>
        <form className="resource-form" onSubmit={onSubmit}>
          {config.fields.filter((f) => !(mode === 'edit' && f.createOnly)).map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select name={field.name} required={field.required} defaultValue={item?.[field.name] === undefined ? field.options[0] : String(item[field.name])}>
                  {field.options.map((opt) => <option value={opt} key={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'resourceSelect' && resources ? (
                <select name={field.name} required={field.required} defaultValue={item?.[field.name] ?? ''}>
                  <option value="" disabled>Select {field.label.toLowerCase()}</option>
                  {resources[field.resourceTarget]?.map((resItem) => {
                    const targetConfig = resourceConfig[field.resourceTarget]
                    const label = resItem.title ?? resItem[targetConfig.primaryField] ?? `#${resItem.id}`
                    return <option value={resItem.id} key={resItem.id}>{label}</option>
                  })}
                </select>
              ) : <input name={field.name} type={field.type ?? 'text'} required={field.required} defaultValue={item?.[field.name] ?? ''} />}
            </label>
          ))}
          <div className="form-actions">
            <button type="submit" className="primary-action" disabled={busy}>{busy ? 'Working...' : title}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

const resourceItemPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
})

const fieldPropType = PropTypes.shape({
  createOnly: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  resourceTarget: PropTypes.string,
  type: PropTypes.string,
})

FormModal.propTypes = {
  busy: PropTypes.bool,
  config: PropTypes.shape({
    fields: PropTypes.arrayOf(fieldPropType).isRequired,
    singular: PropTypes.string.isRequired,
  }).isRequired,
  item: resourceItemPropType,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  resources: PropTypes.objectOf(PropTypes.arrayOf(resourceItemPropType)),
}
