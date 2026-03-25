import { pool } from "../config/database";
import { successResponse } from "../helper/responseHelper";
import { ProductDetail } from "../model/Product.model";

export const getDetailProduct = async (
  id: number,
): Promise<ProductDetail | null> => {
  const query = `
    SELECT 
        p.product_id,
        p.name, 
        p.slug,
        p.min_price,
        json_agg(
            json_build_object(
                'variant_id', pv.variant_id,
                'sku', pv.sku,
                'price', pv.price,
                'specs', pv.technical_specs,
                'image', (SELECT url FROM product_images pi WHERE variant_id = pv.variant_id LIMIT 1)
            )
        ) AS variants
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
    WHERE p.product_id = $1
    GROUP BY p.product_id;
  `;

  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    return result.rows[0]; // Trả về object đầu tiên vì ID là duy nhất
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

export const getProductsByBrand = async (brand: number) => {
  const query = ` 
    SELECT p.product_id, p.name , p.slug, p.created_at, p.min_price,pi.url
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
join product_images pi ON pv.variant_id = pi.variant_id
JOIN brands b ON b.brand_id = p.brand_id
Where pi.is_main = 'true' and b.brand_id= $1
GROUP BY p.product_id,pi.url
ORDER BY p.created_at DESC
LIMIT 8;
  `;

  const result = await pool.query(query, [brand]);
  return result.rows;
};

export const getNewProducts = async () => {
  const query = `
  SELECT p.product_id, p.name , p.slug, p.created_at, p.min_price,pi.url
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
join product_images pi ON pv.variant_id = pi.variant_id
Where pi.is_main = 'true'
GROUP BY p.product_id,pi.url
ORDER BY p.created_at DESC
LIMIT 8;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getAttributeProducts = async () => {
  const query = `
  SELECT 
        p.product_id,
        p.name, 	
        p.slug,
        p.min_price,
		pi.url
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
	Join product_images pi ON pi.product_id = p.product_id
	Join variant_attribute_values vav ON pv.variant_id = vav.variant_id
	Join attribute_values av ON av.value_id = vav.value_id 
    WHERE av.value_name = $1
    GROUP BY p.product_id , pi.url;
  `;
};

export const createProduct = async (product: any) => {
  const client = await pool.connect();
  let data: any = {};
  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `INSERT INTO products (name, category_id,brand_id, description,slug)
       VALUES ($1,$2,$3,$4,$5)
        RETURNING *
       `,
      [
        product.name,
        product.category_id,
        product.brand_id,
        product.description,
        product.slug,
      ],
    );
    data = { ...productResult.rows[0], variants: [] };
    const product_id = productResult.rows[0].product_id;

    for (const variant of product.variants) {
      const variantResult = await client.query(
        `INSERT INTO product_variants
    (product_id, price,technical_specs, stock_quantity, sku)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING variant_id`,
        [
          product_id,
          variant.price,
          variant.technical_specs,
          variant.stock,
          variant.sku,
        ],
      );

      const variant_id = variantResult.rows[0].variant_id;
      const currentVariant = {
        ...variantResult.rows[0],
        attribute_values: [],
        images: [],
      };
      if (variant.attribute_values && variant.attribute_values.length > 0) {
        for (const value_id of variant.attribute_values) {
          await client.query(
            `INSERT INTO variant_attribute_values (variant_id, value_id) VALUES ($1, $2)`,
            [variant_id, value_id],
          );
          currentVariant.attribute_values.push(value_id);
        }
      }
      for (const image of variant.images) {
        const imageResult = await client.query(
          `INSERT INTO product_images
    (product_id, variant_id, is_main, url)
    VALUES ($1,$2,$3,$4)`,
          [product_id, variant_id, image.is_main, image.url],
        );
        currentVariant.image.push(imageResult);
      }
      data.variants.push(currentVariant);
    }

    await client.query("COMMIT");

    return data;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
