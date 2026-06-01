import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { productsAPI } from '@/lib/api';

export async function generateMetadata({ params }) {
  try {
    const { data } = await productsAPI.getOne(params.slug);
    const product = data.product;
    return {
      title: product.metaTitle || `${product.name} | VelvetCart`,
      description: product.metaDescription || product.shortDescription || product.name,
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.name,
        images: product.images?.map((img) => ({
          url: img.url, width: 1200, height: 1600, alt: img.alt || product.name,
        })),
        type: 'website',
      },
      other: {
        'og:price:amount': String(product.price),
        'og:price:currency': 'INR',
        'og:availability': product.stock > 0 ? 'instock' : 'oos',
        'pinterest-rich-pin': 'product',
      },
    };
  } catch {
    return { title: 'Product | VelvetCart' };
  }
}

export default async function ProductPage({ params }) {
  let product, related;
  try {
    const { data } = await productsAPI.getOne(params.slug);
    product = data.product;
    related = data.related || [];
  } catch {
    notFound();
  }

  if (!product) notFound();

  return <ProductDetail product={product} related={related} />;
}

export const revalidate = 60;
