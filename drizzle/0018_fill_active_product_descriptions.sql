UPDATE "products" AS p
SET
  "description" = v.description,
  "updated_at" = now()
FROM (
  VALUES
    ('10000mah-power-bank', 'A 10000mAh power bank for carrying additional charging capacity when you are away from a power outlet. A practical everyday option for travel, commuting and mobile use.'),
    ('20w-fast-charger', 'A 20W fast charger designed for convenient everyday charging of compatible devices. Compact and practical for use at home, work or while travelling.'),
    ('bluetooth-headphones', 'Bluetooth headphones for convenient wireless listening during everyday activities. Suitable for music, media and general audio use with compatible devices.'),
    ('casual-sneakers', 'Casual sneakers with an easy everyday style for relaxed outfits and regular use. A versatile footwear option to pair with jeans, trousers and other casual clothing.'),
    ('classic-analog-watch', 'A classic analog watch with a clean, versatile look for everyday styling. An easy accessory to pair with casual, work and smart outfits.'),
    ('classic-polo-shirt', 'A classic polo shirt with a clean, versatile style for casual and smart-casual dressing. Easy to pair with jeans or trousers for everyday wear.'),
    ('comfort-sandals', 'Comfort sandals with a simple everyday design for casual wear. A practical footwear choice for relaxed outings and regular day-to-day use.'),
    ('cotton-crew-neck-tee', 'A cotton crew neck tee with a simple everyday design and easy-to-style silhouette. A practical wardrobe option for casual outfits and layering.'),
    ('formal-leather-shoes', 'Formal leather shoes with a clean, polished appearance for smart dressing. Suitable for pairing with formal and business-style outfits.'),
    ('genuine-leather-wallet', 'A genuine leather wallet designed for keeping everyday essentials organised in a compact form. A practical accessory for daily use and easy carrying.'),
    ('hooded-sweatshirt', 'A hooded sweatshirt with a relaxed everyday style for casual dressing and layering. Easy to combine with jeans, trousers or other everyday basics.'),
    ('loafers', 'Classic men''s loafers with a clean slip-on design for smart-casual and everyday wear. Easy to pair with trousers, jeans and other versatile outfits.'),
    ('men-s-leather-belt', 'A men''s leather belt with a clean, versatile design for everyday dressing. Suitable for pairing with trousers, jeans and smart-casual outfits.'),
    ('regular-fit-jeans', 'Regular fit jeans with a straightforward everyday silhouette for casual dressing. A versatile wardrobe option that pairs easily with shirts, tees and footwear.'),
    ('running-shoes', 'Running shoes with a sporty everyday design for active and casual styling. A practical footwear option for customers looking for an athletic-inspired look.'),
    ('slim-fit-oxford-shirt', 'A slim fit Oxford shirt with a clean, smart-casual appearance for everyday styling. Suitable for pairing with trousers or jeans for work and casual occasions.'),
    ('smart-watch-series-5', 'Smart Watch Series 5 with a modern wearable design for everyday use. A convenient wrist-worn accessory for customers looking for a smart everyday device.'),
    ('true-wireless-earbuds', 'True wireless earbuds for cable-free everyday listening with compatible devices. A compact audio option for commuting, work, entertainment and general daily use.'),
    ('urban-backpack', 'A practical urban backpack for carrying everyday essentials while commuting, studying or travelling around town. Designed for simple, convenient daily use.'),
    ('polarized-sunglasses', 'Polarized sunglasses with a versatile everyday style for outdoor wear. A practical accessory for completing casual looks while spending time outside.')
) AS v(slug, description)
WHERE p."slug" = v.slug
  AND p."status" = 'active'
  AND (p."description" IS NULL OR btrim(p."description") = '');
