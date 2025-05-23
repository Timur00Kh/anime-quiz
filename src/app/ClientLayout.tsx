"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { Header } from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider>
      <Header />
      {children}
    </ChakraProvider>
  );
} 