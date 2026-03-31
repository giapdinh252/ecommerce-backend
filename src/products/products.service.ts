import { pool } from "../config/database";
import { IpaginationOptions } from "../utils/types/pagination-option";
import { handleUploadToCloud } from "./products.controller";
import { ProductDetail } from "./products.model";

export const getDetailProduct = async (
  slug: string,
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
    WHERE p.slug = $1
    GROUP BY p.product_id;
  `;

  try {
    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

// export const getProductsByBrand = async (brand: number) => {
//   const query = `
//     SELECT p.product_id, p.name , p.slug, p.created_at, p.min_price,pi.url
// FROM products p
// JOIN product_variants pv ON p.product_id = pv.product_id
// join product_images pi ON pv.variant_id = pi.variant_id
// JOIN brands b ON b.brand_id = p.brand_id
// Where pi.is_main = 'true' and b.brand_id= $1
// GROUP BY p.product_id,pi.url
// ORDER BY p.created_at DESC
// LIMIT 8;
//   `;

//   const result = await pool.query(query, [brand]);
//   return result.rows;
// };

// export const getNewProducts = async (options: IpaginationOptions) => {
//   const { page, limit } = options;
//   const offset = (page - 1) * limit;
//   const query = `
//     SELECT p.product_id, p.name, p.slug, p.created_at, p.min_price, pi.url
//     FROM products p
//     JOIN product_variants pv ON p.product_id = pv.product_id
//     JOIN product_images pi ON pv.variant_id = pi.variant_id
//     WHERE pi.is_main = 'true'
//     GROUP BY p.product_id, pi.url, p.name, p.slug, p.created_at, p.min_price
//     ORDER BY p.created_at DESC
//     LIMIT $1 OFFSET $2;
//   `;
//   const values = [limit, offset];

//   const result = await pool.query(query, values);
//   return result.rows;
// };
export const getNewProducts = async (options: IpaginationOptions) => {
  const {
    page,
    limit,
    searchText,
    category,
    brand,
    minPrice,
    maxPrice,
    filters,
    sortBy,
    sortDesc,
  } = options;

  const offset = (page - 1) * limit;
  let queryParams: any[] = [];
  let whereClauses: string[] = [];

  if (searchText) {
    queryParams.push(`%${searchText}%`);
    whereClauses.push(`p.name ILIKE $${queryParams.length}`);
  }
  if (category) {
    queryParams.push(category);
    whereClauses.push(`p.category_id =$${queryParams.length}`);
  }
  if (minPrice !== undefined) {
    queryParams.push(minPrice);
    whereClauses.push(`p.min_price >= $${queryParams.length}`);
  }
  if (maxPrice !== undefined) {
    queryParams.push(maxPrice);
    whereClauses.push(`p.min_price <= $${queryParams.length}`);
  }
  if (brand) {
    queryParams.push(brand);
    whereClauses.push(`p.brand_id =$${queryParams.length}`);
  }

  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, value]) => {
      const valuesArray = Array.isArray(value) ? value : [value];

      queryParams.push(valuesArray);

      whereClauses.push(`
        EXISTS (
           SELECT 1 
           FROM product_variants pv
           JOIN variant_attribute_values vav ON pv.variant_id = vav.variant_id
           JOIN attribute_values av ON vav.value_id = av.value_id
           WHERE pv.product_id = p.product_id 
           AND av.value_name = ANY($${queryParams.length})
        )
      `);
    });
  }

  const sortColumn = sortBy || "p.created_at";
  const sortOrder = sortDesc ? "DESC" : "ASC";
  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const query = `
   SELECT 
    p.product_id, 
    p.name, 
    p.slug, 
    p.created_at, 
    p.min_price, 
   (   
        SELECT pi.url 
        FROM product_images pi 
        WHERE pi.product_id = p.product_id AND pi.is_main = true 
        LIMIT 1
    )
    FROM products p 
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
  `;

  const values = [...queryParams, limit, offset];
  const result = await pool.query(query, values);
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
    WHERE av.value_name ='128GB'
    GROUP BY p.product_id , pi.url;
  `;
  const result = await pool.query(query);
  return result.rows;
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
        const img = handleUploadToCloud(image.url);
        const imageResult = await client.query(
          `INSERT INTO product_images
    (product_id, variant_id, is_main, url)
    VALUES ($1,$2,$3,$4)`,
          [product_id, variant_id, image.is_main, img],
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
