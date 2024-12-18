import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import secImage from '../assets/sec.jpg';
import premiumImg from '../assets/premium.jpg';
import sustainableImg from '../assets/sustainable.jpg';
import customerImg from '../assets/customer.jpg';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  console.log('RECOMloaddefer',context)
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
        <div className='bg-[var(--theme-base-color)] h-96 w-full grid place-content-center'>
          <div className='flex flex-col items-center justify-center w-[80vw] h-full text-center'>
            <div className='flex flex-col items-center justify-center'>
              <div className='text-5xl font-extrabold text-white'>Timeless Elegance, Handcrafted for You</div>
              <div className='md:max-w-96 text-xl mt-3 text-white'>
                "Step into a world of unparalleled quality and craftsmanship."
              </div>
            </div>
          </div>
        </div>
      <RecommendedProducts products={data.recommendedProducts} />
      <div className='w-full flex flex-row items-center justify-between flex-wrap md:px-40 p-20 md:py-40 bg-[var(--theme-lightPurple-color)] text-white'>
        {/* Left Side - Image */}
        <div className='md:w-1/2'>
          <img 
            src={secImage} 
            alt="Bags-luxury" 
            className='w-full h-auto object-cover'
          />
        </div>
        
        {/* Right Side - Text */}
        <div className='md:w-1/2 ml-auto text-right'>
          <div className='text-5xl font-extrabold'>Elevate Your Everyday – Authentic Leather Bags Await</div>
          <div className='text-lg mt-3 font-semibold'>
          "Experience the perfect blend of luxury and functionality with our handcrafted leather bags. Designed to complement your style while standing the test of time, our collection boasts impeccable craftsmanship, premium materials, and timeless designs. Whether you're heading to the office or out on an adventure, our leather bags are made to accompany you every step of the way. Discover the elegance you deserve."
          </div>
        </div>
      </div>

    {/* Why Choose Us Section */}
<div className="bg-[var(--theme-lightGray-color)] py-20 px-10 text-center">
  <h2 className="text-4xl font-extrabold text-[var(--theme-primary-color)] mb-10">
    Why Choose Us
  </h2>
  <div className="grid gap-10 md:grid-cols-3">
    {/* Feature 1 */}
    <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
      <img
        src={premiumImg}
        alt="Premium Quality"
        className="w-full h-auto rounded-lg mb-4"
      />
      <div className="text-[var(--theme-primary-color)] text-4xl mb-4">
        <i className="fas fa-gem"></i>
      </div>
      <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
      <p className="text-gray-600">
        Our products are crafted using the finest materials to ensure durability and elegance.
      </p>
    </div>
    {/* Feature 2 */}
    <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
      <img
        src={sustainableImg}
        alt="Sustainable Practices"
        className="w-full h-auto rounded-lg mb-4"
      />
      <div className="text-[var(--theme-primary-color)] text-4xl mb-4">
        <i className="fas fa-hand-holding-heart"></i>
      </div>
      <h3 className="text-xl font-bold mb-2">Sustainable Practices</h3>
      <p className="text-gray-600">
        We prioritize eco-friendly manufacturing processes to reduce our environmental footprint.
      </p>
    </div>
    {/* Feature 3 */}
    <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
      <img
        src={customerImg}
        alt="Customer Satisfaction"
        className="w-full h-auto rounded-lg mb-4"
      />
      <div className="text-[var(--theme-primary-color)] text-4xl mb-4">
        <i className="fas fa-thumbs-up"></i>
      </div>
      <h3 className="text-xl font-bold mb-2">Customer Satisfaction</h3>
      <p className="text-gray-600">
        Your satisfaction is our priority, with a dedicated team to assist you every step of the way.
      </p>
    </div>
  </div>
</div>


      {/* Customer Testimonials Section */}
      <div className="bg-[var(--theme-lightGray-color)] py-20 px-10 text-center">
        <h2 className="text-4xl font-extrabold text-[var(--theme-primary-color)] mb-10">
          What Our Customers Say
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
            <p className="text-lg font-medium text-gray-600 italic">
              "Absolutely love the quality of these leather bags! They are stylish and durable."
            </p>
            <h4 className="text-xl font-semibold text-gray-800 mt-4">
              - Sarah M.
            </h4>
          </div>
          {/* Testimonial 2 */}
          <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
            <p className="text-lg font-medium text-gray-600 italic">
              "The craftsmanship is outstanding. These bags truly stand the test of time."
            </p>
            <h4 className="text-xl font-semibold text-gray-800 mt-4">
              - John D.
            </h4>
          </div>
          {/* Testimonial 3 */}
          <div className="p-6 bg-[var(--theme-lightPurple-color)] rounded-lg shadow-lg">
            <p className="text-lg font-medium text-gray-600 italic">
              "I'm so impressed by the elegance and practicality of these bags. Highly recommend!"
            </p>
            <h4 className="text-xl font-semibold text-gray-800 mt-4">
              - Emily R.
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  console.log('RECOMPROD',products)
  return (
    <div className="recommended-products">
      <h2>Best Selling Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
