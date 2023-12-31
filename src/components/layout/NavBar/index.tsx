'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import { useDispatch } from "react-redux";
import { hideLoading } from "@/redux/slices/cartSlice";

export default function Navbar() {
    const menu = ["All", "Phones", "Tablets", "laptops", "Desktops", "Software"]
    const [data, setData] = useState({
      userId: '',
      userEmail: ''
    })
    const searchParams = useSearchParams()
    const params = searchParams.get('category')
    const  user =  useUser().user?.primaryEmailAddress?.emailAddress
    const id = useUser().user?.id
    const dispatch = useDispatch()

    useEffect(() => {
      if (id && user) {
        setData({
          userId: id,
          userEmail: user
        });
      }
    }, [id, user]);
  
    useEffect(() => {
      if (data.userId && data.userEmail) {
        reg();
      }
    }, [data]);

    useEffect(()=>{
      dispatch(hideLoading())
    },[dispatch])
    
    const reg = async () => {
      try {
        let res = await fetch("/api/signup", {
          method: "POST",
          body: JSON.stringify({data}),
        });
        console.log("success")
      } catch (error) {
        console.log('Error adding user:', error);
      }
    };

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
                      className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
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
            {data.userId ? <UserButton/>  
            : <SignInButton/>}
          </div>
          <Cart/>
        </div>
      </nav>
      </header>
    );
  }
  