"use client"
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login = () => {
    const router = useRouter();

    const [login, setLogin] = useState({
        email: "honey@gmail.com",
        password: "123",
    });
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setLogin((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        const { email, password } = login;
        
        try {
            const response = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (response.error) {
                setError(response.error);
                return;
            }

            // Get session to access the refresh token
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            const refreshToken = session?.user?.refreshToken;

            // Send to server to set cookie
            if (refreshToken) {
                await fetch("/api/auth/set-refresh-cookie", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });
            }

            router.replace("/todos");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Login to your account
                </h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={login.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />

                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={login.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />

                    </div>
                    <p className="text-sm text-center mt-4">
                        <a
                            href="/forgot-password"
                            className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                            Forgot your password?
                        </a>
                    </p>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </form>
                    <p className="mt-4 text-sm text-gray-600">
                        Need to register for an account?{" "}
                        <Link href="/createaccount" className="text-indigo-600 hover:underline">
                            Create Account
                        </Link>
                    </p>

            </div>
        </div>
    );
};

export default Login;
