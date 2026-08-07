import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { Prisma, type OrderStatus, type PaymentStatus } from '@/lib/generated/prisma/client';
import {
  checkoutSchema,
  orderTrackingSchema,
  type CheckoutInput,
  type OrderTrackingInput,
} from '@/lib/validations/checkout';
import { generateOrderNumber } from './order-number';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, DEFAULT_PAGE_SIZE } from '@/config/site';

export class CheckoutError extends Error {}

const MAX_ORDER_NUMBER_RETRIES = 3;

/**
 * Creates an order from a guest checkout. Recalculates prices, discounts,
 * and stock entirely from the database — client-submitted totals are never
 * trusted. Order creation, order-item creation, and inventory decrement all
 * happen inside one transaction; if any step fails, everything rolls back.
 */
export async function createOrderFromCart(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const productIds = [...new Set(data.items.map((item) => item.productId))];
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map((p) => [p.id, p]));

        let subtotal = 0;
        let discount = 0;
        const orderItemsData: {
          productId: number;
          productName: string;
          quantity: number;
          unitPrice: number;
          total: number;
        }[] = [];

        for (const item of data.items) {
          const product = productMap.get(item.productId);
          if (!product || !product.isActive) {
            throw new CheckoutError('One of the items in your cart is no longer available.');
          }
          if (product.stock < item.quantity) {
            throw new CheckoutError(
              `Only ${product.stock} unit(s) of "${product.name}" are in stock.`,
            );
          }

          const originalPrice = Number(product.price);
          const effectivePrice = product.discountPrice
            ? Number(product.discountPrice)
            : originalPrice;

          subtotal += originalPrice * item.quantity;
          discount += (originalPrice - effectivePrice) * item.quantity;

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: effectivePrice,
            total: effectivePrice * item.quantity,
          });
        }

        const amountDue = subtotal - discount;
        const deliveryFee = amountDue >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
        const total = amountDue + deliveryFee;

        const orderNumber = await generateOrderNumber(tx);

        const order = await tx.order.create({
          data: {
            orderNumber,
            customerName: data.fullName,
            customerPhone: data.phone,
            customerEmail: data.email || null,
            address: data.address,
            city: data.city || null,
            area: data.area || null,
            notes: data.notes || null,
            subtotal,
            discount,
            deliveryFee,
            total,
            items: { createMany: { data: orderItemsData } },
          },
        });

        for (const item of data.items) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (result.count !== 1) {
            throw new CheckoutError(
              'One or more items sold out while placing your order. Please try again.',
            );
          }
        }

        return order;
      });
    } catch (error) {
      const isOrderNumberConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (isOrderNumberConflict && attempt < MAX_ORDER_NUMBER_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  throw new CheckoutError('Could not place your order. Please try again.');
}

/** Guest order tracking: only returns an order when BOTH the order number and phone match. */
export async function trackOrder(input: OrderTrackingInput) {
  const data = orderTrackingSchema.parse(input);

  const order = await prisma.order.findFirst({
    where: { orderNumber: data.orderNumber.trim().toUpperCase(), customerPhone: data.phone.trim() },
    select: {
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      paymentMethod: true,
      subtotal: true,
      discount: true,
      deliveryFee: true,
      total: true,
      createdAt: true,
      customerName: true,
      address: true,
      city: true,
      area: true,
      items: {
        select: { productName: true, quantity: true, unitPrice: true, total: true },
      },
    },
  });

  return order;
}

export type AdminOrderListParams = {
  q?: string;
  status?: OrderStatus;
  page?: number;
};

export async function listOrdersForAdmin(params: AdminOrderListParams) {
  await requireAdmin();
  const page = params.page ?? 1;
  const take = DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * take;

  const where = {
    ...(params.q
      ? {
          OR: [
            { orderNumber: { contains: params.q } },
            { customerName: { contains: params.q } },
            { customerPhone: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.status ? { orderStatus: params.status } : {}),
  };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { items: { select: { id: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / take)), page };
}

export async function getOrderByIdForAdmin(id: number) {
  await requireAdmin();
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

export async function updateOrderStatus(id: number, orderStatus: OrderStatus) {
  await requireAdmin();
  return prisma.order.update({ where: { id }, data: { orderStatus } });
}

export async function updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
  await requireAdmin();
  return prisma.order.update({ where: { id }, data: { paymentStatus } });
}

export async function cancelOrder(id: number) {
  await requireAdmin();
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new Error('Order not found');
    if (order.orderStatus === 'CANCELLED') return order;

    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({ where: { id }, data: { orderStatus: 'CANCELLED' } });
  });
}

export async function getDashboardMetrics() {
  await requireAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRepairRequests,
    salesAggregate,
    lowStockCount,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({
      where: {
        orderStatus: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED'],
        },
      },
    }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.repairRequest.count(),
    prisma.order.aggregate({
      where: { orderStatus: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.$queryRaw<
      [{ count: bigint }]
    >`SELECT COUNT(*) as count FROM Product WHERE isActive = true AND stock > 0 AND stock <= lowStockThreshold`,
  ]);

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRepairRequests,
    monthSales: Number(salesAggregate._sum.total ?? 0),
    lowStockCount: Number(lowStockCount[0]?.count ?? 0),
  };
}

export async function getSalesOverTime(days = 7) {
  await requireAdmin();
  const rows = await prisma.$queryRaw<
    { day: Date; total: unknown }[]
  >`SELECT DATE(createdAt) as day, SUM(total) as total
    FROM \`Order\`
    WHERE orderStatus != 'CANCELLED' AND createdAt >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY day ASC`;

  return rows.map((row) => ({
    day: new Date(row.day).toISOString().slice(0, 10),
    total: Number(row.total ?? 0),
  }));
}

export async function getOrdersOverTime(days = 7) {
  await requireAdmin();
  const rows = await prisma.$queryRaw<
    { day: Date; count: unknown }[]
  >`SELECT DATE(createdAt) as day, COUNT(*) as count
    FROM \`Order\`
    WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt)
    ORDER BY day ASC`;

  return rows.map((row) => ({
    day: new Date(row.day).toISOString().slice(0, 10),
    count: Number(row.count ?? 0),
  }));
}

/** Excludes cancelled orders, per the spec's best-sellers rule. */
export async function getBestSellingProducts(limit = 5) {
  await requireAdmin();
  const rows = await prisma.$queryRaw<
    { productId: number; name: string; quantitySold: unknown }[]
  >`SELECT oi.productId as productId, p.name as name, SUM(oi.quantity) as quantitySold
    FROM OrderItem oi
    JOIN \`Order\` o ON o.id = oi.orderId
    JOIN Product p ON p.id = oi.productId
    WHERE o.orderStatus != 'CANCELLED'
    GROUP BY oi.productId, p.name
    ORDER BY quantitySold DESC
    LIMIT ${limit}`;

  return rows.map((row) => ({ ...row, quantitySold: Number(row.quantitySold ?? 0) }));
}

export async function getSalesByCategory() {
  await requireAdmin();
  const rows = await prisma.$queryRaw<
    { categoryName: string; total: unknown }[]
  >`SELECT c.name as categoryName, SUM(oi.total) as total
    FROM OrderItem oi
    JOIN \`Order\` o ON o.id = oi.orderId
    JOIN Product p ON p.id = oi.productId
    JOIN Category c ON c.id = p.categoryId
    WHERE o.orderStatus != 'CANCELLED'
    GROUP BY c.id, c.name
    ORDER BY total DESC`;

  return rows.map((row) => ({ ...row, total: Number(row.total ?? 0) }));
}
