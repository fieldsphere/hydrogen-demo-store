import {useFetcher} from '@remix-run/react';
import {useEffect, useState, useMemo} from 'react';
import {
  Money,
  Image,
  getProductOptions,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import {useQuickView} from '~/context/QuickViewContext';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Link} from '~/components/Link';
import {Text} from '~/components/Text';
import {usePrefixPathWithLocale} from '~/lib/utils';
import type {ProductFragment} from 'storefrontapi.generated';

type ProductQuickViewData = {
  product: ProductFragment & {
    options: Array<{
      name: string;
      optionValues: Array<{
        name: string;
        firstSelectableVariant: any;
        swatch: {color: string; image: {previewImage: {url: string}}} | null;
      }>;
    }>;
    selectedOrFirstAvailableVariant: ProductFragment['selectedOrFirstAvailableVariant'];
    adjacentVariants: ProductFragment['adjacentVariants'];
    media: {
      nodes: Array<{
        __typename: string;
        id?: string;
        image?: {id: string; url: string; altText: string; width: number; height: number};
        alt?: string;
      }>;
    };
  };
};

export function QuickViewContent() {
  const {productHandle, closeQuickView} = useQuickView();
  const fetcher = useFetcher<ProductQuickViewData>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Build query string from selected options
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(selectedOptions).forEach(([name, value]) => {
      params.set(`option_${name}`, value);
    });
    return params.toString();
  }, [selectedOptions]);

  // Build API path with locale prefix
  const apiPath = usePrefixPathWithLocale(
    productHandle
      ? `/api/product-quick-view/${productHandle}${queryString ? `?${queryString}` : ''}`
      : '',
  );

  // Fetch product data when handle changes
  useEffect(() => {
    if (productHandle && apiPath) {
      fetcher.load(apiPath);
      // Reset image index when product changes
      setSelectedImageIndex(0);
    }
  }, [productHandle, apiPath, fetcher]);

  if (!productHandle) {
    return null;
  }

  if (fetcher.state === 'loading' || !fetcher.data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary/50">Loading...</div>
      </div>
    );
  }

  const {product} = fetcher.data;
  
  // Get variants array for useOptimisticVariant
  const variants = getAdjacentAndFirstAvailableVariants(product);
  
  // Optimistically select variant based on selected options
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    variants,
  );

  // Get product options using Hydrogen helper
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  // Filter images from media
  const images = product.media.nodes.filter(
    (m) => m.__typename === 'MediaImage' && m.image,
  );
  
  const isOutOfStock = !selectedVariant?.availableForSale;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({...prev, [optionName]: value}));
    // Reset image index when variant changes
    setSelectedImageIndex(0);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">
      {/* Left: Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        {images[selectedImageIndex]?.image && (
          <div className="aspect-square bg-primary/5 rounded-lg overflow-hidden">
            <Image
              data={images[selectedImageIndex].image}
              className="w-full h-full object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((media, index) => (
              <button
                key={media.id || index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  index === selectedImageIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                {media.image && (
                  <Image
                    data={media.image}
                    className="w-full h-full object-cover"
                    sizes="64px"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col gap-4">
        {/* Vendor */}
        {product.vendor && (
          <Text className="text-primary/50 text-sm uppercase tracking-wide">
            {product.vendor}
          </Text>
        )}

        {/* Title */}
        <Text as="h2" className="text-2xl font-medium">
          {product.title}
        </Text>

        {/* Price */}
        {selectedVariant?.price && (
          <div className="flex items-center gap-2">
            <Money data={selectedVariant.price} className="text-xl font-medium" />
            {selectedVariant.compareAtPrice && (
              <Money
                data={selectedVariant.compareAtPrice}
                className="text-primary/50 line-through"
              />
            )}
          </div>
        )}

        {/* Variant Options */}
        <div className="space-y-4">
          {productOptions.map((option: MappedProductOptions) => (
            <div key={option.name} className="space-y-2">
              <Text className="font-medium">{option.name}</Text>
              <div className="flex flex-wrap gap-2">
                {option.optionValues.map((value) => {
                  const isSelected = value.selected;

                  return (
                    <button
                      key={value.name}
                      onClick={() => handleOptionChange(option.name, value.name)}
                      disabled={!value.available}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-contrast'
                          : value.available
                            ? 'border-primary/20 hover:border-primary/50'
                            : 'border-primary/10 opacity-50 cursor-not-allowed'
                      }`}
                      style={
                        value.swatch?.color && !isSelected
                          ? {
                              backgroundColor: value.swatch.color,
                              borderColor: value.swatch.color,
                            }
                          : undefined
                      }
                    >
                      {value.swatch?.color ? '' : value.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add to Cart */}
        <div className="mt-4">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-3 px-6 bg-primary/10 text-primary/50 rounded-md cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <AddToCartButton
              lines={[
                {
                  merchandiseId: selectedVariant.id!,
                  quantity: 1,
                },
              ]}
              variant="primary"
              className="w-full"
              onClick={closeQuickView}
            >
              <span className="flex items-center justify-center gap-2">
                Add to Cart
                {selectedVariant?.price && (
                  <>
                    <span>·</span>
                    <Money data={selectedVariant.price} withoutTrailingZeros />
                  </>
                )}
              </span>
            </AddToCartButton>
          )}
        </div>

        {/* View Full Details Link */}
        <Link
          to={`/products/${product.handle}`}
          onClick={closeQuickView}
          className="text-center text-primary/70 hover:text-primary underline"
        >
          View Full Details
        </Link>

        {/* Description (truncated) */}
        {product.descriptionHtml && (
          <div
            className="text-primary/70 text-sm mt-4 line-clamp-4"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          />
        )}
      </div>
    </div>
  );
}
