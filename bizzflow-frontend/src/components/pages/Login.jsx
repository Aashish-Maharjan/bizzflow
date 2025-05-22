import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import axios from "axios";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await axios.post("/api/auth/request-otp", { phone });
      setIsOtpSent(true);
      setIsNewUser(res.data.newUser); // assuming backend tells if it's a new user
      setMessage("OTP sent to your phone.");
    } catch (err) {
      setMessage("Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("/api/auth/verify-otp", { phone, otp });
      localStorage.setItem("token", res.data.token);
      setMessage("Login successful!");
      window.location.href = "/dashboard"; // redirect
    } catch (err) {
      setMessage("Invalid OTP or verification failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700 dark:text-white">
        {isOtpSent ? "Enter OTP" : "Login / Register"}
      </h2>
      <div className="space-y-4">
        {!isOtpSent ? (
          <>
            <Input
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button onClick={handleSendOtp}>Send OTP</Button>
          </>
        ) : (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button onClick={handleVerifyOtp}>Verify OTP</Button>
          </>
        )}
        {message && <p className="text-sm text-center text-blue-600 dark:text-blue-400">{message}</p>}
      </div>
    </div>
  );
}
