import { useForm } from "@inertiajs/react";

export default function ResetPassword() {
    const { data, setData, post, errors } = useForm({
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/reset-password");
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submit}
                className="bg-white p-6 shadow rounded w-96"
            >
                <h2 className="text-2xl mb-4">
                    Reset Password
                </h2>

                <input
                    type="password"
                    placeholder="New Password"
                    value={data.password}
                    onChange={(e) =>
                        setData("password", e.target.value)
                    }
                    className="w-full border p-2 mb-3"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData(
                            "password_confirmation",
                            e.target.value
                        )
                    }
                    className="w-full border p-2"
                />

                <button
                    className="w-full bg-cyan-700 text-white mt-4 p-2"
                >
                    Reset Password
                </button>

                {errors.password && (
                    <p className="text-red-500 mt-2">
                        {errors.password}
                    </p>
                )}
            </form>
        </div>
    );
}