import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100);

export const registerCustomerSchema = z
  .object({
    role: z.literal("CUSTOMER"),
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(6, "Enter a valid phone number").max(20),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSellerSchema = z
  .object({
    role: z.literal("SELLER"),
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(6, "Enter a valid phone number").max(20),
    storeName: z.string().min(2, "Store name is required").max(100),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchema = z.discriminatedUnion("role", [
  registerCustomerSchema,
  registerSellerSchema,
]);

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    email: z.string().email(),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  storeName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z.string().min(6, "Phone is required").max(20),
  line1: z.string().min(4, "Address line is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
  isDefault: z.boolean().optional(),
});

const imageSchema = z.object({
  url: z
    .string()
    .refine(
      (v) => v.startsWith("data:image/") || v.startsWith("http"),
      "Invalid image",
    ),
  isPrimary: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(150),
  description: z.string().min(10, "Description is required").max(4000),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  discount: z.coerce.number().int().min(0).max(90).default(0),
  material: z.string().max(100).optional().or(z.literal("")),
  sizes: z.array(z.string().max(30)).max(20).default([]),
  colors: z.array(z.string().max(30)).max(20).default([]),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  published: z.boolean().default(false),
  images: z.array(imageSchema).min(1, "Add at least 1 image").max(3, "Maximum 3 images"),
});

export const updateStockSchema = z.object({
  stock: z.coerce.number().int().min(0),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  size: z.string().max(30).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

export const wishlistItemSchema = z.object({
  productId: z.string().min(1),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Select a shipping address"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]),
});

export const payoutSchema = z.object({
  accountName: z.string().min(2, "Enter the account holder name").max(120),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifsc: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code")),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1, "Select the order you're reviewing"),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  body: z.string().min(10, "Please write at least a sentence").max(2000),
});

export type ProductInput = z.infer<typeof productSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
