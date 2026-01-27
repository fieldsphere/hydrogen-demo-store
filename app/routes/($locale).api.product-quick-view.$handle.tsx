import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {MEDIA_FRAGMENT, PRODUCT_QUICK_VIEW_FRAGMENT} from '~/data/fragments';

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {handle} = params;
  
  if (!handle) {
    return json({error: 'Product handle is required'}, {status: 400});
  }

  const searchParams = new URL(request.url).searchParams;
  const selectedOptions: {name: string; value: string}[] = [];
  
  // Parse selectedOptions from search params (format: option_Color=Red&option_Size=M)
  searchParams.forEach((value, key) => {
    if (key.startsWith('option_')) {
      selectedOptions.push({
        name: key.replace('option_', ''),
        value,
      });
    }
  });

  const {product} = await context.storefront.query(PRODUCT_QUICK_VIEW_QUERY, {
    variables: {
      handle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product) {
    return json({error: 'Product not found'}, {status: 404});
  }

  return json({product});
}

const PRODUCT_QUICK_VIEW_QUERY = `#graphql
  query ProductQuickView(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductQuickView
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_QUICK_VIEW_FRAGMENT}
` as const;

// no-op
export default function ProductQuickViewApiRoute() {
  return null;
}
