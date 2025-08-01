"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ConvexProvider } from "convex/react";
import { convex } from "@/utils/convex";
import { Header } from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProvider client={convex}>
      <ChakraProvider>
        <Header />
        {children}
      </ChakraProvider>
    </ConvexProvider>
  );
} 