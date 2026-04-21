export class OTPStore {
  private static store = new Map<string, { otp: string; expires: Date }>();

  static setOTP(email: string, otp: string, expires: Date) {
    this.store.set(email, { otp, expires });
  }

  static verifyOTP(email: string, otp: string): boolean {
    const data = this.store.get(email);
    if (!data) {
      console.log(`[OTPStore] No OTP found for ${email}`);
      return false;
    }
    
    const now = Date.now();
    const expiryTime = data.expires.getTime();

    if (data.otp !== otp) {
      console.log(`[OTPStore] OTP mismatch for ${email}`);
      return false;
    }

    if (now > expiryTime) {
      console.log(`[OTPStore] OTP expired for ${email}. Now: ${new Date(now).toISOString()}, Expiry: ${data.expires.toISOString()}`);
      this.clearOTP(email); // Strictly clear it if expired
      return false;
    }
    
    return true;
  }

  static clearOTP(email: string) {
    this.store.delete(email);
  }
}
