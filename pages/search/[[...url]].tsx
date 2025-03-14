import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst, flushMeasurePerf, PrivateQueryMaskProvider } from '@graphcommerce/graphql'
import type { MenuQueryFragment } from '@graphcommerce/magento-category'
import type {
  FilterTypes,
  ProductFiltersQuery,
  ProductListParams,
  ProductListQuery,
} from '@graphcommerce/magento-product'
import {
  extractUrlQuery,
  getFilterTypes,
  parseParams,
  ProductFiltersDocument,
  ProductListDocument,
} from '@graphcommerce/magento-product'
import type { CategorySearchQuery } from '@graphcommerce/magento-search'
import {
  CategorySearchDocument,
  productListApplySearchDefaults,
  searchDefaultsToProductListFilters,
  SearchField,
  useProductList,
} from '@graphcommerce/magento-search'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { LayoutHeader } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import type { LayoutNavigationProps } from '../../components'
import {
  LayoutDocument,
  LayoutNavigation,
  ProductListLayoutClassic,
  ProductListLayoutDefault,
  ProductListLayoutSidebar,
} from '../../components'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'

type SearchResultProps = MenuQueryFragment &
  ProductListQuery &
  ProductFiltersQuery &
  CategorySearchQuery & { filterTypes: FilterTypes; params: ProductListParams }
type RouteProps = { url: string[] }
export type GetPageStaticProps = GetStaticProps<
  LayoutNavigationProps,
  SearchResultProps,
  RouteProps
>

function SearchResultPage(props: SearchResultProps) {
  const { mask, ...productList } = useProductList(props)
  const { params, menu } = productList
  const search = params.url.split('/')[1]

  return (
    <>
      <PageMeta
        title={
          search
            ? i18n._(/* i18n */ 'Results for ‘{search}’', { search })
            : i18n._(/* i18n */ 'Search')
        }
        metaRobots={['noindex']}
        canonical='/search'
      />
      <LayoutHeader floatingMd switchPoint={0}>
        <SearchField size='small' formControl={{ sx: { width: '81vw' } }} />
      </LayoutHeader>

      <PrivateQueryMaskProvider mask={mask}>
        {import.meta.graphCommerce.productFiltersPro &&
          import.meta.graphCommerce.productFiltersLayout === 'SIDEBAR' && (
            <ProductListLayoutSidebar {...productList} menu={menu} />
          )}
        {import.meta.graphCommerce.productFiltersPro &&
          import.meta.graphCommerce.productFiltersLayout !== 'SIDEBAR' && (
            <ProductListLayoutDefault {...productList} menu={menu} />
          )}
        {!import.meta.graphCommerce.productFiltersPro && (
          <ProductListLayoutClassic {...productList} menu={menu} />
        )}
      </PrivateQueryMaskProvider>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

SearchResultPage.pageOptions = pageOptions

export default SearchResultPage

export const getServerSideProps: GetPageStaticProps = async (context) => {
  const { params } = context
  const [searchShort = '', query = []] = extractUrlQuery(params)
  const search = searchShort.length >= 3 ? searchShort : ''

  const client = graphqlSharedClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const filterTypes = getFilterTypes(client, true)

  const staticClient = graphqlSsrClient(context)
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  const productListParams = parseParams(
    search ? `search/${search}` : 'search',
    query,
    await filterTypes,
    search,
  )

  if (!productListParams) return { notFound: true }

  const filters = staticClient.query({
    query: ProductFiltersDocument,
    variables: searchDefaultsToProductListFilters(
      productListApplySearchDefaults(productListParams, (await conf).data),
    ),
  })

  const products = staticClient.query({
    query: ProductListDocument,
    variables: productListApplySearchDefaults(productListParams, (await conf).data),
  })

  const categories = false
    ? staticClient.query({ query: CategorySearchDocument, variables: { search } })
    : undefined

  const result = {
    props: {
      ...(await products).data,
      ...(await filters).data,
      ...(await categories)?.data,
      ...(await layout)?.data,
      filterTypes: await filterTypes,
      params: productListParams,
      up: { href: '/', title: i18n._(/* i18n */ 'Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
  }
  flushMeasurePerf()
  return result
}
