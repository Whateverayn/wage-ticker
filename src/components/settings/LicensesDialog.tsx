import { Button } from '@react-spectrum/s2/Button'
import { DialogTrigger } from '@react-spectrum/s2/Dialog'
import { Disclosure, DisclosurePanel, DisclosureTitle } from '@react-spectrum/s2/Disclosure'
import { ButtonGroup, Content, FullscreenDialog, Heading } from '@react-spectrum/s2/FullscreenDialog'
import { Link } from '@react-spectrum/s2/Link'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { ATTRIBUTION_LICENSES, CREDITED_LICENSES, type ThirdPartyLicense } from '../../data/licenseCategories'

const REPO_URL = 'https://github.com/Whateverayn/wage-ticker'

const sectionStyle = style({ display: 'flex', flexDirection: 'column', gap: 16 })
const bodyTextStyle = style({ font: 'body-sm', color: 'neutral-subdued', marginTop: 0 })
const listStyle = style({ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 })
const rowNameStyle = style({ font: 'body-sm', fontWeight: 'bold' })
const rowMetaStyle = style({ font: 'body-xs', color: 'neutral-subdued' })

function PackageRow({ pkg }: { pkg: ThirdPartyLicense }) {
  return (
    <div>
      <div className={rowNameStyle}>
        {pkg.homepage ? (
          <Link href={pkg.homepage} target="_blank" rel="noopener noreferrer" isStandalone>
            {pkg.name}
          </Link>
        ) : (
          pkg.name
        )}
      </div>
      <div className={rowMetaStyle}>
        {pkg.version} · {pkg.license}
        {pkg.author ? ` · ${pkg.author}` : ''}
      </div>
    </div>
  )
}

export function LicensesDialog() {
  const { t } = useTranslation('flavor')

  return (
    <DialogTrigger>
      <Button variant="secondary">{t('licenses.openButton')}</Button>
      <FullscreenDialog>
        {({ close }) => (
          <>
            <Heading slot="title">{t('licenses.title')}</Heading>
            <Content>
              <div className={sectionStyle}>
                <p className={bodyTextStyle}>
                  {t('licenses.ownIntroPrefix')}{' '}
                  <Link href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
                    MIT License
                  </Link>
                  {t('licenses.ownIntroSuffix')}
                </p>

                <Disclosure styles={style({ width: 'full' })} defaultExpanded>
                  <DisclosureTitle>{t('licenses.attributionTitle')}</DisclosureTitle>
                  <DisclosurePanel>
                    <p className={bodyTextStyle}>{t('licenses.attributionBody')}</p>
                    <div className={listStyle}>
                      {ATTRIBUTION_LICENSES.map((pkg) => (
                        <PackageRow key={pkg.name} pkg={pkg} />
                      ))}
                    </div>
                  </DisclosurePanel>
                </Disclosure>

                <Disclosure styles={style({ width: 'full' })}>
                  <DisclosureTitle>{t('licenses.thanksTitle')}</DisclosureTitle>
                  <DisclosurePanel>
                    <p className={bodyTextStyle}>{t('licenses.thanksBody')}</p>
                    <div className={listStyle}>
                      {CREDITED_LICENSES.map((pkg) => (
                        <PackageRow key={pkg.name} pkg={pkg} />
                      ))}
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>
                {t('licenses.close')}
              </Button>
            </ButtonGroup>
          </>
        )}
      </FullscreenDialog>
    </DialogTrigger>
  )
}
