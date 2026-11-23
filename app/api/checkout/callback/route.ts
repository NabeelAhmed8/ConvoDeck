import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { Invoice } from "@/models/Invoice";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { verifySafepaySignature } from "@/lib/safepay";

async function handleCallback(req: NextRequest) {
  try {
    await dbConnect();

    let query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((val, key) => {
      query[key] = val;
    });

    if (req.method === "POST") {
      try {
        const formData = await req.formData();
        formData.forEach((val, key) => {
          query[key] = val.toString();
        });
      } catch {
      }
    }

    const gateway = query.gateway || "hosted";
    const invoiceId = query.invoiceId || query.pp_BillReference || `INV-${Date.now().toString().slice(-6)}`;
    const plan = (query.plan || "growth") as string;
    const amount = Number(query.amount) || 0;
    const currency = query.currency || "PKR";
    const workspaceId = query.workspaceId || process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";
    const billing = query.billing === "yearly" ? "yearly" : "monthly";

    const tracker = query.tracker || "";
    const signature = query.sig || query.signature || "";
    const isStrict = process.env.STRICT_PAYMENTS === "true" || process.env.NODE_ENV === "production";

    let isSuccess = false;

    if (gateway === "safepay") {
      if (tracker && signature) {
        isSuccess = verifySafepaySignature(tracker, signature);
      } else if (!isStrict) {
        isSuccess =
          query.orderStatus === "PAID" ||
          query.transactionStatus === "SUCCESS" ||
          (query.reference ? query.reference.startsWith("SAFEPAY_") : false);
      }
    } else if (gateway === "card") {
      if (!isStrict) {
        isSuccess = query.orderStatus === "PAID" || query.transactionStatus === "SUCCESS";
      } else if (query.session_id) {
        isSuccess = true;
      }
    } else {
      isSuccess =
        query.pp_ResponseCode === "000" ||
        query.responseCode === "0000" ||
        query.orderStatus === "PAID" ||
        query.transactionStatus === "SUCCESS";
    }

    if (!isSuccess) {
      return NextResponse.redirect(
        new URL(`/checkout?error=Payment+authorization+was+cancelled+or+declined`, req.url)
      );
    }

    const daysToAdd = billing === "yearly" ? 365 : 30;
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    let paymentMethodLabel = "Safepay Gateway";
    if (gateway === "safepay") {
      paymentMethodLabel = `Safepay (JazzCash, EasyPaisa & Cards)`;
    } else if (gateway === "card") {
      paymentMethodLabel = `Stripe International Card`;
    } else if (gateway === "jazzcash") {
      paymentMethodLabel = `JazzCash Hosted Portal (Ref: ${query.pp_TxnRefNo || invoiceId})`;
    } else if (gateway === "easypaisa") {
      paymentMethodLabel = `EasyPaisa Hosted Portal (Order: ${invoiceId})`;
    } else {
      paymentMethodLabel = `Hosted Payment Portal`;
    }

    await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          plan,
          planStatus: "active",
          billingFrequency: billing,
          planCurrency: currency,
          amountPaid: amount,
          planExpiresAt: expiresAt,
          lastPaymentDate: new Date(),
          paymentMethod: paymentMethodLabel,
        },
      },
      { new: true, upsert: true }
    );

    try {
      await Invoice.findOneAndUpdate(
        { invoiceNumber: invoiceId },
        {
          $setOnInsert: {
            workspaceId,
            invoiceNumber: invoiceId,
            plan,
            planName: `${plan.charAt(0).toUpperCase() + plan.slice(1)} License`,
            amount,
            currency,
            billingFrequency: billing,
            paymentMethod: paymentMethodLabel,
            status: "completed",
            paidAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } catch (invErr) {
      console.error("Failed to save invoice record:", invErr);
    }

    const newMaxSeats = plan === "starter" ? 2 : plan === "growth" ? 5 : 50;
    const activeAgents = await User.find({
      workspaceId,
      role: "agent",
      status: "active",
    }).sort({ createdAt: -1 });

    if (activeAgents.length > newMaxSeats) {
      const excessCount = activeAgents.length - newMaxSeats;
      const agentsToSuspend = activeAgents.slice(0, excessCount);
      for (const agent of agentsToSuspend) {
        await User.findByIdAndUpdate(agent._id, { $set: { status: "suspended" } });
      }
    }

    revalidatePath("/billing");
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return NextResponse.redirect(
      new URL(
        `/checkout/success?invoiceId=${invoiceId}&plan=${plan}&amount=${amount}&currency=${currency}`,
        req.url
      )
    );
  } catch (error) {
    console.error("Hosted Checkout Callback Error:", error);
    return NextResponse.redirect(new URL("/checkout?error=Callback+processing+failed", req.url));
  }
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}
