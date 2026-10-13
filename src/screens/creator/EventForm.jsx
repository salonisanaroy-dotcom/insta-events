import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Toggle from '../../components/Toggle'
import Flyer from '../../components/Flyer'
import { shortName, plural } from '../../utils/eventFormat'

const blankEvent = {
  title: '',
  shortTitle: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  allowAdds: true,
  autoUpdate: true,
}

// C2 (new event) and C5 (edit event) share this form
export default function EventForm({ initial, mode = 'create', addedCount = 0, onBack, onSave }) {
  const [form, setForm] = useState(initial ?? blankEvent)
  const [errors, setErrors] = useState({})
  const [confirming, setConfirming] = useState(false) // the "update calendars?" popup

  // one helper that updates any field by name
  const update = (field, value) => setForm({ ...form, [field]: value })

  // fill in the tag name if they left it blank
  const finished = { ...form, shortTitle: form.shortTitle.trim() || shortName(form.title) }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Add an event name'
    if (!form.date) e.date = 'Pick a date'
    if (!form.startTime) e.startTime = 'Add a start time'
    if (!form.endTime) e.endTime = 'Add an end time'
    // "HH:MM" strings sort in time order, so we can compare them directly
    else if (form.startTime && form.endTime <= form.startTime) e.endTime = 'Must be after the start'
    if (!form.location.trim()) e.location = 'Add a location'
    setErrors(e)
    return Object.keys(e).length === 0 // true if no errors
  }

  function handleDone() {
    if (!validate()) return
    // editing an event people already added? double check first
    if (mode === 'edit' && addedCount > 0 && form.autoUpdate) setConfirming(true)
    else onSave(finished)
  }

  // preview only once there's enough to show
  const ready = form.title && form.date && form.startTime && form.endTime && form.location
  const previewPost = {
    colors: ['#4b1e78', '#2f6fdb'],
    flyerTop: 'PREVIEW',
    flyerTitle: form.title || 'Your event',
    event: ready ? finished : null,
  }

  return (
    <div className="page">
      <PageHeader
        title={mode === 'edit' ? 'Edit event' : 'Add Event'}
        onBack={onBack}
        rightLabel={mode === 'edit' ? 'Save' : 'Done'}
        onRight={handleDone}
      />

      <div className="page-body">
        <Field label="Event name" error={errors.title}>
          <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="AKPsi General Body Meeting" />
        </Field>
        <Field label="Short name for the tag (optional)">
          <input value={form.shortTitle} maxLength={16} onChange={(e) => update('shortTitle', e.target.value)} placeholder="GBM" />
        </Field>
        <Field label="Date" error={errors.date}>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </Field>
        <div className="field-row">
          <Field label="Starts" error={errors.startTime}>
            <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          </Field>
          <Field label="Ends" error={errors.endTime}>
            <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
          </Field>
        </div>
        <Field label="Location" error={errors.location}>
          <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="JSOM 1.118, UT Dallas" />
        </Field>

        <div className="toggle-row">
          <div>
            <p className="toggle-title">Let people add to calendar</p>
            <p className="subtext">Google, Apple, or Outlook Calendar</p>
          </div>
          <Toggle on={form.allowAdds} onChange={(v) => update('allowAdds', v)} />
        </div>
        <div className="toggle-row">
          <div>
            <p className="toggle-title">Update calendars if this changes</p>
            <p className="subtext">People who added it get the new time or room</p>
          </div>
          <Toggle on={form.autoUpdate} onChange={(v) => update('autoUpdate', v)} />
        </div>

        <p className="mini-label">PREVIEW</p>
        <Flyer post={previewPost} small />
      </div>

      <div className="page-footer">
        <button className="btn btn-ig" onClick={handleDone}>{mode === 'edit' ? 'Save changes' : 'Done'}</button>
      </div>

      {/* C5 confirm popup */}
      {confirming && (
        <div className="overlay center" onClick={() => setConfirming(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="dialog-title">Update {plural(addedCount, 'calendar')}?</h2>
            <p className="dialog-text">
              Everyone who added this event will see the changes in their calendar and get a
              notification.
            </p>
            <button className="btn btn-ig" onClick={() => onSave(finished)}>Update event</button>
            <button className="text-btn" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// label + input + error message, used for every field
function Field({ label, error, children }) {
  return (
    <label className={error ? 'field has-error' : 'field'}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
