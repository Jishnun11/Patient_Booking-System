import { useForm } from "@inertiajs/react";

export default function VerifyOtp() {
    const { data, setData, post, errors } = useForm({
        otp: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/verify-otp");
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submit}
                className="bg-white p-6 shadow rounded w-96"
            >
                <h2 className="text-2xl mb-4">
                    Verify OTP
                </h2>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={data.otp}
                    onChange={(e) =>
                        setData("otp", e.target.value)
                    }
                    className="w-full border p-2"
                />

                {errors.otp && (
                    <p className="text-red-500">
                        {errors.otp}
                    </p>
                )}

                <button
                    className="w-full bg-cyan-700 text-white mt-4 p-2"
                >
                    Verify
                </button>
            </form>
        </div>
    );
}