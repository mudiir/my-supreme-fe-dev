
/**
 * Docs: https://graphcommerce.org/docs/framework/config
 *
 * @type {import('@graphcommerce/next-config/src/generated/config').GraphCommerceConfig}
 */
const config = {
  robotsAllow: false,
  limitSsg: true,

  magentoEndpoint: 'https://magento.devhouse.work/graphql',
  hygraphEndpoint: 'https://hygraph.devhouse.work/graphql',
  magentoVersion: 247,
  canonicalBaseUrl: 'https://my-supreme-fe.vercel.app',
  storefront: [
    {
      locale: 'en',
      magentoStoreCode: 'default',
      defaultLocale: true,
      googleAnalyticsId: undefined,
      googleRecaptchaKey: undefined,
    },
  ],
  recentlyViewedProducts: { enabled: true },
  productFiltersPro: true,
  productFiltersLayout: 'DEFAULT',
  // previewSecret: '123',

  // compare: true,
  // compareVariant: 'ICON',
  // customerDeleteEnabled: false,

  // permissions: { cart: 'ENABLED', checkout: 'ENABLED', customerAccount: 'ENABLED' },
  // customerCompanyFieldsEnable: false,
  // customerAddressNoteEnable: false,
  // enableGuestCheckoutLogin: false,
  // dataLayer: { coreWebVitals: false },
  // wishlistHideForGuests: true,

  // googleAnalyticsId: undefined,
  // googlePlaystore: undefined,
  // googleRecaptchaKey: undefined,
  // googleTagmanagerId: undefined,

  // configurableVariantForSimple: true,
  // configurableVariantValues: { content: true, gallery: true, url: true },

  // containerSizingContent: 'FULL_WIDTH',
  // containerSizingShell: 'FULL_WIDTH',
  // demoMode: true,
  // breadcrumbs: false,
}

module.exports = config
