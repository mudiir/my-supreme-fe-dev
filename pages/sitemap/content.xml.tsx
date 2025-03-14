import {
  excludeSitemap,
  getServerSidePropsSitemap,
  staticPathsToString,
  toSitemapFields,
} from '@graphcommerce/next-ui'
import type { GetServerSideProps } from 'next'

const excludes = [
  '*/account*',
  '*/wishlist*',
  '*/cart*',
  '*/checkout*',
  '*/404',
  '*/no-route',
  '*/home',
  '*/switch-stores',
  '*/search',
  '*/account',
  '*/wishlist',
  '*/cart',
  '*/checkout',
]
const additionalPaths: string[] = []

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context
  if (!locale) throw Error('Locale not found')

  const paths = additionalPaths.map(staticPathsToString).filter(excludeSitemap(excludes))

  return getServerSidePropsSitemap(context, toSitemapFields(context, paths))
}

export default function Sitemap() {}
