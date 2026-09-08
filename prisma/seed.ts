import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (p: string) => bcrypt.hash(p, 10);
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  console.log("Clearing existing data…");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users…");
  const admin = await prisma.user.create({
    data: {
      name: "Velora Admin",
      email: "admin@velora.test",
      phone: "+1 202 555 0100",
      role: Role.ADMIN,
      passwordHash: await hash("Admin123!"),
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Amelia Hart",
      email: "customer@velora.test",
      phone: "+1 415 555 0142",
      role: Role.CUSTOMER,
      passwordHash: await hash("Customer123!"),
      customerProfile: { create: {} },
      wishlist: { create: {} },
      cart: { create: {} },
      addresses: {
        create: [
          {
            fullName: "Amelia Hart",
            phone: "+1 415 555 0142",
            line1: "418 Valencia Street, Apt 3",
            city: "San Francisco",
            state: "CA",
            postalCode: "94103",
            country: "United States",
            isDefault: true,
          },
        ],
      },
    },
  });

  const sellersData = [
    {
      name: "Clara Bennett",
      email: "seller1@velora.test",
      phone: "+1 212 555 0170",
      storeName: "Atelier Lune",
      bio: "Hand-finished fine jewellery in recycled gold and ethically sourced stones.",
    },
    {
      name: "Marco Silva",
      email: "seller2@velora.test",
      phone: "+1 312 555 0188",
      storeName: "House of Meridian",
      bio: "Considered fashion in natural fibres — linen, wool and organic cotton.",
    },
    {
      name: "Yuki Tanaka",
      email: "seller3@velora.test",
      phone: "+1 503 555 0199",
      storeName: "Kin & Stone",
      bio: "Sculptural silver and minimalist accessories made in small batches.",
    },
  ];

  const sellers = [];
  for (const s of sellersData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: Role.SELLER,
        passwordHash: await hash("Seller123!"),
        sellerProfile: { create: { storeName: s.storeName, bio: s.bio } },
        addresses: {
          create: [
            {
              fullName: s.name,
              phone: s.phone,
              line1: "1 Maker's Row",
              city: "New York",
              state: "NY",
              postalCode: "10012",
              country: "United States",
              isDefault: true,
            },
          ],
        },
      },
      include: { sellerProfile: true },
    });
    sellers.push(user.sellerProfile!);
  }

  console.log("Creating categories…");
  const categoryDefs = [
    { name: "Rings", group: "Jewellery", image: "photo-1605100804763-247f67b3557e" },
    { name: "Necklaces", group: "Jewellery", image: "photo-1599643478518-a784e5dc4c8f" },
    { name: "Earrings", group: "Jewellery", image: "photo-1535632066927-ab7c9ab60908" },
    { name: "Bracelets", group: "Jewellery", image: "photo-1611591437281-460bfbe1220a" },
    { name: "Dresses", group: "Fashion", image: "photo-1595777457583-95e059d581b8" },
    { name: "Knitwear", group: "Fashion", image: "photo-1576871337622-98d48d1cf531" },
    { name: "Outerwear", group: "Fashion", image: "photo-1591047139829-d91aecb6caea" },
    { name: "Accessories", group: "Fashion", image: "photo-1511499767150-a48a237f0083" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const created = await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), group: c.group, imageUrl: img(c.image) },
    });
    categories[c.name] = created.id;
  }

  console.log("Creating products…");
  type P = {
    name: string;
    category: string;
    seller: number;
    price: number;
    discount?: number;
    material: string;
    sizes?: string[];
    colors: string[];
    stock: number;
    images: string[];
    description: string;
    flags?: Partial<Record<"featured" | "trending" | "bestSeller" | "newArrival", boolean>>;
  };

  const products: P[] = [
    {
      name: "Aurelia Signet Ring",
      category: "Rings",
      seller: 0,
      price: 24000,
      material: "18k recycled gold",
      sizes: ["5", "6", "7", "8"],
      colors: ["Gold"],
      stock: 12,
      images: ["photo-1605100804763-247f67b3557e", "photo-1603561591411-07134e71a2a9", "photo-1598560917505-59a3ad559071"],
      description:
        "A weighty signet with a softly domed face, hand-polished to a warm shine. Made to be engraved or worn plain.",
      flags: { featured: true, bestSeller: true },
    },
    {
      name: "Petra Diamond Band",
      category: "Rings",
      seller: 0,
      price: 68000,
      discount: 10,
      material: "Platinum, 0.4ct diamonds",
      sizes: ["5", "6", "7"],
      colors: ["Silver"],
      stock: 5,
      images: ["photo-1598560917505-59a3ad559071", "photo-1602751584552-8ba73aad10e1"],
      description:
        "Seven brilliant-cut diamonds channel-set in solid platinum. A quiet everyday band with real presence.",
      flags: { featured: true, trending: true },
    },
    {
      name: "Solene Pearl Drop Necklace",
      category: "Necklaces",
      seller: 0,
      price: 32000,
      material: "14k gold, freshwater pearl",
      colors: ["Gold", "White"],
      stock: 18,
      images: ["photo-1599643478518-a784e5dc4c8f", "photo-1611652022419-a9419f74343d"],
      description:
        "A single baroque pearl suspended from a fine cable chain. Adjustable between 16 and 18 inches.",
      flags: { bestSeller: true, newArrival: true },
    },
    {
      name: "Halden Chain Necklace",
      category: "Necklaces",
      seller: 2,
      price: 21000,
      material: "Sterling silver",
      colors: ["Silver"],
      stock: 0,
      images: ["photo-1611591437281-460bfbe1220a", "photo-1610694955371-d4a3e0ce4b52"],
      description:
        "A substantial curb chain with a matte finish and a hand-soldered clasp. Currently between batches.",
      flags: { trending: true },
    },
    {
      name: "Ondine Hoop Earrings",
      category: "Earrings",
      seller: 0,
      price: 18000,
      material: "18k gold vermeil",
      colors: ["Gold"],
      stock: 24,
      images: ["photo-1535632066927-ab7c9ab60908", "photo-1633934542430-0905ccb5f050"],
      description:
        "Medium hoops with a subtly tapered profile so they sit close to the ear. Light enough for every day.",
      flags: { featured: true, newArrival: true },
    },
    {
      name: "Mira Stud Set",
      category: "Earrings",
      seller: 2,
      price: 9500,
      discount: 15,
      material: "Sterling silver",
      colors: ["Silver"],
      stock: 40,
      images: ["photo-1629224316810-9d8805b95e76", "photo-1596944924616-7b38e7cfac36"],
      description:
        "Three pairs of graduated studs — a dot, a bar and a tiny disc — to mix across a stack of piercings.",
      flags: { bestSeller: true },
    },
    {
      name: "Cove Cuff Bracelet",
      category: "Bracelets",
      seller: 2,
      price: 26000,
      material: "Recycled sterling silver",
      colors: ["Silver"],
      stock: 9,
      images: ["photo-1611591437281-460bfbe1220a", "photo-1573408301185-9146fe634ad0"],
      description:
        "A wide open cuff forged from a single bar, with a gently hammered surface that catches the light.",
      flags: { trending: true, newArrival: true },
    },
    {
      name: "Lin Beaded Bracelet",
      category: "Bracelets",
      seller: 0,
      price: 14000,
      material: "14k gold, onyx",
      colors: ["Gold", "Black"],
      stock: 15,
      images: ["photo-1602173574767-37ac01994b2a", "photo-1611085583191-a3b181a88401"],
      description:
        "Faceted onyx beads on a stretch cord with a single gold accent. Stacks well with finer chains.",
    },
    {
      name: "Marlowe Linen Dress",
      category: "Dresses",
      seller: 1,
      price: 29000,
      material: "100% European linen",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Ivory", "Sage", "Black"],
      stock: 20,
      images: ["photo-1595777457583-95e059d581b8", "photo-1596783074918-c84cb06531ca"],
      description:
        "A column dress with a relaxed waist tie and deep pockets. Cut long, with a side slit for movement.",
      flags: { featured: true, bestSeller: true },
    },
    {
      name: "Odette Slip Dress",
      category: "Dresses",
      seller: 1,
      price: 24000,
      discount: 20,
      material: "Washable silk",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Champagne", "Charcoal"],
      stock: 11,
      images: ["photo-1566174053879-31528523f8ae", "photo-1539008835657-9e8e9680c956"],
      description:
        "A bias-cut slip with adjustable straps and a cowl back. Layer it or wear it alone.",
      flags: { trending: true },
    },
    {
      name: "Fen Merino Sweater",
      category: "Knitwear",
      seller: 1,
      price: 19000,
      material: "Extra-fine merino wool",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Oat", "Olive", "Navy"],
      stock: 30,
      images: ["photo-1576871337622-98d48d1cf531", "photo-1610652492500-ded49ceeb378"],
      description:
        "A mid-weight crew knit with a clean set-in sleeve and ribbed trims. Softens with every wash.",
      flags: { bestSeller: true, newArrival: true },
    },
    {
      name: "Brae Alpaca Cardigan",
      category: "Knitwear",
      seller: 1,
      price: 27000,
      material: "Alpaca blend",
      sizes: ["S", "M", "L"],
      colors: ["Camel", "Grey"],
      stock: 8,
      images: ["photo-1618354691373-d851c5c3a990", "photo-1610652492500-ded49ceeb378"],
      description:
        "An oversized cardigan with horn buttons and patch pockets. Brushed for a soft halo.",
      flags: { trending: true },
    },
    {
      name: "Halston Wool Coat",
      category: "Outerwear",
      seller: 1,
      price: 58000,
      material: "Italian wool, cupro lining",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Camel", "Charcoal"],
      stock: 6,
      images: ["photo-1591047139829-d91aecb6caea", "photo-1544022613-e87ca75a784a"],
      description:
        "A straight double-faced coat that falls below the knee, with a concealed placket and welt pockets.",
      flags: { featured: true },
    },
    {
      name: "Ridge Quilted Jacket",
      category: "Outerwear",
      seller: 1,
      price: 32000,
      discount: 10,
      material: "Recycled shell, down-free fill",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Olive", "Black"],
      stock: 14,
      images: ["photo-1544022613-e87ca75a784a", "photo-1548883354-94bcfe321cbb"],
      description:
        "A lightweight diamond-quilted jacket with a stand collar and snap front. Packs into its own pocket.",
      flags: { newArrival: true },
    },
    {
      name: "Isla Silk Scarf",
      category: "Accessories",
      seller: 1,
      price: 12000,
      material: "Mulberry silk twill",
      colors: ["Sage", "Rust", "Ivory"],
      stock: 26,
      images: ["photo-1601924994987-69e26d50dc26", "photo-1601924638867-3a6de6b7a500"],
      description:
        "A generously sized square with hand-rolled edges and a soft botanical print. Wear it any way.",
      flags: { bestSeller: true },
    },
    {
      name: "Tor Leather Belt",
      category: "Accessories",
      seller: 2,
      price: 11000,
      material: "Vegetable-tanned leather",
      sizes: ["S", "M", "L"],
      colors: ["Tan", "Black"],
      stock: 22,
      images: ["photo-1624222247344-550fb60583dc", "photo-1553062407-98eeb64c6a62"],
      description:
        "A slim belt with a solid brass buckle that patinas over time. Made to be re-punched and kept.",
    },
    {
      name: "Wren Structured Tote",
      category: "Accessories",
      seller: 2,
      price: 34000,
      material: "Full-grain leather",
      colors: ["Cognac", "Black"],
      stock: 10,
      images: ["photo-1584917865442-de89df76afd3", "photo-1590874103328-eac38a683ce7"],
      description:
        "A clean-lined tote that holds its shape, with a suede-lined interior and a slip pocket for a laptop.",
      flags: { featured: true, trending: true },
    },
    {
      name: "Dune Cashmere Beanie",
      category: "Accessories",
      seller: 1,
      price: 9000,
      material: "Grade-A cashmere",
      colors: ["Oat", "Charcoal", "Sage"],
      stock: 0,
      images: ["photo-1576871337622-98d48d1cf531", "photo-1608889175123-8ee362201f81"],
      description:
        "A finely ribbed beanie knitted in two-ply cashmere. Warm, weightless and back soon.",
    },
    {
      name: "Vale Gold Anklet",
      category: "Bracelets",
      seller: 0,
      price: 13000,
      material: "14k gold fill",
      colors: ["Gold"],
      stock: 17,
      images: ["photo-1602173574767-37ac01994b2a", "photo-1611085583191-a3b181a88401"],
      description:
        "A barely-there chain anklet with a small figaro section and a lobster clasp. Water-safe.",
      flags: { newArrival: true },
    },
    {
      name: "Nore Pearl Studs",
      category: "Earrings",
      seller: 0,
      price: 15000,
      material: "18k gold, akoya pearl",
      colors: ["Gold", "White"],
      stock: 19,
      images: ["photo-1535632066927-ab7c9ab60908", "photo-1633934542430-0905ccb5f050"],
      description:
        "Classic 6mm pearl studs on solid gold posts with oversized backs for a secure hold.",
      flags: { bestSeller: true },
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        discount: p.discount ?? 0,
        effectivePrice: Math.round((p.price * (100 - (p.discount ?? 0))) / 100),
        material: p.material,
        sizes: p.sizes ?? [],
        colors: p.colors,
        stock: p.stock,
        published: true,
        featured: p.flags?.featured ?? false,
        trending: p.flags?.trending ?? false,
        bestSeller: p.flags?.bestSeller ?? false,
        newArrival: p.flags?.newArrival ?? false,
        categoryId: categories[p.category],
        sellerId: sellers[p.seller].id,
        images: {
          create: p.images.map((i, idx) => ({
            url: img(i),
            isPrimary: idx === 0,
            position: idx,
          })),
        },
      },
    });
    createdProducts.push(created);
  }

  // one draft product per seller to exercise publish/unpublish
  for (let i = 0; i < sellers.length; i++) {
    await prisma.product.create({
      data: {
        name: `Draft Sample ${i + 1}`,
        slug: slugify(`Draft Sample ${i + 1}`),
        description: "An unpublished draft used to demonstrate the publish workflow.",
        price: 10000,
        effectivePrice: 10000,
        material: "Sample",
        colors: ["Natural"],
        stock: 3,
        published: false,
        categoryId: categories[i % 2 === 0 ? "Rings" : "Accessories"],
        sellerId: sellers[i].id,
        images: { create: [{ url: img("photo-1515562141207-7a88fb7ce338"), isPrimary: true, position: 0 }] },
      },
    });
  }

  console.log("Creating sample orders…");
  const addr = await prisma.address.findFirst({ where: { userId: customer.id } });

  const orderSpecs = [
    { items: [{ p: 0, q: 1 }, { p: 4, q: 2 }], status: "DELIVERED" as const, paid: true },
    { items: [{ p: 8, q: 1 }], status: "SHIPPED" as const, paid: true },
    { items: [{ p: 2, q: 1 }, { p: 14, q: 1 }, { p: 17, q: 1 }], status: "PROCESSING" as const, paid: true },
    { items: [{ p: 10, q: 2 }], status: "PROCESSING" as const, paid: true },
  ];

  let n = 1;
  for (const spec of orderSpecs) {
    const items = spec.items.map(({ p, q }) => {
      const prod = products[p];
      const unit = Math.round(prod.price * (1 - (prod.discount ?? 0) / 100));
      return {
        product: createdProducts[p],
        source: prod,
        quantity: q,
        unitPrice: unit,
        lineTotal: unit * q,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const shipping = subtotal >= 15000 ? 0 : 900;

    await prisma.order.create({
      data: {
        orderNumber: `VEL-2026090${n}-SEED${n}`,
        userId: customer.id,
        addressId: addr!.id,
        shipFullName: addr!.fullName,
        shipPhone: addr!.phone,
        shipLine1: addr!.line1,
        shipCity: addr!.city,
        shipState: addr!.state,
        shipPostal: addr!.postalCode,
        shipCountry: addr!.country,
        subtotal,
        total: subtotal + shipping,
        status: spec.status,
        paymentStatus: spec.paid ? "PAID" : "PENDING",
        stripeSessionId: `seed_sess_${n}`,
        items: {
          create: items.map((i) => ({
            productId: i.product.id,
            sellerId: i.product.sellerId,
            productName: i.source.name,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            color: i.source.colors[0] ?? null,
            size: i.source.sizes?.[0] ?? null,
            imageUrl: img(i.source.images[0]),
            status: spec.status,
          })),
        },
      },
    });
    n++;
  }

  console.log("Creating reviews…");

  const reviewSnippets = [
    { rating: 5, title: "Even lovelier in person", body: "The photos don't quite do it justice — the finish is beautiful and it feels substantial without being heavy. I've worn it every day since it arrived." },
    { rating: 5, title: "A new favourite", body: "Exactly what I hoped for. Understated, well made, and it hasn't tarnished at all. Packaging was lovely too." },
    { rating: 4, title: "Beautiful, runs slightly small", body: "Really pleased with the quality and the colour. I'd size up if you're between sizes — otherwise no complaints at all." },
    { rating: 5, title: "Worth it", body: "I hesitated because of the price but I'm so glad I bought it. The craftsmanship is obvious and it arrived quickly." },
    { rating: 4, title: "Elegant and easy to wear", body: "Goes with everything. Docked a star only because the clasp takes a moment to get used to, but it's secure." },
    { rating: 5, title: "Gift that landed perfectly", body: "Bought this for my sister and she was thrilled. Feels considered and special, not mass-produced." },
    { rating: 3, title: "Nice but delicate", body: "The design is lovely and it looks great, just handle with care — it's finer than I expected from the listing." },
    { rating: 5, title: "Beautifully made", body: "You can tell it's made in small batches. Weight, finish, the little details — all spot on. Would buy from this maker again." },
    { rating: 4, title: "Happy with it", body: "Good quality and true to the description. Delivery was on the later end of the estimate but well packaged." },
    { rating: 5, title: "Quietly luxurious", body: "This is the kind of piece you keep for years. Timeless, comfortable, and the material feels lovely against the skin." },
  ];

  const reviewAuthorsData = [
    { name: "Sofia Marchetti", email: "sofia@velora.test", pool: [0, 2, 4, 8, 12, 16, 19] },
    { name: "Priya Nair", email: "priya@velora.test", pool: [0, 1, 5, 6, 10, 14, 17] },
    { name: "Elena Duarte", email: "elena@velora.test", pool: [2, 4, 6, 8, 10, 12, 15] },
  ];

  let rn = 5;
  for (const author of reviewAuthorsData) {
    const u = await prisma.user.create({
      data: {
        name: author.name,
        email: author.email,
        phone: "+1 415 555 0" + (100 + rn),
        role: Role.CUSTOMER,
        passwordHash: await hash("Customer123!"),
        customerProfile: { create: {} },
        wishlist: { create: {} },
        cart: { create: {} },
        addresses: {
          create: [
            {
              fullName: author.name,
              phone: "+1 415 555 0" + (100 + rn),
              line1: "22 Linden Way",
              city: "Portland",
              state: "OR",
              postalCode: "97205",
              country: "United States",
              isDefault: true,
            },
          ],
        },
      },
      include: { addresses: true },
    });

    const lineItems = author.pool.map((p) => {
      const prod = products[p];
      const unit = Math.round((prod.price * (100 - (prod.discount ?? 0))) / 100);
      return {
        product: createdProducts[p],
        source: prod,
        unit,
      };
    });
    const subtotal = lineItems.reduce((s, i) => s + i.unit, 0);

    const a = u.addresses[0];
    const order = await prisma.order.create({
      data: {
        orderNumber: `VEL-2026080${rn}-SEED${rn}`,
        userId: u.id,
        addressId: a.id,
        shipFullName: a.fullName,
        shipPhone: a.phone,
        shipLine1: a.line1,
        shipCity: a.city,
        shipState: a.state,
        shipPostal: a.postalCode,
        shipCountry: a.country,
        subtotal,
        total: subtotal,
        status: "DELIVERED",
        paymentStatus: "PAID",
        stripeSessionId: `seed_sess_${rn}`,
        items: {
          create: lineItems.map((i) => ({
            productId: i.product.id,
            sellerId: i.product.sellerId,
            productName: i.source.name,
            unitPrice: i.unit,
            quantity: 1,
            color: i.source.colors[0] ?? null,
            size: i.source.sizes?.[0] ?? null,
            imageUrl: img(i.source.images[0]),
            status: "DELIVERED",
          })),
        },
      },
    });

    for (let k = 0; k < author.pool.length; k++) {
      const p = author.pool[k];
      const snip = reviewSnippets[(rn + k) % reviewSnippets.length];
      await prisma.review.create({
        data: {
          productId: createdProducts[p].id,
          userId: u.id,
          orderId: order.id,
          rating: snip.rating,
          title: snip.title,
          body: snip.body,
        },
      });
    }
    rn++;
  }

  // The primary demo customer reviews items from their delivered order (products 0 and 4).
  const custDelivered = await prisma.order.findFirst({
    where: { userId: customer.id, status: "DELIVERED" },
  });
  if (custDelivered) {
    for (const [k, p] of [0, 4].entries()) {
      const snip = reviewSnippets[k + 3];
      await prisma.review.create({
        data: {
          productId: createdProducts[p].id,
          userId: customer.id,
          orderId: custDelivered.id,
          rating: snip.rating,
          title: snip.title,
          body: snip.body,
        },
      });
    }
  }

  // Recompute denormalised rating aggregates.
  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    _avg: { rating: true },
    _count: { rating: true },
  });
  for (const g of grouped) {
    await prisma.product.update({
      where: { id: g.productId },
      data: {
        ratingAvg: Math.round((g._avg.rating ?? 0) * 10) / 10,
        ratingCount: g._count.rating,
      },
    });
  }

  console.log("\nSeed complete.");
  console.log("──────────────────────────────────────────");
  console.log("Admin     admin@velora.test / Admin123!");
  console.log("Customer  customer@velora.test / Customer123!");
  console.log("Seller 1  seller1@velora.test / Seller123!  (Atelier Lune)");
  console.log("Seller 2  seller2@velora.test / Seller123!  (House of Meridian)");
  console.log("Seller 3  seller3@velora.test / Seller123!  (Kin & Stone)");
  console.log("──────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
