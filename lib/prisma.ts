import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Database helper functions
export async function getRestaurants() {
  try {
    return await db.restaurant.findMany({
      include: {
        menuItems: true,
        reviews: true,
      },
      orderBy: {
        rating: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

export async function getFeaturedRestaurants() {
  try {
    return await db.restaurant.findMany({
      include: {
        // cast to any because generated types may differ for nested includes
        menuItems: ({ include: { category: true } } as any),
        reviews: true,
      },
      orderBy: {
        rating: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching featured restaurants:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await (db as any).category.findMany({
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getMenuItems(restaurantId: string) {
  try {
    return await db.menuItem.findMany({
      where: {
        restaurantId: restaurantId,
      },
      include: ({
        category: true,
        restaurant: true,
      } as any),
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export async function createOrder(orderData: any) {
  try {
    return await db.order.create({
      data: orderData,
      include: {
        items: true,
        restaurant: true,
        user: true,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    return await db.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}
