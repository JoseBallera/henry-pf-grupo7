/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SignInButton, UserButton, useSession, useUser } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import { useDispatch } from "react-redux";
import { addClientSecret, addPaymentIntent, addToCart, addUserID, hideLoading } from "@/redux/slices/cartSlice";
import { checkUserRole } from "@/app/lib/utils";
import CartPage from "@/app/cart/page";
import Purchases from "@/components/purchases/Purchases";

interface Item {
  cart_item_id: number;
  user_id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface CustomPage {
  url: string;
  label: string;
  mountIcon: (el: HTMLElement) => void;
}

export default function Navbar() {
    const menu = ["All", "Phones", "Tablets", "Laptops", "Desktops", "Software"]
    const searchParams = useSearchParams()
    const params = searchParams.get('category')
    const id = useUser().user?.id
    const dispatch = useDispatch()
    const email = useUser().user?.primaryEmailAddress?.emailAddress;
    const { session } = useSession()
    const userRole = checkUserRole(session)
    const pathnames = usePathname();
    const router = useRouter()

    const checkUserStatus = (user: any) => {
      if (user.disable) {
        router.push('/banned');
      }
    };

    const updateUser = async (user: any)=>{
      if(user.id !== id ){
        try {
          let res = await fetch("/api/validateuser", {
            method: "PUT",
            body: JSON.stringify({ email, id }),
          });
          
          return console.log('User Updated')  
           
        } catch (error) {
          console.log('error', error)
        }       
      }
    }

    useEffect(()=>{
      dispatch(hideLoading())
    },[dispatch])
    
    

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          if (!email) {
            return; 
          }
          const response = await fetch(`/api/signup?id=${email}`);
          if (response.ok) {
            const user = await response.json();
            checkUserStatus(user.users[0]);
            updateUser(user.users[0])
          } else {
            throw new Error("Failed to fetch user status");
          }
        } catch (error) {
          console.error("Error user status:", error);
        }
      };
      fetchUserData()
      
    }, [pathnames, id]);   

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        if (!email) {
          return; // Don't fetch if email is not available
        }

        const response = await fetch(`/api/cart?email=${email}`);

        if (response.ok) {
          const cartData = await response.json();
          // cartData.cartItems.map((item)=> console.log(item))
         cartData.cartItems.map((item: Item)=>{
          dispatch(
            addToCart({
              cart_item_id: item.cart_item_id as number,
              userid: item.user_id as string,
              id: item.product_id as string, 
              name: item.name as string,
              image: item.image as string,
              price: item.price as number,
              qty: item.qty as number,
            }),
          );
         })
         dispatch(addClientSecret(cartData.users[0].clientsecret))
         dispatch(addPaymentIntent(cartData.users[0].paymentid)) 
        } else {
          throw new Error("Failed to fetch cart data");
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };
    dispatch(addUserID(id as string))
    fetchCartData();
  }, [email]);


    return (
      <header>
      <nav className="relative flex items-center justify-between p-4 lg:px-6">
        <div className="w-full flex justify-around">
          <div className="flex ">
            <Link href="/" className="mr-2 flex items-center justify-center">
            <Image src="\img\codewave-central-high-resolution-logo-transparent.svg" alt="codewave logo" 
            className="w-52"
            width={100}
            height={100}
             />
            </Link>
            {menu.length ? (
              <ul className="hidden gap-6 text-sm md:flex md:items-center">
                {menu.map((item) => (
                  <li key={item}
                  className={params === item ? "text-red underline" : "null"}>
                    <Link
                      href={item === 'All' ? `/product` : `/product?category=${item}`}
                      className="underline-offset-4  hover:underline text-neutral-400 hover:text-neutral-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="hidden justify-center md:flex md:w-1/3">
            <SearchBar/>
          </div>
          <div>
          {userRole === 'org:admin' ? <Link href='/admindashboard' className=" underline-offset-4  hover:underline text-neutral-400 hover:text-neutral-300">
              Admin Dashboard
            </Link> : null}
          </div>
          <div>
            {id ? <UserButton>  
                 <UserButton.UserProfilePage label="Orders" url="/orders" labelIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                                                  </svg>}>
                  <Purchases/>
                 </UserButton.UserProfilePage>
              </UserButton>
            : <SignInButton/>}
          </div>
          <Cart/>
        </div>
      </nav>
      </header>
    );
  }
  