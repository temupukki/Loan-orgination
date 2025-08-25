import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { customerId, analysisDocs } = await req.json();

    if (!customerId || !analysisDocs || !Array.isArray(analysisDocs)) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Replace this with your actual external API URL
    const externalApiUrl = "https://external-api.com/credit-analysis";

    // Send to external API
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        documents: analysisDocs,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to send to external API");
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
