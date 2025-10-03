import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/utils";
import User from "@/lib/models/user";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add request body parsing
    const { currentPassword, newPassword } = await req.json();
    
    // Connect to the database
    try {
      await dbConnect();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: "Database connection failed" }, 
        { status: 500 }
      );
    }

    const user = await User.findById(auth.userId).select('+password');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" }, 
        { status: 400 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Error in change password:', error);
    return NextResponse.json(
      { error: "An error occurred while changing password" },
      { status: 500 }
    );
  }
}