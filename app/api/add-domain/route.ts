import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain nahi mila bhai!" }, { status: 400 });
    }

    // Vercel ke server ko API call lagana
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Domain Vercel me add ho gaya!" });
    } else {
      return NextResponse.json({ error: data.error?.message || "Vercel ne error diya" }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server Error aa gaya" }, { status: 500 });
  }
}