/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_MONITORING_HOST: string
  readonly VITE_MONITORING_PORT: string
  readonly VITE_AUTH_HOST: string
  readonly VITE_AUTH_PORT: string
  readonly VITE_ALARM_HOST: string
  readonly VITE_ALARM_PORT: string
  readonly VITE_NOTIFICATION_HOST: string
  readonly VITE_NOTIFICATION_PORT: string
  readonly VITE_LOG_HOST: string
  readonly VITE_LOG_PORT: string
  readonly VITE_MEDIA_SERVER_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
