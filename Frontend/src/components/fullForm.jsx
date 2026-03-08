import React, { useState, useEffect } from "react";
import { Signup } from "../hooks/useSignup";

const Signupform = ({ email }) => {
  const { signup, error, isLoading } = Signup();

  const [userOtp, setUserOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: email,
    password: "",
    conformPassword: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // OTP Verification
  const handleVerifyOtp = async () => {
    if (!userOtp) return;

    setOtpLoading(true);

    try {
      const res = await fetch("/api/visitor/verifyotp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: userOtp,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw Error(json.error);
      }

      setIsOtpVerified(true);
      setLocalError(null);
    } catch (error) {
      setLocalError(error.message);
    }

    setOtpLoading(false);
  };

  // Signup Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.conformPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    await signup(formData);
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none";


  useEffect(() => {
    if (error || localError) {
      const timer = setTimeout(() => {
        setError(null);
      }, 13000);

      return () => clearTimeout(timer);
    }
  }, [error, localError]);


  return (
    <div className="w-full max-w-md space-y-6">
      {/* Email Display */}
      <div>
        <label className="text-sm font-semibold">Email</label>
        <div className={inputStyle}>{email}</div>
      </div>

      {/* OTP Section */}
      {!isOtpVerified && (
        <div>
          <h2 className="text-lg font-bold mb-3">Verify OTP</h2>

          <input
            type="text"
            placeholder="Enter OTP"
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            className={inputStyle}
          />

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            className="w-full bg-green-600 text-white p-3 rounded-lg mt-3"
          >
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {/* Signup Form (Only After OTP Verified) */}
      {isOtpVerified && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Complete Signup</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <input
            type="password"
            name="conformPassword"
            placeholder="Confirm Password"
            value={formData.conformPassword}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg"
          >
            {isLoading ? "Creating Account..." : "Signup"}
          </button>
        </form>
      )}

      {/* Error Message */}
      {(localError || error) && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm">
          <div className="text-red-500 shrink-0 mt-0.5">⚠️</div>

          <div>
            <p className="text-sm font-bold text-red-800 mb-1">
              Action Required
            </p>
            <p className="text-xs text-red-600 font-medium">
              {localError || error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signupform;
