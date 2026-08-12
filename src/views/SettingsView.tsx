import { Picker, PickerItem } from '@react-spectrum/s2/Picker'
import { Switch } from '@react-spectrum/s2/Switch'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { LOCALES } from '../i18n/localeRegistry'
import { isVibrationSupported } from '../hooks/useVibration'
import { isWakeLockSupported } from '../hooks/useWakeLock'
import { useAppStore } from '../store/appStore'

const sectionStyle = style({ display: 'flex', flexDirection: 'column', gap: 16 })
const noteStyle = style({ font: 'body-xs', color: 'neutral-subdued' })

export function SettingsView() {
  const { t, i18n } = useTranslation()
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const features = useAppStore((s) => s.features)
  const setFeatureToggle = useAppStore((s) => s.setFeatureToggle)

  return (
    <div className={sectionStyle}>
      <Picker
        label={t('settings.languageLabel')}
        value={locale}
        onChange={(key) => {
          if (!key) return
          const id = String(key)
          setLocale(id)
          i18n.changeLanguage(id)
        }}
        styles={style({ width: 200 })}
      >
        {LOCALES.map((l) => (
          <PickerItem key={l.id} id={l.id}>
            {l.labelNative}
          </PickerItem>
        ))}
      </Picker>

      {isWakeLockSupported() && (
        <div>
          <Switch
            isSelected={features.wakeLockEnabled}
            onChange={(value) => setFeatureToggle('wakeLockEnabled', value)}
          >
            {t('settings.wakeLock')}
          </Switch>
        </div>
      )}
      {isVibrationSupported() && (
        <div>
          <Switch
            isSelected={features.vibrationEnabled}
            onChange={(value) => setFeatureToggle('vibrationEnabled', value)}
          >
            {t('settings.vibration')}
          </Switch>
        </div>
      )}
      {!isWakeLockSupported() && !isVibrationSupported() && <p className={noteStyle}>{t('settings.noOptions')}</p>}
    </div>
  )
}
