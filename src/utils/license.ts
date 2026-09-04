export const LICENSE_STORAGE_KEY = 'is_active'

const LICENSE_API_URL = 'https://api.lemonsqueezy.com/v1/licenses'
const INSTANCE_ID_STORAGE_KEY = 'license_instance_id'
const PRODUCT_ID_STORAGE_KEY = 'license_product_id'

interface LemonSqueezyLicenseResponse {
  activated?: boolean
  error?: string | null
  instance?: {
    id?: string
  } | null
  meta?: {
    product_id?: number
  }
}

export interface LicenseActivationResult {
  success: boolean
  message: string
}

export function getStoredLicenseStatus() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(LICENSE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function storeLicenseStatus(isActive: boolean) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      LICENSE_STORAGE_KEY,
      isActive ? 'true' : 'false',
    )
    return true
  } catch {
    return false
  }
}

async function deactivateMismatchedLicense(
  licenseKey: string,
  instanceId: string,
) {
  const body = new URLSearchParams({
    license_key: licenseKey,
    instance_id: instanceId,
  })

  try {
    await fetch(`${LICENSE_API_URL}/deactivate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
  } catch {
    // The original activation remains rejected even if cleanup fails.
  }
}

export async function activateLicenseKey(
  rawLicenseKey: string,
): Promise<LicenseActivationResult> {
  const licenseKey = rawLicenseKey.trim()

  if (!licenseKey) {
    return { success: false, message: 'Please enter a valid License Key.' }
  }

  const expectedProductId = import.meta.env.VITE_LEMON_SQUEEZY_PRODUCT_ID?.trim()

  if (!expectedProductId) {
    return {
      success: false,
      message: 'The Lemon Squeezy Product ID for Invoice Fold PRO is not configured.',
    }
  }

  const body = new URLSearchParams({
    license_key: licenseKey,
    instance_name: 'Invoice Fold Web',
  })

  try {
    const response = await fetch(`${LICENSE_API_URL}/activate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const result = (await response.json()) as LemonSqueezyLicenseResponse

    if (!response.ok || !result.activated) {
      return {
        success: false,
        message:
          result.error ||
          'This License Key is invalid or has reached its activation limit.',
      }
    }

    const activatedProductId = result.meta?.product_id

    if (String(activatedProductId ?? '') !== expectedProductId) {
      if (result.instance?.id) {
        await deactivateMismatchedLicense(licenseKey, result.instance.id)
      }

      return {
        success: false,
        message: 'This License Key does not belong to Invoice Fold PRO.',
      }
    }

    if (!storeLicenseStatus(true)) {
      return {
        success: false,
        message: 'Your browser blocked local storage, so activation could not be saved.',
      }
    }

    if (result.instance?.id) {
      window.localStorage.setItem(INSTANCE_ID_STORAGE_KEY, result.instance.id)
    }
    if (activatedProductId) {
      window.localStorage.setItem(
        PRODUCT_ID_STORAGE_KEY,
        String(activatedProductId),
      )
    }

    return { success: true, message: 'Activation successful. PRO features are now unlocked.' }
  } catch {
    return {
      success: false,
      message: 'Unable to reach Lemon Squeezy. Check your connection and try again.',
    }
  }
}
