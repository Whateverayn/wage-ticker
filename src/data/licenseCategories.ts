import licensesData from './licenses.generated.json'

export interface ThirdPartyLicense {
  name: string
  version: string
  license: string
  author: string | null
  homepage: string | null
}

const ALL: ThirdPartyLicense[] = licensesData.packages

// Apache-2.0's redistribution clause expects attribution to be preserved;
// MIT/ISC/0BSD/etc. don't require it, so those are shown separately as credits.
export const ATTRIBUTION_LICENSES = ALL.filter((p) => p.license === 'Apache-2.0')
export const CREDITED_LICENSES = ALL.filter((p) => p.license !== 'Apache-2.0')
