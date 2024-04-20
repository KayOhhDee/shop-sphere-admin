import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

import prismadb from "@/lib/prismadb";

const secretKey: string = process.env.PAYSTACK_TEST_SECRET_KEY as string;

export async function POST(req: Request) {
  const body = await req.json();

  const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(body)).digest('hex');

  if (hash == headers().get('x-paystack-signature')) {
    const event = body.event;

    if (event === 'charge.success') {
      const { data } = body;

      const order = await prismadb.order.update({
        where: {
          id: data.metadata.orderId,
        },
        data: {
          isPaid: true,
        },
        include: {
          orderItems: true,
        }
      });

      const productIds = order.orderItems.map((orderItem) => orderItem.productId);

      await prismadb.product.updateMany({
        where: {
          id: {
            in: productIds,
          },
        },
        data: {
          isArchived: true,
        },
      });

      return new NextResponse("OK", { status: 200 });
    }
  } else {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}