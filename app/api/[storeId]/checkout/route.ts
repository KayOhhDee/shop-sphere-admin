import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { metadata } from "@/app/layout";

interface PaystackParams {
  amount: number;
  email: string;
  currency?: string;
  channels?: string[];
  callback_url?: string;
  metadata?:object
}

const secretKey: string = process.env.PAYSTACK_TEST_SECRET_KEY as string;
const url: string = process.env.PAYSTACK_PAYMENT_URL as string;
const callbackUrl: string = process.env.FRONTEND_STORE_URL as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const getCommonHeaders = () => ({
  Authorization: `Bearer ${secretKey}`,
  'Content-Type': 'application/json',
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("No products specified", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      }
    }
  });

  const amount = products.reduce((acc, product) => acc + product.price, 0);
  let paymentData = null

  const options = {
    method: 'POST',
    headers: getCommonHeaders(),
    body: JSON.stringify({
      email: `shop-sphere@gmail.com`,
      amount: `${amount * 100}`,
      callback_url: `${callbackUrl}/cart`,
      metadata: {
        orderId: order.id
      }
    }),
  };

  try {
    const response = await fetch(`${url}/transaction/initialize`, options);
    const data = await response.json();
    paymentData = data.data
  } catch (error) {
    return new NextResponse("An error occurred", { status: 500 });
  }

  return NextResponse.json({url: paymentData.authorization_url}, { headers: corsHeaders });
}
