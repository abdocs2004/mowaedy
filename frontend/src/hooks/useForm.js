import { useCallback, useState } from 'react';
import { validate } from '../lib/validators.js';

/** Small controlled-form helper: values, per-field errors (client + server), submit state. */
export function useForm(initial, schema = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (e) => set(name, e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e),
  });

  /** Runs validation; on success calls onValid(values). Server field errors are mapped back onto fields. */
  const handleSubmit = (onValid) => async (e) => {
    e?.preventDefault();
    const clientErrors = validate(values, schema);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onValid(values);
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      else throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, errors, setErrors, set, bind, submitting, handleSubmit, reset: () => { setValues(initial); setErrors({}); } };
}
