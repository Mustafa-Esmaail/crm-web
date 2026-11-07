import { DEVICE_NAME } from '../constants';
import type { LoginValues, RegisterValues } from '../schemas';

/** Adapters: form values in, the API's request body out, so the form never mirrors the wire shape. */
export function toLoginPayload(values: LoginValues) {
  return { ...values, device_name: DEVICE_NAME };
}

export function toRegisterPayload(values: RegisterValues) {
  const { phone, ...rest } = values;
  return { ...rest, ...(phone ? { phone } : {}), device_name: DEVICE_NAME };
}
