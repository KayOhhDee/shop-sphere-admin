import prismadb from "@/lib/prismadb";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string) => {
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

  const monthlyRevenue: { [key: number]: number } = {}

  for (const order of orders) {
    const month = new Date(order.createdAt).getMonth();
    const revenue = order.orderItems.reduce((acc, orderItem) => acc + orderItem.product.price, 0);

    if (monthlyRevenue[month]) {
      monthlyRevenue[month] += revenue;
    } else {
      monthlyRevenue[month] = revenue;
    }
  }

  const graphData: GraphData[] = [
    { name: "January", total: monthlyRevenue[0] || 0 },
    { name: "February", total: monthlyRevenue[1] || 0 },
    { name: "March", total: monthlyRevenue[2] || 0 },
    { name: "April", total: monthlyRevenue[3] || 0 },
    { name: "May", total: monthlyRevenue[4] || 0 },
    { name: "June", total: monthlyRevenue[5] || 0 },
    { name: "July", total: monthlyRevenue[6] || 0 },
    { name: "August", total: monthlyRevenue[7] || 0 },
    { name: "September", total: monthlyRevenue[8] || 0 },
    { name: "October", total: monthlyRevenue[9] || 0 },
    { name: "November", total: monthlyRevenue[10] || 0 },
    { name: "December", total: monthlyRevenue[11] || 0 }
  ]

  return graphData;
}