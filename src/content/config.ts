import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    efLevel: z.number().int().min(1).max(5),
    slug: z.string().regex(/^ef-[1-5]-.+$/),
    flavorHeadline: z.string(),
    heatDescriptor: z.string(),
    scovilleMin: z.number().int().nonnegative(),
    scovilleMax: z.number().int().positive(),
    keyIngredients: z.tuple([z.string(), z.string()]),
    efColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    jarImage: z.string().optional(),
    jarImageAlt: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().max(160).optional(),
    status: z.enum(['published', 'draft']).default('draft'),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string().max(160),
    status: z.enum(['published', 'draft']),
    lastUpdated: z.coerce.date(),
    noIndex: z.boolean().optional().default(false),
  }),
});

export const collections = {
  products: productsCollection,
  pages: pagesCollection,
};
