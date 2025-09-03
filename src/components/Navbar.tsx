// components/Navbar.tsx
import React from "react";
import NextLink from "next/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import {
  BellIcon,
  DoorIcon,
  StarIcon,
} from "@phosphor-icons/react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";

import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Respiration", href: "/exercices/respiration" },
  { label: "Articles", href: "/articles" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <HeroUINavbar
      className="fixed top-0 left-0 w-full z-50"
      maxWidth="xl"
      style={{
        backgroundColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo + Liens desktop */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <NextLink className="flex items-center gap-2" href="/">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/favicon.png" alt="CESIZEN" className="w-8 h-8" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent">CESIZEN</span>
          </NextLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-6 ml-8">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className="group relative text-black hover:text-cesizen-600 transition"
                href={item.href}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cesizen-600 group-hover:w-full transition-all duration-200" />
              </NextLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Actions desktop */}
      <NavbarContent className="hidden sm:flex gap-4" justify="end">
        {!loading && (
          <>
            {user && (
              <NavbarItem>
                <Button isIconOnly className="text-black" variant="light">
                  <BellIcon size={20} />
                </Button>
              </NavbarItem>
            )}
            <NavbarItem>
              {user ? (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 rounded-lg p-2 transition-colors">
                      <Avatar
                        className="border border-black/20"
                        name={
                          user.name || user.username || user.email || "User"
                        }
                        size="sm"
                        src={user.avatarUrl}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-black">
                          {user.name || user.username || "Utilisateur"}
                        </span>
                        <span className="text-xs text-gray-600">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Menu utilisateur" className="w-56">
                    <DropdownItem
                      key="dashboard"
                      description="Tableau de bord"
                      startContent={<span className="text-cesizen-600">📊</span>}
                      className="text-cesizen-700"
                    >
                      <NextLink className="w-full" href="/dashboard">
                        Dashboard
                      </NextLink>
                    </DropdownItem>
                    <DropdownItem
                      key="profile"
                      description="Gérer mon profil"
                      startContent={<span className="text-green-600">👤</span>}
                      className="text-green-700"
                    >
                      <NextLink className="w-full" href="/profile">
                        Mon Profil
                      </NextLink>
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      description="Se déconnecter"
                      startContent={<DoorIcon size={16} />}
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <div className="flex gap-2">
                  <NextLink href="/login">
                    <Button color="primary" size="sm" variant="flat">
                      Se connecter
                    </Button>
                  </NextLink>
                  <NextLink href="/register">
                    <Button color="primary" size="sm" variant="bordered">
                      S'inscrire
                    </Button>
                  </NextLink>
                </div>
              )}
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* Toggle mobile */}
      <NavbarContent className="sm:hidden" justify="end">
        {!loading && user && (
          <NavbarItem>
            <Button isIconOnly className="text-black" variant="light">
              <BellIcon size={20} />
            </Button>
          </NavbarItem>
        )}
        <NavbarMenuToggle className="text-black" />
      </NavbarContent>

      {/* Menu mobile */}
      <NavbarMenu className="bg-white/30 backdrop-blur-md">
        {navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <NextLink className="block py-2 text-black" href={item.href}>
              {item.label}
            </NextLink>
          </NavbarMenuItem>
        ))}

        {/* Section utilisateur mobile */}
        {!loading && (
          <div className="mt-4 pt-4 border-t border-black/10">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-2 mb-4">
                  <Avatar
                    className="border border-black/20"
                    name={user.name || user.username || user.email || "User"}
                    size="sm"
                    src={user.avatarUrl}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black">
                      {user.name || user.username || "Utilisateur"}
                    </span>
                    <span className="text-xs text-gray-600">{user.email}</span>
                  </div>
                </div>
                <NavbarMenuItem>
                  <NextLink
                    className="flex items-center gap-2 py-2 text-cesizen-700"
                    href="/dashboard"
                  >
                    <span className="text-cesizen-600">📊</span>
                    Dashboard
                  </NextLink>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <NextLink
                    className="flex items-center gap-2 py-2 text-cesizen-700"
                    href="/profile"
                  >
                    <span className="text-cesizen-600">👤</span>
                    Mon Profil
                  </NextLink>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <button
                    className="flex items-center gap-2 py-2 text-red-600 w-full text-left"
                    onClick={handleLogout}
                  >
                    <DoorIcon size={16} />
                    Déconnexion
                  </button>
                </NavbarMenuItem>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <NextLink href="/login">
                  <Button className="w-full" color="primary" variant="flat">
                    Se connecter
                  </Button>
                </NextLink>
                <NextLink href="/register">
                  <Button className="w-full" color="primary" variant="bordered">
                    S&apos;inscrire
                  </Button>
                </NextLink>
              </div>
            )}
          </div>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
}