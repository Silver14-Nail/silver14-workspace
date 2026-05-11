import type { Metadata } from 'next'
import { createStorefrontMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>
}): Promise<Metadata> {
  const { lng } = await params

  return {
    ...createStorefrontMetadata({ locale: lng, path: '/products' }),
    description:
      'Shop handmade press-on nail sets from Silver14 Nail, including French tips, metallic nails, solid colors, nail art, and custom styles.',
    title: 'Shop Press-On Nails',
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
