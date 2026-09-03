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
    return { success: false, message: '请输入有效的激活码。' }
  }

  const expectedProductId = import.meta.env.VITE_LEMON_SQUEEZY_PRODUCT_ID?.trim()

  if (!expectedProductId) {
    return {
      success: false,
      message: '尚未配置 Invoice Fold Pro 的 Lemon Squeezy Product ID。',
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
        message: result.error || '激活码无效或已达到激活次数上限。',
      }
    }

    const activatedProductId = result.meta?.product_id

    if (String(activatedProductId ?? '') !== expectedProductId) {
      if (result.instance?.id) {
        await deactivateMismatchedLicense(licenseKey, result.instance.id)
      }

      return {
        success: false,
        message: '该激活码不属于 Invoice Fold Pro。',
      }
    }

    if (!storeLicenseStatus(true)) {
      return {
        success: false,
        message: '浏览器阻止了本地存储，无法保存激活状态。',
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

    return { success: true, message: '激活成功，Pro 功能已解锁。' }
  } catch {
    return {
      success: false,
      message: '暂时无法连接 Lemon Squeezy，请检查网络后重试。',
    }
  }
}
