"use client";

import Navbar from "@/components/Navbar";
import { useUserAuth } from "@/store/userAuth";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Page() {
  const token = useUserAuth((state) => state.authToken);
  const isLoggedIn = useUserAuth((state) => state.isLoggedIn);
  const user = useUserAuth((state) => state.user);
  const router = useRouter();
  const isAdmin = useUserAuth((state) => state.user?.role === "admin");
  const logout = useUserAuth((state) => state.logout);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/orders", {
          headers: {
            "auth-token": token,
          },
        });
        console.log(response.data);
        setOrders(response.data.data);
      } catch (error) {
        console.log(error);
        toast.error("Error fetching orders");
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [isLoggedIn, token]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        router.push("/");
      }
    });
  };

  if (isAdmin) {
    router.replace("/admin");
    return null;
  }

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <section className="py-8 px-4 relative container mx-auto h-full">
          <h1 className="text-3xl font-bold">
            You need to be logged in to view this page
          </h1>
          <p className="text-lg mt-4">
            Please{" "}
            <Link href="/login" className="text-primary">
              login
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-primary">
              sign up
            </Link>{" "}
            to view this page
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-8 px-4 relative container mx-auto h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-2xl font-bold">Your Orders</h2>
          <div className="mt-4">
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <FaSpinner className="animate-spin text-5xl text-primary" />
              </div>
            )}
            {orders.length === 0 && !isLoading && (
              <p className="text-lg">You have no orders yet</p>
            )}
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow-md rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Order ID: {order._id}</h3>
                  <p
                    className={`text-lg font-bold ${
                      order.status === "confirming"
                        ? "text-yellow-500"
                        : order.status === "cancelled"
                        ? "text-primary"
                        : order.status === "processing" ||
                          order.status === "enroute"
                        ? "text-green-500"
                        : "text-blue-500"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <div className="mt-2 grid gap-3">
                  {order.items.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex gap-2 items-center p-3 border rounded-md"
                    >
                      <div>
                        <Image
                          src={item.image}
                          width={100}
                          height={100}
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1 grid">
                        <p className="text-xl">
                          {item.name} - {item.quantity} item
                          {item.quantity > 1 && "s"}
                        </p>
                        <p className="text-gray-500">{item.price}</p>
                        <p className="text-gray-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
