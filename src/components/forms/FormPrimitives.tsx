import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { sfx } from '../../motion/sound/SfxEngine'
import styles from './FormPrimitives.module.css'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  optional?: boolean
  children: ReactNode
}

function withFieldAria(node: ReactNode, aria: Record<string, unknown>): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const next = withFieldAria(child, aria)
      if (isValidElement(next) && next.key == null) {
        return cloneElement(next, { key: index })
      }
      return next
    })
  }
  if (!isValidElement(node)) return node
  const element = node as ReactElement<{ children?: ReactNode } & Record<string, unknown>>
  const tag = typeof element.type === 'string' ? element.type : ''
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const existing = element.props['aria-describedby']
    const describedBy = [aria['aria-describedby'] as string | undefined, existing as string | undefined]
      .filter(Boolean)
      .join(' ') || undefined
    return cloneElement(element, { ...aria, 'aria-describedby': describedBy })
  }
  if (element.props.children != null) {
    const nextChildren = withFieldAria(element.props.children, aria)
    return cloneElement(element, { ...element.props, children: nextChildren })
  }
  return node
}

export function Field({ id, label, hint, error, required, optional, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const aria = {
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
  }
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : optional ? <span className={styles.optional}> 选填</span> : null}
      </label>
      {withFieldAria(children, aria)}
      {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </div>
  )
}

export interface ChoiceOption {
  value: string
  label: string
  description?: string
}

interface ChoiceGroupProps {
  legend: string
  hint?: string
  options: ChoiceOption[]
  value: string[]
  onChange: (value: string[]) => void
  multiple?: boolean
  error?: string
}

export function ChoiceGroup({ legend, hint, options, value, onChange, multiple = true, error }: ChoiceGroupProps) {
  const groupId = useId()
  const hintId = hint ? `${groupId}-hint` : undefined
  const errorId = error ? `${groupId}-error` : undefined
  const describedBy = errorId ?? hintId

  function toggle(optionValue: string) {
    sfx.play('option-hover')
    if (!multiple) {
      onChange([optionValue])
      return
    }
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue])
  }

  return (
    <fieldset className={styles.choiceGroup} aria-describedby={describedBy}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
      <div className={styles.choices}>
        {options.map((option) => {
          const checked = value.includes(option.value)
          return (
            <label key={option.value} className={[styles.choice, checked ? styles.checked : ''].filter(Boolean).join(' ')}>
              <input
                className={styles.input}
                type={multiple ? 'checkbox' : 'radio'}
                name={groupId}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-invalid={error ? true : undefined}
              />
              <span className={styles.choiceMark} aria-hidden="true">{multiple ? (checked && <Check size={15} strokeWidth={3} />) : <span />}</span>
              <span className={styles.choiceCopy}>
                <span>{option.label}</span>
                {option.description && <small>{option.description}</small>}
              </span>
            </label>
          )
        })}
      </div>
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </fieldset>
  )
}

interface SwitchRowProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
  stateLabel: [off: string, on: string]
}

export function SwitchRow({ checked, onChange, label, description, stateLabel }: SwitchRowProps) {
  return (
    <label className={styles.switchRow}>
      <span className={styles.switchCopy}>
        <span className={styles.switchLabel}>{label}</span>
        <span className={styles.switchDescription}>{description}</span>
      </span>
      <span className={styles.switchControl}>
        <span className={styles.switchState}>{checked ? stateLabel[1] : stateLabel[0]}</span>
        <input className={styles.switchInput} type="checkbox" role="switch" checked={checked} onChange={(event) => { onChange(event.target.checked); sfx.play('tick') }} />
        <span className={styles.switchTrack} aria-hidden="true"><span /></span>
      </span>
    </label>
  )
}
