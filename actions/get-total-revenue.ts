import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  return orders.reduce((acc, order) => acc + order.orderItems.reduce((acc, orderItem) => acc + orderItem.product.price, 0), 0);
}